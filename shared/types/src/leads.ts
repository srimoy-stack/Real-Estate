export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    listingReference?: string;
    status: LeadStatus;
    assignedTo?: string; // Team Member Name/ID
    notes: { id: string; text: string; author: string; createdAt: string }[];
    createdAt: string;
    updatedAt: string;
}

export type RoutingMethod = 'round_robin' | 'manual' | 'auto_assign_listing_agent';

export interface LeadRoutingConfig {
    method: RoutingMethod;
    active: boolean;
}
