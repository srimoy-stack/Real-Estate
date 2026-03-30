
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Inspecting indexes to find space-reclaim candidates...')
    const indexes: any = await prisma.$queryRaw`
      SELECT indexname FROM pg_indexes WHERE tablename = 'Listing' AND schemaname = 'public';
    `
    console.log('Current Indexes:', indexes.map((i: any) => i.indexname).join(', '))
    
    console.log('🔄 Extreme Space Recovery: Dropping all non-unique indexes...')
    const droppedIndexes = [
      'Listing_city_idx',
      'Listing_listPrice_idx',
      'Listing_modificationTimestamp_idx',
      'Listing_listingDate_idx',
      'Listing_createdAt_idx'
    ]
    for (const idx of droppedIndexes) {
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "${idx}";`)
    }
    console.log('✅ Temporary indexes dropped.')
    
    console.log('🔄 Clearing rawData in small batched recycling (batch size: 100)...')
    
    let updatedCount = 0;
    const BATCH_SIZE = 100;
    
    while (true) {
      const subset = await prisma.listing.findMany({
        where: {
          rawData: { not: Prisma.DbNull }
        },
        select: { id: true },
        take: BATCH_SIZE
      });
      
      if (subset.length === 0) break;
      
      const ids = subset.map(l => l.id);
      await prisma.listing.updateMany({
        where: { id: { in: ids } },
        data: { rawData: Prisma.DbNull }
      });
      
      // CRITICAL: Vacuum after every batch to reclaim slots within the file
      await prisma.$executeRawUnsafe('VACUUM "Listing";')
      
      updatedCount += ids.length;
      process.stdout.write(`\rProgress: ${updatedCount} rows cleared...`);
    }
    
    console.log(`\n✅ Successfully cleared rawData from ${updatedCount} listings.`)
    
    console.log('🔄 Rebuilding all indexes...')
    await prisma.$executeRawUnsafe('CREATE INDEX "Listing_city_idx" ON "Listing"("city");')
    await prisma.$executeRawUnsafe('CREATE INDEX "Listing_listPrice_idx" ON "Listing"("listPrice");')
    await prisma.$executeRawUnsafe('CREATE INDEX "Listing_modificationTimestamp_idx" ON "Listing"("modificationTimestamp");')
    await prisma.$executeRawUnsafe('CREATE INDEX "Listing_listingDate_idx" ON "Listing"("listingDate");')
    await prisma.$executeRawUnsafe('CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");')
    console.log('✅ Indexes successfully rebuilt.')
    
  } catch (error) {
    console.error('❌ Error executing update:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
