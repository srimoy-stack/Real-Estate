
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.listing.count()
    console.log(`Total listings: ${count}`)
    
    // Check if isActive column exists by trying to select it
    const firstListing = await prisma.listing.findFirst({
        select: { id: true, isActive: true }
    })
    console.log(`First listing isActive: ${firstListing?.isActive}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
