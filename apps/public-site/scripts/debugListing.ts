import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    try {
        const listing = await prisma.listing.findFirst();
        if (listing) {
            console.log('[Debug] Listing Keys:', Object.keys(listing));
            console.log('[Debug] mlsNumber:', listing.mlsNumber);
            console.log('[Debug] listingKey:', listing.listingKey);
            console.log('[Debug] id:', (listing as any).id);
        }
    } catch (err) {
        console.error('[Debug] Failed to fetch listing:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
