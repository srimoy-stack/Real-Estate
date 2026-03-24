import { listingStore } from './listingStore';
import { fetchMLSListings } from './mockMLSFeed';

/**
 * MLS Sync Simulator
 * ──────────────────────────────────────────────────────────
 * Simulates real-world MLS behavior where listings are updated,
 * prices fluctuate, and new properties appear over time.
 * This runs entirely on the mock listingStore without needing a backend.
 */
export const mlsSyncSimulator = {
    /**
     * Core Simulation Engine
     * Randomly modifies current listings and inserts new ones from the fed.
     */
    async runMockSync(): Promise<{ inserted: number; updated: number; removed: number }> {
        console.log('[MLS Simulator] Synchronizing with mock feed...');

        const feed = await fetchMLSListings();
        let updated = 0;
        let inserted = 0;

        // 1. Process Feed (upsert)
        for (const listing of [...feed.active, ...feed.updated]) {
            const result = listingStore.upsertListing(listing);
            if (result === 'inserted') inserted++;
            else updated++;
        }

        // 2. Randomly simulate market volatility (price & status changes)
        const allListings = listingStore.getAllListings();
        for (const listing of allListings) {
            // Only update active listings occasionally (5% chance)
            if (Math.random() > 0.95 && listing.status === 'For Sale') {
                const priceChangePercent = (Math.random() * 0.1 - 0.05); // +/- 5%
                const newPrice = Math.round(listing.price * (1 + priceChangePercent) / 1000) * 1000;

                listingStore.updateListing(listing.mlsNumber, {
                    price: newPrice,
                    updatedAt: new Date().toISOString()
                });
                updated++;
                console.log(`[MLS Simulator] PRICE UPDATE: ${listing.mlsNumber} is now ${newPrice}`);
            }

            // Randomly sell properties (2% chance)
            if (Math.random() > 0.98 && listing.status === 'For Sale') {
                listingStore.updateListing(listing.mlsNumber, {
                    status: 'Sold',
                    updatedAt: new Date().toISOString()
                });
                updated++;
                console.log(`[MLS Simulator] STATUS UPDATE: ${listing.mlsNumber} marked as SOLD`);
            }
        }

        // 3. Occasionally generate a completely "New" Listing (10% chance per sync)
        if (Math.random() > 0.90) {
            const newMls = `N${Math.floor(Math.random() * 9000000 + 1000000)}`;
            const base = allListings[Math.floor(Math.random() * allListings.length)];

            listingStore.addListing({
                ...base,
                mlsNumber: newMls,
                price: base.price + 50000,
                status: 'For Sale',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFeatured: Math.random() > 0.8
            });
            inserted++;
            console.log(`[MLS Simulator] NEW LISTING: ${newMls} added to the market`);
        }

        return { inserted, updated, removed: feed.removed.length };
    },

    /**
     * Auto-Sync Scheduler
     * Runs the simulator periodically (e.g., every 30 seconds for demo).
     */
    startAutoSync(intervalMs: number = 30000) {
        console.log(`[MLS Simulator] Auto-sync started every ${intervalMs}ms`);
        setInterval(async () => {
            const stats = await this.runMockSync();
            if (stats.inserted > 0 || stats.updated > 0) {
                console.log(`[MLS Simulator] Market Snapshot: +${stats.inserted} new, ${stats.updated} modified.`);
            }
        }, intervalMs);
    }
};
