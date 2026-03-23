import { mlsListingService } from './mls';

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
    /**
     * Core Sync Job
     */
    async runSyncJob(): Promise<SyncMetrics> {
        console.log('[MLS Sync] Starting scheduled sync job via MLS Engine...');

        const result = await mlsListingService.sync();

        const metrics: SyncMetrics = {
            newListings: result.inserted,
            updatedListings: result.updated,
            removedListings: result.removed
        };

        // If there were new listings, we could trigger alerts here.
        // For simulation, we'll just log it.
        if (metrics.newListings > 0) {
            console.log(`[MLS Sync] ${metrics.newListings} new listings found. Processing alerts...`);
            // In a real app, we'd query for matches and send emails.
        }

        console.log('[MLS Sync] Sync Job Complete.');
        return metrics;
    }
}

export const mlsSyncService = new MlsSyncService();

