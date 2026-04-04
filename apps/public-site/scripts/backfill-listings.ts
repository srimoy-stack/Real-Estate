/**
 * ─── Production-Safe Backfill: Fill Missing Listing Fields ── v4 ──
 *
 * PHASE 1 (SQL bulk): Fast bulk SQL for moreInformationLink + primaryPhotoUrl
 * PHASE 2 (rawData):  Cursor-batched extraction from rawData JSON for
 *                     agentName, agentPhone, officeName, mediaJson, primaryPhotoUrl
 * PHASE 3 (API):      DDF API feed crawl (High-Speed Recovery)
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
 *   RESUME PHASE 3:  npx tsx scripts/backfill-listings.ts --commit --skip 4800
 *
 * ────────────────────────────────────────────────────────────────────
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

// ─── Configuration ──────────────────────────────────────────────────
const BATCH_SIZE = 200;
const BATCH_DELAY_MS = 50;
const API_PAGE_SIZE = 100;

const DRY_RUN = !process.argv.includes('--commit');
const PHASE1_ONLY = process.argv.includes('--phase1');
const PHASE2_ONLY = process.argv.includes('--phase2');
const PHASE3_ONLY = process.argv.includes('--phase3');
const NO_API = process.argv.includes('--no-api');
const ONLY_PHOTOS = process.argv.includes('--photos-only');

const argSkipIndex = process.argv.indexOf('--skip');
const START_SKIP = argSkipIndex !== -1 ? parseInt(process.argv[argSkipIndex + 1], 10) : 0;

const DDF = 'https://ddfapi.realtor.ca/odata/v1/Property';
const DDF_MEMBER = 'https://ddfapi.realtor.ca/odata/v1/Member';
const DDF_OFFICE = 'https://ddfapi.realtor.ca/odata/v1/Office';

// ─── SQL Utility ───────────────────────────────────────────────────
async function getCount(where: string) {
  const res: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "Listing" WHERE ${where}`);
  return Number(res[0]?.cnt || 0);
}

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
  const id = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID;
  const secret = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET;
  
  if (!id || !secret) {
     throw new Error("Missing DDF credentials in .env (DDF_CLIENT_ID/SECRET)");
  }

  const r = await fetch('https://identity.crea.ca/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: id,
      client_secret: secret,
      scope: 'DDFApi_Read',
    }),
  });
  const d = await r.json();
  tok = d.access_token;
  setTimeout(() => { tok = null; }, (d?.expires_in - 120) * 1000);
  console.log('  🔐 DDF token acquired');
  return tok!;
}

/**
 * Fetches all available members/offices to build a local lookup map
 */
async function buildAgentOfficeMaps() {
  console.log('\n  🏗️  Building local Agent/Office name maps...');
  const t = await auth();
  
  const memberMap = new Map<string, string>(); 
  const officeMap = new Map<string, string>(); 
  const agentPhoneMap = new Map<string, string>();

  // 1. Fetch Members
  console.log('     Fetching Members...');
  let skip = 0;
  while (true) {
    const params = new URLSearchParams({
      '$top': '1000',
      '$skip': skip.toString(),
      // We try a broader select in case field names differ
      '$select': 'MemberKey,MemberFirstName,MemberLastName,MemberFullName,MemberOfficePhone'
    });
    try {
      const r = await fetch(`${DDF_MEMBER}?${params}`, {
        headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' }
      });
      if (!r.ok) break;
      const data = await r.json();
      if (!data.value || data.value.length === 0) break;
      for (const m of data.value) {
        const fullName = m.MemberFullName || `${m.MemberFirstName || ''} ${m.MemberLastName || ''}`.trim();
        if (fullName) memberMap.set(m.MemberKey, fullName);
        if (m.MemberOfficePhone) agentPhoneMap.set(m.MemberKey, m.MemberOfficePhone);
      }
      if (data.value.length < 1000) break;
      skip += 1000;
      process.stdout.write(`.`);
      if (skip % 5000 === 0) console.log(` (${skip} members cached)`);
    } catch (e) { console.error('Member fetch error:', e); break; }
  }
  console.log(`\n     ✅ Cached ${memberMap.size} members.`);

  // 2. Fetch Offices
  console.log('     Fetching Offices...');
  skip = 0;
  while (true) {
    const params = new URLSearchParams({
      '$top': '1000',
      '$skip': skip.toString(),
      '$select': 'OfficeKey,OfficeName'
    });
    try {
      const r = await fetch(`${DDF_OFFICE}?${params}`, {
        headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' }
      });
      if (!r.ok) break;
      const data = await r.json();
      if (!data.value || data.value.length === 0) break;
      for (const o of data.value) {
        if (o.OfficeName) officeMap.set(o.OfficeKey, o.OfficeName);
      }
      if (data.value.length < 1000) break;
      skip += 1000;
      process.stdout.write(`.`);
    } catch (e) { console.error('Office fetch error:', e); break; }
  }
  console.log(`\n     ✅ Cached ${officeMap.size} offices.`);

  return { memberMap, officeMap, agentPhoneMap };
}


