import { MLSProperty, MLSApiResponse, FilterState } from './types';

/**
 * Fetch listings from the internal MLS proxy.
 * Maps EVERY FilterState field to a query parameter.
 */
export async function fetchListings(
    filters: FilterState,
    page: number = 1,
    pageSize: number = 12
): Promise<MLSApiResponse> {
    const params = new URLSearchParams();

    // ── Core filters ────────────────────────────────────────────────────
    params.set('listingType', filters.listingType);
    if (filters.transactionType) params.set('transactionType', filters.transactionType);
    if (filters.searchQuery) params.set('searchQuery', filters.searchQuery);
    if (filters.city) params.set('city', filters.city);

    // ── Price ────────────────────────────────────────────────────────────
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

    // ── Beds / Baths (strip "+") ────────────────────────────────────────
    if (filters.beds && filters.beds !== 'Any') params.set('beds', filters.beds.replace('+', ''));
    if (filters.baths && filters.baths !== 'Any') params.set('baths', filters.baths.replace('+', ''));

    // ── Square Footage ──────────────────────────────────────────────────
    if (filters.minSqft) params.set('minSqft', filters.minSqft);
    if (filters.maxSqft) params.set('maxSqft', filters.maxSqft);

    // ── Property SubType ────────────────────────────────────────────────
    if (filters.propertyType && filters.propertyType !== 'Any') params.set('propertyType', filters.propertyType);

    // ── Land Size ───────────────────────────────────────────────────────
    if (filters.minLandSize) params.set('minLandSize', filters.minLandSize);
    if (filters.maxLandSize) params.set('maxLandSize', filters.maxLandSize);

    // ── Listed Since ────────────────────────────────────────────────────
    if (filters.listedSince) params.set('listedSince', filters.listedSince);

    // ── Building Type ───────────────────────────────────────────────────
    if (filters.buildingType && filters.buildingType !== 'Any') params.set('buildingType', filters.buildingType);

    // ── Storeys ─────────────────────────────────────────────────────────
    if (filters.minStoreys) params.set('minStoreys', filters.minStoreys);
    if (filters.maxStoreys) params.set('maxStoreys', filters.maxStoreys);

    // ── Ownership / Title ───────────────────────────────────────────────
    if (filters.ownershipType && filters.ownershipType !== 'Any') params.set('ownershipType', filters.ownershipType);

    // ── Maintenance Fees ────────────────────────────────────────────────
    if (filters.minMaintFee) params.set('minMaintFee', filters.minMaintFee);
    if (filters.maxMaintFee) params.set('maxMaintFee', filters.maxMaintFee);

    // ── Property Tax ────────────────────────────────────────────────────
    if (filters.minTax) params.set('minTax', filters.minTax);
    if (filters.maxTax) params.set('maxTax', filters.maxTax);

    // ── Year Built ──────────────────────────────────────────────────────
    if (filters.minYearBuilt) params.set('minYearBuilt', filters.minYearBuilt);
    if (filters.maxYearBuilt) params.set('maxYearBuilt', filters.maxYearBuilt);

    // ── Keywords ────────────────────────────────────────────────────────
    if (filters.keywords) params.set('keywords', filters.keywords);

    // ── Pagination ──────────────────────────────────────────────────────
    const skip = (page - 1) * pageSize;
    params.set('top', pageSize.toString());
    params.set('skip', skip.toString());

    console.log('[MLS Client] Fetching:', params.toString());

    const res = await fetch(`/api/mls-listings?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('[MLS Client] Error:', res.status, errorText);
        throw new Error(`MLS API Error: ${res.status}`);
    }

    const data = await res.json();
    return {
        listings: data.value || [],
        nextLink: data['@odata.nextLink'] || null,
        total: data['@odata.count'] || data.value?.length || 0,
    };
}

/**
 * Fetch a single property detail by ListingKey.
 */
export async function fetchListingDetail(listingKey: string): Promise<MLSProperty> {
    const res = await fetch(`/api/mls-listings/${listingKey}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('[MLS Detail] Error:', res.status, errorText);
        throw new Error(`Listing Unavailable: ${res.status}`);
    }

    return await res.json();
}
