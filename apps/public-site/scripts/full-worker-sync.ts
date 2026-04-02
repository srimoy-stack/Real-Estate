import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient({ log: ['error'] });
const DDF = 'https://ddfapi.realtor.ca/odata/v1/Property';
const PG = 100, CONC = 4, DELAY = 500; 

let tok: string | null = null;
async function auth(): Promise<string> {
    if (tok) return tok;
    const r = await fetch('https://identity.crea.ca/connect/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID || '', client_secret: process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET || '', scope: 'DDFApi_Read' }),
    });
    const d = await r.json(); tok = d.access_token;
    setTimeout(() => { tok = null; }, (d.expires_in - 120) * 1000);
    console.log('🔐 New token'); return tok!;
}

async function page(skip: number): Promise<any[]> {
    const t = await auth();
    const p = new URLSearchParams({ '$top': PG.toString(), '$skip': skip.toString(), '$orderby': 'ModificationTimestamp desc' });
    try {
        const r = await fetch(`${DDF}?${p}`, { headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
        if (!r.ok) return [];
        return (await r.json()).value || [];
    } catch { return []; }
}

function map(i: any) {
    const sf = (v: any) => { if (v == null) return null; const n = parseFloat(String(v)); return Number.isFinite(n) ? n : null; };
    const si = (v: any) => { if (v == null) return null; const n = parseInt(String(v), 10); return Number.isFinite(n) ? n : null; };
    const normalizeUrl = (u: any) => {
        if (typeof u !== 'string') return null;
        const t = u.trim();
        return t.startsWith('www.') ? `https://${t}` : t;
    };
    const listingUrl = normalizeUrl(i.ListingURL);
    return {
        listingKey: i.ListingKey, listingId: i.ListingId || null, listPrice: sf(i.ListPrice),
        standardStatus: i.StandardStatus || null, propertyType: i.PropertyType || null,
        propertySubType: i.PropertySubType || null, bedroomsTotal: si(i.BedroomsTotal),
        bathroomsTotal: si(i.BathroomsTotalInteger), address: i.UnparsedAddress || null,
        city: i.City || null, province: i.StateOrProvince || null, postalCode: i.PostalCode || null,
        latitude: sf(i.Latitude), longitude: sf(i.Longitude),
        livingArea: sf(i.LivingArea || i.BuildingAreaTotal), yearBuilt: si(i.YearBuilt),
        publicRemarks: i.PublicRemarks?.substring(0, 800) || null,
        agentName: i.ListAgentFullName || null, agentPhone: i.ListAgentDirectPhone || null,
        officeName: i.ListOfficeName || null, moreInformationLink: listingUrl,
        modificationTimestamp: i.ModificationTimestamp ? new Date(i.ModificationTimestamp) : null,
        listingDate: i.ListingDate ? new Date(i.ListingDate) : (i.OriginalEntryTimestamp ? new Date(i.OriginalEntryTimestamp) : null),
        // Store minimal rawData — preserve ListingURL for "More Info" links,
        // agent/office details for compliance, but strip bulky Media array
        rawData: (() => {
            const { Media, ...rest } = i;
            rest.ListingURL = listingUrl;
            return rest;
        })(),
        isActive: true,
    };
}

async function analyzeStorage() {
    console.log('\n📊 STORAGE ANALYSIS:');
    try {
        const count = await prisma.listing.count();
        const dbSize: any[] = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size;`;
        const tableSize: any[] = await prisma.$queryRaw`SELECT pg_size_pretty(pg_total_relation_size('"Listing"')) as size;`;
        console.log(`- Total Listings: ${count}`);
        console.log(`- DB Total Size: ${dbSize[0].size}`);
        console.log(`- Listings Table: ${tableSize[0].size}`);
        const avg = count > 0 ? (212 * 1024 / 62150) : 0; // Using my manual calc as fallback
        console.log(`- Approx Room Remaning: ~${Math.floor((500 - parseFloat(dbSize[0].size)))} MB (Assuming 512MB limit)`);
    } catch (e) {
        console.log('  (Could not query detailed storage, likely permission or table name case issues)');
        const count = await prisma.listing.count();
        console.log(`- Total Listings: ${count}`);
    }
}

(async () => {
    console.log('🚀 SAFE WORKER — FETCHING NEW DATA WITHOUT TOUCHING EXISTING');
    await analyzeStorage();

    const RESUME_SKIP = 51000; // Resume from where last run ended
    let ins = 0, w = 0, skip = RESUME_SKIP, totalSkips = 0;
    const t0 = Date.now();

    // Loop for "waves"
    while (w < 100 && totalSkips < 10) {
        w++;
        console.log(`🌊 Wave ${w} (skip=${skip})...`);
        const skips = Array.from({ length: CONC }, (_, i) => skip + i * PG);
        const res = await Promise.all(skips.map(s => page(s)));
        const all = res.flat();
        
        if (!all.length) { 
            console.log(`⚪ No more data from feed.`);
            break; 
        }
        
        const m = all.map(map);
        try {
            // createMany with skipDuplicates: true will skip ANY existing listingKey
            // This ensures "existing data stays untouched" and "no duplicates"
            const r = await prisma.listing.createMany({ data: m, skipDuplicates: true });
            ins += r.count;
            if (r.count === 0) {
                totalSkips++;
                console.log(`   ⏭  All ${m.length} records in this wave already exist.`);
            } else {
                totalSkips = 0;
                console.log(`   ✅ Inserted ${r.count} new records.`);
            }
        } catch (e: any) {
            console.error(`   ❌ Wave failed: ${e.message}`);
        }
        
        skip += CONC * PG;
        await new Promise(r => setTimeout(r, DELAY));
        
        if (totalSkips >= 5) {
            console.log(`⏹  Seen 5 consecutive waves of only existing records. Stopping.`);
            break;
        }
    }

    console.log(`\n✨ DONE +${ins} new | total time ${((Date.now()-t0)/1000).toFixed(0)}s`);
    await analyzeStorage();
    prisma.$disconnect(); process.exit(0);
})().catch(e => { console.error('❌', e); process.exit(1); });
