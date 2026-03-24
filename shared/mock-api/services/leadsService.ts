import { Lead, LeadStatus } from '@repo/types';
import { mockAgents } from '../mock/agentsMock';

/**
 * In-memory lead store.
 */
const leadStore: Lead[] = [
    {
        id: 'lead-1',
        websiteId: 'ws-1',
        listingId: 'L1',
        agentId: 'A1',
        assignedTo: 'Sarah Mitchell',
        isAutoAssigned: true,
        name: 'David Wilson',
        email: 'd.wilson@example.com',
        phone: '(416) 555-8888',
        message: 'I am interested in viewing this luxury condo.',
        mlsNumber: 'W1234567',
        source: 'listing_page',
        status: 'New',
        notes: [],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 'lead-2',
        websiteId: 'ws-1',
        agentId: 'A2',
        assignedTo: 'Marcus Chen',
        isAutoAssigned: true,
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
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'lead-3',
        websiteId: 'ws-1',
        agentId: 'A3',
        assignedTo: 'Jessica Reynolds',
        isAutoAssigned: false,
        name: 'Michael Jordan',
        email: 'mj@example.com',
        phone: '(312) 555-2323',
        message: 'Looking for a lakeside cottage in Muskoka.',
        source: 'contact_page',
        status: 'Qualified',
        notes: [],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
        id: 'lead-4',
        websiteId: 'ws-1',
        agentId: 'A1',
        assignedTo: 'Sarah Mitchell',
        isAutoAssigned: true,
        name: 'Sarah Connor',
        email: 's.connor@example.com',
        phone: '(213) 555-1984',
        message: 'Need to sell my property fast.',
        source: 'agent_profile',
        status: 'Closed',
        notes: [],
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
        id: 'lead-5',
        websiteId: 'ws-1',
        agentId: 'A1',
        assignedTo: 'Sarah Mitchell',
        isAutoAssigned: true,
        name: 'Thomas Anderson',
        email: 'neo@matrix.com',
        phone: '(555) 010-1010',
        message: 'I want to see the penthouse unit.',
        mlsNumber: 'Q1234567',
        source: 'listing_page',
        status: 'New',
        notes: [],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
        id: 'lead-6',
        websiteId: 'ws-1',
        agentId: 'A2',
        assignedTo: 'Marcus Chen',
        isAutoAssigned: true,
        name: 'Bruce Wayne',
        email: 'bruce@wayne.com',
        phone: '(123) 456-7890',
        message: 'Interested in the commercial property on 5th Ave.',
        mlsNumber: 'C1234567',
        source: 'listing_page',
        status: 'New',
        notes: [],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
        id: 'lead-7',
        websiteId: 'ws-1',
        agentId: 'A3',
        assignedTo: 'Jessica Reynolds',
        isAutoAssigned: true,
        name: 'Diana Prince',
        email: 'diana@themyscira.com',
        phone: '(987) 654-3210',
        message: 'Looking for a historical estate with large grounds.',
        source: 'contact_page',
        status: 'New',
        notes: [],
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
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
     * Return all captured leads.
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
     * Create a new lead with routing logic.
     */
    submitLead: async (data: CreateLeadInput): Promise<Lead> => {
        await new Promise(resolve => setTimeout(resolve, 400));

        // ROUTING LOGIC
        // 1. Identify target agent (Direct Agent ID or Listing Agent)
        let targetAgent = mockAgents.find(a => a.id === data.agentId);

        // 2. Fallback: Identify by Listing ID (if we had a listing-to-agent map, we'd use it here)
        // For simulation, we'll pick Sarah (A1) for property-source if no agentId given
        if (!targetAgent && data.source === 'listing_page') {
            targetAgent = mockAgents.find(a => a.id === 'A1');
        }

        // 3. Fallback: Random Assignment
        if (!targetAgent) {
            const randomIdx = Math.floor(Math.random() * mockAgents.length);
            targetAgent = mockAgents[randomIdx];
        }

        const newLead: Lead = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            websiteId: data.websiteId || 'ws-1',
            listingId: data.listingId,
            agentId: targetAgent.id,
            assignedTo: targetAgent.name,
            isAutoAssigned: true,
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
        console.log(`[Mock LeadRouting] Email sent to ${targetAgent.name} (${targetAgent.email}) about new lead: ${newLead.id}`);
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

        const agent = mockAgents.find(a => a.id === agentId);
        lead.agentId = agentId;
        lead.assignedTo = agent?.name || undefined;
        lead.isAutoAssigned = false;
        lead.updatedAt = new Date().toISOString();

        return lead;
    },
};
