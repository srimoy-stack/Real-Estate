export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed';

export interface Lead {
    id: string;
    websiteId: string;
    listingId?: string;  // Listing the lead came from (if any)
    agentId?: string;    // Assigned / target agent
    name: string;
    email: string;
    phone: string;
    message: string;
    mlsNumber?: string;
    source: LeadSource;
    status: LeadStatus;
    notes: { id: string; text: string; author: string; createdAt: string }[];
    assignedTo?: string; // Agent name for quick display
    isAutoAssigned?: boolean;
    createdAt: string;
    updatedAt: string;
}

export type LeadSource =
    | 'listing_page'
    | 'agent_profile'
    | 'contact_page'
    | 'contact_form'
    | 'chat'
    | 'referral'
    | string; // allow custom UTM-tagged sources

export type RoutingMethod = 'round_robin' | 'manual' | 'auto_assign_listing_agent';

export interface LeadRoutingConfig {
    method: RoutingMethod;
    active: boolean;
}
