import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DDF_URL = 'https://ddfapi.realtor.ca/odata/v1/Property';
const TOKEN_URL = 'https://identity.crea.ca/connect/token';
const CLIENT_ID = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID || '';
const CLIENT_SECRET = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET || '';
const PAGE_SIZE = 100;
const CONCURRENCY = 2; 
const TARGET_COUNT = 200000;

async function getToken(retry = 5): Promise<string> {
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'DDFApi_Read',
      }),
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
    const data = await res.json();
    return data.access_token;
  } catch (e: any) {
    if (retry > 0) {
      console.warn(`🔐 Token timeout. Retrying in 10s...`);
      await new Promise(r => setTimeout(r, 10000));
      return getToken(retry - 1);
    }
    throw e;
  }
}

async function fetchOlderBatch(token: string, oldestTimestamp: string, skip: number, retry = 3): Promise<any[]> {
  const filter = oldestTimestamp ? `ModificationTimestamp lt ${oldestTimestamp}` : '';
  const params = new URLSearchParams({
    '$top': PAGE_SIZE.toString(),
    '$skip': skip.toString(),
    '$orderby': 'ModificationTimestamp desc',
  });
  if (filter) params.append('$filter', filter);

  try {
    const res = await fetch(`${DDF_URL}?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.value || [];
  } catch (e: any) {
    if (retry > 0) {
      await new Promise(r => setTimeout(r, 10000));
      return fetchOlderBatch(token, oldestTimestamp, skip, retry - 1);
    }
    return [];
  }
}

function mapListingCompact(item: any) {
  const primaryMedia = item.Media?.length > 0 ? item.Media[0].MediaURL : null;
  return {
    listingKey: item.ListingKey,
    listingId: item.ListingId || null,
    listPrice: item.ListPrice ? parseFloat(item.ListPrice) : null,
    standardStatus: item.StandardStatus || null,
    propertyType: item.PropertyType || null,
    propertySubType: item.PropertySubType || null,
    bedroomsTotal: item.BedroomsTotal ? parseInt(item.BedroomsTotal, 10) : null,
    bathroomsTotal: item.BathroomsTotalInteger ? parseInt(item.BathroomsTotalInteger, 10) : null,
    address: item.UnparsedAddress || null,
    city: item.City || null,
    province: item.StateOrProvince || null,
    postalCode: item.PostalCode || null,
    latitude: item.Latitude ? parseFloat(item.Latitude) : null,
    longitude: item.Longitude ? parseFloat(item.Longitude) : null,
    publicRemarks: item.PublicRemarks ? item.PublicRemarks.substring(0, 1000) : null, // Limit remark length
    agentName: item.ListAgentFullName || null,
    agentPhone: item.ListAgentDirectPhone || null,
    officeName: item.ListOfficeName || null,
    primaryPhoto: primaryMedia,
    modificationTimestamp: item.ModificationTimestamp ? new Date(item.ModificationTimestamp) : null,
    listingDate: item.ListingDate ? new Date(item.ListingDate) : (item.OriginalEntryTimestamp ? new Date(item.OriginalEntryTimestamp) : null),
    // Sidecar storage for agent data not in the primary schema to avoid breaking migrations
    rawData: {
      ListAgentEmail: item.ListAgentEmail || null,
      ListOfficePhone: item.ListOfficePhone || null,
      ListAgentKey: item.ListAgentKey || null,
      ListOfficeKey: item.ListOfficeKey || null,
      ListAgentDirectPhone: item.ListAgentDirectPhone || null,
      ListAgentFullName: item.ListAgentFullName || null,
      ListOfficeName: item.ListOfficeName || null
    },
  };
}

async function cleanupStorage() {
  console.log("🧹 STORAGE CLEANUP: Removing rawData from existing listings to free up space...");
  try {
    await prisma.listing.updateMany({
        data: {
            rawData: {}
        }
    });
    console.log("✅ Cleanup complete. Space recovered.");
  } catch(e: any) {
    console.error(`❌ Cleanup failed: ${e.message}. Attempting to continue anyway.`);
  }
}

async function fastSync() {
  console.log('🚀 STORAGE-OPTIMIZED SYNC — Bypassing 512MB limit...');
  
  // First, free up some space
  await cleanupStorage();

  while (true) {
    try {
      let token = await getToken();
      let totalIndexed = await prisma.listing.count();
      console.log(`📊 DB Current Total: ${totalIndexed}`);

      while (totalIndexed < TARGET_COUNT) {
        let oldestTimestampStr = null;
        try {
          const oldestListing = await prisma.listing.findFirst({
            orderBy: { modificationTimestamp: 'asc' },
            where: { modificationTimestamp: { not: null } }
          });
          oldestTimestampStr = oldestListing?.modificationTimestamp?.toISOString() || null;
        } catch(e) {
          await new Promise(r => setTimeout(r, 15000));
          continue;
        }

        console.log(`🔍 Time searching: ${oldestTimestampStr || 'Genesis'}`);
        const skipBatch = Array.from({ length: CONCURRENCY }, (_, i) => i * PAGE_SIZE);
        const results = await Promise.all(skipBatch.map(s => fetchOlderBatch(token, oldestTimestampStr!, s)));
        const allItems = results.flat();

        if (allItems.length === 0) {
            console.log("🛑 End of feed. Sleeping 60s...");
            await new Promise(r => setTimeout(r, 60000));
            continue;
        }

        const mapped = allItems.map(mapListingCompact);
        try {
          await prisma.listing.createMany({
            data: mapped,
            skipDuplicates: true,
          });
          totalIndexed = await prisma.listing.count();
          console.log(`📦 Status: ${totalIndexed} entries.`);
        } catch (e: any) {
          console.error(`⚠️ Save Batch Failed: ${e.message}`);
          if (e.message.includes("limit exceeded")) {
             console.log("🚨 STILL OVER LIMIT. Double-check Neon storage settings.");
          }
          await new Promise(r => setTimeout(r, 20000));
          break; 
        }
        await new Promise(r => setTimeout(r, 2000));
      }
      if(totalIndexed >= TARGET_COUNT) break;
    } catch (e: any) {
      await new Promise(r => setTimeout(r, 30000));
    }
  }
}

fastSync().catch(console.error);
