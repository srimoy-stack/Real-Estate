/**
 * MLS Listing Service
 * ─────────────────────────────────────────────────────────
 * The single public API for listing data across the platform.
 * Backed by the in-memory listingStore, which is hydrated by
 * the MLS sync engine (syncMLSListings).
 *
 * When real APIs are ready, replace listingStore reads with
 * database queries and fetchMLSListings() with real HTTP calls.
 */

import { listingStore } from './listingStore';
import { fetchMLSListings } from './mockMLSFeed';
import {
    MLSListing,
    MLSListingCard,
    MLSListingFilters,
    MLSListingQueryResult,
} from './listingModel';

export interface SyncResult {
    inserted: number;
    updated: number;
    removed: number;
    timestamp: string;
}

// ─── Initialisation ──────────────────────────────────────────────────────────
// Seed the store immediately so the app has data on first render.
import { MOCK_MLS_FEED } from './mockMLSFeed';
listingStore.seed(MOCK_MLS_FEED);

/**
 * Project a full MLSListing down to the card-only fields for list pages.
 * This keeps the payload small when fetching grids / search results.
 */
function toCard(l: MLSListing): MLSListingCard {
    return {
        mlsNumber: l.mlsNumber,
        price: l.price,
        status: l.status,
        propertyType: l.propertyType,
        address: l.address,
        city: l.city,
        province: l.province,
        postalCode: l.postalCode,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        squareFootage: l.squareFootage,
        images: l.images.length > 0 ? [l.images[0]] : [],
        isFeatured: l.isFeatured,
        createdAt: l.createdAt,
        description: l.description,
        location: l.location,
        agentName: l.agentName,
    };
}

// ─── Sync Engine ─────────────────────────────────────────────────────────────
/**
 * Fetch listings from the MLS feed and sync into the store.
 * • Inserts new listings (duplicate-safe via MLS number)
 * • Updates changed listings
 * • Marks removed listings as 'Removed'
 */
export async function syncMLSListings(): Promise<SyncResult> {
    console.log('[MLS Sync] Starting sync...');

    const feed = await fetchMLSListings();
    let inserted = 0;
    let updated = 0;

    // Process active & updated listings
    for (const listing of [...feed.active, ...feed.updated]) {
        const result = listingStore.upsertListing(listing);
        if (result === 'inserted') inserted++;
        else updated++;
    }

    // Mark explicitly removed MLS numbers
    const removedSet = new Set(feed.removed);
    const manuallyRemoved = feed.removed.length;
    for (const mls of removedSet) {
        listingStore.updateListing(mls, { status: 'Removed' });
    }

    const result: SyncResult = {
        inserted,
        updated,
        removed: manuallyRemoved,
        timestamp: feed.timestamp,
    };

    console.log(`[MLS Sync] Done — inserted: ${inserted}, updated: ${updated}, removed: ${manuallyRemoved}`);
    return result;
}

// ─── Query API ───────────────────────────────────────────────────────────────
/**
 * Query listings with filtering, sorting, and pagination.
 */
