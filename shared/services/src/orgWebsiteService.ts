import {
    OrgWebsite,
    OrgWebsitePage,
    OrgWebsiteBranding,
    WebsiteAgentProfile,
    OrgPageLayoutConfig,
} from '@repo/types';
import { useNotificationStore } from './notificationStore';

// ═══════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════

let mockOrgWebsite: OrgWebsite = {
    id: 'ws_brokerage_001',
    organizationId: 'org-1',
    domain: 'skyline-estates.realestate.com',
    templateId: 'modern-realty',
    templateName: 'Modern Realty',
    organizationName: 'Prestige Realty Group',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-11-20T14:30:00Z',
};

let mockPages: OrgWebsitePage[] = [
    {
        id: 'page-1',
        websiteId: 'ws_brokerage_001',
        slug: '/',
        title: 'Home',
        layoutConfig: {
            sections: [
                { type: 'hero' },
                { type: 'listings' },
                { type: 'agent_profiles' },
                { type: 'testimonials' },
                { type: 'contact' },
            ],
        },
        isPublished: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2025-11-20T14:30:00Z',
    },
    {
        id: 'page-2',
        websiteId: 'ws_brokerage_001',
        slug: 'about-dynamic',
        title: 'About Us (Dynamic)',
        layoutConfig: {
            sections: [
                { type: 'hero' },
                { type: 'text' },
                { type: 'agent_profiles' },
            ],
        },
        isPublished: true,
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2025-10-05T16:45:00Z',
    },
    {
        id: 'page-3',
        websiteId: 'ws_brokerage_001',
        slug: 'communities',
        title: 'Communities',
        layoutConfig: {
            sections: [
                { type: 'hero' },
                { type: 'gallery' },
            ],
        },
        isPublished: true,
        createdAt: '2024-03-22T12:00:00Z',
        updatedAt: '2025-09-15T08:30:00Z',
    },
];

let mockBranding: OrgWebsiteBranding = {
    id: 'brand-1',
    websiteId: 'ws_brokerage_001',
    organizationId: 'org-1',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=256',
    bannerImages: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
    ],
    brandColors: {
        primary: '#4f46e5',
        secondary: '#7c3aed',
        accent: '#06b6d4',
    },
    siteTitle: 'Prestige Realty Group',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-11-20T14:30:00Z',
};

let mockAgentProfiles: WebsiteAgentProfile[] = [
    {
        id: 'wap-1',
        websiteId: 'ws_brokerage_001',
        organizationId: 'org-1',
        name: 'John Smith',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
        bio: 'Expert in Toronto luxury real estate with over 15 years of experience. Specializes in waterfront properties and high-rise condominiums.',
        phone: '(416) 555-0201',
        email: 'john.smith@prestigerealty.com',
        displayOrder: 1,
        isVisible: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2025-11-20T14:30:00Z',
    },
    {
        id: 'wap-2',
        websiteId: 'ws_brokerage_001',
        organizationId: 'org-1',
        name: 'Jane Doe',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
        bio: 'Passionate about helping first-time home buyers find their dream homes. Award-winning agent with a 98% satisfaction rate.',
        phone: '(416) 555-0202',
        email: 'jane.doe@prestigerealty.com',
        displayOrder: 2,
        isVisible: true,
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2025-10-05T16:45:00Z',
    },
    {
        id: 'wap-3',
        websiteId: 'ws_brokerage_001',
        organizationId: 'org-1',
        name: 'Michael Chen',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
        bio: 'Commercial and residential investment specialist. Former financial analyst turned real estate advisor.',
        phone: '(416) 555-0203',
        email: 'michael.chen@prestigerealty.com',
        displayOrder: 3,
        isVisible: false,
        createdAt: '2024-03-22T12:00:00Z',
        updatedAt: '2025-09-15T08:30:00Z',
    },
];

// ═══════════════════════════════════════════════════════════
//  ORGANIZATION WEBSITE SERVICE
// ═══════════════════════════════════════════════════════════

