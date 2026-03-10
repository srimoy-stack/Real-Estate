import { apiClient } from '@repo/api-client';
import { WebsiteInstance, TEMPLATE_REGISTRY } from '@repo/types';

let mockWebsiteInstances: WebsiteInstance[] = [
    {
        id: 'ws-1',
        tenantId: 'TENANT_1',
        agentId: '1',
        templateId: 'corporate-brokerage',
        domain: 'david.prestigerealty.com',
        layoutConfig: {
            header: 'solid',
            footer: 'columns',
            sections: [
                { id: 'hero-1', type: 'hero', title: 'Find Your Future', isVisible: true, isLocked: true, content: { headline: 'Find Your Future', subheadline: 'Trust the brokerage with 40 years of local expertise.', buttonText: 'Find Home' }, order: 0 },
                { id: 'featured-1', type: 'featured_listings', title: 'Premium Listings', isVisible: true, isLocked: true, content: { title: 'Premium Listings', subtitle: 'Hand-picked for quality.' }, order: 1 },
                { id: 'stats-1', type: 'stats', title: 'Performance Metrics', isVisible: true, isLocked: false, content: { title: 'Local Presence', stats: [{ label: 'Homes Sold', value: '500+' }, { label: 'Agents', value: '45' }] } },
            ],
        },
        brandingConfig: { primaryColor: '#1e293b', secondaryColor: '#ffffff' },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
    },
    {
        id: 'ws-2',
        tenantId: 'TENANT_1',
        agentId: '2',
        templateId: 'agent-portfolio',
        domain: 'sarah.prestigerealty.com',
        layoutConfig: {
            header: 'transparent',
            footer: 'minimal',
            sections: [
                { id: 'hero-2', type: 'hero', title: 'Sarah Jenkins Real Estate', isVisible: true, isLocked: true, content: { headline: 'Sarah Jenkins Real Estate', subheadline: 'Selling the dream lifestyle.', buttonText: 'View Properties' }, order: 0 },
                { id: 'about-2', type: 'about_banner', title: 'About Sarah', isVisible: true, isLocked: false, content: { title: 'Bespoke Advisory', description: 'With over 12 years of luxury experience...' } },
                { id: 'featured-2', type: 'featured_listings', title: 'Exclusive Active Listings', isVisible: true, isLocked: true, content: { title: 'The Portfolio', subtitle: 'Active listings in the Greater Area' } },
            ],
        },
        brandingConfig: { primaryColor: '#4f46e5', secondaryColor: '#ffffff' },
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z',
    },
    {
        id: 'ws-3',
        tenantId: 'TENANT_1',
        agentId: '3',
        templateId: 'modern-realty',
        domain: 'michael.prestigerealty.com',
        layoutConfig: {
            header: 'solid',
            footer: 'columns',
            sections: [
                { id: 'hero-3', type: 'hero', title: 'Modern Living Redefined', isVisible: true, isLocked: true, content: { headline: 'Modern Living Redefined', subheadline: 'Tech-forward real estate solutions.', buttonText: 'Search MLS' }, order: 0 },
                { id: 'stats-3', type: 'stats', title: 'Proven Results', isVisible: true, isLocked: false, content: { title: 'Proven Results', stats: [{ label: 'Sales Volume', value: '$45M' }, { label: 'Reviews', value: '4.9/5' }] } },
            ],
        },
        brandingConfig: { primaryColor: '#0f172a', secondaryColor: '#ffffff' },
        createdAt: '2024-06-10T10:00:00Z',
        updatedAt: '2024-06-10T10:00:00Z',
    },
];

export const createWebsiteInstance = async (params: {
    tenantId: string;
    agentId: string;
    templateId: string;
    domain: string;
    brandingConfig?: any;
}): Promise<WebsiteInstance> => {
    // Look up the template to get the default layout config
    const template = TEMPLATE_REGISTRY[params.templateId];
    if (!template) {
        throw new Error(`Template ${params.templateId} not found`);
    }

    const newInstance: WebsiteInstance = {
        id: `ws-${Math.random().toString(36).substr(2, 9)}`,
        tenantId: params.tenantId,
        agentId: params.agentId,
        templateId: params.templateId,
        domain: params.domain,
        // The layoutConfig should be copied from the template's defaultLayoutConfig
        // We'll simulate this by taking the defaultHomepageSections from the template definition
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockWebsiteInstances.push(newInstance);

    try {
        // Attempt real API call
        const response = await apiClient.post<WebsiteInstance>('/brokerage/websites', newInstance);
        return response.data;
    } catch (error) {
        // Fallback to mock for local dev satisfaction
        console.log('Website Instance created (Mock):', newInstance);
        return newInstance;
    }
};

export const getAgentWebsites = async (tenantId: string): Promise<WebsiteInstance[]> => {
    return mockWebsiteInstances.filter(ws => ws.tenantId === tenantId);
};

export const getWebsiteByAgentId = async (agentId: string): Promise<WebsiteInstance | null> => {
    return mockWebsiteInstances.find(ws => ws.agentId === agentId) || null;
};

export const updateWebsiteInstance = async (id: string, data: Partial<WebsiteInstance>): Promise<WebsiteInstance> => {
    const idx = mockWebsiteInstances.findIndex(ws => ws.id === id);
    if (idx !== -1) {
        mockWebsiteInstances[idx] = {
            ...mockWebsiteInstances[idx],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return mockWebsiteInstances[idx];
    }

    try {
        const response = await apiClient.patch<WebsiteInstance>(`/brokerage/websites/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(`Instance ${id} not found`);
    }
};

