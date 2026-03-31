import { Prisma } from '@prisma/client';

export interface ListingQuery {
    city?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    beds?: number | null;
    baths?: number | null;
    propertyType?: string | null;
    q?: string | null;
    search?: string | null; // Alias for q
    // Geo Bounds
    latMin?: number | null;
    latMax?: number | null;
    lngMin?: number | null;
    lngMax?: number | null;
    featured?: boolean | null;
    listingType?: string | null;
    type?: string | null; // Alias for listingType or propertyType
    minSqft?: number | null;
    maxSqft?: number | null;
    minYearBuilt?: number | null;
    maxYearBuilt?: number | null;
    sortBy?: string | null;
    order?: 'asc' | 'desc' | null;
    min_price?: number | null; // Snake case alias
    max_price?: number | null; // Snake case alias
    keywords?: string | null;
    standardStatus?: string | null;
    useRanking?: boolean; // Flag to enable smart ranking
    agentName?: string | null;
    agentId?: string | null;
    // Advanced filters
    buildingType?: string | null;
    ownershipType?: string | null;
    listedSince?: string | null;
    minLandSize?: number | null;
    maxLandSize?: number | null;
    minStoreys?: number | null;
    maxStoreys?: number | null;
    minMaintFee?: number | null;
    maxMaintFee?: number | null;
    minTax?: number | null;
    maxTax?: number | null;
}

/**
 * Centralized Soft-Delete Wrapper
 * Ensures isActive: true is enforced across the platform.
 */
export function withActive(where: Prisma.ListingWhereInput = {}): Prisma.ListingWhereInput {
    return {
        ...where,
        isActive: true
    };
}

// 0. Base Selection to minimize DB load while maintaining API response structure
const LISTING_SELECT_FIELDS = {
    id: true,
    listingKey: true,
    listingId: true,
    listPrice: true,
    standardStatus: true,
    propertyType: true,
    propertySubType: true,
    address: true,
    city: true,
    province: true,
    postalCode: true,
    latitude: true,
    longitude: true,
    bedroomsTotal: true,
    bathroomsTotal: true,
    livingArea: true,
    yearBuilt: true,
    publicRemarks: true,
    modificationTimestamp: true,
    primaryPhoto: true,
    agentName: true,
    agentPhone: true,
    officeName: true,
    moreInformationLink: true,
    isActive: true,
    primaryPhotoUrl: true,
    photosChangeTimestamp: true,
    mediaJson: true,
    rawData: true, // Necessary if the API response expects these fields (per route.ts mapping)
};

/**
 * Smart Search Ranking (SQL Optimized)
 */
