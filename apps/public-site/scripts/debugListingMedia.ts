import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    try {
        const query = 'C12921354';
        const listing = await prisma.listing.findFirst({
            where: {
                OR: [
                    { listingKey: query },
                    { listingId: query }
                ]
            }
        });
        if (listing) {
            console.log('[Debug] Listing Found:', listing.listingKey);
            console.log('[Debug] primaryPhoto:', listing.primaryPhoto);
        } else {
            console.log('[Debug] Listing not found in DB with that key/id');
            // List some keys
            const listings = await prisma.listing.findMany({ 
                take: 5,
                select: { listingKey: true, listingId: true }
             });
            console.log('[Debug] Sample keys:', listings);
        }
    } catch (err) {
        console.error('[Debug] Failed to fetch listing:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
