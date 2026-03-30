import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Restoring non-unique indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "Listing_city_idx" ON "Listing"("city");', // Add IF NOT EXISTS for safety
      'CREATE INDEX IF NOT EXISTS "Listing_listPrice_idx" ON "Listing"("listPrice");',
      'CREATE INDEX IF NOT EXISTS "Listing_modificationTimestamp_idx" ON "Listing"("modificationTimestamp");',
      'CREATE INDEX IF NOT EXISTS "Listing_listingDate_idx" ON "Listing"("listingDate");',
      'CREATE INDEX IF NOT EXISTS "Listing_createdAt_idx" ON "Listing"("createdAt");',
      'CREATE INDEX IF NOT EXISTS "Listing_isActive_idx" ON "Listing"("isActive");'
    ]

    for (const sql of indexes) {
      console.log(`Running: ${sql}`)
      try {
        await prisma.$executeRawUnsafe(sql)
      } catch (err: any) {
         if (err.message.includes('already exists')) {
            console.log(`Skipping: Already exists.`)
         } else {
            throw err
         }
      }
    }
    console.log('✅ All indexes restored successfully.')

    const count = await prisma.listing.count({
      where: { isActive: true }
    })
    console.log(`✅ Verification: count({ where: { isActive: true } }) = ${count}`)

  } catch (error) {
    console.error('❌ Error during index restoration/verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
