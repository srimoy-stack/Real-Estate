import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient({ log: ['error'] });
const DDF = 'https://ddfapi.realtor.ca/odata/v1/Property';
const PG = 100, CONC = 6, DELAY = 100; // Increased concurrency, reduced delay

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
        officeName: i.ListOfficeName || null, moreInformationLink: i.ListingURL || null,
        modificationTimestamp: i.ModificationTimestamp ? new Date(i.ModificationTimestamp) : null,
        listingDate: i.ListingDate ? new Date(i.ListingDate) : (i.OriginalEntryTimestamp ? new Date(i.OriginalEntryTimestamp) : null),
        rawData: Prisma.DbNull, isActive: true,
    };
}

(async () => {
    console.log('🌊 CRAWLER — STARTING AT DB CURSOR');
    const start = await prisma.listing.count();
    console.log(`📊 DB: ${start}`);
    
    let ins = 0, w = 0, skip = start, empty = 0; // Start at current count!
    const t0 = Date.now();

    while (w < 1000 && empty < 2) {
        w++;
        const skips = Array.from({ length: CONC }, (_, i) => skip + i * PG);
        const res = await Promise.all(skips.map(s => page(s)));
        const all = res.flat();
        
        if (!all.length) { 
            empty++; 
            console.log(`⚪ Wave empty at skip=${skip}`);
            skip += CONC * PG; 
            continue; 
        }
        empty = 0;
        
        const u = new Map<string, any>(); for (const x of all) if (x.ListingKey) u.set(x.ListingKey, x);
        const m = Array.from(u.values()).map(map);
        try {
            const r = await prisma.listing.createMany({ data: m, skipDuplicates: true });
            ins += r.count;
            process.stdout.write(`+${r.count} `);
        } catch (e: any) {
            let ok = 0;
            for (const it of m) { try { await prisma.listing.upsert({ where: { listingKey: it.listingKey }, update: it, create: it }); ok++; } catch {} }
            ins += ok;
        }
        
        skip += CONC * PG;
        if (w % 5 === 0) console.log(`\n📦 Total new: ${ins} | skip: ${skip} | ${((Date.now()-t0)/1000).toFixed(0)}s`);
        await new Promise(r => setTimeout(r, DELAY));
    }

    console.log(`\n✨ DONE +${ins} new | total in DB approx ${start + ins}`);
    prisma.$disconnect(); process.exit(0);
})().catch(e => { console.error('❌', e); process.exit(1); });
