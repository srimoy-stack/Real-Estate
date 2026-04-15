/**
 * Quick diagnostic: peek at rawData keys to find agent-related fields.
 * Safe read-only script — no writes.
 */
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['error'] });

async function main() {
  // Grab 3 listings that have rawData
  const listings = await prisma.listing.findMany({
    where: { isActive: true, rawData: { not: null } },
    select: { id: true, listingKey: true, agentName: true, agentEmail: true, agentPhone: true, officeName: true, rawData: true },
    take: 3,
    orderBy: { id: 'desc' },
  });

  for (const l of listings) {
    console.log(`\n═══ Listing ${l.listingKey} (id=${l.id}) ═══`);
    console.log(`  DB agentName: ${l.agentName}`);
    console.log(`  DB agentEmail: ${l.agentEmail}`);
    console.log(`  DB officeName: ${l.officeName}`);

    const raw = l.rawData as Record<string, any>;
    if (!raw) { console.log('  rawData: NULL'); continue; }

    // Print ALL top-level keys
    const keys = Object.keys(raw);
    console.log(`  rawData keys (${keys.length}):`, keys.join(', '));

    // Print any key containing agent/office/member/broker/individual (case insensitive)
    const agentKeys = keys.filter(k => /agent|office|member|broker|individual|ListAgent|ListOffice/i.test(k));
    console.log(`\n  🔍 Agent-related keys:`, agentKeys.length > 0 ? agentKeys.join(', ') : 'NONE FOUND');

    for (const k of agentKeys) {
      const val = raw[k];
      const display = typeof val === 'object' ? JSON.stringify(val).slice(0, 200) : String(val);
      console.log(`    ${k}: ${display}`);
    }
  }
}

main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect());