export async function getListings(filters: MLSListingFilters = {}): Promise<MLSListingQueryResult> {
    // Simulate async data access
    await new Promise(resolve => setTimeout(resolve, 50));

    let results = listingStore.getAllListings();

    // Default: hide 'Removed' unless explicitly requested
    if (!filters.status) {
        results = results.filter(l => l.status !== 'Removed');
    }

    // ── Filter phase ──────────────────────────────────────────────────────────
    if (filters.ids && filters.ids.length > 0) {
        results = results.filter(l => filters.ids!.includes(l.mlsNumber));
    }

    if (filters.city) {
        const c = filters.city.toLowerCase();
        results = results.filter(l => l.city.toLowerCase().includes(c));
    }

    if (filters.propertyType) {
        const types = Array.isArray(filters.propertyType) ? filters.propertyType : [filters.propertyType];
        results = results.filter(l => types.includes(l.propertyType));
    }

    if (filters.status) {
        let statuses = Array.isArray(filters.status) ? (filters.status as string[]) : [filters.status as string];
        // Map ACTIVE to 'For Sale' for compatibility with mock feed
        if (statuses.includes('ACTIVE')) {
            statuses = [...statuses, 'For Sale'];
        }
        results = results.filter(l => statuses.includes(l.status));
    }


    if (filters.minPrice !== undefined) results = results.filter(l => l.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) results = results.filter(l => l.price <= filters.maxPrice!);
    if (filters.bedrooms !== undefined) results = results.filter(l => l.bedrooms >= filters.bedrooms!);
    if (filters.bathrooms !== undefined) results = results.filter(l => l.bathrooms >= filters.bathrooms!);
    if (filters.featured !== undefined) results = results.filter(l => !!l.isFeatured === filters.featured);
    if (filters.organizationId) results = results.filter(l => l.organizationId === filters.organizationId);

    if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        results = results.filter(l =>
            l.address.toLowerCase().includes(kw) ||
            l.city.toLowerCase().includes(kw) ||
            l.mlsNumber.toLowerCase().includes(kw) ||
            l.description.toLowerCase().includes(kw) ||
            l.agentName.toLowerCase().includes(kw) ||
            l.propertyType.toLowerCase().includes(kw)
        );
    }

    // Map bounding box (for map-search pages)
    if (filters.minLat !== undefined) results = results.filter(l => l.location.lat >= filters.minLat!);
    if (filters.maxLat !== undefined) results = results.filter(l => l.location.lat <= filters.maxLat!);
    if (filters.minLng !== undefined) results = results.filter(l => l.location.lng >= filters.minLng!);
    if (filters.maxLng !== undefined) results = results.filter(l => l.location.lng <= filters.maxLng!);

    // ── Sort phase ────────────────────────────────────────────────────────────
    const sort = filters.sort || 'newest';
    results.sort((a, b) => {
        switch (sort) {
            case 'price_asc': return a.price - b.price;
            case 'price_desc': return b.price - a.price;
            case 'newest':
            default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const totalCount = results.length;

    // ── Pagination ────────────────────────────────────────────────────────────
    const limit = filters.limit ?? 12;
    const page = filters.page ?? 1;
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    // ── Project to card fields ────────────────────────────────────────────────
    return {
        listings: paginated.map(toCard),
        totalCount,
    };
}

/**
 * Look up a single full listing by MLS number.
 * Returns the complete MLSListing (all fields) — used on property detail pages.
 */
export async function getListingByMLS(mlsNumber: string): Promise<MLSListing | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return listingStore.getListing(mlsNumber) ?? null;
}

/**
 * Get related listings for a property detail page.
 * Scores by city match, property type match, and price proximity.
 */
export async function getRelatedListings(mlsNumber: string, limit = 3): Promise<MLSListingCard[]> {
    const source = listingStore.getListing(mlsNumber);
    if (!source) return [];

    const all = listingStore.getAllListings().filter(l => l.mlsNumber !== mlsNumber && l.status !== 'Removed');
    const priceTolerance = 0.5;

    const scored = all.map(l => {
        let score = 0;
        if (l.city.toLowerCase() === source.city.toLowerCase()) score += 3;
        if (l.propertyType === source.propertyType) score += 2;
        const minP = source.price * (1 - priceTolerance);
        const maxP = source.price * (1 + priceTolerance);
        if (l.price >= minP && l.price <= maxP) score += 1;
        if (l.province === source.province) score += 0.5;
        return { l, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(({ l }) => toCard(l));
}

/**
 * Convenience: get all featured listings (used in hero/featured sections).
 */
export async function getFeaturedListings(limit = 6): Promise<MLSListingCard[]> {
    const { listings } = await getListings({ featured: true, limit });
    return listings;
}

// ─── Named export bundle ──────────────────────────────────────────────────────
export const mlsListingService = {
    sync: syncMLSListings,
    getListings,
    getListingByMLS,
    getRelatedListings,
    getFeaturedListings,
};
