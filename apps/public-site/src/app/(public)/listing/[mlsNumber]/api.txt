Great questions — and I can see your developer has been looking at the Web API docs at ddfapi-docs.realtor.ca, which is the newer REST/OData API. This is actually the better choice over the legacy RETS feed. Let me answer every question precisely.

1. API Access & Authentication
This is the most important thing to clarify for your developer:
The Web API at ddfapi-docs.realtor.ca uses a completely different auth model than the legacy RETS feed. Here's exactly how it works:
There is no OAuth endpoint and no API key you generate yourself. CREA issues credentials directly. The flow is:
Your DDF Username + Password (from the screenshot you shared)
         ↓
POST to CREA's token endpoint
         ↓
Receive Bearer Access Token
         ↓
Use token in all API requests
The token endpoint is:
POST https://identity.crea.ca/connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=UzXizJtCxoTTDgPyuoTYbeWH
&client_secret=5Cu3Nr3hQSpBKutnJidU22mf
&scope=DDFApi_Read
Token behavior:
    • Tokens are short-lived (typically 1 hour)
    • You must refresh by re-requesting — there is no refresh token flow
    • Store the token + expiry time, re-fetch before it expires
    • Never hardcode a token — always fetch programmatically
Here is the production token manager:
javascript
// lib/ddfTokenManager.js
const axios = require('axios');
const qs = require('querystring');

class DDFTokenManager {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
    this.expiresAt = null;
  }

  async getToken() {
    // Return cached token if still valid (with 60s buffer)
    if (this.token && Date.now() < this.expiresAt - 60000) {
      return this.token;
    }
    return this._fetchNewToken();
  }

  async _fetchNewToken() {
    const res = await axios.post(
      'https://identity.crea.ca/connect/token',
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'DDFApi_Read',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    this.token = res.data.access_token;
    this.expiresAt = Date.now() + res.data.expires_in * 1000;
    console.log(`[Token] New token fetched, expires in ${res.data.expires_in}s`);
    return this.token;
  }
}

module.exports = DDFTokenManager;

2. Environment & Access Setup
Question
Answer
Sandbox environment?
Yes — CREA provides sample credentials (from the PDF doc we reviewed)
Sample credentials
Username: CXLHfDVrziCfvwgCuL8nUahC / Password: mFqMsCSPdnb5WO1gpEEtDCHH
IP whitelisting?
No — no IP restrictions on the DDF API
VPN required?
No
Approval process?
Yes — already done. Your screenshot confirms you are approved. The Data Access Agreement with CREA must be signed before production access, which Digioptimizer (your tech provider registration) should have handled
For the Web API specifically — use the same credentials from your screenshot but against the OData endpoints instead of the RETS endpoints.
javascript
// Base URLs — two different APIs, same credentials
const RETS_BASE = 'https://data.crea.ca';           // Legacy RETS (XML)
const WEBAPI_BASE = 'https://ddfapi.realtor.ca/odata/v1'; // Modern OData (JSON) ✅ use this

3. API Endpoints & Data Coverage
The Web API is OData v4 — here are all available endpoints:
javascript
const ENDPOINTS = {
  // Core listing data
  property:    '/Property',
  member:      '/Member',       // Agents
  office:      '/Office',
  
  // Media — separate from property
  propertyMedia: '/Property?$expand=Media',  // Inline media expansion
  
  // Lookup/metadata tables  
  lookup:      '/Lookup',
};
```

**Full base URL structure:**
```
GET https://ddfapi.realtor.ca/odata/v1/Property
GET https://ddfapi.realtor.ca/odata/v1/Property('ListingKey')
GET https://ddfapi.realtor.ca/odata/v1/Member
GET https://ddfapi.realtor.ca/odata/v1/Office
GET https://ddfapi.realtor.ca/odata/v1/Property?$expand=Media
Media/Images — they are NOT auto-included in property responses. You must either:
    • Use $expand=Media to inline them, or
    • Query media URLs from the Photo collection in the property payload

