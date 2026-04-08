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
    province?: string | null;
    maxTax?: number | null;
    transaction?: string | null; // 'buy' | 'lease' — controls priority ordering
}

/**
 * Centralized Category Configuration
 * To update what counts as "Commercial", "Agriculture", or "Lease", 
 * simply edit these lists. This provides flexibility for future changes.
 */
export const CLASSIFICATION_MAP = {
    commercial: {
        subTypes: ['Industrial', 'Office', 'Retail', 'Business', 'Investment', 'Warehouse', 'Agriculture', 'Acreage', 'Land', 'Hospitality', 'Commercial', 'Multi-family', 'Apartment'],
        excludeSubTypes: ['Single Family', 'Condo', 'Townhouse', 'Modular Home'],
        excludeTypes: []
    },
    lease: {
        keywords: ['Lease', 'Rent'],
        remarks: ['for lease', 'for rent', 'commercial lease'],
        excludeSubTypes: ['Single Family', 'Condo', 'Residential', 'Multi-family', 'Apartment']
    },
    residential: {
        subTypes: ['Single Family', 'Condo', 'Townhouse', 'Modular Home', 'Duplex', 'Triplex', 'Fourplex', 'Multi-family', 'Apartment'],
        types: ['Residential']
    }
} as const;

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
    listingDate: true,
    normalized_property_type: true,
};

/**
 * Smart Search Ranking (SQL Optimized)
 */
