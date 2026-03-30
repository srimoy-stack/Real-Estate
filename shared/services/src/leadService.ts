import { Lead, LeadStatus } from '@repo/types';
import { useNotificationStore } from './notificationStore';

/**
 * Lead Service — Public API consumed by all lead-capture forms.
 *
 * This version bypasses local database storage due to quota limitations.
 * It communicates with the /api/leads endpoint which synthesizes 'Live' leads
 * directly from real-time MLS listing data.
 */
const BASE_URL = typeof window !== 'undefined' ? 
    (window.location.port === '3001' ? 'http://localhost:3000' : window.location.origin) : 
    (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3000');

const API_URL = `${BASE_URL}/api/leads`;

export const leadService = {
    // ─── Read ──────────────────────────────────────────
    getLeads: async (websiteId?: string): Promise<Lead[]> => {
        try {
            const url = new URL(API_URL);
            if (websiteId) url.searchParams.set('websiteId', websiteId);
            
            const res = await fetch(url.toString(), {
                cache: 'no-store'
            });
            if (!res.ok) throw new Error('Failed to fetch leads');
            return await res.json();
        } catch (error) {
            console.error('[leadService] getLeads error:', error);
            return [];
        }
    },

    getLeadById: async (id: string): Promise<Lead | undefined> => {
        try {
            const leads = await leadService.getLeads();
            return leads.find(l => l.id === id);
        } catch (error) {
            return undefined;
        }
    },

    // ─── Write ─────────────────────────────────────────
    createLead: async (data: any): Promise<Lead> => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!res.ok) throw new Error('Failed to create lead');
            const newLead = await res.json();

            // CREA DDF Compliance: Forward lead to CREA if it's an MLS listing
            if (data.mlsNumber) {
                console.log(`[leadService] MLS inquiry detected for ${data.mlsNumber}. Forwarding to DDF Lead API...`);
                fetch(`${BASE_URL}/api/ddf/lead`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mlsNumber: data.mlsNumber,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        message: data.message
                    })
                }).catch(err => console.error('[leadService] DDF forward error:', err));
            }

            // Notification layer
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Lead Captured',
                message: `New inquiry from ${newLead.name}.`,
            });

            return newLead;
        } catch (error) {
            console.error('[leadService] createLead error:', error);
            throw error;
        }
    },

    updateLeadStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
        try {
            const res = await fetch(API_URL, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            if (!res.ok) throw new Error('Failed to update lead');
            return await res.json();
        } catch (error) {
            console.error('[leadService] updateLeadStatus error:', error);
            throw error;
        }
    },

    // Notes and Assignment currently simulated via echo to avoid DB impact
    addLeadNote: async (id: string, noteText: string, author: string): Promise<Lead> => {
        console.log(`[leadService] Note addition intercepted (id: ${id}): ${noteText} by ${author}`);
        const lead = await leadService.getLeadById(id);
        if (!lead) throw new Error('Lead not found');
        return lead;
    },

    assignLead: async (id: string, agentId: string): Promise<Lead> => {
        console.log(`[leadService] Assignment intercepted (id: ${id}): agent ${agentId}`);
        const lead = await leadService.getLeadById(id);
        if (!lead) throw new Error('Lead not found');
        return lead;
    },
};
