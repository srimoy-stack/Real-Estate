/**
 * ─── Backfill ListingURL for existing records ───────────────────────
 *
 * Problem: full-worker-sync.ts set rawData to Prisma.DbNull and
 * moreInformationLink may be null because DDF didn't return ListingURL
 * in the default property set.
 *
 * Solution: Fetch ListingKey + ListingURL from DDF API in lightweight
 * batches ($select=ListingKey,ListingURL) and update moreInformationLink
 * + rawData for all existing records.
 *
 * Usage: npx tsx scripts/backfill-listing-urls.ts
 */
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient({ log: ['error'] });

const DDF = 'https://ddfapi.realtor.ca/odata/v1/Property';
const PAGE_SIZE = 100;
const DELAY = 300;

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
    console.log('🔐 Token acquired');
    return tok!;
}

async function fetchPage(skip: number): Promise<any[]> {
    const t = await auth();
    const params = new URLSearchParams({
        '$top': PAGE_SIZE.toString(),
        '$skip': skip.toString(),
        // Valid fields from DDF metadata
        '$select': 'ListingKey,ListingURL,ListingId,ModificationTimestamp,ListAgentKey,ListOfficeKey',
        '$orderby': 'ModificationTimestamp desc',
    });
    try {
        const r = await fetch(`${DDF}?${params}`, {
            headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
            signal: AbortSignal.timeout(30000),
        });
        if (!r.ok) {
            const errBody = await r.text();
            console.error(`❌ API error: ${r.status} - ${errBody}`);
            return [];
        }
        return (await r.json()).value || [];
    } catch (e) {
        console.error('❌ Fetch error:', e);
        return [];
    }
}

function normalizeUrl(raw: string | null | undefined): string | null {
    if (!raw || typeof raw !== 'string') return null;
    let url = raw.trim();
    if (url.startsWith('www.')) {
        url = 'https://' + url;
    }
    return url;
}

(async () => {
    console.log('🔧 BACKFILL — Updating missing ListingURL from DDF');
    const toBackfillCount = await prisma.listing.count({ 
        where: { 
            isActive: true,
            OR: [
                { moreInformationLink: null },
                { moreInformationLink: { startsWith: 'www.' } },
                { rawData: { equals: Prisma.DbNull as any } }
            ]
        } 
    });
    console.log(`📊 DB: Found ${toBackfillCount} active listings needing backfill.`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const t0 = Date.now();
    const BATCH_SIZE = 20; // Conservative batch for NodeCount limit

    while (true) {
        // 1. Get a batch of keys from DB needing update
        console.log(`\n🔍 Batch fetching from DB...`);
        const listings = await prisma.listing.findMany({
            where: {
                isActive: true,
                OR: [
                    { moreInformationLink: null },
                    { moreInformationLink: { startsWith: 'www.' } },
                    { rawData: { equals: Prisma.DbNull as any } }
                ]
            },
            select: { listingKey: true },
            take: BATCH_SIZE
        });
        console.log(`✅ DB Fetch: ${listings.length} items`);

        if (listings.length === 0) break;

        const keys = listings.map(l => l.listingKey).filter(Boolean);
        if (keys.length === 0) break;

        try {
            // 2. Fetch those specific keys from API
            const tok = await auth();
            // Construct OData filter
            const filterStr = keys.map(k => `ListingKey eq '${k}'`).join(' or ');
            const params = new URLSearchParams({
                '$filter': filterStr,
                '$select': 'ListingKey,ListingURL,ListingId,ListAgentKey,ListOfficeKey',
                '$top': BATCH_SIZE.toString()
            });

            console.log(`🌐 API Fetch: ${keys.length} keys...`);
            const r = await fetch(`${DDF}?${params}`, {
                headers: { Authorization: `Bearer ${tok}`, Accept: 'application/json' },
                signal: AbortSignal.timeout(30000)
            });

            if (!r.ok) {
                const errTxt = await r.text();
                console.error(`\n❌ API error: ${r.status} - ${errTxt}`);
                errors++;
                // Skip this batch
                if (errors > 100) break;
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            const apiData = await r.json();
            const apiItems = apiData.value || [];

            // 3. Map for fast lookup
            const apiMap = new Map(apiItems.map((i: any) => [i.ListingKey, i]));

            // 4. Update the DB
            for (const key of keys) {
                const item = apiMap.get(key);
                if (!item) {
                    // Item not found in active API response - maybe it was deactivated?
                    skipped++;
                    // Mark as processed or similar to avoid infinite loop
                    await prisma.listing.update({
                        where: { listingKey: key },
                        data: { moreInformationLink: 'SKIP_NOT_FOUND' } // Temporary tag
                    });
                    continue;
                }

                const listingUrl = normalizeUrl(item.ListingURL);
                
                // Fetch current rawData to merge
                const existing = await prisma.listing.findUnique({
                    where: { listingKey: key },
                    select: { rawData: true, moreInformationLink: true }
                });

                const existingRaw = (existing?.rawData as any) || {};
                const mergedRaw = {
                    ...existingRaw,
                    ListingURL: listingUrl,
                    ListAgentKey: item.ListAgentKey || existingRaw.ListAgentKey || null,
                    ListOfficeKey: item.ListOfficeKey || existingRaw.ListOfficeKey || null
                };

                await prisma.listing.update({
                    where: { listingKey: key },
                    data: {
                        moreInformationLink: listingUrl || existing?.moreInformationLink,
                        rawData: mergedRaw
                    }
                });
                updated++;
            }
        } catch (e) {
            console.error('\n❌ Batch processing error:', e);
            errors++;
            await new Promise(r => setTimeout(r, 1000));
        }

        const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
        process.stdout.write(`\r📦 Progress: ${updated} updated | ${skipped} skipped (not in API) | ${errors} batch errors | ${elapsed}s`);

        await new Promise(r => setTimeout(r, DELAY));
    }

    // Cleanup: Remove temporary 'SKIP_NOT_FOUND' tags if needed
    await prisma.listing.updateMany({
        where: { moreInformationLink: 'SKIP_NOT_FOUND' },
        data: { moreInformationLink: null }
    });

    console.log(`\n\n✨ BACKFILL COMPLETE`);
    console.log(`   Updated:   ${updated}`);
    console.log(`   Skipped:   ${skipped}`);
    console.log(`   Batch Errors: ${errors}`);
    console.log(`   Duration:  ${((Date.now() - t0) / 1000).toFixed(0)}s`);

    await prisma.$disconnect();
    process.exit(0);
})().catch(e => {
    console.error('❌ Fatal:', e);
    process.exit(1);
});
