import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const count = await prisma.listing.count({
    where: {
      rawData: {
        not: Prisma.DbNull
      }
    }
  });
  const total = await prisma.listing.count();
  console.log(`Progress: ${count} / ${total} listings have rawData (${((count/total)*100).toFixed(2)}%)`);
  await prisma.$disconnect();
}

check();
