'use client';

import { DDFIntegrationConfig, DDFStatusOverview } from '@repo/types';

/**
 * DDF Service – Handles MLS/DDF configuration and synchronization status.
 * Currently uses mock data and simulation for the UI.
 */

// Mock internal state
let mockConfig: DDFIntegrationConfig = {
    feedUrl: 'https://data.crea.ca/DDF/Sync',
    username: 'CREA_DEMO_USER',
    apiKey: '••••••••••••••••',
    syncFrequency: '6h',
    autoSync: true,
    autoPublish: true,
    importPhotos: true,
    filterByBoard: 'Toronto Regional Real Estate Board (TRREB)'
};

let mockStatus: DDFStatusOverview = {
    currentStatus: 'idle',
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    totalListingsCount: 1248,
    listingsAddedToday: 14,
    lastSyncAdded: 12,
    lastSyncUpdated: 45,
    lastSyncRemoved: 2,
};

export const ddfService = {
    /**
     * Retrieves the current DDF configuration for the organization.
     */
    getConfig: async (): Promise<DDFIntegrationConfig> => {
        // In a real app, this would be an API call to the backend settings.
        await new Promise(r => setTimeout(r, 400));
        return { ...mockConfig };
    },

    /**
     * Updates the DDF configuration and simulates a connection.
     */
    connectDDF: async (credentials: Partial<DDFIntegrationConfig>): Promise<DDFIntegrationConfig> => {
        await new Promise(r => setTimeout(r, 1200));
        mockConfig = { ...mockConfig, ...credentials };
        console.log('[DDF Service] Connection established/updated:', mockConfig.username);
        return mockConfig;
    },

    /**
     * Validates credentials against the DDF provider.
     */
    testConnection: async (credentials?: { username: string; apiKey: string; feedUrl: string }): Promise<{ success: boolean; message: string }> => {
        const creds = credentials || { username: mockConfig.username, apiKey: mockConfig.apiKey, feedUrl: mockConfig.feedUrl };
        console.log('[DDF Service] Testing connection with:', creds.username);
        await new Promise(r => setTimeout(r, 2000)); // Simulate network latency

        // Simple mock validation logic
        if (!creds.username || !creds.apiKey || !creds.feedUrl) {
            return { success: false, message: 'All connection fields are required.' };
        }

        if (creds.username.toLowerCase().includes('error')) {
            return {
                success: false,
                message: 'Connection failed: Authentication error. Please verify your CREA DDF credentials.'
            };
        }

        if (creds.feedUrl.toLowerCase().includes('invalid')) {
            return {
                success: false,
                message: 'Connection failed: The provided Feed URL is unreachable or invalid.'
            };
        }

        return {
            success: true,
            message: 'Connection established successfully! The DDF endpoint is responding.'
        };
    },

    /**
     * Gets the current status and metrics of the property sync.
     */
    getSyncStatus: async (): Promise<DDFStatusOverview> => {
        await new Promise(r => setTimeout(r, 300));
        return { ...mockStatus };
    },

    /**
     * Triggers a manual synchronization job.
     */
    syncListings: async (): Promise<{ success: boolean; added: number; updated: number; removed: number; error?: string }> => {
        if (mockStatus.currentStatus === 'syncing') {
            return { success: false, added: 0, updated: 0, removed: 0, error: 'Sync already in progress.' };
        }

        mockStatus.currentStatus = 'syncing';
        mockStatus.lastSyncError = undefined;
        console.log('[DDF Service] Manual sync started...');

        await new Promise(r => setTimeout(r, 4000)); // Simulate heavy job

        // Simulate rare failure for demonstration
        if (Math.random() < 0.1) {
            mockStatus.currentStatus = 'error';
            mockStatus.lastSyncError = 'Connection Timeout: The DDF gateway failed to respond within 30 seconds.';
            return { success: false, added: 0, updated: 0, removed: 0, error: mockStatus.lastSyncError };
        }

        // Simulate random sync results
        const result = {
            success: true,
            added: Math.floor(Math.random() * 8) + 1,
            updated: Math.floor(Math.random() * 25) + 5,
            removed: Math.floor(Math.random() * 3),
        };

        mockStatus.currentStatus = 'success';
        mockStatus.lastSyncAt = new Date().toISOString();
        mockStatus.listingsAddedToday += result.added;
        mockStatus.totalListingsCount += result.added - result.removed;
        mockStatus.lastSyncAdded = result.added;
        mockStatus.lastSyncUpdated = result.updated;
        mockStatus.lastSyncRemoved = result.removed;

        console.log('[DDF Service] Sync complete:', result);
        return result;
    }
};
