/**
 * Listing Store – in-memory "database" keyed by MLS number.
 * Prevents duplicate ingestion and supports CRUD for the sync engine.
 * When real APIs are ready, replace the Map with actual DB calls.
 */

import { MLSListing } from './listingModel';

class ListingStore {
    private store: Map<string, MLSListing> = new Map();

    /** Add a new listing. Returns false if MLS number already exists. */
    addListing(listing: MLSListing): boolean {
        if (this.store.has(listing.mlsNumber)) {
            return false; // duplicate – skip
        }
        this.store.set(listing.mlsNumber, { ...listing });
        return true;
    }

    /** Update an existing listing by MLS number. Returns false if not found. */
    updateListing(mlsNumber: string, updates: Partial<MLSListing>): boolean {
        const existing = this.store.get(mlsNumber);
        if (!existing) return false;
        this.store.set(mlsNumber, {
            ...existing,
            ...updates,
            mlsNumber, // never overwrite key
            updatedAt: new Date().toISOString(),
        });
        return true;
    }

    /** Upsert: insert if new, update if existing. Returns 'inserted' | 'updated'. */
    upsertListing(listing: MLSListing): 'inserted' | 'updated' {
        if (this.store.has(listing.mlsNumber)) {
            this.updateListing(listing.mlsNumber, listing);
            return 'updated';
        }
        this.addListing(listing);
        return 'inserted';
    }

    /** Get a single listing by MLS number. */
    getListing(mlsNumber: string): MLSListing | undefined {
        return this.store.get(mlsNumber);
    }

    /** Get all listings as array. */
    getAllListings(): MLSListing[] {
        return Array.from(this.store.values());
    }

    /** Mark all MLS numbers NOT in the provided set as 'Removed'. */
    markRemovedExcept(activeMlsNumbers: Set<string>): number {
        let count = 0;
        for (const [mls, listing] of this.store.entries()) {
            if (!activeMlsNumbers.has(mls) && listing.status !== 'Removed') {
                this.store.set(mls, { ...listing, status: 'Removed', updatedAt: new Date().toISOString() });
                count++;
            }
        }
        return count;
    }

    /** Bulk seed (replaces existing store – used during initial hydration). */
    seed(listings: MLSListing[]): void {
        this.store.clear();
        for (const listing of listings) {
            this.store.set(listing.mlsNumber, { ...listing });
        }
    }

    /** Total count. */
    count(): number {
        return this.store.size;
    }

    /** Clear everything (for tests / re-sync). */
    clear(): void {
        this.store.clear();
    }
}

// Singleton – shared across the app
export const listingStore = new ListingStore();
