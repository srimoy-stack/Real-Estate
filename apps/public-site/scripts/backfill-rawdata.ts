/**
 * ─── Backfill NULL rawData from DDF API ── High-Speed Bulk Crawl ──
 *
 * PURPOSE:
 *   Crawls the entire DDF Property feed in pages and fills rawData
 *   for any local listing that currently has rawData IS NULL.
 *
 * STRATEGY:
 *   Instead of querying DDF per-listing (slow), we crawl the full feed
 *   in pages of 100 and match against a pre-loaded Set of listingKeys
 *   that need rawData. This is the same pattern used by runDeltaSync.ts.
 *
 * SAFETY GUARANTEES:
 *   ✅ NEVER overwrites existing rawData (SQL WHERE rawData IS NULL)
 *   ✅ No schema changes
 *   ✅ No impact on existing flows
 *   ✅ Media array stripped (already stored separately in mediaJson)
 *   ✅ Per-record try/catch — one bad record won't crash the run
 *   ✅ Retry mechanism with configurable max retries
 *   ✅ DRY RUN mode by default
 *   ✅ Concurrent page fetching for speed
 *   ✅ Rate-limited to prevent API blocking
 *
 * USAGE:
 *   DRY RUN:    npx tsx scripts/backfill-rawdata.ts
 *   REAL RUN:   npx tsx scripts/backfill-rawdata.ts --commit
 *   RESUME:     npx tsx scripts/backfill-rawdata.ts --commit --skip 5000
 *
 * ────────────────────────────────────────────────────────────────────
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

// ─── Configuration ──────────────────────────────────────────────────
const PAGE_SIZE = 100;                // Records per DDF API page
const CONCURRENCY = 2;                // Parallel page fetches (keep low to avoid API throttle)
const DELAY_BETWEEN_WAVES_MS = 500;   // Delay between concurrent wave bursts
const API_TIMEOUT_MS = 60000;         // 60s timeout per API call
const MAX_EMPTY_WAVES = 5;            // Stop after N consecutive empty waves
const MAX_CONSECUTIVE_ERRORS = 15;    // Stop if too many consecutive API failures
const PAGE_RETRY_COUNT = 2;           // Retry failed page fetches

const DRY_RUN = !process.argv.includes('--commit');
const DDF_API = 'https://ddfapi.realtor.ca/odata/v1/Property';

// Parse --skip flag for resuming
const skipIdx = process.argv.indexOf('--skip');
const START_SKIP = skipIdx !== -1 ? parseInt(process.argv[skipIdx + 1], 10) : 0;

// ─── Stats ──────────────────────────────────────────────────────────
const stats = {
  totalApiScanned: 0,
  totalMatched: 0,
  successCount: 0,
  skippedCount: 0,
  failedCount: 0,
  wavesProcessed: 0,
};

// ─── DDF API Authentication ────────────────────────────────────────
let cachedToken: string | null = null;

async function auth(): Promise<string> {
  if (cachedToken) return cachedToken;

  const clientId = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID;
  const clientSecret = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing DDF credentials in .env (DDF_CLIENT_ID / DDF_CLIENT_SECRET)');
  }

  const res = await fetch('https://identity.crea.ca/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'DDFApi_Read',
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  // Auto-clear token 2 minutes before expiry
  const expiresIn = data.expires_in || 3600;
  setTimeout(() => { cachedToken = null; }, (expiresIn - 120) * 1000);
  console.log('  🔐 DDF token acquired');
  return cachedToken!;
}

// ─── Fetch a single page from DDF API ──────────────────────────────
async function fetchPage(skip: number): Promise<any[]> {
  for (let attempt = 0; attempt <= PAGE_RETRY_COUNT; attempt++) {
    try {
      const token = await auth();

      const params = new URLSearchParams({
        '$top': PAGE_SIZE.toString(),
        '$skip': skip.toString(),
        '$orderby': 'ModificationTimestamp desc',
      });

      const res = await fetch(`${DDF_API}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });

      if (!res.ok) {
        throw new Error(`DDF API returned ${res.status}`);
      }

      const data = await res.json();
      return data.value || [];
    } catch (error: any) {
      if (attempt < PAGE_RETRY_COUNT) {
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      console.error(`  ⚠️  Page fetch failed at skip=${skip} after ${PAGE_RETRY_COUNT + 1} attempts: ${error.message}`);
      return [];
    }
  }
  return [];
}

// ─── Extract rawData (strip Media array) ───────────────────────────
function extractRawData(ddfRecord: Record<string, any>): Record<string, any> {
  const { Media, ...rawWithoutMedia } = ddfRecord;

  // Normalize ListingURL if present
  if (typeof rawWithoutMedia.ListingURL === 'string') {
    const url = rawWithoutMedia.ListingURL.trim();
    if (url.startsWith('www.')) {
      rawWithoutMedia.ListingURL = `https://${url}`;
    }
  }

  return rawWithoutMedia;
}

// ─── Safe Update (only if rawData is STILL null) ───────────────────
async function safeUpdateRawData(id: number, rawData: Record<string, any>): Promise<boolean> {
  if (DRY_RUN) return true;

  // Concurrency-safe: WHERE rawData IS NULL prevents overwrites
  // ONLY modifies rawData column — all other columns remain completely untouched
  const result = await prisma.$executeRawUnsafe(
    `UPDATE "Listing" SET "rawData" = $1::jsonb WHERE "id" = $2 AND "rawData" IS NULL`,
    JSON.stringify(rawData),
    id
  );

  return result > 0;
}

// ─── Main Execution ────────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   Backfill NULL rawData — High-Speed Bulk Crawl              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`  Mode:       ${DRY_RUN ? '🟡 DRY RUN (no writes)' : '🟢 COMMIT (writing to DB)'}`);
  console.log(`  Start skip: ${START_SKIP}`);
  console.log(`  Concurrency: ${CONCURRENCY} pages/wave`);
  console.log('');

  // ─── STEP 1: Pre-load target listingKeys ────────────────────────
  console.log('  📋 Loading listingKeys with NULL rawData...');
  const nullRecords: { id: number; listingKey: string }[] = await prisma.$queryRawUnsafe(
    `SELECT "id", "listingKey" FROM "Listing" WHERE "rawData" IS NULL`
  );
  const nullCount = nullRecords.length;

  // Build fast lookup: listingKey -> id
  const targetMap = new Map<string, number>();
  for (const r of nullRecords) {
    targetMap.set(r.listingKey, r.id);
  }

  console.log(`  📊 Total listings with NULL rawData: ${nullCount}`);

  if (nullCount === 0) {
    console.log('  ✅ Nothing to backfill! All listings already have rawData.');
    return;
  }

  // ─── STEP 2: Crawl DDF Feed in Waves ────────────────────────────
  console.log(`\n  🚜 Crawling DDF Property feed (starting at skip=${START_SKIP})...\n`);

  let skip = START_SKIP;
  let emptyWaves = 0;
  let consecutiveErrors = 0;
  const failedUpdates: { id: number; rawData: Record<string, any> }[] = [];
  const t0 = Date.now();

  while (emptyWaves < MAX_EMPTY_WAVES && consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
    stats.wavesProcessed++;

    // Fetch CONCURRENCY pages in parallel
    const skips = Array.from({ length: CONCURRENCY }, (_, i) => skip + i * PAGE_SIZE);
    const pages = await Promise.all(skips.map(s => fetchPage(s)));
    const allRecords = pages.flat();

    if (allRecords.length === 0) {
      emptyWaves++;
      console.log(`  ⚪ Empty wave at skip=${skip} (${emptyWaves}/${MAX_EMPTY_WAVES})`);
      skip += CONCURRENCY * PAGE_SIZE;
      continue;
    }

    emptyWaves = 0;
    consecutiveErrors = 0;
    stats.totalApiScanned += allRecords.length;

    // Deduplicate by ListingKey
    const uniqueRecords = new Map<string, any>();
    for (const rec of allRecords) {
      if (rec.ListingKey) uniqueRecords.set(rec.ListingKey, rec);
    }

    // Match against our target set
    let waveSuccess = 0;
    let waveSkipped = 0;
    let waveFailed = 0;

    for (const [listingKey, ddfRecord] of uniqueRecords) {
      const localId = targetMap.get(listingKey);
      if (localId === undefined) continue; // Not in our NULL set

      stats.totalMatched++;

      try {
        const rawData = extractRawData(ddfRecord);

        // Validate meaningful data
        if (!rawData || Object.keys(rawData).length < 2) {
          stats.skippedCount++;
          waveSkipped++;
          continue;
        }

        const updated = await safeUpdateRawData(localId, rawData);

        if (updated) {
          stats.successCount++;
          waveSuccess++;
          // Remove from target map so we don't try again
          targetMap.delete(listingKey);
        } else {
          stats.skippedCount++;
          waveSkipped++;
          targetMap.delete(listingKey); // Already filled concurrently
        }
      } catch (error: any) {
        stats.failedCount++;
        waveFailed++;
        failedUpdates.push({ id: localId, rawData: extractRawData(ddfRecord) });
      }
    }

    // Progress logging
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const remaining = targetMap.size;
    if (waveSuccess > 0 || waveFailed > 0 || stats.wavesProcessed % 5 === 0) {
      console.log(
        `  📦 Wave ${stats.wavesProcessed} (skip=${skip}): ` +
        `✅${waveSuccess} ⏭️${waveSkipped} ❌${waveFailed} | ` +
        `API scanned: ${stats.totalApiScanned} | Filled: ${stats.successCount} | ` +
        `Remaining: ${remaining} | ${elapsed}s`
      );
    } else {
      process.stdout.write('.');
    }

    // Early exit: all targets filled
    if (targetMap.size === 0) {
      console.log('\n  🎉 All target records have been filled!');
      break;
    }

    // Check if any page was smaller than PAGE_SIZE (end of feed)
    const lastPageSize = pages[pages.length - 1].length;
    if (lastPageSize < PAGE_SIZE && lastPageSize > 0) {
      console.log(`\n  📄 Reached end of DDF feed at skip=${skip + (CONCURRENCY - 1) * PAGE_SIZE}`);
      break;
    }

    skip += CONCURRENCY * PAGE_SIZE;

    // Rate limit between waves
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_WAVES_MS));
  }

  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    console.log(`\n  ⚠️  Stopped: ${MAX_CONSECUTIVE_ERRORS} consecutive API errors.`);
  }

  // ─── STEP 3: Retry Failed Updates (once) ────────────────────────
  if (failedUpdates.length > 0) {
    console.log(`\n  🔄 Retrying ${failedUpdates.length} failed DB updates...`);
    let retrySuccess = 0;
    let retryFail = 0;

    for (const { id, rawData } of failedUpdates) {
      try {
        const updated = await safeUpdateRawData(id, rawData);
        if (updated) {
          retrySuccess++;
          stats.failedCount--;
          stats.successCount++;
        } else {
          retryFail++;
        }
      } catch {
        retryFail++;
      }
    }

    console.log(`  🔄 Retry: ✅${retrySuccess} recovered, ❌${retryFail} permanently failed`);
  }

  // ─── STEP 4: Validation ─────────────────────────────────────────
  const postNull: any[] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as cnt FROM "Listing" WHERE "rawData" IS NULL`
  );
  const postNullCount = Number(postNull[0]?.cnt || 0);

  // ─── Final Report ───────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   RESULTS                                                    ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  API Pages Scanned: ${stats.totalApiScanned.toString().padEnd(40)}║`);
  console.log(`║  Local Matches:     ${stats.totalMatched.toString().padEnd(40)}║`);
  console.log(`║  ✅ Success:        ${stats.successCount.toString().padEnd(40)}║`);
  console.log(`║  ⏭️  Skipped:       ${stats.skippedCount.toString().padEnd(40)}║`);
  console.log(`║  ❌ Failed:         ${stats.failedCount.toString().padEnd(40)}║`);
  console.log(`║  Waves Processed:   ${stats.wavesProcessed.toString().padEnd(40)}║`);
  console.log(`║  ⏱️  Duration:       ${(elapsed + 's').padEnd(40)}║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  NULL rawData BEFORE: ${nullCount.toString().padEnd(38)}║`);
  console.log(`║  NULL rawData AFTER:  ${postNullCount.toString().padEnd(38)}║`);
  console.log(`║  Records Filled:     ${(nullCount - postNullCount).toString().padEnd(39)}║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  if (DRY_RUN) {
    console.log('\n  🟡 This was a DRY RUN. No data was written.');
    console.log('  💡 Run with --commit to apply changes:');
    console.log('     npx tsx scripts/backfill-rawdata.ts --commit\n');
  }
}

// ─── Entry Point ───────────────────────────────────────────────────
main()
  .catch((err) => {
    console.error('\n❌ Fatal error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
