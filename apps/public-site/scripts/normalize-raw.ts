import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BATCH_SIZE = 1000;

function classifyListing(listing: any): string {
    const subType = (listing.propertySubType || '').toLowerCase();
    const remarks = (listing.publicRemarks || '').toLowerCase();
    const beds = listing.bedroomsTotal;

    // 1. CLEAR LEASE (Highest Priority)
    if (
        subType.includes('lease') ||
        remarks.includes('for lease') ||
        remarks.includes('for rent') ||
        remarks.includes('lease available') ||
        remarks.includes('monthly rent')
    ) {
        return 'lease';
    }

    // 2. CLEAR COMMERCIAL (By SubType)
    const COMMERCIAL_INDICATORS = [
        'retail', 'business', 'office', 'industrial', 'vacant land',
        'parking', 'hospitality', 'institutional - special purpose',
        'mixed use', 'hotel', 'investment', 'agriculture'
    ];
    if (COMMERCIAL_INDICATORS.some(ind => subType.includes(ind))) {
        return 'commercial';
    }

    // 3. CLEAR RESIDENTIAL (By SubType)
    const RESIDENTIAL_INDICATORS = [
        'residential', 'single family', 'condo', 'condominium', 'townhouse',
        'duplex', 'triplex', 'multi-family', 'apartment', 'detached', 'semi-detached'
    ];
    if (RESIDENTIAL_INDICATORS.some(ind => subType.includes(ind))) {
        return 'residential';
    }

    // 4. AMBIGUOUS ("Other", "Vacant Land" caught earlier, missing values)
    // Heuristic: If it has bedrooms, it's likely residential. If 0/null bedrooms, it's likely commercial.
    if (beds && beds > 0) return 'residential';
    
    // Final default for this precise script: if no proof of residential, bin into commercial
    return 'commercial';
}

async function main() {
    console.log('═════════════ REFINED BACKFILL (RAW SQL MODE) ═════════════');

    while (true) {
        // 1. Fetch using raw SQL to bypass Prisma Client validation
        const batch: any[] = await prisma.$queryRawUnsafe(`
            SELECT id, "propertySubType", "bedroomsTotal", "publicRemarks"
            FROM "Listing"
            WHERE "normalized_property_type" IS NULL
            LIMIT ${BATCH_SIZE}
        `);

        if (batch.length === 0) break;

        console.log(`Processing ${batch.length} items...`);

        // 2. Build bulk UPDATE using individual transactions (or better, a single batch update if possible)
        // Since we want accuracy, we classify each one.
        for (const listing of batch) {
            const normalized = classifyListing(listing);
            await prisma.$executeRawUnsafe(`
                UPDATE "Listing" 
                SET "normalized_property_type" = $1 
                WHERE id = $2
            `, normalized, listing.id);
        }
        
        process.stdout.write(`✅ Batch completed. Remaining: checking...\r`);
    }

    console.log('\n✨ All items processed.');
    await prisma.$disconnect();
}

main().catch(console.error);
