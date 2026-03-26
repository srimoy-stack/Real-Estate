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
      console.log(`Last Sync: ${lastSync.startedAt.toISOString()} | Status: ${lastSync.status} | Synced: ${lastSync.listingsSynced}`);
    } else {
      console.log('No sync logs found.');
    }
    
    // Check if there are any specific errors in recent logs
    const errorLogs = await prisma.syncLog.findMany({
        where: { status: 'failed' },
        take: 3,
        orderBy: { startedAt: 'desc' }
    });
    
    if (errorLogs.length > 0) {
        console.log('\n--- RECENT FAILURES ---');
        errorLogs.forEach(log => {
            console.log(`[${log.startedAt.toISOString()}] Error: ${log.errorMessage}`);
        });
    }

  } catch (error) {
    console.error('FAILED TO CONNECT OR QUERY DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
