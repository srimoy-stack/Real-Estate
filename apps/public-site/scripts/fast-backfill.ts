import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Fast SQL Backfill...');

  // 1. Mark everything as Residential by default (safest fallback)
  console.log('Step 1/4: Resetting nulls to residential...');
  await prisma.$executeRawUnsafe(`
    UPDATE "Listing" 
    SET "normalized_property_type" = 'residential' 
    WHERE "normalized_property_type" IS NULL;
  `);

  // 2. Overwrite with Commercial based on PropertySubType
  console.log('Step 2/4: Applying Commercial subtypes...');
  await prisma.$executeRawUnsafe(`
    UPDATE "Listing" 
    SET "normalized_property_type" = 'commercial' 
    WHERE LOWER("propertySubType") IN (
      'retail', 'business', 'office', 'industrial', 'vacant land', 
      'parking', 'hospitality', 'institutional - special purpose', 
      'mixed use', 'hotel', 'investment'
    );
  `);

  // 3. Overwrite with Lease if publicRemarks contains keywords
  console.log('Step 3/4: Applying Lease indicators...');
  const leaseKeywords = ['for lease', 'for rent', 'lease available', 'monthly rent'];
  const keywordPattern = leaseKeywords.map(kw => `%${kw}%`).join(' OR "publicRemarks" ILIKE ');
  
  await prisma.$executeRawUnsafe(`
    UPDATE "Listing" 
    SET "normalized_property_type" = 'lease' 
    WHERE "publicRemarks" ILIKE '${leaseKeywords.map(kw => `%${kw}%`).join("' OR \"publicRemarks\" ILIKE '")}'
  `);

  // 4. Fallback for "Other" with 0 bedrooms → Commercial
  console.log('Step 4/4: Refining "Other" and Null bedrooms...');
  await prisma.$executeRawUnsafe(`
    UPDATE "Listing" 
    SET "normalized_property_type" = 'commercial' 
    WHERE LOWER("propertySubType") = 'other' AND ("bedroomsTotal" IS NULL OR "bedroomsTotal" = 0);
  `);

  // Verification
  const counts = await prisma.$queryRawUnsafe(`
    SELECT "normalized_property_type", COUNT(*) FROM "Listing" GROUP BY 1;
  `);
  console.log('\n✅ Fast Backfill complete!');
  console.log(JSON.stringify(counts, (k, v) => typeof v === 'bigint' ? Number(v) : v, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
