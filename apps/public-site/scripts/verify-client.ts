import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.listing.count({
      where: { isActive: true }
    })
    console.log(`✅ Verification Success: count({ where: { isActive: true } }) = ${count}`)
  } catch (error: any) {
    console.error('❌ Prisma Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
