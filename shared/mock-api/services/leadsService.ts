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
        mlsNumber: 'X123456',
        source: 'listing_page',
        status: 'New',
        notes: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'lead-2',
        websiteId: 'ws-1',
        agentId: 'A2',
        name: 'Emily Blunt',
        email: 'emilyb@example.com',
        phone: '(604) 555-7777',
        message: 'Does this family home have a school nearby?',
        mlsNumber: 'X654321',
        source: 'contact_form',
        status: 'Contacted',
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
