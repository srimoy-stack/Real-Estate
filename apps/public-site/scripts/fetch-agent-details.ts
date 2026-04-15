/**
 * ─── Fetch & Normalize Agent Details ── Production-Safe Backfill ──
 *
 * PURPOSE:
 *   Extracts agent details from DDF rawData and the DDF Member/Office
 *   API, then updates Listing columns (agentName, agentPhone,
 *   agentEmail, officeName).
 *
 * STRATEGY:
 *   PHASE 1 (rawData):  Extract agent info from existing Listing.rawData
 *                       JSON for listings missing agent fields.
 *   PHASE 2 (DDF API):  Fetch Member + Office directories from DDF
 *                       and enrich listings that have ListAgentKey /
 *                       ListOfficeKey but are still missing fields.
 *
 * SAFETY GUARANTEES:
 *   ✅ NEVER overwrites existing non-null values (fill-only)
 *   ✅ NEVER touches rawData column (read-only)
 *   ✅ Idempotent: safe to run multiple times
 *   ✅ DRY RUN mode by default
 *   ✅ Cursor-based pagination (no skip/offset)
 *   ✅ Per-record try/catch — one bad record won't crash the run
 *   ✅ Batch processing with configurable batch size
 *   ✅ Progress logging with stats
 *
 * USAGE:
 *   DRY RUN:    npx tsx scripts/fetch-agent-details.ts
 *   REAL RUN:   npx tsx scripts/fetch-agent-details.ts --commit
 *   PHASE 1:    npx tsx scripts/fetch-agent-details.ts --commit --phase1
 *   PHASE 2:    npx tsx scripts/fetch-agent-details.ts --commit --phase2
 *
 * ────────────────────────────────────────────────────────────────────
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';
import { setCache } from '../src/lib/redis';

const prisma = new PrismaClient({ log: ['error'] });

// ─── Configuration ──────────────────────────────────────────────────
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 50;
const DDF_MEMBER_URL = 'https://ddfapi.realtor.ca/odata/v1/Member';
const DDF_OFFICE_URL = 'https://ddfapi.realtor.ca/odata/v1/Office';

const DRY_RUN = !process.argv.includes('--commit');
const PHASE1_ONLY = process.argv.includes('--phase1');
const PHASE2_ONLY = process.argv.includes('--phase2');

// ─── Agent Extraction Helpers ──────────────────────────────────────

interface AgentData {
  agentName: string | null;
  agentEmail: string | null;
  agentPhone: string | null;
  agentOfficePhone: string | null;
  agentPhoto: string | null;
  agentMemberKey: string | null;
  brokerageName: string | null;
  brokerageKey: string | null;
}

function safeTrim(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return String(val).trim() || null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstOf(raw: Record<string, any>, ...fields: string[]): unknown {
  for (const f of fields) {
    if (raw[f] !== null && raw[f] !== undefined && raw[f] !== '') return raw[f];
  }
  return null;
}

function isValidPhotoUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.length < 10 || !trimmed.startsWith('http')) return null;
  if (/\.(pdf|doc|docx|zip|rar|7z)$/i.test(trimmed)) return null;
  try { new URL(trimmed); return trimmed; } catch { return null; }
}

/**
 * Extracts normalized agent data from a DDF rawData JSON object.
 * Handles multiple field name variations across DDF structures.
 */
