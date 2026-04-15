import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { getAgentFromCache } from '../src/lib/agent-cache';

async function test() {
  console.log('--- Testing Agent Hydration ---');
  // Agent 2050106 (from 2449 QUEEN MARY STREET)
  console.log('Looking up agent 2050106...');
  const agent = await getAgentFromCache('2050106');
  console.log('Result:', JSON.stringify(agent, null, 2));
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
