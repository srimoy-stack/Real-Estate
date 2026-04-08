const { PrismaClient } = require('@prisma/client');
const { fetchRankedListings } = require('./src/lib/listings-utils');
const prisma = new PrismaClient();

async function main() {
    const query = {
        propertyType: 'Commercial', // "All Commercial" selects this
        city: '',
    };
    const { listings, total } = await fetchRankedListings(prisma, query, 10, 0);
    console.log(`Results for Commercial: ${total}`);
    console.log('Sample address:', listings[0]?.address);
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
