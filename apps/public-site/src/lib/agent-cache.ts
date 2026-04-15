import { getCached, setCache } from './redis';

export interface AgentCacheData {
  agentName: string;
  agentPhone: string | null;
  agentPhoto: string | null;
  officeName: string | null;
}

const AGENT_CACHE_TTL = 86400 * 30; // 30 days
let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Acquire DDF token (memoized in memory for this server instance).
 */
async function getDdfToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const clientId = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID;
  const clientSecret = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET;
  
  console.log(`[DDF Auth] ID: ${clientId ? 'SET' : 'MISSING'} | Secret: ${clientSecret ? 'SET' : 'MISSING'}`);
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch('https://identity.crea.ca/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'DDFApi_Read',
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.access_token) {
      cachedToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000 - 60000;
      return cachedToken;
    }
  } catch (err) {
    console.warn('[DDF Auth] Failed to acquire token:', err);
  }
  return null;
}

/**
 * Live fetch agent and office from DDF API and cache them.
 */
async function fetchAgentLive(memberKey: string, officeKey?: string): Promise<AgentCacheData | null> {
  console.log(`[DDF] Cache miss for agent ${memberKey}. Attempting live fetch...`);
  const token = await getDdfToken();
  if (!token) {
    console.warn('[DDF] Failed to acquire token for live fetch.');
    return null;
  }

  try {
    // 1. Fetch Member
    console.log(`[DDF] Fetching member details for ${memberKey}...`);
    const mRes = await fetch(`https://ddfapi.realtor.ca/odata/v1/Member('${memberKey}')`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!mRes.ok) {
        console.warn(`[DDF] Member API error ${mRes.status} for ${memberKey}`);
        return null;
    }
    const m = await mRes.json();
    
    if (!m || !m.MemberKey) {
        console.warn(`[DDF] Member ${memberKey} not found in API`);
        return null;
    }
    
    const agentName = [m.MemberFirstName, m.MemberLastName].filter(Boolean).join(' ') || 'Listing Representative';
    const agentPhone = m.MemberOfficePhone || m.MemberTollFreePhone || null;
    const agentPhoto = m.Media?.[0]?.MediaURL || null;

    console.log(`[DDF] Found: ${agentName} (${agentPhone})`);

    // 2. Fetch Office (if officeKey provided or in member record)
    const activeOfficeKey = officeKey || m.OfficeKey;
    let officeName = null;
    
    if (activeOfficeKey) {
       const oRes = await fetch(`https://ddfapi.realtor.ca/odata/v1/Office('${activeOfficeKey}')`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       if (oRes.ok) {
         const o = await oRes.json();
         officeName = o.OfficeName || null;
         if (officeName) await saveOfficeToCache(activeOfficeKey, officeName);
       }
    }

    const result: AgentCacheData = { agentName, agentPhone, agentPhoto, officeName };
    await saveAgentToCache(memberKey, result);
    return result;
  } catch (err) {
    console.warn('[DDF Live Fetch] Error fetching agent/office:', err);
    return null;
  }
}

/**
 * Get agent details from Redis by MemberKey/OfficeKey. 
 * Falls back to live DDF API lookup if not in cache.
 */
export async function getAgentFromCache(memberKey: string, officeKey?: string): Promise<AgentCacheData | null> {
  if (!memberKey) return null;
  
  const key = `agent:${memberKey}`;
  let data = await getCached(key);
  
  if (data) return data;
  
  // Cache miss — perform live lookup
  return await fetchAgentLive(memberKey, officeKey);
}

/**
 * Save agent and office details to Redis.
 */
export async function saveAgentToCache(memberKey: string, data: AgentCacheData): Promise<void> {
  if (!memberKey) return;
  await setCache(`agent:${memberKey}`, data, AGENT_CACHE_TTL);
}

export async function saveOfficeToCache(officeKey: string, officeName: string): Promise<void> {
  if (!officeKey || !officeName) return;
  await setCache(`office:${officeKey}`, officeName, AGENT_CACHE_TTL);
}
