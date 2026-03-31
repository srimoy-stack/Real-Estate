
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function heal() {
  console.log('--- DB Data Healing ---');
  // Copy primaryPhoto to primaryPhotoUrl if missing
  const count = await p.listing.count({
    where: { 
      primaryPhotoUrl: null,
      primaryPhoto: { not: null }
    }
  });
  console.log(`Found ${count} listings to heal.`);
  
  if (count === 0) {
    console.log('No listings require healing. DB is already healthy.');
    await p.$disconnect();
    return;
  }

  const listings = await p.listing.findMany({
    where: { 
      primaryPhotoUrl: null,
      primaryPhoto: { not: null }
    },
    select: { id: true, primaryPhoto: true }
  });
  
  const batchSize = 100;
  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize);
    await Promise.all(batch.map((l: any) => 
      p.listing.update({
        where: { id: l.id },
        data: { primaryPhotoUrl: l.primaryPhoto }
      })
    ));
    if (i % 500 === 0) console.log(`Processed ${i} / ${listings.length}`);
  }
  
  console.log('Healing COMPLETE.');
  await p.$disconnect();
}

heal().catch(console.error);
