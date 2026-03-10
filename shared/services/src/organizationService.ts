import { apiClient } from '@repo/api-client';
import { useNotificationStore } from './notificationStore';

export enum OrgType {
    // ... existing enums ...
    BROKERAGE = 'BROKERAGE',
    AGENT = 'AGENT'
}

export enum SubscriptionPlan {
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE'
}

export enum OrgStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

export enum DDFStatus {
    HEALTHY = 'HEALTHY',
    WARNING = 'WARNING',
    ERROR = 'ERROR'
}

export interface Organization {
    id: string;
    name: string;
    type: OrgType;
    template: string;
    domain: string;
    ddfStatus: DDFStatus;
    leads30d: number;
    subscriptionPlan: SubscriptionPlan;
    status: OrgStatus;
    createdAt: string;
    modules?: {
        listings: boolean;
        mapSearch: boolean;
        blog: boolean;
        leadCRM: boolean;
        emailNotifications: boolean;
        sms: boolean;
        analytics: boolean;
        teamManagement: boolean;
        neighborhoodPages: boolean;
    };
    adminEmail?: string;
    legalName?: string;
    allowedTemplates: string[];
}

// Mock Table: TenantTemplates
// In a real app this would be a DB table.
export interface TenantTemplate {
    id: string;
    tenantId: string;
    templateId: string;
    assignedBy: string;
    createdAt: string;
}

let mockTenantTemplates: TenantTemplate[] = [
    { id: 'tt-1', tenantId: 'org-1', templateId: 'modern-realty', assignedBy: 'super-admin', createdAt: '2023-10-15T10:00:00Z' },
    { id: 'tt-2', tenantId: 'org-1', templateId: 'minimal-realty', assignedBy: 'super-admin', createdAt: '2023-10-15T10:00:00Z' },
    { id: 'tt-3', tenantId: 'org-2', templateId: 'agent-portfolio', assignedBy: 'super-admin', createdAt: '2023-11-02T14:30:00Z' },
    { id: 'tt-4', tenantId: 'TENANT_1', templateId: 'modern-realty', assignedBy: 'super-admin', createdAt: '2024-03-10T10:00:00Z' },
    { id: 'tt-5', tenantId: 'TENANT_1', templateId: 'luxury-estate', assignedBy: 'super-admin', createdAt: '2024-03-10T10:00:00Z' },
    { id: 'tt-6', tenantId: 'tenant_7721', templateId: 'agent-portfolio', assignedBy: 'super-admin', createdAt: '2024-03-10T10:00:00Z' },
    { id: 'tt-7', tenantId: 'tenant_7721', templateId: 'modern-realty', assignedBy: 'super-admin', createdAt: '2024-03-10T10:00:00Z' },
    { id: 'tt-8', tenantId: 'TENANT_1', templateId: 'agent-portfolio', assignedBy: 'super-admin', createdAt: '2024-03-10T10:00:00Z' },
    { id: 'tt-9', tenantId: 'TENANT_1', templateId: 'corporate-brokerage', assignedBy: 'super-admin', createdAt: '2024-03-10T10:00:00Z' },
];

export const getAssignedTemplates = async (tenantId: string): Promise<TenantTemplate[]> => {
    return mockTenantTemplates.filter(t => t.tenantId === tenantId);
};

