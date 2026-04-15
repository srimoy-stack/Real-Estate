/**
 * Quick test: Can we fetch a single Member by MemberKey?
 * Uses a real ListAgentKey from the database.
 */
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['error'] });

const DDF_BASE = 'https://ddfapi.realtor.ca/odata/v1';

async function getToken(): Promise<string> {
  const clientId = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID;
  const clientSecret = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET;
  const res = await fetch('https://identity.crea.ca/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials', client_id: clientId!, client_secret: clientSecret!, scope: 'DDFApi_Read',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  console.log('✅ Token acquired\n');
  return data.access_token;
}

async function main() {
  const token = await getToken();

  // Get 3 real ListAgentKey values from the database
  const listings = await prisma.listing.findMany({
    where: { isActive: true, rawData: { not: null } },
    select: { listingKey: true, rawData: true },
    take: 3,
    orderBy: { id: 'desc' },
  });

  for (const l of listings) {
    const raw = l.rawData as any;
    const agentKey = raw?.ListAgentKey;
    const officeKey = raw?.ListOfficeKey;
    console.log(`\n━━━ Listing ${l.listingKey} ━━━`);
    console.log(`  ListAgentKey: ${agentKey}, ListOfficeKey: ${officeKey}`);

    if (agentKey) {
      // Test: /odata/v1/Member('AgentKey')
      const url = `${DDF_BASE}/Member('${agentKey}')`;
      console.log(`  → GET ${url}`);
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      console.log(`  Status: ${r.status}`);
      if (r.ok) {
        const data = await r.json();
        console.log(`  ✅ Agent: ${data.MemberFirstName} ${data.MemberLastName}`);
        console.log(`  Phone: ${data.MemberOfficePhone || 'N/A'}`);
        console.log(`  Keys: ${Object.keys(data).join(', ')}`);
      } else {
        const body = await r.text();
        console.log(`  ❌ ${body.slice(0, 300)}`);
      }
    }

    if (officeKey) {
      const url = `${DDF_BASE}/Office('${officeKey}')`;
      console.log(`  → GET ${url}`);
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      console.log(`  Status: ${r.status}`);
      if (r.ok) {
        const data = await r.json();
        console.log(`  ✅ Office: ${data.OfficeName}`);
      } else {
        const body = await r.text();
        console.log(`  ❌ ${body.slice(0, 300)}`);
      }
    }
  }
}

main()
  .catch(e => console.error('Fatal:', e))
  .finally(() => prisma.$disconnect());