export async function fetchRankedListings(
    prisma: any, 
    query: ListingQuery, 
    limit: number, 
    skip: number,
    _options?: { shortcodeMode?: boolean }
) {
    try {
        // ── 1. Determine priority mode from transaction ──────────────────────
        const txn = (query.transaction || '').toLowerCase();
        const isLeaseMode = txn === 'lease';

        // Priority type: which normalized_property_type should appear first
        const priorityType = isLeaseMode ? 'lease' : 'commercial';

        // ── 2. Build WHERE clause (handles all filters) ─────────────────────
        const baseWhere = withActive(buildWhereClause(query));

        // ── 3. Count total matching listings ────────────────────────────────
        console.log('[Search Engine] baseWhere:', JSON.stringify(baseWhere, null, 2));
        const total = await prisma.listing.count({ where: baseWhere });

        // ── 4. Fetch with priority ordering ─────────────────────────────────
        // Strategy: Two-batch fetch for correct priority across pagination.
        //   Batch 1: Priority listings (commercial for buy, lease for lease)
        //   Batch 2: Remaining listings (everything else)
        // This ensures priority listings always appear first, even across pages.

        const orderBy = buildOrderByClause(query);
        let listings: any[];

        // Priority WHERE: same base filters + normalized_property_type match
        const baseConditions = Array.isArray(baseWhere.AND) ? baseWhere.AND : [baseWhere];
        const priorityWhere: any = {
            AND: [
                ...baseConditions,
                { normalized_property_type: priorityType },
                { isActive: true }
            ]
        };

        // Count priority listings to handle pagination correctly
        console.log('[Search Engine] priorityWhere:', JSON.stringify(priorityWhere, null, 2));
        const priorityCount = await prisma.listing.count({ where: priorityWhere });
        console.log('[Search Engine] priorityCount:', priorityCount);

        if (skip < priorityCount) {
            // Current page overlaps priority listings
            const priorityListings = await prisma.listing.findMany({
                where: priorityWhere,
                take: limit,
                skip,
                orderBy,
                select: LISTING_SELECT_FIELDS
            });

            if (priorityListings.length < limit) {
                // Fill remaining slots with non-priority listings
                const remainder = limit - priorityListings.length;
                const otherListings = await prisma.listing.findMany({
                    where: {
                        ...baseWhere,
                        NOT: { normalized_property_type: priorityType }
                    },
                    take: remainder,
                    skip: 0,
                    orderBy,
                    select: LISTING_SELECT_FIELDS
                });
                listings = [...priorityListings, ...otherListings];
            } else {
                listings = priorityListings;
            }
        } else {
            // Past all priority listings — fetch from non-priority pool
            const otherSkip = skip - priorityCount;
            listings = await prisma.listing.findMany({
                where: {
                    ...baseWhere,
                    NOT: { normalized_property_type: priorityType }
                },
                take: limit,
                skip: otherSkip,
                orderBy,
                select: LISTING_SELECT_FIELDS
            });
        }

        const relaxationLevel = 'None';

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
            primarySort = { listingDate: sortOrder }; break;
        case 'createdAt':
            primarySort = { createdAt: sortOrder }; break;
        default:
            primarySort = { modificationTimestamp: 'desc' }; break;
    }

    // Always ensure we have a fallback for ties
    const fallbackSort: Prisma.ListingOrderByWithRelationInput = { id: 'desc' };

    // Primary goal: Newest First
    if (sortBy === 'newest' || sortBy === 'date' || sortBy === 'updated' || !sortBy) {
        return [
            primarySort, // listingDate
            { modificationTimestamp: 'desc' },
            { primaryPhotoUrl: { sort: 'desc', nulls: 'last' } as any },
            fallbackSort
        ];
    }

    // Default behavior for other sorts: Photos first to ensure high-quality grid
    return [
        { primaryPhotoUrl: { sort: 'desc', nulls: 'last' } as any },
        primarySort,
        secondarySort,
        fallbackSort
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
        if (!city || city === 'Any') return null;

        // Extract base city: "Toronto (East End-Danforth)" → "Toronto"
        const baseCity = city.replace(/\s*\(.*\)\s*$/, '').trim();

        // Build OR conditions: exact → prefix → base city fallback
        const conditions: Prisma.ListingWhereInput[] = [
            { city: { equals: city, mode: 'insensitive' as const } },
            { city: { startsWith: city, mode: 'insensitive' as const } },
            { city: { contains: city, mode: 'insensitive' as const } }
        ];

        // If city has a parenthetical neighborhood, add broad base-city fallback
        // This ensures "Toronto (East End-Danforth)" still returns Toronto results
        if (baseCity) {
            conditions.push(
                { city: { equals: baseCity, mode: 'insensitive' as const } },
                { city: { startsWith: baseCity, mode: 'insensitive' as const } },
                { city: { contains: baseCity, mode: 'insensitive' as const } }
            );
        }

        return { OR: conditions };
    },
    // 2.5 Province
    province: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        return { province: { startsWith: s, mode: 'insensitive' } };
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

    // 5. Types & Status — Uses normalizedPropertyType (DB source of truth)
    propertyType: (v) => {
        const s = String(v).trim();
        if (!s || s === 'Any') return null;
        
        // Support multiple types via comma separation
        const types = s.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        
        const getConditionForType = (t: string): Prisma.ListingWhereInput => {
            const lowT = t.toLowerCase();
            
            // ── Dynamic Category Filtering ────────────────────────────────────
            // Uses the centralized CLASSIFICATION_MAP for maximum flexibility.
            
            if (lowT === 'commercial') {
                const config = CLASSIFICATION_MAP.commercial;
                return {
                    AND: [
                        {
                            OR: [
                                ...config.subTypes.map(st => ({ propertySubType: { contains: st, mode: 'insensitive' as const } })),
                            ]
                        },
                        {
                            NOT: {
                                OR: [
                                    ...config.excludeSubTypes.map(st => ({ propertySubType: { contains: st, mode: 'insensitive' as const } })),
                                    ...config.excludeTypes.map(st => ({ propertyType: { contains: st, mode: 'insensitive' as const } })),
                                ]
                            }
                        }
                    ]
                };
            }
            
            if (lowT === 'lease') {
                const config = CLASSIFICATION_MAP.lease;
                return {
                    AND: [
                        {
                            OR: [
                                ...config.keywords.map(kw => ({ propertySubType: { contains: kw, mode: 'insensitive' as const } })),
                                ...config.keywords.map(kw => ({ propertyType: { contains: kw, mode: 'insensitive' as const } })),
                                ...config.remarks.map(rem => ({ publicRemarks: { contains: rem, mode: 'insensitive' as const } })),
                            ]
                        },
                        {
                            NOT: {
                                OR: [
                                    ...config.excludeSubTypes.map(st => ({ propertySubType: { contains: st, mode: 'insensitive' as const } })),
                                ]
                            }
                        }
                    ]
                };
            }
            
            if (lowT === 'residential') {
                const config = CLASSIFICATION_MAP.residential;
                return {
                    OR: [
                        ...config.types.map(tp => ({ propertyType: { contains: tp, mode: 'insensitive' as const } })),
                        ...config.subTypes.map(st => ({ propertySubType: { contains: st, mode: 'insensitive' as const } })),
                    ]
                };
            }
            
            // For specific subtypes (e.g., "Duplex", "Farm")
            return {
                propertySubType: { contains: t, mode: 'insensitive' }
            };
        };

        if (types.length <= 1) return getConditionForType(types[0]);

        return {
            OR: types.map(getConditionForType)
        };
    },
    type: (v, q) => q.propertyType ? null : FILTER_MAP.propertyType(v, q),
    listingType: (v, q) => {
        return FILTER_MAP.propertyType(v, q);
    },
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
        // Use listingDate (OriginalEntryTimestamp) — not modificationTimestamp which resets on sync
        return { listingDate: { gte: d } };
    },
    minLandSize: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['LotSizeArea'], gte: n } } : null; },
    maxLandSize: (v) => { const n = safeFloat(v); return n !== null ? { rawData: { path: ['LotSizeArea'], lte: n } } : null; },
    minStoreys: (v) => { const n = safeInt(v); return n !== null ? { rawData: { path: ['Stories'], gte: n } } : null; },
    maxStoreys: (v) => { const n = safeInt(v); return n !== null ? { rawData: { path: ['Stories'], lte: n } } : null; },
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
