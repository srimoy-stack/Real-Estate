import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT COUNT(*) as total, COUNT(primary_photo_url) as with_photos FROM "Listing" WHERE "standardStatus" = 'Active'`;
    console.log(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  } finally {
    await prisma.$disconnect();
  }
}
main();
