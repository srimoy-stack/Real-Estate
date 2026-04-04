import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const counts: any[] = await prisma.$queryRawUnsafe(`
    SELECT normalized_property_type, COUNT(*) 
    FROM "Listing" 
    GROUP BY 1 
    ORDER BY 2 DESC;
  `);

  console.log('\n📊 CURRENT PROPERTY DISTRIBUTION:');
  console.log('---------------------------------');
  counts.forEach(row => {
    const type = row.normalized_property_type || 'unclassified';
    const count = Number(row.count);
    console.log(`${type.padEnd(15)}: ${count.toLocaleString()}`);
  });
  console.log('---------------------------------');
  const total = counts.reduce((acc, row) => acc + Number(row.count), 0);
  console.log(`TOTAL LISTINGS  : ${total.toLocaleString()}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