export async function fetchRankedListings(
    prisma: any, 
    query: ListingQuery, 
    limit: number, 
    skip: number,
    options?: { shortcodeMode?: boolean }
) {
    try {
        // ── 1. Helper: Execute Single Search Action ──────────────────────────
        const runSearch = async (q: ListingQuery, limit: number, skip: number, extraFilter: any = {}) => {
            const searchStr = (q.q || q.search || q.keywords || '').trim();
            const baseWhere = buildWhereClause(q);
            const where = { AND: [baseWhere, extraFilter] };
            
            if (!searchStr) {
                const orderBy = buildOrderByClause(q);
                return await prisma.listing.findMany({
                    where: withActive(where),
                    take: limit,
                    skip,
                    orderBy,
                    select: LISTING_SELECT_FIELDS
                });
            }

            // Keyword Search with Scoring (Optimized SQL)
            if (Object.keys(extraFilter).length > 0) {
                return await prisma.listing.findMany({
                    where: withActive(where),
                    take: limit,
                    skip,
                    orderBy: { modificationTimestamp: 'desc' },
                    select: LISTING_SELECT_FIELDS
                });
            }

            const term = `%${searchStr}%`;
            const cityFilter = q.city ? q.city : null;
            const cityPrefix = cityFilter ? `${cityFilter}%` : null;
            const minPrice = q.minPrice || q.min_price || 0;
            const maxPrice = q.maxPrice || q.max_price || 999999999;
            const beds = q.beds || 0;
            const baths = q.baths || 0;
            const propType = q.propertyType && q.propertyType !== 'Any' ? `%${q.propertyType}%` : null;

            // Using specific fields in SQL to minimize JSON overhead
            const fields = Object.keys(LISTING_SELECT_FIELDS)
                .map(f => `"${f}"`)
                .join(', ');

            return await prisma.$queryRawUnsafe(`
                SELECT ${fields}, 
                    (
                        CASE WHEN "address" ILIKE $1 THEN 10 ELSE 0 END +
                        CASE WHEN "city" ILIKE $1 THEN 5 ELSE 0 END +
                        CASE WHEN "publicRemarks" ILIKE $1 THEN 2 ELSE 0 END
                    ) as relevance
                FROM "Listing"
                WHERE "isActive" = true
                  AND ($2::text IS NULL OR "city" ILIKE $2)
                  AND ("listPrice" >= $3 AND "listPrice" <= $4)
                  AND ("bedroomsTotal" >= $5)
                  AND ("bathroomsTotal" >= $6)
                  AND ($7::text IS NULL OR "propertyType" ILIKE $7 OR "propertySubType" ILIKE $7)
                  AND (
                      "address" ILIKE $1 OR 
                      "city" ILIKE $1 OR 
                      "publicRemarks" ILIKE $1 OR
                      "listingId" ILIKE $1
                  )
                ORDER BY relevance DESC, "modificationTimestamp" DESC
                LIMIT ${limit} OFFSET ${skip}
            `, term, cityPrefix, minPrice, maxPrice, beds, baths, propType);
        };

        // ── 2. Count + Paginated Fetch ────────────────────────────────────────
        const strictWhere = withActive(buildWhereClause(query));
        const strictCount = await prisma.listing.count({ where: strictWhere });

        let total = strictCount;
        let expanded = false;
        let listings: any[];

        const hasGeo = queryHasGeoBounds(query);
        const shouldExpand = !options?.shortcodeMode && hasGeo && (query.city == null);

        if (strictCount < 20 && shouldExpand) {
            // Geo was limiting results — remove geo bounds, keep city + all other filters
            const fallbackQuery = { ...query, latMin: null, latMax: null, lngMin: null, lngMax: null };
            const fallbackWhere = withActive(buildWhereClause(fallbackQuery));
            const fallbackCount = await prisma.listing.count({ where: fallbackWhere });

            if (fallbackCount > strictCount) {
                // Use expanded results: strict first, then remaining
                total = fallbackCount;
                expanded = true;

                if (skip < strictCount) {
                    // Page overlaps strict results
                    const strictResults = await runSearch(query, limit, skip);
                    if (strictResults.length < limit) {
                        // Need to fill remainder from fallback (excluding strict)
                        const remainder = limit - strictResults.length;
                        const extra = await runSearch(fallbackQuery, remainder, 0, { NOT: strictWhere });
                        listings = [...strictResults, ...extra];
                    } else {
                        listings = strictResults;
                    }
                } else {
                    // Past strict results — fetch from fallback only (excluding strict)
                    const expandedSkip = skip - strictCount;
                    listings = await runSearch(fallbackQuery, limit, expandedSkip, { NOT: strictWhere });
                }
            } else {
                // Fallback didn't help — use strict as-is
                listings = await runSearch(query, limit, skip);
            }
        } else {
            // Enough strict results — standard paginated fetch
            listings = await runSearch(query, limit, skip);
        }

        const relaxationLevel = expanded ? 'GeoExpanded' : 'None';

        return { listings, total, relaxationLevel };

    } catch (err) {
        console.error('[Listing Engine] Ranked Fetch Error:', err);
        throw err;
    }
}

/**
 * Isolated Shortcode Fetch Logic
 * Calls the main engine but enforces strict matching (no expansion/fallback).
 */
export async function getListingsForShortcode(
    prisma: any,
    filters: ListingQuery,
    limit: number = 6
) {
    // 1. Sanitize Filters: Remove pollution and dead values
    const cleanFilters: ListingQuery = {};
    for (const [key, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null && val !== '' && val !== 'Any') {
            (cleanFilters as any)[key] = val;
        }
    }

    // 2. Call Engine with Shortcode isolation
    return await fetchRankedListings(
        prisma,
        cleanFilters,
        limit,
        0,
        { shortcodeMode: true }
    );
}

/**
 * Centralized Order By Builder
 */
export function buildOrderByClause(query: ListingQuery): Prisma.ListingOrderByWithRelationInput | Prisma.ListingOrderByWithRelationInput[] {
    const { sortBy, order = 'desc' } = query;
    const sortOrder = (order === 'asc' || order === 'desc') ? order : 'desc';

    // Base secondary sort to ensure consistency
    const secondarySort: Prisma.ListingOrderByWithRelationInput = { modificationTimestamp: 'desc' };

    let primarySort: Prisma.ListingOrderByWithRelationInput;

    switch (sortBy) {
        case 'price':
            primarySort = { listPrice: sortOrder }; break;
        case 'beds':
            primarySort = { bedroomsTotal: sortOrder }; break;
        case 'baths':
            primarySort = { bathroomsTotal: sortOrder }; break;
        case 'sqft':
            primarySort = { livingArea: sortOrder }; break;
        case 'year':
            primarySort = { yearBuilt: sortOrder }; break;
        case 'newest':
        case 'date':
        case 'updated':
            primarySort = { modificationTimestamp: sortOrder }; break;
        case 'createdAt':
            primarySort = { createdAt: sortOrder }; break;
        default:
            primarySort = { modificationTimestamp: 'desc' }; break;
    }

    // CRITICAL: Always prioritize listings WITH photos to improve UI quality.
    // Putting primaryPhotoUrl: 'desc' first means truthy strings (URLs) come before null/null-like.
    return [
        { primaryPhotoUrl: { sort: 'desc', nulls: 'last' } as any },
        primarySort,
        secondarySort
    ];
}

