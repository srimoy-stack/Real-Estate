import { Lead, LeadStatus } from '@repo/types';

/**
 * In-memory lead store.
 * All leads submitted from ANY form (property page, agent profile, contact page)
 * are stored here.  The array is the single source of truth for the mock.
 */
const leadStore: Lead[] = [
    {
        id: 'lead-1',
        websiteId: 'ws-1',
        listingId: 'L1',
        agentId: 'A1',
        name: 'David Wilson',
        email: 'd.wilson@example.com',
        phone: '(416) 555-8888',
        message: 'I am interested in viewing this luxury condo.',
        mlsNumber: 'W1234567',
        source: 'listing_page',
        status: 'New',
        notes: [],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 'lead-2',
        websiteId: 'ws-1',
        agentId: 'A2',
        name: 'Emily Blunt',
        email: 'emilyb@example.com',
        phone: '(604) 555-7777',
        message: 'Does this family home have a school nearby?',
        mlsNumber: 'V3456789',
        source: 'contact_form',
        status: 'Contacted',
        notes: [
            { id: 'n-1', text: 'Left a voicemail. Waiting for callback.', author: 'System', createdAt: new Date(Date.now() - 3600000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'lead-3',
        websiteId: 'ws-1',
        name: 'Michael Jordan',
        email: 'mj@example.com',
        phone: '(312) 555-2323',
        message: 'Looking for a lakeside cottage in Muskoka.',
        source: 'contact_page',
        status: 'Qualified',
        notes: [],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
        id: 'lead-4',
        websiteId: 'ws-1',
        agentId: 'A1',
        name: 'Sarah Connor',
        email: 's.connor@example.com',
        phone: '(213) 555-1984',
        message: 'Need to sell my property fast.',
        source: 'agent_profile',
        status: 'Closed',
        notes: [],
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
        id: 'lead-5',
        websiteId: 'ws-1',
        name: 'Thomas Anderson',
        email: 'neo@matrix.com',
        phone: '(555) 010-1010',
        message: 'I want to see the penthouse unit.',
        mlsNumber: 'Q1234567',
        source: 'listing_page',
        status: 'New',
        notes: [],
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
    },
];

export interface CreateLeadInput {
    name: string;
    email: string;
    phone: string;
    message: string;
    source: string;
    listingId?: string;
    agentId?: string;
    mlsNumber?: string;
    websiteId?: string;
}

export const leadsService = {
    /**
     * Return all captured leads (most recent first).
     */
    getLeads: async (): Promise<Lead[]> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...leadStore].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    /**
     * Get a single lead by its id.
     */
    getLeadById: async (id: string): Promise<Lead | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return leadStore.find(l => l.id === id);
    },

    /**
     * Create a new lead from any submission source.
     * Persists in the in-memory store and returns the new Lead.
     */
    submitLead: async (data: CreateLeadInput): Promise<Lead> => {
        await new Promise(resolve => setTimeout(resolve, 400));

        const newLead: Lead = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            websiteId: data.websiteId || 'ws-1',
            listingId: data.listingId,
            agentId: data.agentId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
            mlsNumber: data.mlsNumber,
            source: data.source,
            status: 'New' as LeadStatus,
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        leadStore.push(newLead);
        console.log(`[Mock LeadsService] Lead captured (${newLead.source}):`, newLead.id, '→', newLead.name);
        return newLead;
    },

    /**
     * Update a lead's status in the store.
     */
    updateLeadStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
        const lead = leadStore.find(l => l.id === id);
        if (!lead) throw new Error(`Lead ${id} not found`);
        lead.status = status;
        lead.updatedAt = new Date().toISOString();
        return lead;
    },

    /**
     * Re-assign a lead to a specific agent.
     */
    assignLead: async (id: string, agentId: string): Promise<Lead> => {
        const lead = leadStore.find(l => l.id === id);
        if (!lead) throw new Error(`Lead ${id} not found`);
        lead.agentId = agentId;
        lead.updatedAt = new Date().toISOString();
        return lead;
    },
};
