import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

async function auth() {
  const r = await fetch('https://identity.crea.ca/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.DDF_CLIENT_ID || '',
      client_secret: process.env.DDF_CLIENT_SECRET || '',
      scope: 'DDFApi_Read',
    }),
  });
  const d = await r.json();
  return d.access_token;
}

async function inspect() {
  const t = await auth();
  const endpoints = ['Member', 'Office'];
  for (const e of endpoints) {
    console.log(`\n--- Inspecting ${e} ---`);
    const r = await fetch(`https://ddfapi.realtor.ca/odata/v1/${e}?$top=1`, {
      headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' }
    });
    if (!r.ok) {
       console.log(`Failed to fetch ${e}: ${r.status}`);
       continue;
    }
    const data = await r.json();
    console.log(JSON.stringify(data.value?.[0], null, 2));
  }
}

inspect();
