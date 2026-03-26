import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const listingCount = await prisma.listing.count();
    const syncLogCount = await prisma.syncLog.count();
    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    console.log('--- DATABASE STATUS ---');
    console.log(`Total Listings: ${listingCount}`);
    console.log(`Sync Logs: ${syncLogCount}`);
    
    if (lastSync) {
      console.log(`Last Sync: ${lastSync.startedAt.toISOString()} | Status: ${lastSync.status} | Synced Items: ${lastSync.listingsSynced}`);
      if (lastSync.errorMessage) {
          console.log(`Error: ${lastSync.errorMessage}`);
      }
    } else {
      console.log('No sync logs found.');
    }
  } catch (error) {
    console.error('FAILED TO CONNECT OR QUERY DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