/**
 * ─── Filter Engine Implementation ───
 * Modular search system for professional listing discovery.
 */

type FilterProcessor = (value: any, query: ListingQuery) => Prisma.ListingWhereInput | null;

/**
 * Safe number parser — returns null if result is not a finite number
 */
function safeFloat(v: any): number | null {
    const n = parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
}
function safeInt(v: any): number | null {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
}

const FILTER_MAP: Record<string, FilterProcessor> = {
    // 1. Core Text Search — OR across text fields only
    q: (v, q) => {
        const combined = [v, q.search, q.keywords].filter(Boolean).join(' ').trim();
        if (!combined) return null;
        
        // Strategy: If searching for a city, prioritize the city/address fields
        // descriptions (publicRemarks) often contain city names as keywords, causing broad pollution
        return {
            OR: [
                { city: { startsWith: combined, mode: 'insensitive' } },
                { address: { contains: combined, mode: 'insensitive' } },
                { publicRemarks: { contains: combined, mode: 'insensitive' } }
            ]
        };
    },
    search: (v, q) => q.q ? null : FILTER_MAP.q(v, q),
    keywords: (v, q) => (q.q || q.search) ? null : FILTER_MAP.q(v, q),

    // 2. Location — startsWith to capture "Toronto (Annex)", "Toronto (Waterfront Communities)", etc.
    //    CREA DDF stores cities as "CityName (Neighbourhood)" — startsWith matches Realtor.ca behavior
    city: (v) => {
        const city = String(v).trim();
        if (!city) return null;
        return { city: { startsWith: city, mode: 'insensitive' } };
    },

    // 3. Price — guarded against NaN
    minPrice: (v) => { const n = safeFloat(v); return n !== null ? { listPrice: { gte: n } } : null; },
    min_price: (v) => { const n = safeFloat(v); return n !== null ? { listPrice: { gte: n } } : null; },
    maxPrice: (v) => { const n = safeFloat(v); return n !== null ? { listPrice: { lte: n } } : null; },
    max_price: (v) => { const n = safeFloat(v); return n !== null ? { listPrice: { lte: n } } : null; },

    // 4. Physical Attributes — guarded against NaN
    beds: (v) => { const n = safeInt(v); return (n !== null && n > 0) ? { bedroomsTotal: { gte: n } } : null; },
    baths: (v) => { const n = safeInt(v); return (n !== null && n > 0) ? { bathroomsTotal: { gte: n } } : null; },
    minSqft: (v) => { const n = safeFloat(v); return n !== null ? { livingArea: { gte: n } } : null; },
    maxSqft: (v) => { const n = safeFloat(v); return n !== null ? { livingArea: { lte: n } } : null; },
    minYearBuilt: (v) => { const n = safeInt(v); return n !== null ? { yearBuilt: { gte: n } } : null; },
    maxYearBuilt: (v) => { const n = safeInt(v); return n !== null ? { yearBuilt: { lte: n } } : null; },

    // 5. Types & Status
    propertyType: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        
        // Support multiple types via comma separation
        const types = s.split(',').map(t => t.trim()).filter(Boolean);
        
        const getConditionForType = (t: string): Prisma.ListingWhereInput => {
            if (t === 'Residential') {
                return {
                    OR: [
                        { propertyType: { contains: 'Residential', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Single Family', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Multi-family', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Condo', mode: 'insensitive' } }
                    ]
                };
            }
            if (t === 'Commercial') {
                return {
                    OR: [
                        { propertyType: { contains: 'Commercial', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Industrial', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Office', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Retail', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Business', mode: 'insensitive' } }
                    ]
                };
            }
            if (t === 'Lease') {
                return {
                    OR: [
                        { propertyType: { contains: 'Lease', mode: 'insensitive' } },
                        { propertySubType: { contains: 'Lease', mode: 'insensitive' } },
                        { publicRemarks: { contains: 'Lease', mode: 'insensitive' } },
                        { rawData: { path: ['TransactionType'], equals: 'For Lease' } }
                    ]
                };
            }
            return {
                OR: [
                    { propertyType: { contains: t, mode: 'insensitive' } },
                    { propertySubType: { contains: t, mode: 'insensitive' } }
                ]
            };
        };

        if (types.length <= 1) return getConditionForType(types[0]);

        return {
            OR: types.map(getConditionForType)
        };
    },
    type: (v, q) => q.propertyType ? null : FILTER_MAP.propertyType(v, q),
    listingType: (v, q) => FILTER_MAP.propertyType(v, q),
    featured: (v) => (v === true || v === 'true') ? { isFeatured: true } : null,
    standardStatus: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        return { standardStatus: { equals: s, mode: 'insensitive' } };
    },
    agentName: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        return { agentName: { equals: s, mode: 'insensitive' } };
    },
    agentId: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        return {
            OR: [
                { listingKey: { contains: s, mode: 'insensitive' } },
                { rawData: { path: ['ListAgentKey'], equals: s } }
            ]
        };
    },

    // ── Advanced Filters ──────────────────────────────────────────────
    buildingType: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        return {
            OR: [
                { rawData: { path: ['StructureType'], array_contains: s } },
                { propertySubType: { contains: s, mode: 'insensitive' } }
            ]
        };
    },
    ownershipType: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        return { rawData: { path: ['CommonInterest'], string_contains: s } };
    },
    listedSince: (v) => {
        const s = String(v).trim();
        if (!s) return null;
        const d = new Date(s);
        if (isNaN(d.getTime())) return null;
        return { modificationTimestamp: { gte: d } };
    },
    minLandSize: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['LotSizeArea'], gte: n } } : null; },
    maxLandSize: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['LotSizeArea'], lte: n } } : null; },
    minStoreys: (v) => { const n = safeInt(v); return n !== null ? { rawData: { path: ['Stories'], gte: String(n) } } : null; },
    maxStoreys: (v) => { const n = safeInt(v); return n !== null ? { rawData: { path: ['Stories'], lte: String(n) } } : null; },
    minMaintFee: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['AssociationFee'], gte: n } } : null; },
    maxMaintFee: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['AssociationFee'], lte: n } } : null; },
    minTax: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['TaxAnnualAmount'], gte: n } } : null; },
    maxTax: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['TaxAnnualAmount'], lte: n } } : null; },
};