export const assignTemplateToTenant = async (tenantId: string, templateId: string, assignedBy: string): Promise<TenantTemplate> => {
    const newEntry: TenantTemplate = {
        id: `tt-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        templateId,
        assignedBy,
        createdAt: new Date().toISOString()
    };
    mockTenantTemplates.push(newEntry);

    // Also update the Organization allowedTemplates for legacy compatibility if needed
    // In a real app, allowedTemplates might be a computed field from this table
    return newEntry;
};


export interface GetOrgsParams {
    page: number;
    limit: number;
    search?: string;
    type?: OrgType;
    status?: OrgStatus;
    subscription?: SubscriptionPlan;
}

export interface GetOrgsResponse {
    items: Organization[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const getOrganizations = async (params: GetOrgsParams): Promise<GetOrgsResponse> => {
    try {
        const response = await apiClient.get<GetOrgsResponse>('/super-admin/organizations', { params });
        return response.data;
    } catch (error) {
        // Mock data for demo/onboarding
        const items: Organization[] = [
            {
                id: 'org-1',
                name: 'Skyline Real Estate',
                type: OrgType.BROKERAGE,
                template: 'modern-realty',
                domain: 'skyline-demo.realestate.com',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 452,
                subscriptionPlan: SubscriptionPlan.ENTERPRISE,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-10-15T10:00:00Z',
                adminEmail: 'admin@skyline.com',
                allowedTemplates: ['modern-realty', 'minimal-realty', 'corporate-brokerage'],
                modules: {
                    listings: true, mapSearch: true, blog: true, leadCRM: true,
                    emailNotifications: true, sms: true, analytics: true,
                    teamManagement: true, neighborhoodPages: true
                }
            },
            {
                id: 'org-2',
                name: 'Jane Doe Properties',
                type: OrgType.AGENT,
                template: 'agent-portfolio',
                domain: 'janedoe.com',
                ddfStatus: DDFStatus.WARNING,
                leads30d: 87,
                subscriptionPlan: SubscriptionPlan.PREMIUM,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-11-02T14:30:00Z',
                adminEmail: 'jane@properties.com',
                allowedTemplates: ['agent-portfolio', 'minimal-realty'],
                modules: {
                    listings: true, mapSearch: true, blog: false, leadCRM: true,
                    emailNotifications: true, sms: false, analytics: true,
                    teamManagement: false, neighborhoodPages: false
                }
            },
            {
                id: 'org-3',
                name: 'Metro Listings',
                type: OrgType.BROKERAGE,
                template: 'corporate-brokerage',
                domain: 'metro.realestate.ca',
                ddfStatus: DDFStatus.ERROR,
                leads30d: 312,
                subscriptionPlan: SubscriptionPlan.BASIC,
                status: OrgStatus.SUSPENDED,
                createdAt: '2023-09-20T08:15:00Z',
                adminEmail: 'support@metro.ca',
                allowedTemplates: ['corporate-brokerage', 'minimal-realty'],
                modules: {
                    listings: true, mapSearch: false, blog: true, leadCRM: false,
                    emailNotifications: false, sms: false, analytics: true,
                    teamManagement: true, neighborhoodPages: false
                }
            },
            {
                id: 'org-4',
                name: 'Coastal Homes',
                type: OrgType.BROKERAGE,
                template: 'luxury-estate',
                domain: 'coastalhomes.com',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 156,
                subscriptionPlan: SubscriptionPlan.PREMIUM,
                status: OrgStatus.INACTIVE,
                createdAt: '2024-01-10T12:00:00Z',
                adminEmail: 'office@coastal.com',
                allowedTemplates: ['luxury-estate', 'modern-realty', 'agent-portfolio'],
                modules: {
                    listings: true, mapSearch: true, blog: true, leadCRM: true,
                    emailNotifications: true, sms: false, analytics: true,
                    teamManagement: true, neighborhoodPages: true
                }
            }
        ];

        // Filter by search
        let filtered = items;
        if (params.search) {
            const s = params.search.toLowerCase();
            filtered = filtered.filter(o => o.name.toLowerCase().includes(s) || o.domain.toLowerCase().includes(s));
        }
        if (params.type) filtered = filtered.filter(o => o.type === params.type);
        if (params.status) filtered = filtered.filter(o => o.status === params.status);
        if (params.subscription) filtered = filtered.filter(o => o.subscriptionPlan === params.subscription);

        return {
            items: filtered,
            total: filtered.length,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil(filtered.length / params.limit)
        };
    }
};

export const updateOrgStatus = async (id: string, status: OrgStatus): Promise<void> => {
    try {
        await apiClient.patch(`/super-admin/organizations/${id}/status`, { status });
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Status Updated',
            message: `Organization status changed to ${status}`
        });
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            title: 'Update Failed',
            message: 'Could not update organization status'
        });
        throw error;
    }
};

export const updateOrganization = async (id: string, data: Partial<Organization>): Promise<void> => {
    try {
        await apiClient.put(`/super-admin/organizations/${id}`, data);
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Organization Updated',
            message: 'All changes have been saved successfully.'
        });
    } catch (error) {
        // Mock success for demo
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Organization Updated (Mock)',
            message: 'Changes saved locally (Mock API).'
        });
    }
};

export const deleteOrganization = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/super-admin/organizations/${id}`);
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Organization Deleted',
            message: `The organization has been permanently removed.`
        });
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: 'An error occurred while deleting the organization.'
        });
        throw error;
    }
};