4. Request Structure & Querying
This is where the Web API is vastly superior to RETS. It supports full OData querying:
javascript
// lib/ddfApiClient.js
const axios = require('axios');
const DDFTokenManager = require('./ddfTokenManager');

class DDFApiClient {
  constructor(clientId, clientSecret) {
    this.tokenManager = new DDFTokenManager(clientId, clientSecret);
    this.baseUrl = 'https://ddfapi.realtor.ca/odata/v1';
  }

  async _get(endpoint, params = {}) {
    const token = await this.tokenManager.getToken();
    const res = await axios.get(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      params,
    });
    return res.data;
  }

  // ── FILTERING EXAMPLES ──────────────────────────────────────

  // By city
  async getByCity(city, top = 200, skip = 0) {
    return this._get('/Property', {
      '$filter': `City eq '${city}'`,
      '$top': top,
      '$skip': skip,
      '$count': true,
    });
  }

  // By price range
  async getByPriceRange(min, max) {
    return this._get('/Property', {
      '$filter': `ListPrice ge ${min} and ListPrice le ${max}`,
      '$top': 200,
      '$orderby': 'ListPrice asc',
    });
  }

  // By property type (Residential, Condo, etc.)
  async getByPropertyType(type) {
    return this._get('/Property', {
      '$filter': `PropertyType eq '${type}'`,
      '$top': 200,
    });
  }

  // Combined filter — city + price + type (for your search page)
  async search({ city, minPrice, maxPrice, propertyType, bedrooms, top = 20, skip = 0 }) {
    const filters = [];
    if (city)         filters.push(`City eq '${city}'`);
    if (minPrice)     filters.push(`ListPrice ge ${minPrice}`);
    if (maxPrice)     filters.push(`ListPrice le ${maxPrice}`);
    if (propertyType) filters.push(`PropertyType eq '${propertyType}'`);
    if (bedrooms)     filters.push(`BedroomsTotal ge ${bedrooms}`);

    return this._get('/Property', {
      '$filter': filters.join(' and '),
      '$top': top,
      '$skip': skip,
      '$count': true,
      '$orderby': 'ModificationTimestamp desc',
      '$expand': 'Media',
      '$select': [
        'ListingKey', 'ListingId', 'ListPrice', 'PropertyType',
        'BedroomsTotal', 'BathroomsTotalInteger',
        'UnparsedAddress', 'City', 'StateOrProvince', 'PostalCode',
        'Latitude', 'Longitude', 'PublicRemarks',
        'ModificationTimestamp', 'StandardStatus'
      ].join(','),
    });
  }

  // Incremental sync — everything updated since last run
  async getUpdatedSince(timestamp) {
    return this._get('/Property', {
      '$filter': `ModificationTimestamp gt ${timestamp}`,
      '$top': 200,
      '$orderby': 'ModificationTimestamp asc',
      '$expand': 'Media',
    });
  }

  // Master list for reconciliation
  async getMasterList(skip = 0) {
    return this._get('/Property', {
      '$select': 'ListingKey,ModificationTimestamp',
      '$top': 500,
      '$skip': skip,
      '$count': true,
    });
  }

  // Single listing by key
  async getByKey(listingKey) {
    return this._get(`/Property('${listingKey}')`, {
      '$expand': 'Media',
    });
  }
}

module.exports = DDFApiClient;
Pagination — important limits:
javascript
// OData pagination rules for CREA Web API
const PAGINATION = {
  maxPerPage: 200,      // Hard max per request
  defaultPage: 20,      // Good default for website display
  syncBatchSize: 200,   // Use max during sync jobs
};

