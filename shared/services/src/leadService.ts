import { Lead, LeadStatus } from '@repo/types';
import { useNotificationStore } from './notificationStore';
import { leadsService as mockApi, CreateLeadInput } from '../../mock-api/services/leadsService';

/**
 * Lead Service — Public API consumed by all lead-capture forms.
 *
 * Currently backed by an in-memory mock.
 * Later this will call backend REST / GraphQL endpoints.
 */
export const leadService = {
    // ─── Read ──────────────────────────────────────────
    getLeads: async (websiteId?: string): Promise<Lead[]> => {
        const leads = await mockApi.getLeads();
        if (websiteId) {
            return leads.filter(l => l.websiteId === websiteId);
        }
        return leads;
    },

    getLeadById: async (id: string): Promise<Lead | undefined> => {
        return mockApi.getLeadById(id);
    },

    // ─── Write ─────────────────────────────────────────
    /**
     * Universal lead creation used by:
     *   • Property detail page  (source: "listing_page")
     *   • Agent profile page    (source: "agent_profile")
     *   • Contact page          (source: "contact_page")
     */
    createLead: async (data: CreateLeadInput): Promise<Lead> => {
        const newLead = await mockApi.submitLead(data);

        // Fire in-app notification for the dashboard
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Lead Routed & Assigned',
            message: `New inquiry from ${newLead.name} via ${formatSource(newLead.source)}. Assigned to ${newLead.assignedTo}.`,
        });

        return newLead;
    },

    // ─── Status management ─────────────────────────────
    updateLeadStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
        return mockApi.updateLeadStatus(id, status);
    },

    addLeadNote: async (id: string, noteText: string, author: string): Promise<Lead> => {
        const lead = await mockApi.getLeadById(id);
        if (!lead) throw new Error('Lead not found');

        const newNote = {
            id: `note-${Math.random().toString(36).substr(2, 9)}`,
            text: noteText,
            author,
            createdAt: new Date().toISOString(),
        };

        // In a real implementation the API would persist this.
        lead.notes.push(newNote);
        lead.updatedAt = new Date().toISOString();
        return lead;
    },

    assignLead: async (id: string, agentId: string): Promise<Lead> => {
        return mockApi.assignLead(id, agentId);
    },
};

/** Pretty-print source labels for notifications */
function formatSource(source: string): string {
    switch (source) {
        case 'listing_page': return 'Property Page';
        case 'agent_profile': return 'Agent Profile';
        case 'contact_page': return 'Contact Page';
        default: return source.replace(/_/g, ' ');
    }
}
