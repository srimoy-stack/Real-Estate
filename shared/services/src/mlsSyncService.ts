import { InternalListing, InternalListingStatus } from '@repo/types';
import { listingQueryApi } from './listingQueryApi';


export interface SyncMetrics {
    newListings: number;
    updatedListings: number;
    removedListings: number;
}

/**
 * Service to synchronize MLS property data into the internal listing database.
 * Designed to run as a scheduled background job.
 */
export class MlsSyncService {
    // In a real implementation, this would connect to the primary SQL/NoSQL database.
    // We mock it here using an in-memory map keyed by mlsNumber to prevent duplicates.
    private dbListings: Map<string, InternalListing> = new Map();

    /**
     * 1. Fetch listing data from an MLS API or feed.
     */
    async fetchMlsFeed(): Promise<any[]> {
        // Mock payload mimicking a RESO Web API or RETS feed response
        return [
            {
                ListingKey: "MLS123456",
                ListPrice: 850000,
                MlsStatus: "Active",
                PublicRemarks: "Beautiful modern home...",
                Media: [{ MediaURL: "https://example.com/img1.jpg" }]
            }
        ];
    }

    /**
     * 2. Parse the incoming listing data into the InternalListing model.
     */
    parseMlsData(rawListing: any): Partial<InternalListing> {
        return {
            mlsNumber: rawListing.ListingKey || rawListing.mlsNumber,
            price: rawListing.ListPrice || rawListing.price,
            status: this.mapMlsStatus(rawListing.MlsStatus || rawListing.status),
            description: rawListing.PublicRemarks || rawListing.description,
            images: rawListing.Media ? rawListing.Media.map((m: any) => m.MediaURL) : (rawListing.images || []),
            // Map remaining fields...
            address: rawListing.address || '',
            city: rawListing.city || '',
            province: rawListing.province || '',
            postalCode: rawListing.postalCode || '',
            propertyType: rawListing.propertyType || 'Detached',
            bedrooms: rawListing.bedrooms || 0,
            bathrooms: rawListing.bathrooms || 0,
            squareFootage: rawListing.squareFootage || 0,
            lotSize: rawListing.lotSize || 0,
            amenities: rawListing.amenities || [],
        };
    }

    private mapMlsStatus(mlsStatus: string): InternalListingStatus {
        const statusStr = String(mlsStatus).toLowerCase();
        if (statusStr.includes('active')) return InternalListingStatus.FOR_SALE;
        if (statusStr.includes('sold') || statusStr.includes('closed')) return InternalListingStatus.SOLD;
        if (statusStr.includes('pending')) return InternalListingStatus.PENDING;
        return InternalListingStatus.REMOVED;
    }