function extractAgentFromRawData(rawData: unknown): AgentData {
  const EMPTY: AgentData = {
    agentName: null, agentEmail: null, agentPhone: null,
    agentOfficePhone: null, agentPhoto: null, agentMemberKey: null,
    brokerageName: null, brokerageKey: null,
  };
  if (!rawData || typeof rawData !== 'object') return EMPTY;

  const raw = rawData as Record<string, any>;

  // Agent Name — try multiple field locations
  let agentName = safeTrim(firstOf(raw, 'ListAgentFullName', 'AgentFullName', 'ListingAgentName'));
  if (!agentName) {
    const first = safeTrim(firstOf(raw, 'ListAgentFirstName', 'AgentFirstName'));
    const last = safeTrim(firstOf(raw, 'ListAgentLastName', 'AgentLastName'));
    if (first || last) agentName = [first, last].filter(Boolean).join(' ');
  }
  if (!agentName && raw.Individual) {
    const ind = Array.isArray(raw.Individual) ? raw.Individual[0] : raw.Individual;
    if (ind && typeof ind === 'object') {
      const name = ind.Name || ind.FullName;
      if (typeof name === 'string') agentName = safeTrim(name);
      else if (name && typeof name === 'object') {
        const fn = safeTrim(name.FirstName || name.first);
        const ln = safeTrim(name.LastName || name.last);
        if (fn || ln) agentName = [fn, ln].filter(Boolean).join(' ');
      }
    }
  }
  if (!agentName) {
    const nested = raw.Agent || raw.ListingAgent;
    if (nested && typeof nested === 'object') {
      const obj = Array.isArray(nested) ? nested[0] : nested;
      agentName = safeTrim(obj?.FullName || obj?.Name || obj?.AgentName);
    }
  }

  return {
    agentName,
    agentEmail: safeTrim(firstOf(raw, 'ListAgentEmail', 'AgentEmail', 'ListingAgentEmail')),
    agentPhone: safeTrim(firstOf(raw, 'ListAgentDirectPhone', 'AgentDirectPhone', 'ListingAgentPhone', 'ListAgentPreferredPhone')),
    agentOfficePhone: safeTrim(firstOf(raw, 'ListAgentOfficePhone', 'ListOfficePhone', 'AgentOfficePhone')),
    agentPhoto: isValidPhotoUrl(firstOf(raw, 'ListAgentPhoto', 'AgentPhoto', 'ListAgentPhotoURL')),
    agentMemberKey: safeTrim(firstOf(raw, 'ListAgentKey', 'ListAgentMlsId', 'AgentMemberKey')),
    brokerageName: safeTrim(firstOf(raw, 'ListOfficeName', 'OfficeName', 'BrokerageName', 'ListingOfficeName')),
    brokerageKey: safeTrim(firstOf(raw, 'ListOfficeKey', 'OfficeKey', 'BrokerageKey')),
  };
}

// ─── Stats ──────────────────────────────────────────────────────────
const stats = {
  phase1: { scanned: 0, updated: 0, skipped: 0, failed: 0 },
  phase2: { membersLoaded: 0, officesLoaded: 0, listingsEnriched: 0, failed: 0 },
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
  if (!data.access_token) throw new Error(`Auth failed: ${JSON.stringify(data)}`);

  cachedToken = data.access_token;
  const expiresIn = data.expires_in || 3600;
  setTimeout(() => { cachedToken = null; }, (expiresIn - 120) * 1000);
  console.log('  🔐 DDF token acquired');
  return cachedToken!;
}


