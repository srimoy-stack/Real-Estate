
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSync() {
  const CLIENT_ID = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID || '';
  const CLIENT_SECRET = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET || '';
  const TOKEN_URL = 'https://identity.crea.ca/connect/token';
  const DDF_URL = 'https://ddfapi.realtor.ca/odata/v1/Property';

  console.log('Fetching token...');
  const resT = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: 'DDFApi_Read' }),
  });
  const { access_token } = await resT.json();

  console.log('Fetching 5 listings...');
  const res = await fetch(`${DDF_URL}?$top=5`, { 
    headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' } 
  });
  const data = await res.json();
  
  for (const item of data.value) {
    const primaryMedia = item.Media?.length > 0 ? item.Media[0].MediaURL : null;
    console.log(`Key: ${item.ListingKey} | MediaURL: ${primaryMedia}`);
    
    // Attempt save to DB
    await prisma.listing.upsert({
        where: { listingKey: item.ListingKey },
        update: {
            primaryPhoto: primaryMedia,
            primaryPhotoUrl: primaryMedia,
            isActive: true
        },
        create: {
            listingKey: item.ListingKey,
            primaryPhoto: primaryMedia,
            primaryPhotoUrl: primaryMedia,
            isActive: true,
            city: item.City
        }
    });
  }
  console.log('Done.');
  await prisma.$disconnect();
}
testSync().catch(console.error);