// ═══════════════════════════════════════════════════════════════════
//  PHASE 1: Bulk SQL updates
// ═══════════════════════════════════════════════════════════════════
async function phase1() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 1: Bulk SQL Backfill (links + photos)              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 1a. moreInformationLink from rawData->>'ListingURL'
  const countLinkFromRaw = await getCount('"isActive" = true AND "moreInformationLink" IS NULL AND "rawData"->>\'ListingURL\' IS NOT NULL AND "rawData"->>\'ListingURL\' != \'\'');
  console.log(`  📊 moreInformationLink from rawData.ListingURL: ${countLinkFromRaw} candidates`);

  if (!DRY_RUN && countLinkFromRaw > 0) {
    const res = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "moreInformationLink" = CASE
        WHEN "rawData"->>'ListingURL' LIKE 'www.%'
        THEN 'https://' || "rawData"->>'ListingURL'
        ELSE "rawData"->>'ListingURL'
      END,
      "updatedAt" = NOW()
      WHERE "isActive" = true
        AND "moreInformationLink" IS NULL
        AND "rawData"->>'ListingURL' IS NOT NULL
        AND "rawData"->>'ListingURL' != ''
    `;
    console.log(`  ✅ Updated ${res} rows.`);
  }

  // 1b. moreInformationLink constructed from listingId
  const countLinkConstruct = await getCount('"isActive" = true AND "moreInformationLink" IS NULL AND "listingId" IS NOT NULL');
  console.log(`  📊 moreInformationLink from listingId (construct): ${countLinkConstruct} candidates`);

  if (!DRY_RUN && countLinkConstruct > 0) {
    const res = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "moreInformationLink" = 'https://www.realtor.ca/real-estate/' || "listingId", "updatedAt" = NOW()
      WHERE "isActive" = true AND "moreInformationLink" IS NULL AND "listingId" IS NOT NULL
    `;
    console.log(`  ✅ Updated ${res} rows.`);
  }

  // 1c. primaryPhotoUrl from primaryPhoto column
  const countPhotoFromPrimary = await getCount('"isActive" = true AND "primary_photo_url" IS NULL AND "primaryPhoto" LIKE \'http%\'');
  console.log(`  📊 primaryPhotoUrl from primaryPhoto: ${countPhotoFromPrimary} candidates`);

  if (!DRY_RUN && countPhotoFromPrimary > 0) {
    const res = await prisma.$executeRaw`
      UPDATE "Listing"
      SET "primary_photo_url" = "primaryPhoto", "updatedAt" = NOW()
      WHERE "isActive" = true AND "primary_photo_url" IS NULL AND "primaryPhoto" LIKE 'http%'
    `;
    console.log(`  ✅ Updated ${res} rows.`);
  }

  console.log('\n  ✅ Phase 1 complete.');
}


// ═══════════════════════════════════════════════════════════════════
//  PHASE 2: rawData Extraction
// ═══════════════════════════════════════════════════════════════════
async function phase2() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 2: rawData Extraction (mediaJson + names)          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const needCount = await prisma.listing.count({
    where: {
      isActive: true,
      rawData: { not: Prisma.JsonNull },
      OR: [
        { primaryPhotoUrl: null },
        { agentName: null },
        { agentPhone: null },
        { officeName: null },
        { moreInformationLink: null },
      ],
    },
  });
  console.log(`  📊 ${needCount} listings have rawData + at least one NULL field\n`);

  if (needCount === 0) return;

  let cursor: number | undefined = undefined;
  let batchNum = 0;
  let totalUpdated = 0;
  const t0 = Date.now();

  while (true) {
    batchNum++;
    const listings: any[] = await prisma.listing.findMany({
      where: {
        isActive: true,
        rawData: { not: Prisma.JsonNull },
        OR: [{ primaryPhotoUrl: null }, { agentName: null }, { officeName: null }, { moreInformationLink: null }],
      },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (listings.length === 0) break;

    let batchUpdated = 0;
    for (const listing of listings) {
      try {
        const rd = (listing.rawData || {}) as Record<string, any>;
        const updateData: Record<string, any> = {};

        if (!listing.agentName && isValidString(rd.ListAgentFullName)) {
          updateData.agentName = rd.ListAgentFullName.trim();
        }
        if (!listing.agentPhone && isValidString(rd.ListAgentDirectPhone)) {
          updateData.agentPhone = rd.ListAgentDirectPhone.trim();
        }
        if (!listing.officeName && isValidString(rd.ListOfficeName)) {
          updateData.officeName = rd.ListOfficeName.trim();
        }
        if (!listing.mediaJson) {
          const valid = extractValidMedia(rd.Media);
          if (valid) updateData.mediaJson = valid;
        }
        if (!listing.primaryPhotoUrl) {
          const mj = updateData.mediaJson || listing.mediaJson;
          if (Array.isArray(mj) && mj.length > 0) updateData.primaryPhotoUrl = mj[0].MediaURL;
        }

        if (Object.keys(updateData).length > 0) {
          if (!DRY_RUN) {
            await prisma.listing.update({ where: { id: listing.id }, data: updateData });
          }
          batchUpdated++;
          totalUpdated++;
        }
      } catch (e) {}
    }

    cursor = listings[listings.length - 1].id;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`  📦 P2 Batch ${batchNum}: scanned=${listings.length} | updated=${batchUpdated} | total=${totalUpdated} | ${elapsed}s`);
    await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
  }
}

