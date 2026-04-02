/**
 * ─── Production-Safe Backfill: Fill Missing Listing Fields ── v3 ──
 *
 * PHASE 1 (SQL bulk): Fast bulk SQL for moreInformationLink + primaryPhotoUrl
 * PHASE 2 (rawData):  Cursor-batched extraction from rawData JSON for
 *                     agentName, agentPhone, officeName, mediaJson, primaryPhotoUrl
 * PHASE 3 (API):      DDF API fallback for agent/office fields still NULL
 *
 * SAFETY:
 *   ✅ NEVER overwrites existing non-null values (WHERE col IS NULL)
 *   ✅ Idempotent: safe to run multiple times
 *   ✅ DRY RUN mode by default
 *   ✅ Cursor-based pagination throughout (no skip/offset)
 *   ✅ Per-record try/catch — one bad record won't crash the run
 *   ✅ Batch delay to avoid DB stress
 *
 * USAGE:
 *   DRY RUN:         npx tsx scripts/backfill-listings.ts
 *   REAL RUN:        npx tsx scripts/backfill-listings.ts --commit
 *   PHASE 1 ONLY:    npx tsx scripts/backfill-listings.ts --commit --phase1
 *   PHASE 2 ONLY:    npx tsx scripts/backfill-listings.ts --commit --phase2
 *   PHASE 3 ONLY:    npx tsx scripts/backfill-listings.ts --commit --phase3
 *   SKIP API:        npx tsx scripts/backfill-listings.ts --commit --no-api
 *
 * ────────────────────────────────────────────────────────────────────
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

// ─── Configuration ──────────────────────────────────────────────────
const BATCH_SIZE = 200;
const BATCH_DELAY_MS = 75;
const API_BATCH_SIZE = 20;
const API_DELAY_MS = 350;

const DRY_RUN = !process.argv.includes('--commit');
const PHASE1_ONLY = process.argv.includes('--phase1');
const PHASE2_ONLY = process.argv.includes('--phase2');
const PHASE3_ONLY = process.argv.includes('--phase3');
const NO_API = process.argv.includes('--no-api');
const SINGLE_PHASE = PHASE1_ONLY || PHASE2_ONLY || PHASE3_ONLY;

const DDF = 'https://ddfapi.realtor.ca/odata/v1/Property';

// ─── Validation helpers ─────────────────────────────────────────────
const INVALID_EXTENSIONS = ['.pdf', '.doc', '.docx', '.zip', '.rar', '.7z', '.gz'];

function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length < 10) return false;
  if (!trimmed.startsWith('http')) return false;
  const lower = trimmed.toLowerCase();
  for (const ext of INVALID_EXTENSIONS) {
    if (lower.endsWith(ext)) return false;
  }
  try { new URL(trimmed); return true; } catch { return false; }
}

function isValidString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function normalizeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let url = raw.trim();
  if (!url) return null;
  if (url.startsWith('www.')) url = 'https://' + url;
  try { new URL(url); return url; } catch { return null; }
}

function extractValidMedia(media: unknown): any[] | null {
  if (!Array.isArray(media)) return null;
  const valid = media
    .filter((m: any) => {
      if (!m || typeof m !== 'object') return false;
      if (!isValidImageUrl(m.MediaURL)) return false;
      const cat = (m.MediaCategory || '').toLowerCase();
      if (cat && !cat.includes('photo') && !cat.includes('image')) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      if (a.PreferredPhotoYN && !b.PreferredPhotoYN) return -1;
      if (!a.PreferredPhotoYN && b.PreferredPhotoYN) return 1;
      return (a.Order || 999) - (b.Order || 999);
    });
  return valid.length > 0 ? valid : null;
}

// ─── DDF API Authentication ────────────────────────────────────────
let tok: string | null = null;
async function auth(): Promise<string> {
  if (tok) return tok;
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
  setTimeout(() => { tok = null; }, (d.expires_in - 120) * 1000);
  console.log('  🔐 DDF token acquired');
  return tok!;
}

async function fetchByKeys(keys: string[]): Promise<Map<string, any>> {
  const result = new Map<string, any>();
  if (keys.length === 0) return result;
  const t = await auth();
  const filterStr = keys.map(k => `ListingKey eq '${k}'`).join(' or ');
  const params = new URLSearchParams({
    '$filter': filterStr,
    '$select': 'ListingKey,ListingURL,ListAgentFullName,ListAgentDirectPhone,ListOfficeName',
    '$top': keys.length.toString(),
  });
  try {
    const r = await fetch(`${DDF}?${params}`, {
      headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) {
      const errText = await r.text();
      console.error(`  ❌ API error ${r.status}: ${errText.substring(0, 200)}`);
      return result;
    }
    const data = await r.json();
    for (const item of (data.value || [])) {
      if (item.ListingKey) result.set(item.ListingKey, item);
    }
  } catch (e: any) {
    console.error(`  ❌ API fetch error: ${e.message}`);
  }
  return result;
}


// ═══════════════════════════════════════════════════════════════════
//  PHASE 1: Bulk SQL updates (fast — no row-by-row)
// ═══════════════════════════════════════════════════════════════════
async function phase1() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 1: Bulk SQL Backfill (links + photos)              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // ─── 1a. moreInformationLink from rawData->>'ListingURL' ──────
  const countLinkFromRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "moreInformationLink" IS NULL
      AND "rawData" IS NOT NULL
      AND "rawData"->>'ListingURL' IS NOT NULL
      AND "rawData"->>'ListingURL' != ''
  `;
  const linkFromRawCount = Number(countLinkFromRaw[0]?.cnt || 0);
  console.log(`  📊 moreInformationLink from rawData.ListingURL: ${linkFromRawCount} candidates`);

  if (!DRY_RUN && linkFromRawCount > 0) {
    const result1: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "moreInformationLink" = CASE
        WHEN "rawData"->>'ListingURL' LIKE 'www.%'
        THEN 'https://' || "rawData"->>'ListingURL'
        ELSE "rawData"->>'ListingURL'
      END,
      "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "moreInformationLink" IS NULL
        AND "rawData" IS NOT NULL
        AND "rawData"->>'ListingURL' IS NOT NULL
        AND "rawData"->>'ListingURL' != ''
    `;
    console.log(`  ✅ Updated ${result1} rows with moreInformationLink from rawData`);
  }

  // ─── 1b. moreInformationLink constructed from listingId ──────
  const countLinkConstruct: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "moreInformationLink" IS NULL
      AND "listingId" IS NOT NULL
  `;
  const linkConstructCount = Number(countLinkConstruct[0]?.cnt || 0);
  console.log(`  📊 moreInformationLink from listingId (construct): ${linkConstructCount} candidates`);

  if (!DRY_RUN && linkConstructCount > 0) {
    const result2: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "moreInformationLink" = 'https://www.realtor.ca/real-estate/' || "listingId",
          "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "moreInformationLink" IS NULL
        AND "listingId" IS NOT NULL
    `;
    console.log(`  ✅ Updated ${result2} rows with constructed moreInformationLink`);
  }

  // ─── 1c. primaryPhotoUrl from primaryPhoto column ─────────────
  const countPhotoFromPrimary: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "primary_photo_url" IS NULL
      AND "primaryPhoto" IS NOT NULL
      AND "primaryPhoto" LIKE 'http%'
      AND "primaryPhoto" NOT LIKE '%.pdf'
      AND "primaryPhoto" NOT LIKE '%.doc'
      AND "primaryPhoto" NOT LIKE '%.zip'
  `;
  const photoFromPrimaryCount = Number(countPhotoFromPrimary[0]?.cnt || 0);
  console.log(`  📊 primaryPhotoUrl from primaryPhoto: ${photoFromPrimaryCount} candidates`);

  if (!DRY_RUN && photoFromPrimaryCount > 0) {
    const result3: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "primary_photo_url" = "primaryPhoto",
          "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "primary_photo_url" IS NULL
        AND "primaryPhoto" IS NOT NULL
        AND "primaryPhoto" LIKE 'http%'
        AND "primaryPhoto" NOT LIKE '%.pdf'
        AND "primaryPhoto" NOT LIKE '%.doc'
        AND "primaryPhoto" NOT LIKE '%.zip'
    `;
    console.log(`  ✅ Updated ${result3} rows with primaryPhotoUrl from primaryPhoto`);
  }

  // ─── 1d. primaryPhotoUrl from rawData Media[0] ────────────────
  const countPhotoFromRawMedia: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "primary_photo_url" IS NULL
      AND "rawData" IS NOT NULL
      AND jsonb_typeof("rawData"->'Media') = 'array'
      AND jsonb_array_length("rawData"->'Media') > 0
      AND "rawData"->'Media'->0->>'MediaURL' IS NOT NULL
      AND "rawData"->'Media'->0->>'MediaURL' LIKE 'http%'
      AND "rawData"->'Media'->0->>'MediaURL' NOT LIKE '%.pdf'
  `;
  const photoFromRawMediaCount = Number(countPhotoFromRawMedia[0]?.cnt || 0);
  console.log(`  📊 primaryPhotoUrl from rawData.Media[0]: ${photoFromRawMediaCount} candidates`);

  if (!DRY_RUN && photoFromRawMediaCount > 0) {
    const result3b: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "primary_photo_url" = "rawData"->'Media'->0->>'MediaURL',
          "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "primary_photo_url" IS NULL
        AND "rawData" IS NOT NULL
        AND jsonb_typeof("rawData"->'Media') = 'array'
        AND jsonb_array_length("rawData"->'Media') > 0
        AND "rawData"->'Media'->0->>'MediaURL' IS NOT NULL
        AND "rawData"->'Media'->0->>'MediaURL' LIKE 'http%'
        AND "rawData"->'Media'->0->>'MediaURL' NOT LIKE '%.pdf'
    `;
    console.log(`  ✅ Updated ${result3b} rows with primaryPhotoUrl from rawData.Media[0]`);
  }

  // ─── 1e. primaryPhotoUrl from mediaJson first element ─────────
  const countPhotoFromMedia: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "primary_photo_url" IS NULL
      AND "media_json" IS NOT NULL
      AND jsonb_typeof("media_json") = 'array'
      AND jsonb_array_length("media_json") > 0
      AND "media_json"->0->>'MediaURL' IS NOT NULL
      AND "media_json"->0->>'MediaURL' LIKE 'http%'
  `;
  const photoFromMediaCount = Number(countPhotoFromMedia[0]?.cnt || 0);
  console.log(`  📊 primaryPhotoUrl from mediaJson[0]: ${photoFromMediaCount} candidates`);

  if (!DRY_RUN && photoFromMediaCount > 0) {
    const result4: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "primary_photo_url" = "media_json"->0->>'MediaURL',
          "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "primary_photo_url" IS NULL
        AND "media_json" IS NOT NULL
        AND jsonb_typeof("media_json") = 'array'
        AND jsonb_array_length("media_json") > 0
        AND "media_json"->0->>'MediaURL' IS NOT NULL
        AND "media_json"->0->>'MediaURL' LIKE 'http%'
    `;
    console.log(`  ✅ Updated ${result4} rows with primaryPhotoUrl from mediaJson`);
  }

  // ─── 1f. agentName from rawData.ListAgentFullName (bulk SQL) ──
  const countAgentRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "agentName" IS NULL
      AND "rawData" IS NOT NULL
      AND "rawData"->>'ListAgentFullName' IS NOT NULL
      AND "rawData"->>'ListAgentFullName' != ''
  `;
  const agentRawCount = Number(countAgentRaw[0]?.cnt || 0);
  console.log(`  📊 agentName from rawData.ListAgentFullName: ${agentRawCount} candidates`);

  if (!DRY_RUN && agentRawCount > 0) {
    const r: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "agentName" = TRIM("rawData"->>'ListAgentFullName'),
          "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "agentName" IS NULL
        AND "rawData" IS NOT NULL
        AND "rawData"->>'ListAgentFullName' IS NOT NULL
        AND "rawData"->>'ListAgentFullName' != ''
    `;
    console.log(`  ✅ Updated ${r} rows with agentName from rawData`);
  }

  // ─── 1g. agentPhone from rawData.ListAgentDirectPhone (bulk SQL)
  const countPhoneRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "agentPhone" IS NULL
      AND "rawData" IS NOT NULL
      AND "rawData"->>'ListAgentDirectPhone' IS NOT NULL
      AND "rawData"->>'ListAgentDirectPhone' != ''
  `;
  const phoneRawCount = Number(countPhoneRaw[0]?.cnt || 0);
  console.log(`  📊 agentPhone from rawData.ListAgentDirectPhone: ${phoneRawCount} candidates`);

  if (!DRY_RUN && phoneRawCount > 0) {
    const r: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "agentPhone" = TRIM("rawData"->>'ListAgentDirectPhone'),
          "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "agentPhone" IS NULL
        AND "rawData" IS NOT NULL
        AND "rawData"->>'ListAgentDirectPhone' IS NOT NULL
        AND "rawData"->>'ListAgentDirectPhone' != ''
    `;
    console.log(`  ✅ Updated ${r} rows with agentPhone from rawData`);
  }

  // ─── 1h. officeName from rawData.ListOfficeName (bulk SQL) ─────
  const countOfficeRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "officeName" IS NULL
      AND "rawData" IS NOT NULL
      AND "rawData"->>'ListOfficeName' IS NOT NULL
      AND "rawData"->>'ListOfficeName' != ''
  `;
  const officeRawCount = Number(countOfficeRaw[0]?.cnt || 0);
  console.log(`  📊 officeName from rawData.ListOfficeName: ${officeRawCount} candidates`);

  if (!DRY_RUN && officeRawCount > 0) {
    const r: any = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "officeName" = TRIM("rawData"->>'ListOfficeName'),
          "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "officeName" IS NULL
        AND "rawData" IS NOT NULL
        AND "rawData"->>'ListOfficeName' IS NOT NULL
        AND "rawData"->>'ListOfficeName' != ''
    `;
    console.log(`  ✅ Updated ${r} rows with officeName from rawData`);
  }

  console.log('\n  ✅ Phase 1 complete.');
}


// ═══════════════════════════════════════════════════════════════════
//  PHASE 2: Cursor-based rawData extraction (mediaJson + remaining)
// ═══════════════════════════════════════════════════════════════════
async function phase2() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 2: rawData Extraction (mediaJson + remaining)      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Count candidates: listings with rawData AND at least one NULL field
  const needCount = await prisma.listing.count({
    where: {
      isActive: true,
      rawData: { not: { equals: null } },
      OR: [
        { mediaJson: { equals: null } },
        { primaryPhotoUrl: null },
        { agentName: null },
        { agentPhone: null },
        { officeName: null },
        { moreInformationLink: null },
      ],
    },
  });
  console.log(`  📊 ${needCount} listings have rawData + at least one NULL field\n`);

  if (needCount === 0) {
    console.log('  ✅ Nothing to do for Phase 2.');
    return;
  }

  let cursor: number | undefined = undefined;
  let batchNum = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const t0 = Date.now();

  while (true) {
    batchNum++;

    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        rawData: { not: { equals: null } },
        OR: [
          { mediaJson: { equals: null } },
          { primaryPhotoUrl: null },
          { agentName: null },
          { agentPhone: null },
          { officeName: null },
          { moreInformationLink: null },
        ],
      },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (listings.length === 0) break;

    let batchUpdated = 0;
    let batchSkipped = 0;

    for (const listing of listings) {
      try {
        // ─── Safely extract rawData ─────────────────────────
        const raw = listing.rawData;
        if (!raw || typeof raw !== 'object') {
          batchSkipped++;
          totalSkipped++;
          continue;
        }
        const rd = raw as Record<string, any>;

        const updateData: Record<string, any> = {};

        // ── moreInformationLink ──
        if (!listing.moreInformationLink) {
          const url = normalizeUrl(rd.ListingURL);
          if (url) {
            updateData.moreInformationLink = url;
          } else if (listing.listingId) {
            updateData.moreInformationLink = `https://www.realtor.ca/real-estate/${listing.listingId}`;
          }
        }

        // ── agentName ──
        if (!listing.agentName && isValidString(rd.ListAgentFullName)) {
          updateData.agentName = (rd.ListAgentFullName as string).trim();
        }

        // ── agentPhone ──
        if (!listing.agentPhone && isValidString(rd.ListAgentDirectPhone)) {
          updateData.agentPhone = (rd.ListAgentDirectPhone as string).trim();
        }

        // ── officeName ──
        if (!listing.officeName && isValidString(rd.ListOfficeName)) {
          updateData.officeName = (rd.ListOfficeName as string).trim();
        }

        // ── mediaJson ──
        if (!listing.mediaJson) {
          const validMedia = extractValidMedia(rd.Media);
          if (validMedia) {
            updateData.mediaJson = validMedia;
          }
        }

        // ── primaryPhotoUrl (if still null after phase 1) ──
        if (!listing.primaryPhotoUrl) {
          // Try primaryPhoto column first
          if (isValidImageUrl(listing.primaryPhoto)) {
            updateData.primaryPhotoUrl = (listing.primaryPhoto as string).trim();
          }
          // Then rawData.Media[0]
          else if (Array.isArray(rd.Media) && rd.Media.length > 0 && isValidImageUrl(rd.Media[0]?.MediaURL)) {
            updateData.primaryPhotoUrl = rd.Media[0].MediaURL.trim();
          }
          // Then from mediaJson we just built or existing
          else {
            const mj = updateData.mediaJson || (listing.mediaJson as any[] | null);
            if (Array.isArray(mj) && mj.length > 0 && isValidImageUrl(mj[0]?.MediaURL)) {
              updateData.primaryPhotoUrl = mj[0].MediaURL.trim();
            }
          }
          // DO NOT insert placeholder — leave NULL if no valid image
        }

        if (Object.keys(updateData).length === 0) {
          batchSkipped++;
          totalSkipped++;
          continue;
        }

        if (DRY_RUN && batchNum <= 2) {
          console.log(`  📝 [DRY] id=${listing.id} key=${listing.listingKey}`);
          for (const [k, v] of Object.entries(updateData)) {
            const display = k === 'mediaJson' ? `[${(v as any[]).length} images]` : v;
            console.log(`      → ${k}: ${display}`);
          }
        }

        if (!DRY_RUN) {
          await prisma.listing.update({ where: { id: listing.id }, data: updateData });
        }
        batchUpdated++;
        totalUpdated++;
      } catch (err: any) {
        totalErrors++;
        if (totalErrors <= 10) {
          console.error(`  ❌ id=${listing.id}: ${err.message}`);
        }
      }
    }

    cursor = listings[listings.length - 1].id;
    batchSkipped = listings.length - batchUpdated;
    totalSkipped += batchSkipped - (listings.length - batchUpdated - batchSkipped); // avoid double count

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(
      `  📦 P2 Batch ${batchNum}: scanned=${listings.length} | updated=${batchUpdated} | skipped=${listings.length - batchUpdated} | total=${totalUpdated} | ${elapsed}s`
    );

    // Small delay to avoid DB stress
    await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
  }

  console.log(`\n  ✅ Phase 2 complete: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`);
}


// ═══════════════════════════════════════════════════════════════════
//  PHASE 3: API-based backfill (agent, office — last resort)
// ═══════════════════════════════════════════════════════════════════
async function phase3() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 3: DDF API Backfill (agent, phone, office)         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const needCount = await prisma.listing.count({
    where: {
      isActive: true,
      OR: [
        { agentName: null },
        { agentPhone: null },
        { officeName: null },
      ],
    },
  });
  console.log(`  📊 ${needCount} listings still need agent/office data from API\n`);

  if (needCount === 0) {
    console.log('  ✅ Nothing to do for Phase 3.');
    return;
  }

  let cursor: number | undefined = undefined;
  let batchNum = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let consecutiveEmpty = 0;
  const t0 = Date.now();

  while (true) {
    batchNum++;

    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        OR: [
          { agentName: null },
          { agentPhone: null },
          { officeName: null },
        ],
      },
      select: {
        id: true,
        listingKey: true,
        agentName: true,
        agentPhone: true,
        officeName: true,
        moreInformationLink: true,
      },
      orderBy: { id: 'asc' },
      take: API_BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (listings.length === 0) break;

    const keys = listings.map(l => l.listingKey).filter(Boolean);
    const apiMap = await fetchByKeys(keys);
    let batchUpdated = 0;

    for (const listing of listings) {
      try {
        const apiRecord = apiMap.get(listing.listingKey);
        if (!apiRecord) {
          totalSkipped++;
          continue;
        }

        const updateData: Record<string, any> = {};

        if (!listing.agentName && isValidString(apiRecord.ListAgentFullName)) {
          updateData.agentName = apiRecord.ListAgentFullName.trim();
        }
        if (!listing.agentPhone && isValidString(apiRecord.ListAgentDirectPhone)) {
          updateData.agentPhone = apiRecord.ListAgentDirectPhone.trim();
        }
        if (!listing.officeName && isValidString(apiRecord.ListOfficeName)) {
          updateData.officeName = apiRecord.ListOfficeName.trim();
        }
        if (!listing.moreInformationLink && apiRecord.ListingURL) {
          const url = normalizeUrl(apiRecord.ListingURL);
          if (url) updateData.moreInformationLink = url;
        }

        if (Object.keys(updateData).length === 0) {
          totalSkipped++;
          continue;
        }

        if (DRY_RUN && batchNum <= 3) {
          console.log(`  📝 [DRY] id=${listing.id} key=${listing.listingKey}`);
          for (const [k, v] of Object.entries(updateData)) {
            console.log(`      → ${k}: ${v}`);
          }
        }

        if (!DRY_RUN) {
          await prisma.listing.update({ where: { id: listing.id }, data: updateData });
        }
        batchUpdated++;
        totalUpdated++;
      } catch (err: any) {
        totalErrors++;
        console.error(`  ❌ id=${listing.id}: ${err.message}`);
      }
    }

    cursor = listings[listings.length - 1].id;

    if (batchUpdated === 0) {
      consecutiveEmpty++;
    } else {
      consecutiveEmpty = 0;
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(
      `  📦 P3 Batch ${batchNum}: scanned=${listings.length} | updated=${batchUpdated} | apiHits=${apiMap.size} | total=${totalUpdated}/${needCount} | ${elapsed}s`
    );

    if (consecutiveEmpty >= 50) {
      console.log(`  ⏹  50 consecutive empty batches — API has no more useful data. Stopping.`);
      break;
    }

    await new Promise(r => setTimeout(r, API_DELAY_MS));
  }

  console.log(`\n  ✅ Phase 3 complete: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`);
}


// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════
(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  BACKFILL LISTINGS — Production-Safe Field Recovery v3');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mode:       ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '🔥 LIVE — writing to DB'}`);
  const phases = PHASE1_ONLY ? 'Phase 1 only' :
    PHASE2_ONLY ? 'Phase 2 only' :
    PHASE3_ONLY ? 'Phase 3 only' :
    NO_API ? 'Phase 1 + 2 (no API)' :
    'Phase 1 + 2 + 3';
  console.log(`  Phases:     ${phases}`);
  console.log(`  Batch size: ${BATCH_SIZE} (Phase 2) / ${API_BATCH_SIZE} (Phase 3)`);
  console.log('───────────────────────────────────────────────────────────');

  if (!DRY_RUN) {
    console.log('\n⚠️  LIVE MODE — Updates will be written to the database.');
    console.log('    Starting in 3 seconds... (Ctrl+C to abort)\n');
    await new Promise(r => setTimeout(r, 3000));
  }

  // ─── Pre-flight counts ─────────────────────────────────────────
  const total = await prisma.listing.count({ where: { isActive: true } });
  const nullLink = await prisma.listing.count({ where: { isActive: true, moreInformationLink: null } });
  const nullPhoto = await prisma.listing.count({ where: { isActive: true, primaryPhotoUrl: null } });
  const nullAgent = await prisma.listing.count({ where: { isActive: true, agentName: null } });
  const nullPhone = await prisma.listing.count({ where: { isActive: true, agentPhone: null } });
  const nullOffice = await prisma.listing.count({ where: { isActive: true, officeName: null } });
  const nullMedia = await prisma.listing.count({ where: { isActive: true, mediaJson: { equals: null } } });

  console.log(`\n📊 PRE-FLIGHT (${total} active listings):`);
  console.log(`   NULL moreInformationLink: ${nullLink}`);
  console.log(`   NULL primaryPhotoUrl:     ${nullPhoto}`);
  console.log(`   NULL agentName:           ${nullAgent}`);
  console.log(`   NULL agentPhone:          ${nullPhone}`);
  console.log(`   NULL officeName:          ${nullOffice}`);
  console.log(`   NULL mediaJson:           ${nullMedia}`);

  const t0 = Date.now();

  // ─── Run Phases ────────────────────────────────────────────────
  if (!SINGLE_PHASE || PHASE1_ONLY) await phase1();
  if (!SINGLE_PHASE || PHASE2_ONLY) await phase2();
  if ((!SINGLE_PHASE && !NO_API) || PHASE3_ONLY) await phase3();

  // ─── Post-run validation ──────────────────────────────────────
  console.log('\n───────────────────────────────────────────────────────────');
  console.log('  POST-RUN VALIDATION');
  console.log('───────────────────────────────────────────────────────────');

  const postLink = await prisma.listing.count({ where: { isActive: true, moreInformationLink: null } });
  const postPhoto = await prisma.listing.count({ where: { isActive: true, primaryPhotoUrl: null } });
  const postAgent = await prisma.listing.count({ where: { isActive: true, agentName: null } });
  const postPhone = await prisma.listing.count({ where: { isActive: true, agentPhone: null } });
  const postOffice = await prisma.listing.count({ where: { isActive: true, officeName: null } });
  const postMedia = await prisma.listing.count({ where: { isActive: true, mediaJson: { equals: null } } });

  console.log(`  moreInformationLink: ${nullLink} → ${postLink}  (fixed ${nullLink - postLink})`);
  console.log(`  primaryPhotoUrl:     ${nullPhoto} → ${postPhoto}  (fixed ${nullPhoto - postPhoto})`);
  console.log(`  agentName:           ${nullAgent} → ${postAgent}  (fixed ${nullAgent - postAgent})`);
  console.log(`  agentPhone:          ${nullPhone} → ${postPhone}  (fixed ${nullPhone - postPhone})`);
  console.log(`  officeName:          ${nullOffice} → ${postOffice}  (fixed ${nullOffice - postOffice})`);
  console.log(`  mediaJson:           ${nullMedia} → ${postMedia}  (fixed ${nullMedia - postMedia})`);

  // ── Specific validation: NULL primaryPhotoUrl where media exists
  const photoNullButMediaExists: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Listing"
    WHERE "isActive" = true
      AND "primary_photo_url" IS NULL
      AND ("media_json" IS NOT NULL OR "primaryPhoto" IS NOT NULL)
  `;
  const orphanCount = Number(photoNullButMediaExists[0]?.cnt || 0);
  if (orphanCount > 0) {
    console.log(`\n  ⚠️  ${orphanCount} listings still have NULL primaryPhotoUrl despite having media data`);
    console.log(`     (likely invalid image URLs that failed validation)`);
  } else {
    console.log(`\n  ✅ All listings with media data have a valid primaryPhotoUrl`);
  }

  // Sample 10 records
  if (!DRY_RUN) {
    console.log('\n  📋 Sample of 10 recently updated:');
    const samples = await prisma.listing.findMany({
      where: { isActive: true },
      select: {
        listingKey: true,
        moreInformationLink: true,
        agentName: true,
        primaryPhotoUrl: true,
        officeName: true,
        mediaJson: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    for (const s of samples) {
      const mediaCount = Array.isArray(s.mediaJson) ? (s.mediaJson as any[]).length : 0;
      console.log(
        `    ${s.listingKey} | link=${s.moreInformationLink ? '✅' : '❌'} | agent=${s.agentName || '—'} | photo=${s.primaryPhotoUrl ? '✅' : '❌'} | office=${s.officeName || '—'} | media=${mediaCount}`
      );
    }
  }

  const totalElapsed = ((Date.now() - t0) / 1000).toFixed(1);

  // ── Summary ───────────────────────────────────────────────────
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Duration:     ${totalElapsed}s`);
  console.log(`  Total active: ${total}`);
  console.log(`  Fields fixed: ${(nullLink - postLink) + (nullPhoto - postPhoto) + (nullAgent - postAgent) + (nullPhone - postPhone) + (nullOffice - postOffice) + (nullMedia - postMedia)} field-values across all listings`);
  console.log(`═══════════════════════════════════════════════════════════`);

  if (DRY_RUN) {
    console.log('\n💡 DRY RUN complete. To apply:');
    console.log('   npx tsx scripts/backfill-listings.ts --commit');
    console.log('   npx tsx scripts/backfill-listings.ts --commit --no-api     (skip DDF API)');
    console.log('   npx tsx scripts/backfill-listings.ts --commit --phase1     (SQL bulk only)');
    console.log('   npx tsx scripts/backfill-listings.ts --commit --phase2     (rawData extraction only)');
    console.log('   npx tsx scripts/backfill-listings.ts --commit --phase3     (API only)\n');
  }

  await prisma.$disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error('\n❌ FATAL ERROR:', err);
  await prisma.$disconnect();
  process.exit(1);
});
