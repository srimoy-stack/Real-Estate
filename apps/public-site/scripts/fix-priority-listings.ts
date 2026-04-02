/**
 * ─── PRIORITY BACKFILL: Fetch Missing Photos for Specific Keys ────────
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

const DDF_BASE = 'https://ddfapi.realtor.ca/odata/v1/Property';
const API_DELAY_MS = 500;

const PRIORITY_KEYS = [
    "29546023", "29546011", "29543377", "29536437", "29534308",
    "29489135", "29243770", "29367135", "29539682", "29525756",
    "29457317", "29546257", "29546235", "29546233", "29545999",
    "29541216", "29539423", "29537308", "29537141", "29532532",
    "29411455", "29539824", "29546018", "29546015", "29546005",
    "29546000", "29545998", "29545996", "29545992", "29545991",
    "29545978", "29543655", "29541788", "29537316", "29500032",
    "29499830", "29486374", "29481940", "29411398", "29349154",
    "28304935", "29371502", "29545827", "29545829", "29545593",
    "29545576", "29545500", "29315777", "29248356", "29109701",
    "29545815", "29545811", "29545809", "29545665", "29545655",
    "29545644", "29543504", "29407486", "29407485", "28778971",
    "29545588", "29545589", "29545590", "29545591", "29545578",
    "29545572", "29545571", "29545564", "29545563", "29545562",
    "29545561", "29545560", "29545260", "29545259", "29545255",
    "29544341", "29544340", "29543082", "29541415", "29541283",
    "29541217", "29537331", "29537577", "29534524", "29433777"
];

const NON_IMAGE_EXT = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv|7z|gz)$/i;

// Auth
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
    return tok!;
}

function processMedia(media: any[]): { primary: string | null; array: any[] } {
    if (!media || media.length === 0) return { primary: null, array: [] };
    const processed = media
        .filter((m: any) => {
            const url = m?.HighResMediaURL || m?.MediaURL || m?.LowResMediaURL;
            if (!url || typeof url !== 'string') return false;
            if (NON_IMAGE_EXT.test(url.trim())) return false;
            return true;
        })
        .map((m: any) => ({
            MediaURL: (m.HighResMediaURL || m.MediaURL || m.LowResMediaURL).trim(),
            Order: m.Order || 0,
            MediaModificationTimestamp: m.MediaModificationTimestamp || null,
        }))
        .sort((a: any, b: any) => a.Order - b.Order);

    const primaryObj = processed.find((m: any) => m.Order === 0) || processed[0];
    return { primary: primaryObj?.MediaURL || null, array: processed };
}

async function fixListing(key: string) {
    try {
        const t = await auth();
        console.log(`\n🔍 Fetching ${key}...`);
        const r = await fetch(`${DDF_BASE}('${key}')`, {
            headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
        });

        if (!r.ok) {
            console.log(`  ❌ API Error ${r.status}`);
            return;
        }

        const apiRecord = await r.json();
        const { primary, array: mediaArray } = processMedia(apiRecord.Media);

        if (primary) {
            const existing = await prisma.listing.findUnique({ where: { listingKey: key } });
            if (!existing) {
                console.log(`  ⚠️  Listing ${key} not in DB`);
                return;
            }

            await prisma.listing.update({
                where: { id: existing.id },
                data: {
                    primaryPhoto: primary,
                    primaryPhotoUrl: primary,
                    mediaJson: mediaArray,
                    photosChangeTimestamp: new Date(),
                    // Also fix moreInformationLink if missing
                    ...(existing.moreInformationLink ? {} : { moreInformationLink: apiRecord.MoreInformationLink })
                }
            });
            console.log(`  ✅ Fixed photos for ${key}`);
        } else {
            console.log(`  ⚠️  No photos found in API for ${key}`);
        }
    } catch (err: any) {
        console.error(`  ❌ Error processing ${key}: ${err.message}`);
    }
}

(async () => {
    console.log(`🚀 Starting Priority Backfill for ${PRIORITY_KEYS.length} listings...`);
    for (const key of PRIORITY_KEYS) {
        await fixListing(key);
        await new Promise(res => setTimeout(res, API_DELAY_MS));
    }
    console.log(`\n✨ Priority Backfill Complete`);
    await prisma.$disconnect();
    process.exit(0);
})();