    /**
     * Core Sync Job (Requirement 8 - Structure as a scheduled background job)
     */
    async runSyncJob(): Promise<SyncMetrics> {
        console.log('[MLS Sync] Starting scheduled sync job...');

        const rawListings = await this.fetchMlsFeed();
        const metrics: SyncMetrics = { newListings: 0, updatedListings: 0, removedListings: 0 };

        const activeMlsNumbers = new Set<string>();
        const newListingsMatchedAlerts: InternalListing[] = [];

        // Process Incoming Feed
        for (const raw of rawListings) {
            const parsed = this.parseMlsData(raw);
            if (!parsed.mlsNumber) continue;

            activeMlsNumbers.add(parsed.mlsNumber);

            const existingListing = this.dbListings.get(parsed.mlsNumber);

            // 3. Insert new listings if the MLS number does not exist
            if (!existingListing) {
                const newListing = {
                    ...parsed,
                    id: `local-${parsed.mlsNumber}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isFeatured: false,
                } as InternalListing;

                this.insertListing(newListing);
                newListingsMatchedAlerts.push(newListing);
                metrics.newListings++;
                continue;
            }

            // 4. Update listings if: price, status, description, or images change
            const priceChanged = existingListing.price !== parsed.price;
            const statusChanged = existingListing.status !== parsed.status;
            const descriptionChanged = existingListing.description !== parsed.description;
            const imagesChanged = JSON.stringify(existingListing.images) !== JSON.stringify(parsed.images);

            if (priceChanged || statusChanged || descriptionChanged || imagesChanged) {
                this.updateListing(existingListing.mlsNumber, parsed);
                metrics.updatedListings++;
            }
        }

        // 5. Mark listings as inactive (REMOVED) if they are removed from the MLS feed
        for (const [mlsNumber, listing] of this.dbListings.entries()) {
            if (!activeMlsNumbers.has(mlsNumber) && listing.status !== InternalListingStatus.REMOVED) {
                this.updateListing(mlsNumber, { status: InternalListingStatus.REMOVED });
                metrics.removedListings++;
            }
        }

        // 6. Alert Users for New Matches
        if (newListingsMatchedAlerts.length > 0) {
            await this.processPropertyAlerts(newListingsMatchedAlerts);
        }

        // 7. Log sync results
        console.log('[MLS Sync] Sync Job Complete.');
        console.log(`[MLS Sync] New Listings: ${metrics.newListings}`);
        console.log(`[MLS Sync] Updated Listings: ${metrics.updatedListings}`);
        console.log(`[MLS Sync] Removed/Inactive Listings: ${metrics.removedListings}`);

        // Invalidate cache if any updates occurred
        if (metrics.newListings > 0 || metrics.updatedListings > 0 || metrics.removedListings > 0) {
            listingQueryApi.clearCache();
        }

        return metrics;
    }

    /**
     * Matches new listings against all saved searches and triggers notifications.
     */
    private async processPropertyAlerts(newListings: InternalListing[]) {
        const { userSavedItemService } = await import('./userSavedItemService');
        const allSavedSearches = userSavedItemService.getAllSavedSearches();

        console.log(`[MLS Alerts] Processing alerts for ${newListings.length} new listings against ${allSavedSearches.length} saved searches...`);

        for (const search of allSavedSearches) {
            const matches = newListings.filter(listing => {
                const f = search.filters;

                if (f.city && listing.city.toLowerCase() !== f.city.toLowerCase()) return false;
                if (f.minPrice && listing.price < f.minPrice) return false;
                if (f.maxPrice && listing.price > f.maxPrice) return false;
                if (f.bedrooms && listing.bedrooms < f.bedrooms) return false;
                if (f.bathrooms && listing.bathrooms < f.bathrooms) return false;
                if (f.propertyType) {
                    const types = Array.isArray(f.propertyType) ? f.propertyType : [f.propertyType];
                    if (types.length > 0 && !types.map(t => t.toString().toLowerCase()).includes(listing.propertyType.toLowerCase())) return false;
                }

                return true;
            });

            if (matches.length > 0) {
                console.log(`[MLS Alerts] NOTIFY USER ${search.userId}: ${matches.length} matches found for search "${search.name}"`);
                matches.forEach(m => {
                    console.log(`   - MATCH: ${m.mlsNumber} (${m.address}) - $${m.price}`);
                });

                // Simulate SMTP / SendGrid call
                console.log(`[EMAIL] Sending "New Listings Match Your Search" email to user ${search.userId}...`);
            }
        }
    }

    /**
     * 6. Prevent duplicate listings using the MLS number as the unique key.
     */
    private insertListing(listing: InternalListing) {
        if (this.dbListings.has(listing.mlsNumber)) {
            console.warn(`[MLS Sync] Prevented duplicate insertion for MLS Number: ${listing.mlsNumber}`);
            return;
        }
        this.dbListings.set(listing.mlsNumber, listing);
    }

    private updateListing(mlsNumber: string, updates: Partial<InternalListing>) {
        const listing = this.dbListings.get(mlsNumber);
        if (!listing) return;

        this.dbListings.set(mlsNumber, {
            ...listing,
            ...updates,
            updatedAt: new Date().toISOString()
        });
    }

    // Test utility to inspect db state
    getDatabaseState() {
        return Array.from(this.dbListings.values());
    }
}

export const mlsSyncService = new MlsSyncService();
