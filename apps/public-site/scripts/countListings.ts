import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.listing.count();
        console.log(`[Count] Current listing count in database: ${count}`);
    } catch (err) {
        console.error('[Count] Failed to count listings:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
