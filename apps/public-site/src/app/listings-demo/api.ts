import { MLSProperty, MLSApiResponse, FilterState } from './types';

interface FetchListingsResponse extends MLSApiResponse {
    listings: MLSProperty[];
    nextLink: string | null;
    total: number;
    totalCount?: number;
    platformTotal?: number;
}

const USE_INTERNAL_API = true; // Toggle to switch between local Sync DB and Live MLS Proxy

/**
 * AGGREGATION UTILITY with Parallel Auto-Pagination.
 *
 * Strategy:
 *   1. Fetch 3 batches (300 potential listings) in parallel.
 *   2. Merge and deduplicate by ListingId.
 *   3. If results are still very low, try an expanded geo search.
 */
export async function fetchAggregatedListings(
    filters: FilterState,
    pageSize: number = 100
): Promise<FetchListingsResponse> {
    console.log(`[MLS Aggregator] Starting parallel batch fetch...`);

    try {
        // ── Step 1: Fetch 3 batches in parallel (0, 100, 200) ───────────
        const batches = [1, 2, 3];
        const results = await Promise.all(
            batches.map(page =>
                fetchListings(filters, page, pageSize).catch(err => {
                    console.error(`[MLS Aggregator] Batch ${page} failed:`, err);
                    return { listings: [], total: 0, totalCount: 0, platformTotal: 0, nextLink: null };
                })
            )
        );

        // ── Step 2: Extract & Deduplicate (Task 3.1) ───────────────────────────
        const seen = new Set<string>();
        const uniqueListings = results.flatMap(r => r.listings).filter(l => {
            const id = l.ListingId || l.ListingKey;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        // ── Step 3: NO expansion (Task 3.1) ────────────────────────────────────
        // Geo-expansion is removed to guarantee 1:1 total correspondence.

        const sortedListings = sortListings(uniqueListings, filters);
        
        return {
            listings: sortedListings,
            total: results[0]?.total || 0, // Backend total is the source of truth
            totalCount: results[0]?.totalCount || results[0]?.total || 0,
            platformTotal: results[0]?.platformTotal || 0,
            nextLink: null
        };

    } catch (err) {
        console.error('[MLS Aggregator] Critical Failure:', err);
        throw err;
    }
}

/**
 * RELEVANCE SCORING & SORTING (Mirrors Backend Weighted Ranking)
 */
export function scoreListing(listing: MLSProperty, query: string): number {
    if (!query) return 0;
    const q = query.toLowerCase().trim();
    const city = (listing.City || '').toLowerCase();
    const addr = (listing.UnparsedAddress || '').toLowerCase();
    const remarks = (listing.PublicRemarks || '').toLowerCase();

    let score = 0;
    // Weighted search ranking: Address (3), City exact (2), Remarks (1)
    if (addr.includes(q)) score += 3;
    if (city === q) score += 2; // Exact match only — prevents cross-city pollution
    if (remarks.includes(q)) score += 1;
    
    // Exact match bonuses (Professional UI heuristic)
    if (addr === q) score += 10;
    
    return score;
}

export function sortListings(listings: MLSProperty[], filters: FilterState): MLSProperty[] {
    // Use searchQuery/keywords for relevance scoring — city is a filter, not a search term
    const searchStr = (filters.searchQuery || filters.keywords || '').toLowerCase().trim();
    const { sortBy, order } = filters;
    const isDesc = order === 'desc';

    return [...listings].sort((a, b) => {
        // If sorting by Newest/Initial, and a search exists, prioritize relevance
        if ((sortBy === 'newest' || !sortBy) && searchStr) {
            const scoreA = scoreListing(a, searchStr);
            const scoreB = scoreListing(b, searchStr);
            if (scoreA !== scoreB) return scoreB - scoreA;
        }

        switch (sortBy) {
            case 'price':
            case 'price_asc':
            case 'price_desc':
                return isDesc ? (b.ListPrice || 0) - (a.ListPrice || 0) : (a.ListPrice || 0) - (b.ListPrice || 0);
            case 'beds':
            case 'bedrooms':
                return isDesc ? (b.BedroomsTotal || 0) - (a.BedroomsTotal || 0) : (a.BedroomsTotal || 0) - (b.BedroomsTotal || 0);
            case 'year':
            case 'yearBuilt':
                return isDesc ? (b.YearBuilt || 0) - (a.YearBuilt || 0) : (a.YearBuilt || 0) - (b.YearBuilt || 0);
            case 'sqft':
            case 'livingArea':
                return isDesc ? (b.LivingArea || 0) - (a.LivingArea || 0) : (a.LivingArea || 0) - (b.LivingArea || 0);
            case 'newest':
            case 'date':
            case 'updated':
            default:
                const timeA = new Date(a.ModificationTimestamp || 0).getTime();
                const timeB = new Date(b.ModificationTimestamp || 0).getTime();
                return isDesc ? timeB - timeA : timeA - timeB;
        }
    });
}

/**
 * CORE FETCH LOGIC (Internal vs Legacy Proxy)
 */
export async function fetchListings(
    filters: FilterState,
    page: number = 1,
    pageSize: number = 100
): Promise<FetchListingsResponse> {

    // ── 1. Try Internal API First ───────────────────────────────────────
    if (USE_INTERNAL_API) {
        try {
            const internalParams = new URLSearchParams();

            // Helper: only set param if value is a non-empty trimmed string
            const setParam = (key: string, val: any) => {
                if (val === undefined || val === null) return;
                const s = String(val).trim();
                if (s && s !== 'undefined' && s !== 'null') {
                    internalParams.set(key, s);
                }
            };

            // City — exact filter, trim whitespace
            setParam('city', filters.city);

            // Price — only valid numeric strings
            setParam('minPrice', filters.minPrice);
            setParam('maxPrice', filters.maxPrice);

            // Beds/Baths — strip "+" suffix, skip "Any"
            if (filters.beds && filters.beds !== 'Any') setParam('beds', filters.beds.replace('+', ''));
            if (filters.baths && filters.baths !== 'Any') setParam('baths', filters.baths.replace('+', ''));

            // Physical attributes
            setParam('minSqft', filters.minSqft);
            setParam('maxSqft', filters.maxSqft);
            setParam('minYearBuilt', filters.minYearBuilt);
            setParam('maxYearBuilt', filters.maxYearBuilt);

            // Types — skip "Any"
            if (filters.propertyType && filters.propertyType !== 'Any') setParam('propertyType', filters.propertyType);
            setParam('listingType', filters.listingType);
            if (filters.featured) internalParams.set('featured', 'true');
            setParam('keywords', filters.keywords);

            // Sorting
            setParam('sort_by', filters.sortBy);
            setParam('order', filters.order);

            // Geo bounds — only valid finite numbers
            if (filters.latitudeMin != null && Number.isFinite(filters.latitudeMin)) setParam('latMin', filters.latitudeMin);
            if (filters.latitudeMax != null && Number.isFinite(filters.latitudeMax)) setParam('latMax', filters.latitudeMax);
            if (filters.longitudeMin != null && Number.isFinite(filters.longitudeMin)) setParam('lngMin', filters.longitudeMin);
            if (filters.longitudeMax != null && Number.isFinite(filters.longitudeMax)) setParam('lngMax', filters.longitudeMax);

            // Search query — trimmed
            const q = (filters.searchQuery || '').trim();
            if (q) internalParams.set('q', q);

            internalParams.set('page', page.toString());
            internalParams.set('limit', pageSize.toString());

            const internalRes = await fetch(`/api/internal-listings?${internalParams.toString()}`, {
                cache: 'no-store'
            });

            if (internalRes.ok) {
                const response = await internalRes.json();
                const { listings, total, totalPages, page, meta, platformTotal } = response;
                
                return {
                    listings: listings || [],
                    total: total || meta?.total || 0,
                    totalCount: total || meta?.total || 0,
                    platformTotal: platformTotal || meta?.platformTotal || 0,
                    nextLink: page < totalPages ? 'next' : null
                };
            }
        } catch (err) {
            console.error('[MLS Client] Internal API failure, falling back...', err);
        }
    }

    // ── 2. Legacy Proxy Fallback ────────────────────────────────────────
    const params = new URLSearchParams();
    params.set('listingType', filters.listingType);
    if (filters.transactionType) params.set('transactionType', filters.transactionType);
    if (filters.city) params.set('city', filters.city);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

    // Geo Bounds
    if (filters.latitudeMin != null) params.set('latMin', filters.latitudeMin.toString());
    if (filters.latitudeMax != null) params.set('latMax', filters.latitudeMax.toString());
    if (filters.longitudeMin != null) params.set('lngMin', filters.longitudeMin.toString());
    if (filters.longitudeMax != null) params.set('lngMax', filters.longitudeMax.toString());

    const skip = (page - 1) * pageSize;
    params.set('top', pageSize.toString());
    params.set('skip', skip.toString());
    params.append('$expand', 'Media');

    const res = await fetch(`/api/mls-listings?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`MLS API Error: ${res.status}`);

    const data = await res.json();
    const rawListings = data.value || data['@odata.value'] || (Array.isArray(data) ? data : []);

    return {
        listings: rawListings,
        total: data['@odata.count'] || rawListings.length || 0,
        nextLink: data['@odata.nextLink'] || null
    };
}

/**
 * Fetch a single property detail
 */
export async function fetchListingDetail(listingKey: string): Promise<MLSProperty> {
    // ── 1. Try Internal API First ───────────────────────────────────────
    try {
        const internalRes = await fetch(`/api/internal-listings/${listingKey}`, {
            cache: 'no-store'
        });

        if (internalRes.ok) {
            return await internalRes.json();
        }
    } catch (err) {
        console.warn('[MLS Client] Internal Detail failure, trying legacy proxy...', err);
    }

    // ── 2. Legacy Proxy Fallback ────────────────────────────────────────
    const res = await fetch(`/api/mls-listings/${listingKey}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Listing Unavailable: ${res.status}`);
    return await res.json();
}
