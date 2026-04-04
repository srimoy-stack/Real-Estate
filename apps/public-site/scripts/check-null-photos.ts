import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Check] Starting null photo count...');
  
  const total = await prisma.listing.count();
  const missing = await prisma.listing.count({
    where: {
      OR: [
        { primaryPhotoUrl: null },
        { primaryPhotoUrl: '' }
      ]
    }
  });

  console.log(`[Results] Total listings: ${total}`);
  console.log(`[Results] Missing photos: ${missing}`);
  console.log(`[Results] Coverage: ${((1 - missing / total) * 100).toFixed(2)}%`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
