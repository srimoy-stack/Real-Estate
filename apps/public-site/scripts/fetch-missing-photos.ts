/**
 * ─── EMERGENCY: Fetch Missing Photos from DDF API ───────────────
 *
 * Fetches Media for all active listings with NULL primaryPhotoUrl.
 * Uses per-listing DDF endpoint: Property('key') which always returns Media.
 *
 * SAFETY:
 *   ✅ Only updates listings with NULL primaryPhotoUrl
 *   ✅ Never overwrites existing photos
 *   ✅ Cursor-based pagination
 *   ✅ Per-record try/catch
 *   ✅ DRY RUN by default
 *
 * USAGE:
 *   DRY RUN:   npx tsx scripts/fetch-missing-photos.ts
 *   REAL RUN:  npx tsx scripts/fetch-missing-photos.ts --commit
 *
 * ─────────────────────────────────────────────────────────────────
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

const DRY_RUN = !process.argv.includes('--commit');
const DDF_BASE = 'https://ddfapi.realtor.ca/odata/v1/Property';
const DB_PAGE_SIZE = 500;
const API_DELAY_MS = 350;
const CONCURRENCY = 10; // faster recovery

const NON_IMAGE_EXT = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv|7z|gz)$/i;

// ─── Auth ───────────────────────────────────────────────────────
let tok: string | null = null;
let tokPromise: Promise<string> | null = null;

async function auth(): Promise<string> {
  if (tok) return tok;
  if (tokPromise) return tokPromise;

  tokPromise = (async () => {
    try {
      const r = await fetch('https://identity.crea.ca/connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID || '',
          client_secret: process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET || '',
          scope: 'DDFApi_Read',
        }),
      });
      const d = await r.json();
      tok = d.access_token;
      tokPromise = null;
      setTimeout(() => { tok = null; }, (d.expires_in - 120) * 1000);
      console.log('  🔐 DDF token acquired');
      return tok!;
    } catch (err) {
      tokPromise = null;
      throw err;
    }
  })();

  return tokPromise;
}

// ─── Media processing (same as deltaSync) ───────────────────────
function processMedia(media: any[]): { primary: string | null; array: any[] } {
  if (!media || media.length === 0) return { primary: null, array: [] };

  const processed = media
    .filter((m: any) => {
      const url = m?.HighResMediaURL || m?.MediaURL || m?.LowResMediaURL;
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim();
      if (trimmed.length < 10) return false;
      if (NON_IMAGE_EXT.test(trimmed)) return false;
      try {
        const parsed = new URL(trimmed);
        if (parsed.pathname === '/' || parsed.pathname === '') return false;
      } catch { return false; }
      return true;
    })
    .map((m: any) => {
      const bestUrl = (m.HighResMediaURL || m.MediaURL || m.LowResMediaURL).trim();
      return {
        MediaURL: bestUrl,
        Order: m.Order || 0,
        MediaModificationTimestamp: m.MediaModificationTimestamp || null,
      };
    })
    .sort((a: any, b: any) => a.Order - b.Order);

  const primaryObj = processed.find((m: any) => m.Order === 0) || processed[0];
  return { primary: primaryObj?.MediaURL || null, array: processed };
}

// ─── Fetch single listing with media via Property('key') ────────
async function fetchSingleListing(key: string): Promise<any | null> {
  try {
    const t = await auth();
    // Per DDF docs: Property('key') returns full record including Media
    const r = await fetch(`${DDF_BASE}('${key}')`, {
      headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (r.status === 404) return null; // listing not in API
    if (!r.ok) return null;

    return await r.json();
  } catch {
    return null;
  }
}

// ─── Fetch batch in parallel with concurrency limit ─────────────
async function fetchBatch(keys: string[]): Promise<Map<string, any>> {
  const result = new Map<string, any>();

  for (let i = 0; i < keys.length; i += CONCURRENCY) {
    const chunk = keys.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map(key => fetchSingleListing(key))
    );

    for (let j = 0; j < chunk.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled' && r.value && r.value.ListingKey) {
        result.set(r.value.ListingKey, r.value);
      }
    }

    // Small delay between concurrent chunks
    if (i + CONCURRENCY < keys.length) {
      await new Promise(r => setTimeout(r, API_DELAY_MS));
    }
  }

  return result;
}


// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════
(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  FETCH MISSING PHOTOS — DDF API Media Recovery');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN' : '🔥 LIVE — writing to DB'}`);
  console.log('───────────────────────────────────────────────────────────');

  const totalActive = await prisma.listing.count({ where: { isActive: true } });
  const nullPhoto = await prisma.listing.count({ where: { isActive: true, primaryPhotoUrl: null } });

  console.log(`\n📊 PRE-FLIGHT:`);
  console.log(`   Total active:        ${totalActive}`);
  console.log(`   With photos:         ${totalActive - nullPhoto} (${((totalActive - nullPhoto) / totalActive * 100).toFixed(1)}%)`);
  console.log(`   Missing photos:      ${nullPhoto} (${(nullPhoto / totalActive * 100).toFixed(1)}%)`);

  if (nullPhoto === 0) {
    console.log('\n✅ All listings have photos!');
    await prisma.$disconnect();
    process.exit(0);
  }

  if (!DRY_RUN) {
    console.log('\n⚠️  LIVE MODE — Starting in 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));
  }

  const t0 = Date.now();
  let cursor: number | undefined;
  let totalScanned = 0;
  let totalFixed = 0;
  let totalLinksFixed = 0;
  let totalNoMedia = 0;
  let totalNotInApi = 0;
  let totalErrors = 0;
  let batchNum = 0;

  while (true) {
    const listings = await prisma.listing.findMany({
      where: { isActive: true, primaryPhotoUrl: null },
      select: { id: true, listingKey: true, moreInformationLink: true },
      orderBy: { id: 'desc' }, // Fix newest first as requested
      take: DB_PAGE_SIZE,
      ...(cursor !== undefined ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (listings.length === 0) break;
    cursor = listings[listings.length - 1].id;

    // Fetch all in this DB page via parallel single-listing API calls
    batchNum++;
    const keys = listings.map((l: any) => l.listingKey);
    const apiMap = await fetchBatch(keys);

    for (const listing of listings) {
      totalScanned++;
      try {
        const apiRecord = apiMap.get(listing.listingKey);
        if (!apiRecord) {
          totalNotInApi++;
          continue;
        }

        let updatedData: any = {};
        
        // Photos
        const media = apiRecord.Media;
        if (media && Array.isArray(media) && media.length > 0) {
          const { primary, array: mediaArray } = processMedia(media);
          if (primary) {
            updatedData.primaryPhoto = primary;
            updatedData.primaryPhotoUrl = primary;
            updatedData.mediaJson = mediaArray.length > 0 ? mediaArray : Prisma.DbNull;
            updatedData.photosChangeTimestamp = new Date();
          }
        }

        // MoreInformationLink
        if (!listing.moreInformationLink && apiRecord.MoreInformationLink) {
          updatedData.moreInformationLink = apiRecord.MoreInformationLink;
          totalLinksFixed++;
        }

        if (Object.keys(updatedData).length > 0) {
          if (DRY_RUN && totalFixed < 5) {
            console.log(`  📝 [DRY] ${listing.listingKey}: ${updatedData.primaryPhotoUrl?.substring(0, 50)}... (${updatedData.moreInformationLink ? 'URL fixed' : ''})`);
          }

          if (!DRY_RUN) {
            await prisma.listing.update({
              where: { id: listing.id },
              data: updatedData,
            });
          }
          totalFixed++;
        } else {
          totalNoMedia++;
        }

      } catch (err: any) {
        totalErrors++;
        if (totalErrors <= 10) {
          console.error(`  ❌ ${listing.listingKey}: ${err.message}`);
        }
      }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const pct = (totalScanned / nullPhoto * 100).toFixed(1);
    console.log(
      `  📦 Batch ${batchNum}: scanned=${listings.length} fixed=${totalFixed} links_fixed=${totalLinksFixed} | total: ${totalFixed}/${totalScanned} (${pct}%) | ${elapsed}s`
    );
  }

  // ─── Post-run ─────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const postNullPhoto = await prisma.listing.count({ where: { isActive: true, primaryPhotoUrl: null } });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Scanned:              ${totalScanned}`);
  console.log(`  Photos fixed:         ${totalFixed}`);
  console.log(`  No media in DDF:      ${totalNoMedia}`);
  console.log(`  Not in API:           ${totalNotInApi}`);
  console.log(`  Errors:               ${totalErrors}`);
  console.log(`  Duration:             ${elapsed}s`);
  console.log(`  NULL photos: ${nullPhoto} → ${postNullPhoto} (fixed ${nullPhoto - postNullPhoto})`);
  console.log(`  Photo coverage: ${((totalActive - postNullPhoto) / totalActive * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════════');

  if (DRY_RUN) {
    console.log('\n💡 DRY RUN complete. To apply:');
    console.log('   npx tsx scripts/fetch-missing-photos.ts --commit\n');
  }

  await prisma.$disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error('\n❌ FATAL:', err);
  await prisma.$disconnect();
  process.exit(1);
});
