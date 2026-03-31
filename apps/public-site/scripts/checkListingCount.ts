import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.listing.count();
        console.log(`[DB Status] Current listing count: ${count}`);
    } catch (err) {
        console.error('[DB Status] Error fetching count:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
