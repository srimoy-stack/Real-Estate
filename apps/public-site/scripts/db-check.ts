import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    console.log('Attempting to connect to the database...');
    const result = await prisma.$queryRaw`SELECT 1 as connection_test`;
    console.log('✅ Connection successful:', result);
    
    const listingCount = await prisma.listing.count();
    console.log('📊 Current Listing count:', listingCount);
    
    const userCount = await prisma.user.count();
    console.log('👤 Current User count:', userCount);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
