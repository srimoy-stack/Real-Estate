import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Fast SQL Backfill (Retry)...');

  // One-by-one update is slow, but Prisma's updateMany is fast as it sends a bulk UPDATE
  
  console.log('Step 1/4: Residential reset...');
  const rCount = await prisma.listing.updateMany({
    where: { normalizedPropertyType: null },
    data: { normalizedPropertyType: 'residential' }
  });
  console.log(`Updated ${rCount.count} to residential.`);

  console.log('Step 2/4: Commercial SubTypes...');
  const cCount = await prisma.listing.updateMany({
    where: {
      propertySubType: {
        in: [
          'retail', 'business', 'office', 'industrial', 'vacant land', 
          'parking', 'hospitality', 'institutional - special purpose', 
          'mixed use', 'hotel', 'investment',
          'Retail', 'Business', 'Office', 'Industrial', 'Vacant Land'
        ],
        mode: 'insensitive' as any
      }
    },
    data: { normalizedPropertyType: 'commercial' }
  });
  console.log(`Updated ${cCount.count} to commercial.`);

  console.log('Step 3/4: Lease Detection...');
  // publicRemarks keywords
  const lCount = await prisma.listing.updateMany({
    where: {
      OR: [
        { publicRemarks: { contains: 'for lease', mode: 'insensitive' } },
        { publicRemarks: { contains: 'for rent', mode: 'insensitive' } },
        { publicRemarks: { contains: 'lease available', mode: 'insensitive' } },
        { publicRemarks: { contains: 'monthly rent', mode: 'insensitive' } }
      ]
    },
    data: { normalizedPropertyType: 'lease' }
  });
  console.log(`Updated ${lCount.count} to lease.`);

  console.log('Step 4/4: Other/Vacant Land refinement...');
  const oCount = await prisma.listing.updateMany({
    where: {
      OR: [
        { propertySubType: { equals: 'Vacant Land', mode: 'insensitive' } },
        { 
          AND: [
            { propertySubType: { equals: 'Other', mode: 'insensitive' } },
            { OR: [{ bedroomsTotal: null }, { bedroomsTotal: 0 }] }
          ]
        }
      ]
    },
    data: { normalizedPropertyType: 'commercial' }
  });
  console.log(`Updated ${oCount.count} to commercial (refinement).`);

  const validation = await prisma.listing.groupBy({
    by: ['normalizedPropertyType'],
    _count: { _all: true }
  });
  console.log('\n✅ Counts after backfill:', JSON.stringify(validation, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
