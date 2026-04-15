
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.listing.count({ where: { isActive: true } });
  const withAgent = await prisma.listing.count({ 
    where: { 
      isActive: true, 
      agentName: { not: null } 
    } 
  });
  const withOffice = await prisma.listing.count({ 
    where: { 
      isActive: true, 
      officeName: { not: null } 
    } 
  });
  const recentUpdates = await prisma.listing.count({
    where: {
      isActive: true,
      updatedAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000) // last 30 mins
      }
    }
  });

  console.log('--- Agent Backfill Stats ---');
  console.log(`Total Active Listings: ${total}`);
  console.log(`With Agent Name:       ${withAgent} (${((withAgent/total)*100).toFixed(1)}%)`);
  console.log(`With Office Name:      ${withOffice} (${((withOffice/total)*100).toFixed(1)}%)`);
  console.log(`Updated in last 30m:   ${recentUpdates}`);
  console.log('----------------------------');
}

main().catch(console.error).finally(() => prisma.$disconnect());
