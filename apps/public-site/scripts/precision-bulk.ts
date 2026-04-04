import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMERCIAL_SUBTYPES = [
  'Retail', 'Business', 'Office', 'Industrial', 
  'Parking', 'Hospitality', 'Institutional - Special Purpose', 
  'Mixed Use', 'Hotel', 'Investment'
];

const RESIDENTIAL_SUBTYPES = [
  'Single Family', 'Multi-family', 'Condo', 'Condominium', 
  'Townhouse', 'Duplex', 'Triplex', '2 Family', '3 Family', '4 Family', 
  'Apartment', 'Row / Townhouse', 'Semi-Detached', 'Detached', 
  'Mobile Home', 'Manufactured Home'
];

async function main() {
  console.log('🚀 Starting Precision Bulk Backfill (Raw SQL Mode)...');

  // 1. Bulk Update clear Commercial
  console.log('Step 1/3: Categorizing clear Commercial subtypes...');
  const commList = COMMERCIAL_SUBTYPES.map(s => `'${s.replace(/'/g, "''")}'`).join(',');
  const cRes = await prisma.$executeRawUnsafe(`
    UPDATE "Listing"
    SET "normalized_property_type" = 'commercial'
    WHERE "normalized_property_type" IS NULL
    AND "propertySubType" ILIKE ANY (ARRAY[${commList}]);
  `);
  console.log(`✅ ${cRes} listings marked as Commercial.`);

  // 2. Bulk Update clear Residential
  console.log('Step 2/3: Categorizing clear Residential subtypes...');
  const resList = RESIDENTIAL_SUBTYPES.map(s => `'${s.replace(/'/g, "''")}'`).join(',');
  const rRes = await prisma.$executeRawUnsafe(`
    UPDATE "Listing"
    SET "normalized_property_type" = 'residential'
    WHERE "normalized_property_type" IS NULL
    AND "propertySubType" ILIKE ANY (ARRAY[${resList}]);
  `);
  console.log(`✅ ${rRes} listings marked as Residential.`);

  // 3. Lease keywords
  console.log('Step 3/3: Categorizing clear Lease listings...');
  const lRes = await prisma.$executeRawUnsafe(`
    UPDATE "Listing"
    SET "normalized_property_type" = 'lease'
    WHERE "normalized_property_type" IS NULL
    AND (
      "publicRemarks" ILIKE '%for lease%' OR
      "publicRemarks" ILIKE '%for rent%' OR
      "publicRemarks" ILIKE '%lease available%'
    );
  `);
  console.log(`✅ ${lRes} listings marked as Lease.`);

  console.log('\n✨ Precision Bulk Complete.');
  
  const stats = await prisma.$queryRawUnsafe(`
    SELECT "normalized_property_type", COUNT(*) FROM "Listing" GROUP BY 1;
  `);
  console.log('Current Stats:', JSON.stringify(stats, (k, v) => typeof v === 'bigint' ? Number(v) : v, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
