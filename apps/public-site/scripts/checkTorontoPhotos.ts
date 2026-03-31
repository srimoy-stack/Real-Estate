
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  const withPhotos = await p.listing.count({ 
    where: { 
      city: { startsWith: 'Toronto', mode: 'insensitive' }, 
      OR: [
        { primaryPhoto: { not: null } },
        { primaryPhotoUrl: { not: null } }
      ]
    } 
  });
  const total = await p.listing.count({ where: { city: { startsWith: 'Toronto', mode: 'insensitive' } } });
  console.log(`Toronto: ${withPhotos} with photos / ${total} total`);
  
  const sample = await p.listing.findMany({ 
    where: { 
        city: { startsWith: 'Toronto', mode: 'insensitive' },
        isActive: true
    },
    take: 5,
    select: { listingKey: true, primaryPhoto: true, primaryPhotoUrl: true }
  });
  console.log('Sample Toronto Data:', JSON.stringify(sample, null, 2));
  
  await p.$disconnect();
}
check().catch(console.error);
