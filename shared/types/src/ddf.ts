import { BaseEntity } from './index';

export type DDFSyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface DDFSyncLog extends BaseEntity {
    timestamp: string;
    status: 'success' | 'failed';
    addedCount: number;
    updatedCount: number;
    removedCount: number;
    duration: string;
    errorReason?: string;
}

export interface DDFIntegrationConfig {
    feedUrl: string;
    username: string; // Often required for DDF in addition to API key
    apiKey: string;
    syncFrequency: '1h' | '3h' | '6h' | '12h' | '24h';
    autoSync: boolean;
    filterByBoard?: string;
    filterByOffice?: string;
    autoPublish: boolean;
    importPhotos: boolean;
}

export interface DDFStatusOverview {
    currentStatus: DDFSyncStatus;
    lastSyncAt: string | null;
    totalListingsCount: number;
    listingsAddedToday: number;
    lastSyncAdded: number;
    lastSyncUpdated: number;
    lastSyncRemoved: number;
    lastSyncError?: string;
}