// Paginating through all results:
async function getAllProperties(client) {
  const allListings = [];
  let skip = 0;
  let total = Infinity;

  while (allListings.length < total) {
    const res = await client.getMasterList(skip);
    total = res['@odata.count'];
    allListings.push(...res.value);
    skip += 500;

    if (res.value.length === 0) break;

    // Rate limit — be polite to CREA servers
    await new Promise(r => setTimeout(r, 500));
  }

  return allListings;
}
Rate limits: CREA does not publish exact numbers but the practical rule is: no more than 1 request per second during sync, and sync only after 10am daily.

5. Response / Payload Structure
Here is exactly what a property response looks like and the key fields to map:
javascript
// Sample Web API response structure
{
  "@odata.context": "...",
  "@odata.count": 45231,
  "value": [
    {
      // ── IDENTIFIERS ──────────────────────────
      "ListingKey": "123456789",          // Primary key — use this everywhere
      "ListingId": "E5012345",            // Human-readable MLS number
      
      // ── PRICE ────────────────────────────────
      "ListPrice": 899000,
      "ClosePrice": null,                 // Null until sold
      
      // ── STATUS ───────────────────────────────
      "StandardStatus": "Active",         // Active | Pending | Closed
      "MlsStatus": "For Sale",
      
      // ── PROPERTY DETAILS ─────────────────────
      "PropertyType": "Residential",
      "PropertySubType": "Detached",
      "BedroomsTotal": 4,
      "BathroomsTotalInteger": 3,
      "LivingArea": 2100,
      "LivingAreaUnits": "Square Feet",
      "YearBuilt": 2005,
      
      // ── ADDRESS ──────────────────────────────
      "UnparsedAddress": "123 Main St",
      "StreetNumber": "123",
      "StreetName": "Main",
      "StreetSuffix": "St",
      "City": "Toronto",
      "StateOrProvince": "ON",
      "PostalCode": "M5V 1A1",
      "Country": "Canada",
      "Latitude": 43.6532,
      "Longitude": -79.3832,
      
      // ── AGENT ────────────────────────────────
      "ListAgentKey": "agent_456",
      "ListAgentFullName": "Baljit Singh Mand",
      "ListAgentEmail": "agent@brokerage.ca",
      "ListAgentDirectPhone": "416-555-0100",
      "ListOfficeKey": "office_789",
      "ListOfficeName": "ABC Realty Inc.",
      
      // ── TIMESTAMPS ───────────────────────────
      "ModificationTimestamp": "2024-01-15T14:30:00Z",  // For delta sync
      "ListingContractDate": "2024-01-10",
      "PhotosChangeTimestamp": "2024-01-15T10:00:00Z",
      
      // ── COMPLIANCE ───────────────────────────
      "MoreInformationLink": "https://www.realtor.ca/real-estate/12345/...",
      
      // ── MEDIA (when $expand=Media) ───────────
      "Media": [
        {
          "Order": 0,                     // 0 = primary/hero photo
          "MediaURL": "https://cdn.realtor.ca/listings/cts/enlg/pta/...",
          "MediaModificationTimestamp": "2024-01-15T10:00:00Z",
        }
      ]
    }
  ]
}
Database mapping from API response:
javascript
// lib/mapListing.js — maps API response to your DB schema
function mapListingToDb(tenantId, apiProperty) {
  const p = apiProperty;
  const primaryPhoto = p.Media?.find(m => m.Order === 0);

  return {
    tenant_id:              tenantId,
    listing_key:            p.ListingKey,
    listing_id:             p.ListingId,
    standard_status:        p.StandardStatus,
    list_price:             p.ListPrice,
    property_type:          p.PropertyType,
    property_sub_type:      p.PropertySubType,
    bedrooms_total:         p.BedroomsTotal,
    bathrooms_total:        p.BathroomsTotalInteger,
    living_area:            p.LivingArea,
    year_built:             p.YearBuilt,
    address_full:           p.UnparsedAddress,
    city:                   p.City,
    province:               p.StateOrProvince,
    postal_code:            p.PostalCode,
    latitude:               p.Latitude,
    longitude:              p.Longitude,
    public_remarks:         p.PublicRemarks,
    list_agent_name:        p.ListAgentFullName,
    list_agent_phone:       p.ListAgentDirectPhone,
    list_office_name:       p.ListOfficeName,
    more_information_link:  p.MoreInformationLink,  // REQUIRED for badge
    primary_photo_url:      primaryPhoto?.MediaURL,
    modification_timestamp: p.ModificationTimestamp,
    photos_change_ts:       p.PhotosChangeTimestamp,
    raw_data:               JSON.stringify(p),       // Never modify — store as-is
  };
}

