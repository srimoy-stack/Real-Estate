const { PrismaClient } = require('@prisma/client');
const { fetchRankedListings } = require('./src/lib/listings-utils');
const prisma = new PrismaClient();

async function main() {
    const query = {
        transaction: 'buy',
        propertyType: 'Any',
    };
    console.log('Running fetchRankedListings with:', query);
    const result = await fetchRankedListings(prisma, query, 10, 0);
    console.log('Result total:', result.total);
    console.log('Result listings count:', result.listings.length);
    if (result.listings.length > 0) {
        console.log('First listing:', JSON.stringify(result.listings[0], null, 2));
    }
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
