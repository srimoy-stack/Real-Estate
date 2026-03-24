import {
    OrgWebsite,
    OrgWebsitePage,
    OrgWebsiteBranding,
    WebsiteAgentProfile,
    OrgPageLayoutConfig,
} from '@repo/types';
import { useNotificationStore } from './notificationStore';

export interface OrgWebsiteService {
    getOrgWebsite(organizationId: string, websiteId?: string): Promise<OrgWebsite | null>;
    updateWebsite(organizationId: string, websiteId: string, data: Partial<OrgWebsite>): Promise<OrgWebsite>;
    getPages(organizationId: string, websiteId: string): Promise<OrgWebsitePage[]>;
    getPageById(organizationId: string, websiteId: string, pageId: string): Promise<OrgWebsitePage | null>;
    getPageBySlug(organizationId: string, websiteId: string, slug: string): Promise<OrgWebsitePage | null>;
    createPage(organizationId: string, data: {
        websiteId: string;
        slug: string;
        title: string;
        layoutConfig: OrgPageLayoutConfig;
        seo?: any;
        isPublished: boolean;
        isPublic: boolean;
    }): Promise<OrgWebsitePage>;
    provisionDefaultPages(organizationId: string, websiteId: string): Promise<void>;
    updatePage(organizationId: string, pageId: string, data: Partial<OrgWebsitePage>): Promise<OrgWebsitePage>;
    savePageLayout(organizationId: string, pageId: string, json: string): Promise<void>;
    deletePage(organizationId: string, pageId: string): Promise<void>;
    reorderPages(organizationId: string, websiteId: string, pageIds: string[]): Promise<OrgWebsitePage[]>;
    updateNavigation(organizationId: string, websiteId: string, navigation: any[]): Promise<void>;
    getBranding(organizationId: string, websiteId: string): Promise<OrgWebsiteBranding | null>;
    updateBranding(organizationId: string, websiteId: string, data: Partial<OrgWebsiteBranding>): Promise<OrgWebsiteBranding>;
    getAgentProfiles(websiteId: string, organizationId: string): Promise<WebsiteAgentProfile[]>;
    addAgentProfile(organizationId: string, data: any): Promise<WebsiteAgentProfile>;
    updateAgentProfile(organizationId: string, profileId: string, data: any): Promise<WebsiteAgentProfile>;
    removeAgentProfile(organizationId: string, profileId: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
//  MOCK DATA PERSISTENCE
// ═══════════════════════════════════════════════════════════

const IS_SERVER = typeof window === 'undefined';
const DATA_VERSION = 'v3'; // Bump this to reset localStorage mock data
const STORAGE_KEYS = {
    WEBSITE: 'mock_org_website',
    PAGES: 'mock_org_pages',
    BRANDING: 'mock_org_branding',
    AGENTS: 'mock_org_agents',
    VERSION: 'mock_data_version'
};

// Clear stale data on version mismatch
if (!IS_SERVER) {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (storedVersion !== DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEYS.WEBSITE);
        localStorage.removeItem(STORAGE_KEYS.PAGES);
        localStorage.removeItem(STORAGE_KEYS.BRANDING);
        localStorage.removeItem(STORAGE_KEYS.AGENTS);
        localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
    }
}

const getInitialWebsite = (): OrgWebsite => {
    if (!IS_SERVER) {
        const saved = localStorage.getItem(STORAGE_KEYS.WEBSITE);
        if (saved) return JSON.parse(saved);
    }
    return {
        id: 'ws_brokerage_001',
        organizationId: 'org-1',
        domain: 'skyline-estates.realestate.com',
        templateId: 'modern-realty',
        templateName: 'Modern Realty',
        organizationName: 'Prestige Realty Group',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2025-11-20T14:30:00Z',
        navigation: [
            { label: 'Home', slug: '/' },
            { label: 'About', slug: '/about' },
            { label: 'Communities', slug: '/communities' },
        ],
    };
};

const getInitialPages = (): OrgWebsitePage[] => {
    if (!IS_SERVER) {
        const saved = localStorage.getItem(STORAGE_KEYS.PAGES);
        if (saved) return JSON.parse(saved);
    }
    return [
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
            seo: {
                metaTitle: 'Skyline Estates | Your Trusted Real Estate Partner',
                metaDescription: 'Discover luxury homes and expert real estate services with Skyline Estates.',
                ogTitle: 'Skyline Estates | Luxury Real Estate',
                schemaType: 'Organization'
            },
            pageType: 'static',
            isPublished: true,
            isPublic: true,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2025-11-20T14:30:00Z',
        },
        {
            id: 'page-2',
            websiteId: 'ws_brokerage_001',
            slug: '/about',
            title: 'About Us',
            layoutConfig: {
                sections: [
                    { type: 'text' },
                    { type: 'agent_profiles' },
                ],
            },
            seo: {
                metaTitle: 'About Skyline Estates | Our Mission & Team',
                metaDescription: 'Learn about the history and dedicated team behind Skyline Estates.',
            },
            pageType: 'static',
            isPublished: true,
            isPublic: true,
            createdAt: '2024-02-10T10:00:00Z',
            updatedAt: '2025-10-05T16:45:00Z',
        },
        {
            id: 'page-3',
            websiteId: 'ws_brokerage_001',
            slug: '/communities',
            title: 'Communities',
            layoutConfig: {
                sections: [
                    { type: 'hero' },
                    { type: 'gallery' },
                ],
            },
            seo: {
                metaTitle: 'Explore Local Communities | Skyline Estates',
                metaDescription: 'Guide to the best neighborhoods and communities in the area.',
            },
            pageType: 'static',
            isPublished: true,
            isPublic: true,
            createdAt: '2024-03-22T12:00:00Z',
            updatedAt: '2025-09-15T08:30:00Z',
        },
    ];
};

