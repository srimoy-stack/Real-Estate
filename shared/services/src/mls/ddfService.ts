'use client';

import { DDFIntegrationConfig, DDFStatusOverview } from '@repo/types';

/**
 * DDF Service – Handles MLS/DDF configuration and synchronization status.
 * Currently uses mock data and simulation for the UI.
 */

// Constants for local storage keys
const DDF_CONFIG_KEY = 'ddf_integration_config';
const DDF_STATUS_KEY = 'ddf_sync_status';

// Default mock internal state
const DEFAULT_CONFIG: DDFIntegrationConfig = {
    feedUrl: 'https://data.crea.ca/DDF/Sync',
    username: 'CREA_DEMO_USER',
    apiKey: '••••••••••••••••',
    syncFrequency: '6h',
    autoSync: true,
    autoPublish: true,
    importPhotos: true,
    filterByBoard: 'Toronto Regional Real Estate Board (TRREB)'
};

const DEFAULT_STATUS: DDFStatusOverview = {
    currentStatus: 'idle',
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    totalListingsCount: 1248,
    listingsAddedToday: 14,
    lastSyncAdded: 12,
    lastSyncUpdated: 45,
    lastSyncRemoved: 2,
};

// Helper: safe localStorage access for SSR/Client
const getStored = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
};

const setStored = <T>(key: string, val: T) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(val));
};

export const ddfService = {
    /**
     * Retrieves the current DDF configuration for the organization.
     */
    getConfig: async (): Promise<DDFIntegrationConfig> => {
        await new Promise(r => setTimeout(r, 400));
        return getStored(DDF_CONFIG_KEY, DEFAULT_CONFIG);
    },

    /**
     * Updates the DDF configuration and simulates a connection.
     */
    connectDDF: async (credentials: Partial<DDFIntegrationConfig>): Promise<DDFIntegrationConfig> => {
        await new Promise(r => setTimeout(r, 1200));
        const current = getStored(DDF_CONFIG_KEY, DEFAULT_CONFIG);
        const updated = { ...current, ...credentials };
        setStored(DDF_CONFIG_KEY, updated);
        console.log('[DDF Service] Connection established/updated:', updated.username);
        return updated;
    },

    /**
     * Validates credentials against the DDF provider.
     */
    testConnection: async (credentials?: { username: string; apiKey: string; feedUrl: string }): Promise<{ success: boolean; message: string }> => {
        const config = getStored(DDF_CONFIG_KEY, DEFAULT_CONFIG);
        const creds = credentials || { username: config.username, apiKey: config.apiKey, feedUrl: config.feedUrl };
        console.log('[DDF Service] Testing connection with:', creds.username);
        await new Promise(r => setTimeout(r, 1500)); // Simulate network latency

        // Simple mock validation logic
        if (!creds.username || !creds.apiKey || !creds.feedUrl) {
            return { success: false, message: 'All connection fields are required.' };
        }

        // Logic triggers
        if (creds.username.toLowerCase().includes('error')) {
            return {
                success: false,
                message: 'Connection failed: Authentication error. Please verify your CREA DDF credentials.'
            };
        }

        if (creds.username.length < 5) {
            return {
                success: false,
                message: 'Connection failed: The provided DDF credentials are too short or invalid.'
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
        return getStored(DDF_STATUS_KEY, DEFAULT_STATUS);
    },

    /**
     * Triggers a manual synchronization job.
     */
    syncListings: async (): Promise<{ success: boolean; added: number; updated: number; removed: number; error?: string }> => {
        const status = getStored(DDF_STATUS_KEY, DEFAULT_STATUS);

        if (status.currentStatus === 'syncing') {
            return { success: false, added: 0, updated: 0, removed: 0, error: 'Sync already in progress.' };
        }

        status.currentStatus = 'syncing';
        status.lastSyncError = undefined;
        setStored(DDF_STATUS_KEY, status);
        console.log('[DDF Service] Manual sync started...');

        await new Promise(r => setTimeout(r, 3000)); // Simulate job

        // Simulate rare failure for demonstration
        if (Math.random() < 0.05) {
            status.currentStatus = 'error';
            status.lastSyncError = 'Connection Timeout: The DDF gateway failed to respond within 30 seconds.';
            setStored(DDF_STATUS_KEY, status);
            return { success: false, added: 0, updated: 0, removed: 0, error: status.lastSyncError };
        }

        // Simulate random sync results
        const result = {
            success: true,
            added: Math.floor(Math.random() * 8) + 1,
            updated: Math.floor(Math.random() * 25) + 5,
            removed: Math.floor(Math.random() * 3),
        };

        status.currentStatus = 'success';
        status.lastSyncAt = new Date().toISOString();
        status.listingsAddedToday += result.added;
        status.totalListingsCount += result.added - result.removed;
        status.lastSyncAdded = result.added;
        status.lastSyncUpdated = result.updated;
        status.lastSyncRemoved = result.removed;

        setStored(DDF_STATUS_KEY, status);
        console.log('[DDF Service] Sync complete:', result);
        return result;
    }
};
