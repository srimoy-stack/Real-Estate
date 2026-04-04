/**
 * ─── COMMERCIAL PHOTO RECOVERY: Targeted Sync for 60 Listings ────────
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

const DDF_BASE = 'https://ddfapi.realtor.ca/odata/v1/Property';
const API_DELAY_MS = 300; // Faster for targeted recovery

const RECOVERY_KEYS = [
    "29545168", "29307670", "25836399", "29548055", "29235950", 
    "29526307", "29545790", "29423096", "29547273", "29547234", 
    "29547005", "29546601", "29546443", "29544327", "29544325", 
    "29546153", "28932175", "29545602", "29545558", "29545548", 
    "29545141", "29545140", "29192564", "29502788", "29156270", 
    "29543810", "27772501", "29220894", "29542967", "29432524", 
    "29401904", "29542243", "29542162", "29541478", "29538185", 
    "29443876", "29442292", "29432697", "29432696", "28991918", 
    "29539651", "29532241", "29539311", "29220119", "29283827", 
    "29462564", "27272047"
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
    if (!d.access_token) throw new Error('Auth failed: ' + JSON.stringify(d));
    tok = d.access_token;
    return tok!;
}

function processMedia(media: any[]): { primary: string | null; array: any[] } {
    if (!media || !Array.isArray(media)) return { primary: null, array: [] };
    const processed = media
        .filter((m: any) => {
            const url = m?.HighResMediaURL || m?.MediaURL || m?.LowResMediaURL;
            if (!url || typeof url !== 'string') return false;
            if (NON_IMAGE_EXT.test(url.trim())) return false;
            return true;
        })
        .map((m: any) => ({
            MediaURL: (m.HighResMediaURL || m.MediaURL || m.LowResMediaURL || '').trim(),
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
        console.log(`\n🔍 Recovering Photos for ${key}...`);
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
                console.log(`  ⚠️  Listing ${key} not in local database`);
                return;
            }

            await prisma.listing.update({
                where: { id: existing.id },
                data: {
                    primaryPhoto: primary,
                    primaryPhotoUrl: primary,
                    mediaJson: mediaArray as any,
                    photosChangeTimestamp: new Date(),
                }
            });
            console.log(`  ✅ Successfully updated ${mediaArray.length} photos for [${apiRecord.UnparsedAddress || key}]`);
        } else {
            console.log(`  ⚠️  No photos available in DDF API for ${key}`);
        }
    } catch (err: any) {
        console.error(`  ❌ Critical Error for ${key}: ${err.message}`);
    }
}

(async () => {
    console.log(`🚀 Starting Targeted Recovery for ${RECOVERY_KEYS.length} Priority Properties...`);
    for (const key of RECOVERY_KEYS) {
        await fixListing(key);
        await new Promise(res => setTimeout(res, API_DELAY_MS));
    }
    console.log(`\n✨ Commercial Photo Recovery Complete`);
    await prisma.$disconnect();
    process.exit(0);
})();