export const orgWebsiteService = {
    // ─── Website Details ───────────────────────────────────
    getOrgWebsite: async (organizationId: string): Promise<OrgWebsite | null> => {
        if (mockOrgWebsite.organizationId === organizationId) {
            return mockOrgWebsite;
        }
        return null;
    },

    // ─── Page Management ───────────────────────────────────
    getPages: async (organizationId: string, websiteId: string): Promise<OrgWebsitePage[]> => {
        // Multi-tenant safety check
        if (mockOrgWebsite.id !== websiteId || mockOrgWebsite.organizationId !== organizationId) {
            return [];
        }
        return mockPages.filter(p => p.websiteId === websiteId);
    },

    getPageById: async (organizationId: string, websiteId: string, pageId: string): Promise<OrgWebsitePage | null> => {
        if (mockOrgWebsite.id !== websiteId || mockOrgWebsite.organizationId !== organizationId) {
            return null;
        }
        return mockPages.find(p => p.id === pageId) || null;
    },

    getPageBySlug: async (organizationId: string, websiteId: string, slug: string): Promise<OrgWebsitePage | null> => {
        if (mockOrgWebsite.id !== websiteId || mockOrgWebsite.organizationId !== organizationId) {
            return null;
        }
        return mockPages.find(p => p.websiteId === websiteId && p.slug === slug) || null;
    },

    createPage: async (organizationId: string, data: {
        websiteId: string;
        slug: string;
        title: string;
        layoutConfig: OrgPageLayoutConfig;
        isPublished: boolean;
    }): Promise<OrgWebsitePage> => {
        // Multi-tenant safety check
        if (mockOrgWebsite.id !== data.websiteId || mockOrgWebsite.organizationId !== organizationId) {
            throw new Error('Unauthorized');
        }

        const newPage: OrgWebsitePage = {
            id: `page-${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockPages.push(newPage);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Page Created',
            message: `"${newPage.title}" has been added to your website.`,
        });

        return newPage;
    },

    provisionDefaultPages: async (organizationId: string, websiteId: string): Promise<void> => {
        const homeExists = mockPages.some(p => p.websiteId === websiteId && p.slug === '/');
        if (!homeExists) {
            await orgWebsiteService.createPage(organizationId, {
                websiteId,
                title: 'Home',
                slug: '/',
                layoutConfig: {
                    sections: [
                        { type: 'hero' },
                        { type: 'listings' },
                        { type: 'agent_profiles' }
                    ]
                },
                isPublished: true,
            });
        }
    },

    updatePage: async (organizationId: string, pageId: string, data: Partial<OrgWebsitePage>): Promise<OrgWebsitePage> => {
        // Multi-tenant check
        if (mockOrgWebsite.organizationId !== organizationId) throw new Error('Unauthorized');

        const idx = mockPages.findIndex(p => p.id === pageId);
        if (idx === -1) throw new Error('Page not found');

        mockPages[idx] = { ...mockPages[idx], ...data, updatedAt: new Date().toISOString() };

        return mockPages[idx];
    },

    savePageLayout: async (organizationId: string, pageId: string, json: string): Promise<void> => {
        if (mockOrgWebsite.organizationId !== organizationId) throw new Error('Unauthorized');

        const idx = mockPages.findIndex(p => p.id === pageId);
        if (idx === -1) throw new Error('Page not found');

        mockPages[idx].customLayoutJson = json;
        mockPages[idx].updatedAt = new Date().toISOString();

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Layout Saved',
            message: `Design for "${mockPages[idx].title}" has been published.`,
        });
    },

    deletePage: async (organizationId: string, pageId: string): Promise<void> => {
        // Multi-tenant check
        if (mockOrgWebsite.organizationId !== organizationId) throw new Error('Unauthorized');

        const page = mockPages.find(p => p.id === pageId);
        mockPages = mockPages.filter(p => p.id !== pageId);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Page Deleted',
            message: page ? `"${page.title}" has been removed.` : 'Page deleted.',
        });
    },

    reorderPages: async (organizationId: string, websiteId: string, pageIds: string[]): Promise<OrgWebsitePage[]> => {
        // Multi-tenant check
        if (mockOrgWebsite.id !== websiteId || mockOrgWebsite.organizationId !== organizationId) {
            throw new Error('Unauthorized');
        }

        // Reorder in-place based on the provided order
        const websitePages = mockPages.filter(p => p.websiteId === websiteId);
        const otherPages = mockPages.filter(p => p.websiteId !== websiteId);
        const reordered = pageIds
            .map(id => websitePages.find(p => p.id === id))
            .filter((p): p is OrgWebsitePage => !!p);
        mockPages = [...otherPages, ...reordered];

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Navigation Updated',
            message: 'Page order has been saved.',
        });

        return reordered;
    },

    // ─── Branding ──────────────────────────────────────────
    getBranding: async (organizationId: string, websiteId: string): Promise<OrgWebsiteBranding | null> => {
        if (mockBranding.websiteId === websiteId && mockBranding.organizationId === organizationId) {
            return mockBranding;
        }
        return null;
    },

    updateBranding: async (organizationId: string, websiteId: string, data: Partial<OrgWebsiteBranding>): Promise<OrgWebsiteBranding> => {
        if (mockBranding.websiteId !== websiteId || mockBranding.organizationId !== organizationId) {
            throw new Error('Unauthorized');
        }

        mockBranding = { ...mockBranding, ...data, updatedAt: new Date().toISOString() };

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Branding Updated',
            message: 'Your website branding has been saved.',
        });

        return mockBranding;
    },

    // ─── Agent Profiles ────────────────────────────────────
    getAgentProfiles: async (websiteId: string, organizationId: string): Promise<WebsiteAgentProfile[]> => {
        return mockAgentProfiles.filter(
            ap => ap.websiteId === websiteId && ap.organizationId === organizationId
        );
    },

    addAgentProfile: async (organizationId: string, data: Omit<WebsiteAgentProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebsiteAgentProfile> => {
        if (data.organizationId !== organizationId) throw new Error('Unauthorized');

        const newProfile: WebsiteAgentProfile = {
            id: `wap-${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockAgentProfiles.push(newProfile);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Added to Website',
            message: `${newProfile.name} is now visible on your website.`,
        });

        return newProfile;
    },

    updateAgentProfile: async (organizationId: string, profileId: string, data: Partial<WebsiteAgentProfile>): Promise<WebsiteAgentProfile> => {
        const idx = mockAgentProfiles.findIndex(ap => ap.id === profileId);
        if (idx === -1) throw new Error('Agent profile not found');
        if (mockAgentProfiles[idx].organizationId !== organizationId) throw new Error('Unauthorized');

        mockAgentProfiles[idx] = { ...mockAgentProfiles[idx], ...data, updatedAt: new Date().toISOString() };

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Profile Updated',
            message: `${mockAgentProfiles[idx].name}'s website profile has been updated.`,
        });

        return mockAgentProfiles[idx];
    },

    removeAgentProfile: async (organizationId: string, profileId: string): Promise<void> => {
        const profile = mockAgentProfiles.find(ap => ap.id === profileId);
        if (profile && profile.organizationId !== organizationId) throw new Error('Unauthorized');

        mockAgentProfiles = mockAgentProfiles.filter(ap => ap.id !== profileId);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Removed from Website',
            message: profile ? `${profile.name} has been removed from the website.` : 'Agent profile removed.',
        });
    },
};
