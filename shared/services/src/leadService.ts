import { Lead, LeadStatus } from '@repo/types';
import { listingQueryApi } from './listingQueryApi';
import { websiteInstanceService } from './websiteInstanceService';
import { useNotificationStore } from './notificationStore';

// Mock database for leads
let leads: Lead[] = [
    {
        id: 'lead-1',
        websiteId: 'ws-1',
        agentId: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '555-0199',
        message: 'I am interested in seeing this property.',
        mlsNumber: 'W1234567',
        source: 'Property Detail Page',
        status: 'New',
        notes: [
            { id: 'note-1', text: 'Spoke to her, very interested.', author: 'John Smith', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'lead-2',
        websiteId: 'ws-1',
        agentId: '1',
        name: 'Bob Miller',
        email: 'bob@example.com',
        phone: '555-0200',
        message: 'Looking for a 2 bedroom condo in Toronto.',
        source: 'Contact Page',
        status: 'Contacted',
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const leadService = {
    getLeads: async (websiteId?: string): Promise<Lead[]> => {
        if (websiteId) {
            return leads.filter(l => l.websiteId === websiteId);
        }
        return leads;
    },

    getLeadById: async (id: string): Promise<Lead | undefined> => {
        return leads.find(l => l.id === id);
    },

    createLead: async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<Lead> => {
        let assignedAgentId = data.agentId;

        // LEAD ROUTING LOGIC
        if (!assignedAgentId) {
            // 1. If it comes from a listing page → assign to listing agent
            if (data.mlsNumber) {
                try {
                    const listing = await listingQueryApi.getListingByMlsId(data.mlsNumber);
                    if (listing && listing.agentName) {
                        // Find agent by name or use a default mapping
                        // For now, let's assume we can map agent names or just use listing agent if we had an ID
                        // Since our mock data doesn't have agent IDs in listings yet, we'll fallback
                    }
                } catch (e) {
                    console.error('Error fetching listing for lead routing', e);
                }
            }

            // 2. Otherwise assign to default agent for the website
            if (!assignedAgentId) {
                try {
                    const websites = await websiteInstanceService.getAgentWebsites('org-1'); // Mock org
                    const website = websites.find(ws => ws.id === data.websiteId);
                    if (website) {
                        assignedAgentId = website.agentId;
                    }
                } catch (e) {
                    console.error('Error fetching website for lead routing', e);
                }
            }
        }

        const newLead: Lead = {
            ...data,
            id: `lead-${Math.random().toString(36).substr(2, 9)}`,
            agentId: assignedAgentId,
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        leads.push(newLead);

        // Notify Agent (Mock)
        useNotificationStore.getState().addNotification({
            type: 'info',
            title: 'New Lead Captured',
            message: `New inquiry from ${newLead.name} for ${newLead.mlsNumber || 'General Information'}. Notification sent to agent.`,
        });

        console.log('Lead Created & Agent Notified:', newLead);

        return newLead;
    },

    updateLeadStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
        const index = leads.findIndex(l => l.id === id);
        if (index === -1) throw new Error('Lead not found');

        leads[index] = {
            ...leads[index],
            status,
            updatedAt: new Date().toISOString()
        };

        return leads[index];
    },

    addLeadNote: async (id: string, noteText: string, author: string): Promise<Lead> => {
        const index = leads.findIndex(l => l.id === id);
        if (index === -1) throw new Error('Lead not found');

        const newNote = {
            id: `note-${Math.random().toString(36).substr(2, 9)}`,
            text: noteText,
            author,
            createdAt: new Date().toISOString()
        };

        leads[index].notes.push(newNote);
        leads[index].updatedAt = new Date().toISOString();

        return leads[index];
    },

    assignLead: async (id: string, agentId: string): Promise<Lead> => {
        const index = leads.findIndex(l => l.id === id);
        if (index === -1) throw new Error('Lead not found');

        leads[index] = {
            ...leads[index],
            agentId,
            updatedAt: new Date().toISOString()
        };

        return leads[index];
    }
};
