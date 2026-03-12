import { ListingSectionConfig } from '@repo/types';
import { useNotificationStore } from './notificationStore';

// Mock database for ListingSectionConfigs
let configs: ListingSectionConfig[] = [];

export const listingSectionService = {
    getConfigsByWebsite: async (websiteId: string): Promise<ListingSectionConfig[]> => {
        return configs.filter(c => c.websiteId === websiteId);
    },

    getConfigById: async (id: string): Promise<ListingSectionConfig | undefined> => {
        return configs.find(c => c.id === id);
    },

    createConfig: async (data: Omit<ListingSectionConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ListingSectionConfig> => {
        const newConfig: ListingSectionConfig = {
            ...data,
            id: `lsc_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        configs.push(newConfig);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Listings Configuration Saved',
            message: `New filter set "${newConfig.sectionKey}" created.`
        });

        return newConfig;
    },

    updateConfig: async (id: string, data: Partial<ListingSectionConfig>): Promise<ListingSectionConfig> => {
        const index = configs.findIndex(c => c.id === id);
        if (index === -1) throw new Error('ListingSectionConfig not found');

        configs[index] = { ...configs[index], ...data, updatedAt: new Date().toISOString() };

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Listings Configuration Updated',
            message: `Filter set "${configs[index].sectionKey}" has been synchronized.`
        });

        return configs[index];
    },

    deleteConfig: async (id: string): Promise<void> => {
        const config = configs.find(c => c.id === id);
        configs = configs.filter(c => c.id !== id);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Filter Set Removed',
            message: config ? `Configuration "${config.sectionKey}" has been deleted.` : 'Configuration deleted.'
        });
    }
};
