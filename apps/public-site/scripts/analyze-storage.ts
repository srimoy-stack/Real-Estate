import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- DATABASE STORAGE ANALYSIS ---');
    const dbSize: any[] = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size;`;
    console.log(`Current Database Total Size: ${dbSize[0].size}`);

    const tableSizes: any[] = await prisma.$queryRaw`
      SELECT
          table_name,
          pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS total_size
      FROM
          information_schema.tables
      WHERE
          table_schema = 'public'
      ORDER BY
          pg_total_relation_size(quote_ident(table_name)) DESC;
    `;
    
    console.log('\nTable Sizes:');
    tableSizes.forEach(t => {
      console.log(`- ${t.table_name}: ${t.total_size}`);
    });

    const listingCount = await prisma.listing.count();
    console.log(`\nTotal Listings: ${listingCount}`);
    
    if (listingCount > 0) {
        const sizeBigInt = (await prisma.$queryRaw`SELECT pg_total_relation_size('"Listing"')` as any)[0].pg_total_relation_size;
        const avgSize = Number(sizeBigInt) / listingCount;
        console.log(`Average size per listing: ${Math.round(avgSize / 1024)} KB`);
    }

  } catch (error) {
    console.error('ANALYSIS FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