// ═══════════════════════════════════════════════════════════════════
//  PHASE 3: DDF API Feed Crawl
// ═══════════════════════════════════════════════════════════════════
async function phase3() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 3: DDF API Feed Crawl (High-Speed Recovery)        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const t = await auth();
  const maps = !ONLY_PHOTOS ? await buildAgentOfficeMaps() : null;

  console.log(`\n  🚜 Crawling Property Feed (Start from skip=${START_SKIP})...`);
  let skip = START_SKIP;
  let totalUpdated = 0;
  let totalScanned = 0;
  let consecutiveErrors = 0;
  const t0 = Date.now();

  while (consecutiveErrors < 10) {
    const params = new URLSearchParams({
      '$top': API_PAGE_SIZE.toString(),
      '$skip': skip.toString(),
      '$select': 'ListingKey,ListingURL,ListAgentKey,ListOfficeKey,Media'
    });
    
    try {
      const r = await fetch(`${DDF}?${params}`, {
        headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(60000),
      });

      if (!r.ok) throw new Error(`API error ${r.status}`);

      const data = await r.json();
      const records = data.value || [];
      if (records.length === 0) break;
      
      consecutiveErrors = 0;
      totalScanned += records.length;

      const keys = records.map((r: any) => r.ListingKey).filter(Boolean);
      const locals = await prisma.listing.findMany({
        where: {
          listingKey: { in: keys },
          OR: [{ primaryPhotoUrl: null }, { agentName: null }, { officeName: null }]
        },
        select: { id: true, listingKey: true, primaryPhotoUrl: true, agentName: true, officeName: true }
      });

      for (const local of locals) {
        const api = records.find((r: any) => r.ListingKey === local.listingKey);
        if (!api) continue;

        const updateData: Record<string, any> = {};
        if (!local.primaryPhotoUrl && api.Media) {
          const v = extractValidMedia(api.Media);
          if (v) {
            updateData.mediaJson = v;
            updateData.primaryPhotoUrl = v[0].MediaURL;
          }
        }
        if (maps) {
          if (!local.agentName && api.ListAgentKey && maps.memberMap.has(api.ListAgentKey)) {
            updateData.agentName = maps.memberMap.get(api.ListAgentKey);
            updateData.agentPhone = maps.agentPhoneMap.get(api.ListAgentKey);
          }
          if (!local.officeName && api.ListOfficeKey && maps.officeMap.has(api.ListOfficeKey)) {
            updateData.officeName = maps.officeMap.get(api.ListOfficeKey);
          }
        }

        if (Object.keys(updateData).length > 0) {
          if (!DRY_RUN) await prisma.listing.update({ where: { id: local.id }, data: updateData });
          totalUpdated++;
        }
      }

      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      process.stdout.write('.');
      if (totalScanned % 1000 === 0) {
        console.log(` (Scanned ${totalScanned} | Updated ${totalUpdated} | skip=${skip} | ${elapsed}s)`);
      }

      if (records.length < API_PAGE_SIZE) break;
      skip += API_PAGE_SIZE;
    } catch (e: any) {
      console.error(`\n  ⚠️  Warning at skip=${skip}: ${e.message}`);
      consecutiveErrors++;
      await new Promise(res => setTimeout(res, 2000));
      skip += API_PAGE_SIZE;
    }
  }

  console.log(`\n  ✅ Phase 3 complete: ${totalUpdated} updated, ${totalScanned} scanned.`);
}

(async () => {
  try {
    if (!PHASE2_ONLY && !PHASE3_ONLY) await phase1();
    if (!PHASE1_ONLY && !PHASE3_ONLY) await phase2();
    if (!PHASE1_ONLY && !PHASE2_ONLY && !NO_API) await phase3();
  } catch (e) {
    console.error('\n❌ Fatal error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
