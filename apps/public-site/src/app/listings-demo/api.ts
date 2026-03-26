import { MLSProperty, MLSApiResponse, FilterState } from './types';
import { expandGeoBounds } from './utils';

interface FetchListingsResponse extends MLSApiResponse {
    listings: MLSProperty[];
    nextLink: string | null;
    total: number;
    totalCount?: number;
}

const MIN_LISTING_THRESHOLD = 20;
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
                    return { listings: [], total: 0, totalCount: 0, nextLink: null };
                })
            )
        );

        let allListings = results.flatMap(r => r.listings);
        let totalCount = results[0]?.total || 0;

        // ── Step 2: Deduplicate by ListingId ───────────────────────────
        const seen = new Set<string>();
        const uniqueListings = allListings.filter(l => {
            const id = l.ListingId || l.ListingKey;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        // ── Step 3: Optional Geo Expansion if too few results ──────────
        if (uniqueListings.length < MIN_LISTING_THRESHOLD) {
            console.log(`[MLS Aggregator] Low yield (${uniqueListings.length}). Expanding bounds...`);
            const expandedBounds = expandGeoBounds({
                latitudeMin: filters.latitudeMin ?? 0,
                latitudeMax: filters.latitudeMax ?? 0,
                longitudeMin: filters.longitudeMin ?? 0,
                longitudeMax: filters.longitudeMax ?? 0,
            }, 0.20); // 20% expansion

            try {
                const resExp = await fetchListings({ ...filters, ...expandedBounds }, 1, pageSize);

                // Add new ones
                resExp.listings.forEach(l => {
                    const id = l.ListingId || l.ListingKey;
                    if (id && !seen.has(id)) {
                        uniqueListings.push(l);
                        seen.add(id);
                    }
                });
                totalCount = Math.max(totalCount, resExp.total);
            } catch (err) {
                console.warn('[MLS Aggregator] Geo expansion failed:', err);
            }
        }

        const sortedListings = sortListings(uniqueListings, filters);
        console.log(`[MLS Aggregator] Final unique count: ${sortedListings.length}`);

        return {
            listings: sortedListings,
            total: totalCount,
            totalCount: results[0]?.totalCount || 0,
            nextLink: null
        };

    } catch (err) {
        console.error('[MLS Aggregator] Critical Failure:', err);
        throw err;
    }
}

/**
 * RELEVANCE SCORING & SORTING
 */
export function scoreListing(listing: MLSProperty, searchCity: string): number {
    if (!searchCity) return 0;
    let score = 0;
    const city = (listing.City || '').toLowerCase();
    const addr = (listing.UnparsedAddress || '').toLowerCase();
    const remarks = (listing.PublicRemarks || '').toLowerCase();

    if (city.includes(searchCity) || searchCity.includes(city)) score += 10;
    if (addr.includes(searchCity)) score += 5;
    if (remarks.includes(searchCity)) score += 2;
    return score;
}

export function sortListings(listings: MLSProperty[], filters: FilterState): MLSProperty[] {
    const searchCity = (filters.city || '').toLowerCase().trim();
    return [...listings].sort((a, b) => {
        const scoreA = scoreListing(a, searchCity);
        const scoreB = scoreListing(b, searchCity);
        if (scoreA !== scoreB) return scoreB - scoreA;
        const tA = a.ModificationTimestamp || '';
        const tB = b.ModificationTimestamp || '';
        if (tA !== tB) return tB.localeCompare(tA);
        return (b.ListPrice || 0) - (a.ListPrice || 0);
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
            if (filters.city) internalParams.set('city', filters.city);
            if (filters.minPrice) internalParams.set('minPrice', filters.minPrice);
            if (filters.maxPrice) internalParams.set('maxPrice', filters.maxPrice);
            if (filters.searchQuery) {
                internalParams.set('q', filters.searchQuery);
                internalParams.set('searchQuery', filters.searchQuery);
            }
            internalParams.set('page', page.toString());
            internalParams.set('limit', pageSize.toString());

            const internalRes = await fetch(`/api/internal-listings?${internalParams.toString()}`, {
                cache: 'no-store'
            });

            if (internalRes.ok) {
                const data = await internalRes.json();
                return {
                    listings: data.listings || [],
                    total: data.total || 0,
                    totalCount: data.totalCount || 0,
                    nextLink: data.page < data.totalPages ? 'next' : null
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
