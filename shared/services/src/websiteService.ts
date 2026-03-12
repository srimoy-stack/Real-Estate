import { Website } from '@repo/types';
import { useNotificationStore } from './notificationStore';
import { PLATFORM_TEMPLATES } from './templateRegistry';

// Mock database for websites
let websites: Website[] = [
    {
        id: 'ws-1',
        organizationId: 'org-1',
        agentId: undefined, // Brokerage Site
        templateId: 'modern-realty',
        domain: 'skyline-demo.realestate.com',
        websiteType: 'BROKERAGE_SITE',
        defaultLanguage: 'English',
        layoutConfig: {}, // Copy from template defaultLayoutConfig
        brandingConfig: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const websiteService = {
    getWebsitesByOrganization: async (organizationId: string): Promise<Website[]> => {
        return websites.filter(w => w.organizationId === organizationId);
    },

    getWebsiteById: async (id: string): Promise<Website | undefined> => {
        return websites.find(w => w.id === id);
    },

    createWebsite: async (data: Omit<Website, 'id' | 'createdAt' | 'updatedAt' | 'layoutConfig'>): Promise<Website> => {
        // Find template to copy defaultLayoutConfig
        const template = PLATFORM_TEMPLATES.find(t => t.templateKey === data.templateId);

        const newWebsite: Website = {
            ...data,
            id: `ws_${Math.random().toString(36).substr(2, 9)}`,
            layoutConfig: template?.defaultLayoutConfig || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        websites.push(newWebsite);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Website Provisioned',
            message: `New site ${newWebsite.domain} is now live.`
        });

        return newWebsite;
    },

    updateWebsite: async (id: string, data: Partial<Website>): Promise<Website> => {
        const index = websites.findIndex(w => w.id === id);
        if (index === -1) throw new Error('Website not found');

        websites[index] = { ...websites[index], ...data, updatedAt: new Date().toISOString() };

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Website Updated',
            message: `Changes to ${websites[index].domain} have been saved.`
        });

        return websites[index];
    },

    deleteWebsite: async (id: string): Promise<void> => {
        const ws = websites.find(w => w.id === id);
        websites = websites.filter(w => w.id !== id);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Website Deleted',
            message: ws ? `The site ${ws.domain} has been deactivated.` : 'Website record deleted.'
        });
    }
};