module.exports = { mapListingToDb };

6. Data Sync Strategy
Here is the complete recommended sync strategy for production:
javascript
// workers/syncStrategy.js

/*
  SYNC FLOW (run daily after 10am):

  1. INITIAL SYNC (first time for a tenant)
     - Fetch all listings in batches of 200
     - Store everything in listings table
     - Record sync timestamp

  2. DELTA SYNC (every subsequent run)  
     - Fetch only records where ModificationTimestamp > last_sync_at
     - Upsert changed records
     - Separately: fetch master ID list, delete any IDs not in it

  3. PHOTO SYNC (within delta sync)
     - If PhotosChangeTimestamp changed → re-fetch all media for that listing
     - If unchanged → skip (saves API calls)
*/

async function runSync(tenant) {
  const client = new DDFApiClient(
    tenant.ddf_username,
    decrypt(tenant.ddf_password_encrypted)
  );

  const isInitialSync = !tenant.ddf_last_sync_at;

  if (isInitialSync) {
    await runInitialSync(client, tenant.id);
  } else {
    await runDeltaSync(client, tenant.id, tenant.ddf_last_sync_at);
  }
}

async function runInitialSync(client, tenantId) {
  console.log(`[Sync] Starting INITIAL sync for tenant ${tenantId}`);
  let skip = 0;
  let total = Infinity;
  let synced = 0;

  while (synced < total) {
    const res = await client._get('/Property', {
      '$top': 200, '$skip': skip,
      '$count': true,
      '$expand': 'Media',
    });
    total = res['@odata.count'];
    
    const mapped = res.value.map(p => mapListingToDb(tenantId, p));
    await batchUpsert(mapped);
    
    synced += res.value.length;
    skip += 200;
    console.log(`[Sync] Initial: ${synced}/${total}`);

    await sleep(500); // Be polite — 500ms between requests
    if (res.value.length === 0) break;
  }
}

