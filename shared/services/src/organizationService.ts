import { apiClient } from '@repo/api-client';
import { useNotificationStore } from './notificationStore';
import { Organization, OrganizationType, TenantTemplate } from '@repo/types';
import { templateAssignmentService } from './templateAssignmentService';

export enum SubscriptionPlan {
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE'
}

export enum OrgType {
    BROKERAGE = 'BROKERAGE',
    INDIVIDUAL_AGENT = 'INDIVIDUAL_AGENT',
    AGENT = 'INDIVIDUAL_AGENT' // Support for legacy references
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

export interface OrganizationDashboardItem extends Organization {
    domain: string;
    template: string;
    ddfStatus: DDFStatus;
    leads30d: number;
    subscriptionPlan: SubscriptionPlan;
    status: OrgStatus;
    adminEmail?: string;
    allowedTemplates?: string[];
    modules?: Record<string, boolean>;
}

export const getAssignedTemplates = async (organizationId: string): Promise<TenantTemplate[]> => {
    return templateAssignmentService.getTemplatesByTenant(organizationId);
};

export const assignTemplateToOrganization = async (organizationId: string, templateId: string, assignedBy: string): Promise<TenantTemplate> => {
    return templateAssignmentService.assignTemplate({ organizationId, templateId, adminId: assignedBy });
};

export interface GetOrgsParams {
    page: number;
    limit: number;
    search?: string;
    type?: OrganizationType;
    status?: OrgStatus;
    subscription?: SubscriptionPlan;
}

export interface GetOrgsResponse {
    items: OrganizationDashboardItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── Onboarding Wizard Payload ────────────────────────


export const getOrganizations = async (params: GetOrgsParams): Promise<GetOrgsResponse> => {
    try {
        const response = await apiClient.get<GetOrgsResponse>('/super-admin/organizations', { params });
        return response.data;
    } catch (error) {
        // Mock data for demo/onboarding
        const items: OrganizationDashboardItem[] = [
            {
                id: 'org-1',
                name: 'Skyline Real Estate',
                type: 'BROKERAGE',
                email: 'contact@skyline.com',
                phone: '555-0101',
                timezone: 'America/New_York',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 452,
                subscriptionPlan: SubscriptionPlan.ENTERPRISE,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-10-15T10:00:00Z',
                updatedAt: '2024-03-01T12:00:00Z',
                adminEmail: 'admin@skyline.com',
                isActive: true,
                domain: 'skyline.realty',
                template: 'modern-realty',
                allowedTemplates: ['modern-realty', 'luxury-estate', 'corporate-brokerage'],
                modules: { ddfSync: true, leadCRM: true, advancedAnalytics: true, agentPortals: true }
            },
            {
                id: 'org-2',
                name: 'John Smith Realty',
                type: 'INDIVIDUAL_AGENT',
                email: 'john@smithrealty.com',
                phone: '555-0102',
                timezone: 'America/Toronto',
                ddfStatus: DDFStatus.WARNING,
                leads30d: 87,
                subscriptionPlan: SubscriptionPlan.PREMIUM,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-11-02T14:30:00Z',
                updatedAt: '2024-03-11T09:00:00Z',
                adminEmail: 'john@smithrealty.com',
                isActive: true,
                domain: 'johnsmith.agent',
                template: 'agent-portfolio',
                allowedTemplates: ['agent-portfolio'],
                modules: { ddfSync: true, leadCRM: true, advancedAnalytics: false, agentPortals: false }
            },
            {
                id: 'org-3',
                name: 'Coastal Properties',
                type: 'BROKERAGE',
                email: 'info@coastalprop.com',
                phone: '555-0103',
                timezone: 'America/Los_Angeles',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 1240,
                subscriptionPlan: SubscriptionPlan.ENTERPRISE,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-08-20T10:00:00Z',
                updatedAt: '2024-03-10T15:00:00Z',
                adminEmail: 'admin@coastalprop.com',
                isActive: true,
                domain: 'coastal.properties',
                template: 'luxury-estate',
                allowedTemplates: ['modern-realty', 'luxury-estate'],
                modules: { ddfSync: true, leadCRM: true, advancedAnalytics: true, agentPortals: true }
            },
            {
                id: 'org-4',
                name: 'Urban Living',
                type: 'BROKERAGE',
                email: 'hello@urbanliving.com',
                phone: '555-0104',
                timezone: 'America/Chicago',
                ddfStatus: DDFStatus.ERROR,
                leads30d: 56,
                subscriptionPlan: SubscriptionPlan.BASIC,
                status: OrgStatus.SUSPENDED,
                createdAt: '2024-01-10T09:00:00Z',
                updatedAt: '2024-03-05T11:00:00Z',
                adminEmail: 'support@urbanliving.com',
                isActive: false,
                domain: 'urbanliving.site',
                template: 'minimal-realty',
                allowedTemplates: ['minimal-realty'],
                modules: { ddfSync: true, leadCRM: false, advancedAnalytics: false, agentPortals: false }
            },
            {
                id: 'org-5',
                name: 'Sarah Miller',
                type: 'INDIVIDUAL_AGENT',
                email: 'sarah@millerrealty.ca',
                phone: '555-0105',
                timezone: 'America/Vancouver',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 210,
                subscriptionPlan: SubscriptionPlan.PREMIUM,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-12-05T14:00:00Z',
                updatedAt: '2024-03-12T08:00:00Z',
                adminEmail: 'sarah@millerrealty.ca',
                isActive: true,
                domain: 'sarahmiller.realtor',
                template: 'agent-portfolio',
                allowedTemplates: ['agent-portfolio', 'minimal-realty'],
                modules: { ddfSync: true, leadCRM: true, advancedAnalytics: false, agentPortals: false }
            },
            {
                id: 'org-6',
                name: 'Summit Estates',
                type: 'BROKERAGE',
                email: 'contact@summitestates.com',
                phone: '555-0106',
                timezone: 'America/Denver',
                ddfStatus: DDFStatus.WARNING,
                leads30d: 890,
                subscriptionPlan: SubscriptionPlan.ENTERPRISE,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-09-15T11:00:00Z',
                updatedAt: '2024-03-11T16:00:00Z',
                adminEmail: 'admin@summitestates.com',
                isActive: true,
                domain: 'summit.estates',
                template: 'corporate-brokerage',
                allowedTemplates: ['corporate-brokerage', 'modern-realty'],
                modules: { ddfSync: true, leadCRM: true, advancedAnalytics: true, agentPortals: true }
            },
            {
                id: 'org-7',
                name: 'Lakeside Realty',
                type: 'BROKERAGE',
                email: 'office@lakesiderea.com',
                phone: '555-0107',
                timezone: 'America/Detroit',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 342,
                subscriptionPlan: SubscriptionPlan.BASIC,
                status: OrgStatus.INACTIVE,
                createdAt: '2024-02-01T10:00:00Z',
                updatedAt: '2024-02-01T10:00:00Z',
                adminEmail: 'manager@lakesiderea.com',
                isActive: false,
                domain: 'lakeside.realty',
                template: 'modern-realty',
                allowedTemplates: ['modern-realty'],
                modules: { ddfSync: true, leadCRM: false, advancedAnalytics: false, agentPortals: false }
            }
        ];

        let filtered = items;
        if (params.search) {
            const s = params.search.toLowerCase();
            filtered = filtered.filter(o => o.name.toLowerCase().includes(s));
        }
        if (params.type) filtered = filtered.filter(o => o.type === params.type);
        if (params.status) filtered = filtered.filter(o => o.status === params.status);

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