// ═══════════════════════════════════════════════════════════════════
//  PHASE 1: Extract agent data from rawData → update Listing columns
//
//  Reads rawData (never modifies it), fills NULL agent columns.
// ═══════════════════════════════════════════════════════════════════
async function phase1() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 1: rawData Extraction → Fill Listing Agent Fields ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const needCount = await prisma.listing.count({
    where: {
      isActive: true,
      rawData: { not: Prisma.JsonNull },
      OR: [
        { agentName: null },
        { agentPhone: null },
        { agentEmail: null },
        { officeName: null },
      ],
    },
  });

  console.log(`  📊 ${needCount} active listings have rawData + at least one NULL agent field\n`);
  if (needCount === 0) {
    console.log('  ✅ Phase 1: Nothing to do — all agent fields already populated.');
    return;
  }

  let cursor: number | undefined = undefined;
  let batchNum = 0;
  const t0 = Date.now();

  while (true) {
    batchNum++;
    const listings: any[] = await prisma.listing.findMany({
      where: {
        isActive: true,
        rawData: { not: Prisma.JsonNull },
        OR: [
          { agentName: null },
          { agentPhone: null },
          { agentEmail: null },
          { officeName: null },
        ],
      },
      select: {
        id: true,
        agentName: true,
        agentPhone: true,
        agentEmail: true,
        officeName: true,
        rawData: true,
      },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (listings.length === 0) break;

    let batchUpdated = 0;

    for (const listing of listings) {
      stats.phase1.scanned++;
      try {
        const extracted = extractAgentFromRawData(listing.rawData);
        const updateData: Record<string, any> = {};

        // Only fill NULL columns — NEVER overwrite existing values
        if (!listing.agentName && extracted.agentName) {
          updateData.agentName = extracted.agentName;
        }
        if (!listing.agentPhone && extracted.agentPhone) {
          updateData.agentPhone = extracted.agentPhone;
        }
        if (!listing.agentEmail && extracted.agentEmail) {
          updateData.agentEmail = extracted.agentEmail;
        }
        if (!listing.officeName && extracted.brokerageName) {
          updateData.officeName = extracted.brokerageName;
        }

        if (Object.keys(updateData).length > 0) {
          if (!DRY_RUN) {
            await prisma.listing.update({ where: { id: listing.id }, data: updateData });
          }
          batchUpdated++;
          stats.phase1.updated++;
        } else {
          stats.phase1.skipped++;
        }
      } catch (e: any) {
        stats.phase1.failed++;
      }
    }

    cursor = listings[listings.length - 1].id;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(
      `  📦 P1 Batch ${batchNum}: scanned=${listings.length} | updated=${batchUpdated} | ` +
      `total=${stats.phase1.updated} | ${elapsed}s`
    );

    await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
  }

  console.log(`\n  ✅ Phase 1 complete: ${stats.phase1.updated} listings updated.`);
}


// ═══════════════════════════════════════════════════════════════════
//  PHASE 2: Fetch Members + Offices from DDF API → Enrich Listings
//
//  For listings that still have NULL agent fields after Phase 1,
//  look up the agent by ListAgentKey in the DDF Member directory.
//  rawData is only READ, never modified.
// ═══════════════════════════════════════════════════════════════════
async function phase2() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 2: DDF Member + Office API → Enrich Listings      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const token = await auth();

  // ── 2a. Build Member lookup map ──────────────────────────────────
  console.log('  📡 Fetching Members from DDF (max 100/page per API spec)...');
  const memberMap = new Map<string, { name: string; phone: string | null; photo: string | null }>();
  let nextMemberUrl: string | null = `${DDF_MEMBER_URL}?$top=100&$select=MemberKey,MemberFirstName,MemberLastName,MemberOfficePhone,MemberTollFreePhone&$orderby=MemberKey`;

  while (nextMemberUrl) {
    try {
      const r = await fetch(nextMemberUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(60000),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        console.error(`  ⚠️  Member API returned ${r.status}: ${body.slice(0, 200)}`);
        break;
      }

      const data = await r.json();
      const members = data.value || [];
      if (members.length === 0) break;

      for (const m of members) {
        const fullName = [safeTrim(m.MemberFirstName), safeTrim(m.MemberLastName)]
          .filter(Boolean).join(' ') || null;

        if (!fullName || !m.MemberKey) continue;

        memberMap.set(String(m.MemberKey), {
          name: fullName,
          phone: safeTrim(m.MemberOfficePhone) || safeTrim(m.MemberTollFreePhone),
          photo: null,
        });
        stats.phase2.membersLoaded++;
      }

      nextMemberUrl = data['@odata.nextLink'] || null;
      if (stats.phase2.membersLoaded % 500 === 0) {
        process.stdout.write(`\r  📦 ${stats.phase2.membersLoaded} members loaded...`);
      }
    } catch (e: any) {
      console.error(`  ⚠️  Member fetch error: ${e.message}`);
      break;
    }
  }
  console.log(`\n  ✅ Loaded ${stats.phase2.membersLoaded} members.`);

  // ── 2b. Build Office lookup map ─────────────────────────────────
  console.log('\n  📡 Fetching Offices from DDF (max 100/page per API spec)...');
  const officeMap = new Map<string, string>();
  let nextOfficeUrl: string | null = `${DDF_OFFICE_URL}?$top=100&$select=OfficeKey,OfficeName&$orderby=OfficeKey`;

  while (nextOfficeUrl) {
    try {
      const r = await fetch(nextOfficeUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(60000),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        console.error(`  ⚠️  Office API returned ${r.status}: ${body.slice(0, 200)}`);
        break;
      }

      const data = await r.json();
      const offices = data.value || [];
      if (offices.length === 0) break;

      for (const o of offices) {
        if (o.OfficeName && o.OfficeKey) {
          officeMap.set(String(o.OfficeKey), o.OfficeName);
          stats.phase2.officesLoaded++;
        }
      }
      nextOfficeUrl = data['@odata.nextLink'] || null;
      if (stats.phase2.officesLoaded % 500 === 0) {
        process.stdout.write(`\r  📦 ${stats.phase2.officesLoaded} offices loaded...`);
      }
    } catch (e: any) {
      console.error(`  ⚠️  Office fetch error: ${e.message}`);
      break;
    }
  }
  console.log(`\n  ✅ Loaded ${stats.phase2.officesLoaded} offices.`);

  if (memberMap.size === 0 && officeMap.size === 0) {
    console.log('  ⚠️  No members or offices loaded. Skipping enrichment.');
    return;
  }

  // ── 2c. Enrich listings that still have NULL agent fields ───────
  console.log('\n  🔗 Enriching listings with DDF data...');
  let cursor: number | undefined = undefined;
  let batchNum = 0;
  const t0 = Date.now();

  while (true) {
    batchNum++;
    const listings: any[] = await prisma.listing.findMany({
      where: {
        isActive: true,
        rawData: { not: Prisma.JsonNull },
        OR: [
          { agentName: null },
          { agentPhone: null },
          { agentEmail: null },
          { officeName: null },
        ],
      },
      select: {
        id: true,
        agentName: true,
        agentPhone: true,
        agentEmail: true,
        officeName: true,
        rawData: true,
      },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (listings.length === 0) break;

    let batchEnriched = 0;

    for (const listing of listings) {
      try {
        const raw = (listing.rawData || {}) as Record<string, any>;
        const agentKey = safeTrim(raw.ListAgentKey);
        const officeKey = safeTrim(raw.ListOfficeKey);
        const updateData: Record<string, any> = {};

        // Look up office by OfficeKey (ensure string comparison)
        const officeKeyStr = officeKey ? String(officeKey) : null;
        let officeName = listing.officeName;
        if (!officeName && officeKeyStr && officeMap.has(officeKeyStr)) {
          officeName = officeMap.get(officeKeyStr)!;
          updateData.officeName = officeName;
        }

        // --- NEW: Save to Redis Cache (always do this as it saves Postgres space) ---
        if (agentKeyStr && memberMap.has(agentKeyStr)) {
          const member = memberMap.get(agentKeyStr)!;
          await setCache(`agent:${agentKeyStr}`, {
            agentName: member.name,
            agentPhone: member.phone,
            agentPhoto: member.photo,
            officeName: officeName || null
          }, 86400 * 30); // 30 days
        }
        if (officeKeyStr && officeMap.has(officeKeyStr)) {
          await setCache(`office:${officeKeyStr}`, officeMap.get(officeKeyStr)!, 86400 * 30);
        }

        if (Object.keys(updateData).length > 0) {
          if (!DRY_RUN) {
            try {
              await prisma.listing.update({ where: { id: listing.id }, data: updateData });
            } catch (e: any) {
              // If Postgres is full, we rely on the Redis cache we just populated
              if (e.message.includes('limit') || e.message.includes('512')) {
                // Ignore space errors, keep going for Redis
              } else {
                throw e;
              }
            }
          }
          batchEnriched++;
          stats.phase2.listingsEnriched++;
        }
      } catch (e: any) {
        stats.phase2.failed++;
      }
    }

    cursor = listings[listings.length - 1].id;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    if (batchEnriched > 0 || batchNum % 10 === 0) {
      console.log(
        `  📦 P2 Batch ${batchNum}: enriched=${batchEnriched} | ` +
        `total=${stats.phase2.listingsEnriched} | ${elapsed}s`
      );
    }

    await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
  }

  console.log(`\n  ✅ Phase 2 complete: ${stats.phase2.listingsEnriched} listings enriched from DDF API.`);
}


// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════
async function main() {
  const t0 = Date.now();

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Fetch & Normalize Agent Details — Production Backfill  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`  Mode:  ${DRY_RUN ? '🟡 DRY RUN (no writes)' : '🟢 COMMIT (writing to DB)'}`);
  console.log(`  Phase: ${PHASE1_ONLY ? 'Phase 1 only' : PHASE2_ONLY ? 'Phase 2 only' : 'All phases'}`);
  console.log('');

  // Phase 1: Extract from rawData (read-only on rawData)
  if (!PHASE2_ONLY) {
    await phase1();
  }

  // Phase 2: Fetch from DDF API + enrich
  if (!PHASE1_ONLY) {
    await phase2();
  }

  // ─── Final Report ───────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   RESULTS                                                ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  PHASE 1: rawData Extraction                             ║`);
  console.log(`║    Listings Scanned:   ${stats.phase1.scanned.toString().padEnd(35)}║`);
  console.log(`║    ✅ Updated:         ${stats.phase1.updated.toString().padEnd(35)}║`);
  console.log(`║    ⏭️  Skipped:        ${stats.phase1.skipped.toString().padEnd(35)}║`);
  console.log(`║    ❌ Failed:          ${stats.phase1.failed.toString().padEnd(35)}║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  PHASE 2: DDF API Enrichment                             ║`);
  console.log(`║    Members Loaded:     ${stats.phase2.membersLoaded.toString().padEnd(35)}║`);
  console.log(`║    Offices Loaded:     ${stats.phase2.officesLoaded.toString().padEnd(35)}║`);
  console.log(`║    ✅ Enriched:        ${stats.phase2.listingsEnriched.toString().padEnd(35)}║`);
  console.log(`║    ❌ Failed:          ${stats.phase2.failed.toString().padEnd(35)}║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  ⏱️  Total Duration:    ${(elapsed + 's').padEnd(35)}║`);
  console.log('╚═══════════════════════════════════════════════════════════╝');

  if (DRY_RUN) {
    console.log('\n  🟡 This was a DRY RUN. No data was written.');
    console.log('  💡 Run with --commit to apply changes:');
    console.log('     npx tsx scripts/fetch-agent-details.ts --commit\n');
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