async function runDeltaSync(client, tenantId, lastSyncAt) {
  console.log(`[Sync] Delta sync since ${lastSyncAt}`);

  // 1. Get updated listings
  const timestamp = new Date(lastSyncAt).toISOString();
  const updated = await client.getUpdatedSince(timestamp);
  
  if (updated.value.length > 0) {
    const mapped = updated.value.map(p => mapListingToDb(tenantId, p));
    await batchUpsert(mapped);
    console.log(`[Sync] Upserted ${mapped.length} updated listings`);
  }

  // 2. Reconcile deletions using master list
  const activeKeys = await getAllActiveKeys(client);
  const deleted = await db.query(`
    DELETE FROM listings
    WHERE tenant_id = $1 AND listing_key != ALL($2::text[])
    RETURNING listing_key
  `, [tenantId, activeKeys]);

  console.log(`[Sync] Deleted ${deleted.rowCount} stale listings`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

7. Compliance & Usage Guidelines
These are non-negotiable — CREA can terminate your feed access for violations:
javascript
// middleware/complianceMiddleware.js

// 1. Every listing page MUST show the "Powered by REALTOR.ca" badge
// Inject this into your Next.js listing layout component:

export function RealtorBadge({ moreInformationLink, lang = 'en' }) {
  const href = lang === 'fr'
    ? 'https://www.realtor.ca/fr'
    : 'https://www.realtor.ca/en';
  const src = lang === 'fr'
    ? 'https://www.realtor.ca/images/fr-ca/powered_by_realtor.svg'
    : 'https://www.realtor.ca/images/en-ca/powered_by_realtor.svg';
  const alt = lang === 'fr' ? 'Alimenté par: REALTOR.ca' : 'Powered by: REALTOR.ca';

  return (
    <a href={moreInformationLink || href} target="_blank" rel="noopener">
      <img width="125" src={src} alt={alt} />
    </a>
  );
}

// 2. Rules for data storage:
const COMPLIANCE_RULES = {
  // ✅ Allowed
  canCache: true,              // Caching is fine
  canStore: true,              // Storing in DB is fine
  canIndex: true,              // Search indexing is fine

  // ❌ Not allowed
  canModify: false,            // Never alter listing content
  canRemoveBranding: false,    // Badge is mandatory
  canSellData: false,          // Cannot resell raw data
  canShowSoldPrice: false,     // Sold prices must not be displayed

  // ⚠️ Required
  mustLinkToRealtor: true,     // MoreInformationLink must be clickable
  mustSyncAnalytics: true,     // Fire analytics ping on each listing view
  mustDeleteStale: true,       // Remove sold/expired listings promptly
};

// 3. Analytics ping — fire on every listing view
async function fireAnalyticsPing(listingId, destinationId, userIp) {
  const uuid = `${require('uuid').v4()}-${destinationId}`;
  
  // Fire and forget — no await needed
  axios.get('https://analytics.crea.ca/LogEvents.svc/LogEvents', {
    params: {
      ListingID: listingId,
      DestinationID: destinationId,  // Your DDF destination ID from CREA
      EventType: 'view',
      UUID: uuid,
      IP: userIp,
    }
  }).catch(() => {}); // Silent fail — never block page load for this
}

8. Developer Resources — Working Request Examples
Complete Postman-equivalent examples your developer can run immediately:
bash
# Step 1 — Get token
curl -X POST https://identity.crea.ca/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=UzXizJtCxoTTDgPyuoTYbeWH&client_secret=5Cu3Nr3hQSpBKutnJidU22mf&scope=DDFApi_Read"

# Step 2 — Search properties in Toronto
curl "https://ddfapi.realtor.ca/odata/v1/Property?\$filter=City eq 'Toronto'&\$top=5&\$expand=Media" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"

# Step 3 — Get a single listing
curl "https://ddfapi.realtor.ca/odata/v1/Property('LISTING_KEY')?$expand=Media" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Step 4 — Delta sync (everything updated in last 24h)
curl "https://ddfapi.realtor.ca/odata/v1/Property?\$filter=ModificationTimestamp gt 2024-01-14T00:00:00Z&\$top=200&\$orderby=ModificationTimestamp asc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Step 5 — SEO page data (all Toronto condos)
curl "https://ddfapi.realtor.ca/odata/v1/Property?\$filter=City eq 'Toronto' and PropertySubType eq 'Condo'&\$select=ListingKey,ListPrice,BedroomsTotal,UnparsedAddress,Latitude,Longitude&\$top=200&\$count=true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

Summary table for your developer:
Question
Answer
Auth type
OAuth2 client credentials — POST to identity.crea.ca/connect/token
Token lifetime
~1 hour — auto-refresh in code
Sandbox
Use sample credentials from the DDF PDF
IP whitelist
Not required
Max per request
200 records
Sync timing
After 10am daily
Images
$expand=Media on Property endpoint
Incremental sync
$filter=ModificationTimestamp gt {timestamp}
Required badge
MoreInformationLink + Powered by REALTOR.ca SVG
Analytics
Fire GET to analytics.crea.ca on every listing view
The single most important thing for your developer to do right now is run the token request curl command above and confirm they get a valid access_token back. Once that works, everything else follows. Want me to generate the complete Next.js listing page with badge, or the full database schema next?
