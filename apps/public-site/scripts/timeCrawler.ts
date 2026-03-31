import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient({ log: ['error'] });
const DDF = 'https://ddfapi.realtor.ca/odata/v1/Property';
const PG = 100, CONC_PAGES = 3, DELAY = 300; 

let tok: string | null = null;
async function auth(): Promise<string> {
    if (tok) return tok;
    const r = await fetch('https://identity.crea.ca/connect/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID || '', client_secret: process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET || '', scope: 'DDFApi_Read' }),
    });
    const d = await r.json(); tok = d.access_token;
    setTimeout(() => { tok = null; }, (d.expires_in - 120) * 1000);
    console.log('🔑 New token acquired'); return tok!;
}

async function page(ts: string, skip: number): Promise<any[]> {
    const t = await auth();
    // Fetch records OLDER than the given timestamp
    const query = `$filter=ModificationTimestamp lt ${ts}&$top=${PG}&$skip=${skip}&$orderby=ModificationTimestamp desc`;
    try {
        const r = await fetch(`${DDF}?${query}`, { headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
        if (!r.ok) { console.warn(`   ⚠️ API error: ${r.status}`); return []; }
        return (await r.json()).value || [];
    } catch (e: any) { console.warn(`   ⚠️ Fetch fail: ${e.message}`); return []; }
}

function map(i: any) {
    const sf = (v: any) => { if (v == null) return null; const n = parseFloat(String(v)); return Number.isFinite(n) ? n : null; };
    const si = (v: any) => { if (v == null) return null; const n = parseInt(String(v), 10); return Number.isFinite(n) ? n : null; };
    return {
        listingKey: i.ListingKey, listingId: i.ListingId || null, listPrice: sf(i.ListPrice),
        standardStatus: i.StandardStatus || null, propertyType: i.PropertyType || null,
        propertySubType: i.PropertySubType || null, bedroomsTotal: si(i.BedroomsTotal),
        bathroomsTotal: si(i.BathroomsTotalInteger), address: i.UnparsedAddress || null,
        city: i.City || null, province: i.StateOrProvince || null, postalCode: i.PostalCode || null,
        latitude: sf(i.Latitude), longitude: sf(i.Longitude),
        livingArea: sf(i.LivingArea || i.BuildingAreaTotal), yearBuilt: si(i.YearBuilt),
        publicRemarks: i.PublicRemarks?.substring(0, 800) || null,
        agentName: i.ListAgentFullName || null, officeName: i.ListOfficeName || null,
        modificationTimestamp: i.ModificationTimestamp ? new Date(i.ModificationTimestamp) : null,
        listingDate: i.ListingDate ? new Date(i.ListingDate) : (i.OriginalEntryTimestamp ? new Date(i.OriginalEntryTimestamp) : null),
        rawData: Prisma.DbNull, isActive: true,
    };
}

(async () => {
    console.log('🕒 TIME CRAWLER — FETCHING OLDER DATA CHRONOLOGICALLY');
    const startCount = await prisma.listing.count();
    console.log(`📊 Current DB: ${startCount}`);

    let totalIns = 0, waves = 0;
    
    while (waves < 500) {
        waves++;
        // Find the oldest record in DB again
        const oldest = await prisma.listing.findFirst({ 
            where: { modificationTimestamp: { not: null } },
            orderBy: { modificationTimestamp: 'asc' } 
        });
        
        if (!oldest?.modificationTimestamp) { console.log('❌ No older timestamp found!'); break; }
        
        const targetTs = oldest.modificationTimestamp.toISOString();
        console.log(`\n📅 Wave ${waves}: Crawling before ${targetTs}...`);

        // Fetch multiple pages in parallel for speed
        const skips = Array.from({ length: CONC_PAGES }, (_, i) => i * PG);
        const results = await Promise.all(skips.map(s => page(targetTs, s)));
        const all = results.flat();
        
        if (!all.length) { console.log('⚪ No older records found. Finished!'); break; }
        
        const mapped = all.map(map);
        try {
            const r = await prisma.listing.createMany({ data: mapped, skipDuplicates: true });
            totalIns += r.count;
            process.stdout.write(`✅ +${r.count} (${totalIns}) `);
        } catch (e: any) {
            let ok = 0;
            for (const it of mapped) { try { await prisma.listing.upsert({ where: { listingKey: it.listingKey }, update: it, create: it }); ok++; } catch {} }
            totalIns += ok;
            process.stdout.write(`🔄 ~${ok} `);
        }
        
        await new Promise(r => setTimeout(r, DELAY));
        if (waves % 5 === 0) { 
            const cur = await prisma.listing.count();
            console.log(`\n📊 New Total in DB: ${cur}`);
        }
    }

    console.log(`\n✨ DONE +${totalIns} new records.`);
    prisma.$disconnect(); process.exit(0);
})().catch(e => { console.error('❌', e); process.exit(1); });