function queryHasGeoBounds(q: ListingQuery) {
    return q.latMin != null && q.latMax != null && q.lngMin != null && q.lngMax != null;
}

export function buildWhereClause(query: ListingQuery): Prisma.ListingWhereInput {
    // ── 1. Priority MLS ID Search — numeric queries bypass ALL filters ──
    const searchStr = (query.q || query.search || query.keywords || '').trim();
    if (searchStr) {
        const isNumericId = /^\d{5,}$/.test(searchStr);
        const isMlsKey = /^[A-Za-z]\d{2,}$/i.test(searchStr);
        if (isNumericId || isMlsKey) {
            return withActive({
                OR: [
                    { listingKey: { equals: searchStr, mode: 'insensitive' } },
                    { listingId: { equals: searchStr, mode: 'insensitive' } }
                ]
            });
        }
    }

    // ── 2. Build AND conditions — each filter becomes one AND element ───
    const conditions: Prisma.ListingWhereInput[] = [];

    // Geo Bounds — only when all four values are valid finite numbers
    if (queryHasGeoBounds(query)) {
        const latMin = safeFloat(query.latMin);
        const latMax = safeFloat(query.latMax);
        const lngMin = safeFloat(query.lngMin);
        const lngMax = safeFloat(query.lngMax);
        if (latMin !== null && latMax !== null && lngMin !== null && lngMax !== null) {
            conditions.push({
                latitude: { gte: latMin, lte: latMax },
                longitude: { gte: lngMin, lte: lngMax }
            });
        }
    }

    // ── 3. Modular filters — skip bad values to prevent Prisma errors ───
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        if (typeof value === 'string' && value.trim() === '') continue;
        if (typeof value === 'number' && !Number.isFinite(value)) continue;
        if (typeof value === 'boolean' && key !== 'featured') continue;

        const processor = FILTER_MAP[key as keyof typeof FILTER_MAP];
        if (!processor) continue;

        const condition = processor(value, query);
        if (!condition) continue;

        // Final safety: ensure no empty OR/AND arrays leak through
        if ('OR' in condition && (!Array.isArray(condition.OR) || condition.OR.length === 0)) continue;
        if ('AND' in condition && (!Array.isArray(condition.AND) || condition.AND.length === 0)) continue;

        conditions.push(condition);
    }

    // ── 4. Return: AND of all conditions, or {} if none ─────────────────
    const finalWhere = conditions.length > 0 ? { AND: conditions } : {};
    return withActive(finalWhere);
}
