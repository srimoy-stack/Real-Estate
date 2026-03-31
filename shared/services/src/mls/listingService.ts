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
import { mlsDataProvider } from './mlsDataProvider';

export interface SyncResult {
  inserted: number;
  updated: number;
  removed: number;
  timestamp: string;
}

import { mlsSyncSimulator } from './mlsSyncSimulator';

// ─── Initialisation ──────────────────────────────────────────────────────────
// Seed the store immediately and run an initial simulation sync if wanted
import { MOCK_MLS_FEED } from './mockMLSFeed';
listingStore.seed(MOCK_MLS_FEED);

// Optional: Run one simulation pass on start to randomize the market immediately
mlsSyncSimulator.runMockSync().then((stats) => {
  console.log(
    `[MLS Service] Platform hydrated: +${stats.inserted} new, ${stats.updated} modified.`
  );
});

/**
 * Trigger a manual simulation sync pass for dev/demo purposes.
 */
export async function runSimulation(): Promise<{
  inserted: number;
  updated: number;
  removed: number;
}> {
  return mlsSyncSimulator.runMockSync();
}

// ─── Sync Engine ─────────────────────────────────────────────────────────────
/**
 * Fetch listings from the MLS feed and sync into the store.
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

  console.log(
    `[MLS Sync] Done — inserted: ${inserted}, updated: ${updated}, removed: ${manuallyRemoved}`
  );
  return result;
}

// ─── Query API ───────────────────────────────────────────────────────────────
/**
 * Query listings with filtering, sorting, and pagination via Data Provider.
 */
export async function getListings(filters: MLSListingFilters = {}): Promise<MLSListingQueryResult> {
  return mlsDataProvider.getListings(filters);
}

/**
 * Look up a single full listing by MLS number via Data Provider.
 */
export async function getListingByMLS(mlsNumber: string): Promise<MLSListing | null> {
  return mlsDataProvider.getListingByMLS(mlsNumber);
}

/**
 * Get related listings for a property detail page.
 */
export async function getRelatedListings(mlsNumber: string, limit = 3): Promise<MLSListingCard[]> {
  const source = await getListingByMLS(mlsNumber);
  if (!source) return [];

  const { listings: all } = await getListings({ limit: 100 });
  const priceTolerance = 0.5;

  const scored = all
    .filter((l) => l.mlsNumber !== mlsNumber)
    .map((l) => {
      let score = 0;
      const lCity = (l.city ?? '').toLowerCase();
      const sCity = (source.city ?? '').toLowerCase();
      if (lCity && sCity && lCity === sCity) score += 3;
      if (l.propertyType === source.propertyType) score += 2;
      const minP = (source.price ?? 0) * (1 - priceTolerance);
      const maxP = (source.price ?? 0) * (1 + priceTolerance);
      if ((l.price ?? 0) >= minP && (l.price ?? 0) <= maxP) score += 1;
      if (l.province === source.province) score += 0.5;
      return { l, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ l }) => l as MLSListingCard);
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
  runSimulation,
};
