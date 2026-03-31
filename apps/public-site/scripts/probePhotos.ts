
const fs = require('fs');

async function test() {
  const CLIENT_ID = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID || '';
  const CLIENT_SECRET = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET || '';
  const TOKEN_URL = 'https://identity.crea.ca/connect/token';
  const DDF_URL = 'https://ddfapi.realtor.ca/odata/v1/Property';

  const resT = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: 'DDFApi_Read' }),
  });
  const { access_token } = await resT.json();
  
  console.log('Searching for listings WITH media...');
  const res = await fetch(`${DDF_URL}?$top=50&$orderby=ModificationTimestamp desc`, { 
    headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' } 
  });
  const data = await res.json();
  
  const found = data.value.filter((item: any) => item.Media && item.Media.length > 0);
  console.log(`Found ${found.length} items with Media in top 50`);
  
  if (found.length > 0) {
    console.log('Media Item Sample:', JSON.stringify(found[0].Media[0], null, 2));
  } else {
    console.log('No media found in top 50. Fields on first item:', Object.keys(data.value[0]));
    // Check if there is a 'Photo' collection
    console.log('Is there a Photo field?', !!data.value[0].Photo);
  }
}
test().catch(console.error);
