import { apiClient } from '@repo/api-client';
import { WebsiteInstance, TEMPLATE_REGISTRY } from '@repo/types';

let mockWebsiteInstances: WebsiteInstance[] = [
    {
        id: 'ws-1',
        organizationId: 'org-1',
        agentId: 'agent-1',
        templateId: 'corporate-brokerage',
        domain: 'david.prestigerealty.com',
        layoutConfig: {
            header: 'solid',
            footer: 'columns',
            sections: [
                { id: 'hero-1', type: 'hero', title: 'Find Your Future', isVisible: true, isLocked: true, content: { headline: 'Find Your Future', subheadline: 'Trust the brokerage with 40 years of local expertise.', buttonText: 'Find Home' }, order: 0 },
                { id: 'featured-1', type: 'listings', title: 'Premium Listings', isVisible: true, isLocked: true, content: { title: 'Premium Listings', subtitle: 'Hand-picked for quality.' }, order: 1 },
                { id: 'about-1', type: 'about', title: 'About Us', isVisible: true, isLocked: false, content: { title: 'About Our Brokerage' } },
                { id: 'contact-1', type: 'contact', title: 'Contact', isVisible: true, isLocked: false, content: { title: 'Get In Touch', buttonLabel: 'Contact Now' } },
            ],
        },
        brandingConfig: { primaryColor: '#1e293b', secondaryColor: '#ffffff' },
        navigation: [
            { label: 'Home', slug: '/' },
            { label: 'About', slug: '#about-1' },
            { label: 'Properties', slug: '#featured-1' },
        ],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
    },
    {
        id: 'ws-2',
        organizationId: 'org-1',
        agentId: 'agent-2',
        templateId: 'agent-portfolio',
        domain: 'sarah.prestigerealty.com',
        layoutConfig: {
            header: 'transparent',
            footer: 'minimal',
            sections: [
                { id: 'hero-2', type: 'hero', title: 'Sarah Jenkins Real Estate', isVisible: true, isLocked: true, content: { headline: 'Sarah Jenkins Real Estate', subheadline: 'Selling the dream lifestyle.', buttonText: 'View Properties' }, order: 0 },
                { id: 'featured-2', type: 'listings', title: 'Exclusive Active Listings', isVisible: true, isLocked: true, content: { title: 'The Portfolio', subtitle: 'Active listings in the Greater Area' } },
                { id: 'contact-2', type: 'contact', title: 'Contact', isVisible: true, isLocked: false, content: { title: 'Schedule a Meeting', buttonLabel: 'Book Now' } },
            ],
        },
        brandingConfig: { primaryColor: '#4f46e5', secondaryColor: '#ffffff' },
        navigation: [
            { label: 'Home', slug: '/' },
            { label: 'Portfolio', slug: '#featured-2' },
            { label: 'Contact', slug: '#contact-2' },
        ],
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z',
    },
    {
        id: 'ws-3',
        organizationId: 'org-1',
        agentId: '1',
        templateId: 'corporate-brokerage',
        domain: 'david-team.prestigerealty.com',
        layoutConfig: {
            header: 'solid',
            footer: 'columns',
            sections: [
                { id: 'hero-3', type: 'hero', title: 'Modern Living Redefined', isVisible: true, isLocked: true, content: { headline: 'Modern Living Redefined', subheadline: 'Tech-forward real estate solutions.', buttonText: 'Search MLS' }, order: 0 },
                { id: 'listings-3', type: 'listings', title: 'Top Properties', isVisible: true, isLocked: false, content: { title: 'Proven Results' } },
                { id: 'contact-3', type: 'contact', title: 'Contact', isVisible: true, isLocked: false, content: { title: 'Connect', buttonLabel: 'Reach Out' } },
            ],
        },
        brandingConfig: { primaryColor: '#0f172a', secondaryColor: '#ffffff' },
        navigation: [
            { label: 'Home', slug: '/' },
            { label: 'Search', slug: '/listings' },
            { label: 'Contact', slug: '#contact-3' },
        ],
        createdAt: '2024-06-10T10:00:00Z',
        updatedAt: '2024-06-10T10:00:00Z',
    },
    {
        id: 'website-3',
        organizationId: 'org-1',
        agentId: '3',
        templateId: 'modern-realty',
        domain: 'agent-3.realestate.com',
        navigation: [
            { label: 'Home', slug: '/' },
            { label: 'About', slug: '/about' },
            { label: 'Listings', slug: '/listings' },
            { label: 'Contact', slug: '/contact' }
        ],
        brandingConfig: { primaryColor: '#4f46e5', secondaryColor: '#ffffff' },
        layoutConfig: {
            sections: []
        },
        config: {},
        seo: {
            global: {
                metaTitle: 'Modern Realty | Find Your Dream Home',
                metaDescription: 'Trusted real estate services and luxury listings.',
            },
            pages: {},
            dynamic: {
                listing: {
                    titleTemplate: '{address} for sale | {city}',
                    descriptionTemplate: '{beds} bed {type} in {city}'
                },
                agent: {
                    titleTemplate: '{agentName} Realtor',
                    descriptionTemplate: 'View listings by {agentName}'
                }
            }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

// ═══════════════════════════════════════════════════════
//  AGENT PAGES — per-agent page storage for advanced mode.
//  Completely isolated: one agent's pages NEVER touch
//  another agent's pages or the organization website.
// ═══════════════════════════════════════════════════════

export interface AgentPage {
    id: string;
    agentId: string;
    websiteId: string;
    slug: string;
    title: string;
    pageType: 'static' | 'listing' | 'agent';
    isPublic: boolean;
    isPublished: boolean;
    customLayoutJson?: string;
    layoutConfig: { sections: any[] };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
    };
    createdAt: string;
    updatedAt: string;
}

// In-memory store keyed by agentId
let mockAgentPages: Record<string, AgentPage[]> = {};

// Seed a default "Home" page for any new agent entering advanced mode
const seedAgentDefaultPages = (agentId: string, websiteId: string) => {
    if (mockAgentPages[agentId]) return; // already initialised
    mockAgentPages[agentId] = [
        {
            id: `agp-${agentId}-home`,
            agentId,
            websiteId,
            slug: '/',
            title: 'Home',
            pageType: 'static',
            isPublic: true,
            isPublished: true,
            layoutConfig: { sections: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: `agp-${agentId}-about`,
            agentId,
            websiteId,
            slug: '/about',
            title: 'About Me',
            pageType: 'static',
            isPublic: true,
            isPublished: true,
            layoutConfig: { sections: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: `agp-${agentId}-contact`,
            agentId,
            websiteId,
            slug: '/contact',
            title: 'Contact',
            pageType: 'static',
            isPublic: true,
            isPublished: true,
            layoutConfig: { sections: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
};

// ─── Core website-instance operations ─────────────────

export const createWebsiteInstance = async (params: {
    organizationId: string;
    agentId: string;
    templateId: string;
    domain: string;
    brandingConfig?: any;
}): Promise<WebsiteInstance> => {
    const template = TEMPLATE_REGISTRY[params.templateId];
    if (!template) throw new Error(`Template ${params.templateId} not found`);

    const newInstance: WebsiteInstance = {
        id: `ws-${Math.random().toString(36).substr(2, 9)}`,
        organizationId: params.organizationId,
        agentId: params.agentId,
        templateId: params.templateId,
        domain: params.domain,
        layoutConfig: {
            header: template.headerStyle,
            footer: template.footerStyle,
            sections: template.defaultHomepageSections,
        },
        brandingConfig: params.brandingConfig || {
            primaryColor: '#4f46e5',
            secondaryColor: '#ffffff',
            fontHeading: 'Inter',
            fontBody: 'Roboto',
        },
        navigation: [
            { label: 'Home', slug: '/' },
            { label: 'About', slug: '#about' },
            { label: 'Listings', slug: '#listings' },
            { label: 'Contact', slug: '#contact' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockWebsiteInstances.push(newInstance);

    try {
        const response = await apiClient.post<WebsiteInstance>('/brokerage/websites', newInstance);
        return response.data;
    } catch {
        return newInstance;
    }
};

export const getAgentWebsites = async (organizationId: string): Promise<WebsiteInstance[]> => {
    return mockWebsiteInstances.filter(ws => ws.organizationId === organizationId);
};

export const getWebsiteByAgentId = async (agentId: string): Promise<WebsiteInstance | null> => {
    return mockWebsiteInstances.find(ws => ws.agentId === agentId) || null;
};

export const updateWebsiteInstance = async (id: string, data: Partial<WebsiteInstance>): Promise<WebsiteInstance> => {
    const idx = mockWebsiteInstances.findIndex(ws => ws.id === id);
    if (idx !== -1) {
        mockWebsiteInstances[idx] = { ...mockWebsiteInstances[idx], ...data, updatedAt: new Date().toISOString() };
        return mockWebsiteInstances[idx];
    }
    try {
        const response = await apiClient.patch<WebsiteInstance>(`/brokerage/websites/${id}`, data);
        return response.data;
    } catch {
        throw new Error(`Instance ${id} not found`);
    }
};

// ─── Agent navigation (agent-advanced mode) ───────────

export const updateAgentNavigation = async (
    websiteId: string,
    navigation: { label: string; slug: string; children?: any[] }[]
): Promise<void> => {
    const idx = mockWebsiteInstances.findIndex(ws => ws.id === websiteId);
    if (idx !== -1) {
        mockWebsiteInstances[idx] = {
            ...mockWebsiteInstances[idx],
            navigation,
            updatedAt: new Date().toISOString(),
        };
    }
};

// ─── Agent page CRUD (agent-advanced mode) ────────────

export const getAgentPages = async (agentId: string, websiteId: string): Promise<AgentPage[]> => {
    seedAgentDefaultPages(agentId, websiteId);
    return mockAgentPages[agentId] || [];
};

export const getAgentPageById = async (agentId: string, pageId: string): Promise<AgentPage | null> => {
    return (mockAgentPages[agentId] || []).find(p => p.id === pageId) || null;
};

export const getAgentPageBySlug = async (agentId: string, slug: string): Promise<AgentPage | null> => {
    const pages = mockAgentPages[agentId] || [];
    let normalizedSlug = slug.trim();
    if (!normalizedSlug.startsWith('/')) normalizedSlug = '/' + normalizedSlug;
    if (normalizedSlug.length > 1 && normalizedSlug.endsWith('/')) normalizedSlug = normalizedSlug.slice(0, -1);
    return (
        pages.find(p => {
            let ps = p.slug.trim();
            if (!ps.startsWith('/')) ps = '/' + ps;
            if (ps.length > 1 && ps.endsWith('/')) ps = ps.slice(0, -1);
            return ps === normalizedSlug;
        }) || null
    );
};

export const createAgentPage = async (
    agentId: string,
    data: {
        websiteId: string;
        slug: string;
        title: string;
        layoutConfig: { sections: any[] };
        isPublic: boolean;
        isPublished: boolean;
        seo?: AgentPage['seo'];
        pageType?: 'static' | 'listing' | 'agent';
    }
): Promise<AgentPage> => {
    if (!mockAgentPages[agentId]) mockAgentPages[agentId] = [];
    const newPage: AgentPage = {
        id: `agp-${agentId}-${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        pageType: data.pageType || 'static',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    mockAgentPages[agentId].push(newPage);
    return newPage;
};

export const updateAgentPage = async (
    agentId: string,
    pageId: string,
    data: Partial<AgentPage>
): Promise<AgentPage> => {
    const pages = mockAgentPages[agentId];
    if (!pages) throw new Error('Agent pages not found');
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx === -1) throw new Error('Page not found');
    pages[idx] = { ...pages[idx], ...data, updatedAt: new Date().toISOString() };
    return pages[idx];
};

export const saveAgentPageLayout = async (agentId: string, pageId: string, json: string): Promise<void> => {
    const pages = mockAgentPages[agentId];
    if (!pages) throw new Error('Agent pages not found');
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx === -1) throw new Error('Page not found');
    pages[idx].customLayoutJson = json;
    pages[idx].updatedAt = new Date().toISOString();
};

export const deleteAgentPage = async (agentId: string, pageId: string): Promise<void> => {
    if (!mockAgentPages[agentId]) return;
    mockAgentPages[agentId] = mockAgentPages[agentId].filter(p => p.id !== pageId);
};

// ─── Unified service export ────────────────────────────

export const websiteInstanceService = {
    // Core
    createWebsiteInstance,
    getAgentWebsites,
    getWebsiteByAgentId,
    updateWebsiteInstance,
    // Agent-advanced: navigation
    updateAgentNavigation,
    // Agent-advanced: page management
    getAgentPages,
    getAgentPageById,
    getAgentPageBySlug,
    createAgentPage,
    updateAgentPage,
    saveAgentPageLayout,
    deleteAgentPage,
};
