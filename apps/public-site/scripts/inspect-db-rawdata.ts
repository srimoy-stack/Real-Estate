import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Inspecting sample rawData from Listing table...\n');

  const samples = await prisma.listing.findMany({
    where: {
      rawData: { not: null }
    },
    take: 1,
    select: {
      id: true,
      listingKey: true,
      rawData: true
    }
  });

  if (samples.length === 0) {
    console.log('❌ No records with rawData found.');
  } else {
    for (const sample of samples) {
      console.log(`Listing ID: ${sample.id}`);
      console.log(`Listing Key: ${sample.listingKey}`);
      console.log('Raw Data Content:');
      console.log(JSON.stringify(sample.rawData, null, 2));
      console.log('\n' + '='.repeat(50) + '\n');
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
