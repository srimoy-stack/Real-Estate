
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const latestUpdated = await prisma.listing.findFirst({
    where: {
      primaryPhotoUrl: { not: null }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      updatedAt: true,
      listingKey: true
    }
  });

  const withPhotos = await prisma.listing.count({
    where: { primaryPhotoUrl: { not: null } }
  });

  console.log(JSON.stringify({ 
    withPhotos, 
    latestUpdateAt: latestUpdated?.updatedAt,
    latestListingKey: latestUpdated?.listingKey 
  }));
  await prisma.$disconnect();
}

main();
