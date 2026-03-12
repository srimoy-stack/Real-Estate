export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed';

export interface Lead {
    id: string;
    websiteId: string;
    agentId?: string; // Assigned agent
    name: string;
    email: string;
    phone: string;
    message: string;
    mlsNumber?: string;
    source: string;
    status: LeadStatus;
    notes: { id: string; text: string; author: string; createdAt: string }[];
    createdAt: string;
    updatedAt: string;
}

export type RoutingMethod = 'round_robin' | 'manual' | 'auto_assign_listing_agent';

export interface LeadRoutingConfig {
    method: RoutingMethod;
    active: boolean;
}