let mockOrgWebsite = getInitialWebsite();
let mockPages = getInitialPages();

const persist = () => {
    if (!IS_SERVER) {
        localStorage.setItem(STORAGE_KEYS.WEBSITE, JSON.stringify(mockOrgWebsite));
        localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(mockPages));
    }
};

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

export const orgWebsiteService: OrgWebsiteService = {
    // ─── Website Details ───────────────────────────────────
    getOrgWebsite: async (organizationId: string, _websiteId?: string): Promise<OrgWebsite | null> => {
        // Return a mock website for any organizationId to ensure the builder always loads in demo
        return {
            ...mockOrgWebsite,
            organizationId: organizationId,
            id: `ws_${organizationId}`
        };
    },

    updateWebsite: async (_organizationId: string, _websiteId: string, data: Partial<OrgWebsite>): Promise<OrgWebsite> => {
        mockOrgWebsite = { ...mockOrgWebsite, ...data, updatedAt: new Date().toISOString() };
        persist();
        return mockOrgWebsite;
    },

    // ─── Page Management ───────────────────────────────────
    getPages: async (_organizationId: string, websiteId: string): Promise<OrgWebsitePage[]> => {
        // Return mock pages for any valid combination for demo
        return mockPages.map(p => ({ ...p, websiteId }));
    },

    getPageById: async (_organizationId: string, websiteId: string, pageId: string): Promise<OrgWebsitePage | null> => {
        const page = mockPages.find(p => p.id === pageId);
        if (page) {
            return { ...page, websiteId };
        }
        return null;
    },

    getPageBySlug: async (_organizationId: string, _websiteId: string, slug: string): Promise<OrgWebsitePage | null> => {
        // Normalize slug for comparison — ensure leading slash consistency and remove trailing slash
        let normalizedSlug = slug.trim();
        if (!normalizedSlug.startsWith('/')) normalizedSlug = '/' + normalizedSlug;
        if (normalizedSlug.length > 1 && normalizedSlug.endsWith('/')) normalizedSlug = normalizedSlug.slice(0, -1);

        const found = mockPages.find(p => {
            let pageSlug = p.slug.trim();
            if (!pageSlug.startsWith('/')) pageSlug = '/' + pageSlug;
            if (pageSlug.length > 1 && pageSlug.endsWith('/')) pageSlug = pageSlug.slice(0, -1);
            return pageSlug === normalizedSlug;
        });
        return found ? { ...found, websiteId: _websiteId } : null;
    },
    createPage: async (_organizationId: string, data: {
        websiteId: string;
        slug: string;
        title: string;
        layoutConfig: OrgPageLayoutConfig;
        seo?: any; // Use any for simplicity in mock
        isPublished: boolean;
        isPublic: boolean;
    }): Promise<OrgWebsitePage> => {
        // Multi-tenant safety check
        // In demo, we skip restrictive auth checks to allow multi-org testing


        const newPage: OrgWebsitePage = {
            id: `page-${Math.random().toString(36).substr(2, 9)}`,
            pageType: 'static',
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockPages.push(newPage);

        persist();

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Page Created',
            message: `"${newPage.title}" has been created successfully.`,
        });

        return newPage;
    },

    provisionDefaultPages: async (organizationId: string, websiteId: string): Promise<void> => {
        const existingPages = mockPages.filter(p => p.websiteId === websiteId);
        if (existingPages.length > 0) return;

        // Provision Home Page
        await orgWebsiteService.createPage(organizationId, {
            websiteId,
            title: 'Home',
            slug: '/',
            layoutConfig: {
                sections: [
                    { type: 'hero' },
                    { type: 'listings', filters: { featured: true }, limit: 4 },
                    { type: 'heading', config: { text: 'Our Top Producers', align: 'center', level: 'h2', variant: 'underline' } },
                    { type: 'agent_profiles', variant: 'grid' },
                    { type: 'spacer', config: { variant: 'medium' } },
                    { type: 'testimonials' },
                    { type: 'contact' }
                ]
            },
            isPublished: true,
            isPublic: true,
        });

        // Provision About Page
        await orgWebsiteService.createPage(organizationId, {
            websiteId,
            title: 'About Our Mission',
            slug: '/about',
            layoutConfig: {
                sections: [
                    { type: 'heading', config: { text: 'Redefining Real Estate', align: 'left', level: 'h1', variant: 'accent' } },
                    {
                        type: 'text',
                        content: {
                            text: 'We are more than just a brokerage. We are a family of experts dedicated to helping you find your perfect space. [listings config="luxury" limit="3"] Join us on our journey to innovate the housing market.',
                            variant: 'lead',
                            align: 'left'
                        }
                    },
                    { type: 'stats' },
                    { type: 'image', config: { variant: 'parallax', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200' } },
                ]
            },
            isPublished: true,
            isPublic: true,
        });

        // Provision Contact Page
        await orgWebsiteService.createPage(organizationId, {
            websiteId,
            title: 'Get In Touch',
            slug: '/contact',
            layoutConfig: {
                sections: [
                    { type: 'heading', config: { text: 'We would love to hear from you', align: 'center', level: 'h2' } },
                    { type: 'contact' },
                    { type: 'map' },
                ]
            },
            isPublished: true,
            isPublic: true,
        });

        // Provision Communities Page
        await orgWebsiteService.createPage(organizationId, {
            websiteId,
            title: 'Our Neighborhoods',
            slug: '/communities',
            layoutConfig: {
                sections: [
                    { type: 'hero', variant: 'minimal', content: { headline: 'Discover Local Neighborhoods', subheadline: 'Expert guides to the places we call home.' } },
                    { type: 'communities' },
                    { type: 'gallery', config: { variant: 'masonry' } },
                ]
            },
            isPublished: true,
            isPublic: true,
        });
    },

    updatePage: async (_organizationId: string, pageId: string, data: Partial<OrgWebsitePage>): Promise<OrgWebsitePage> => {
        // Multi-tenant check - relaxed for demo
        // if (mockOrgWebsite.organizationId !== organizationId) throw new Error('Unauthorized');

        const idx = mockPages.findIndex(p => p.id === pageId);
        if (idx === -1) throw new Error('Page not found');

        mockPages[idx] = { ...mockPages[idx], ...data, updatedAt: new Date().toISOString() };
        persist();

        return mockPages[idx];
    },

    savePageLayout: async (_organizationId: string, pageId: string, json: string): Promise<void> => {
        // if (mockOrgWebsite.organizationId !== organizationId) throw new Error('Unauthorized');

        const idx = mockPages.findIndex(p => p.id === pageId);
        if (idx === -1) throw new Error('Page not found');

        mockPages[idx].customLayoutJson = json;
        mockPages[idx].updatedAt = new Date().toISOString();
        persist();

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Layout Saved',
            message: `Design for "${mockPages[idx].title}" has been published.`,
        });
    },

    deletePage: async (_organizationId: string, pageId: string): Promise<void> => {
        // if (mockOrgWebsite.organizationId !== organizationId) throw new Error('Unauthorized');

        const page = mockPages.find(p => p.id === pageId);
        mockPages = mockPages.filter(p => p.id !== pageId);
        persist();

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Page Deleted',
            message: page ? `"${page.title}" has been removed.` : 'Page deleted.',
        });
    },

    reorderPages: async (_organizationId: string, websiteId: string, pageIds: string[]): Promise<OrgWebsitePage[]> => {
        // if (mockOrgWebsite.id !== websiteId || mockOrgWebsite.organizationId !== organizationId) {
        //     throw new Error('Unauthorized');
        // }

        // Reorder in-place based on the provided order
        const websitePages = mockPages.filter(p => p.websiteId === websiteId);
        const otherPages = mockPages.filter(p => p.websiteId !== websiteId);
        const reordered = pageIds
            .map(id => websitePages.find(p => p.id === id))
            .filter((p): p is OrgWebsitePage => !!p);
        mockPages = [...otherPages, ...reordered];
        persist();

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Navigation Updated',
            message: 'Page order has been saved.',
        });

        return reordered;
    },

    updateNavigation: async (_organizationId: string, _websiteId: string, navigation: { label: string; slug: string; children?: { label: string; slug: string; children?: any[] }[] }[]): Promise<void> => {
        // if (mockOrgWebsite.id !== websiteId || mockOrgWebsite.organizationId !== organizationId) {
        //     throw new Error('Unauthorized');
        // }
        mockOrgWebsite.navigation = navigation;
        persist();

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Navigation Saved',
            message: 'Site navigation menu has been updated.',
        });
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
