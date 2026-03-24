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


// ─── Persistence Logic ────────────────────────────────
const STORAGE_KEY = 'platform_organizations_v2';
const IS_SERVER = typeof window === 'undefined';

const getInitialOrgs = (): OrganizationDashboardItem[] => {
    if (!IS_SERVER) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    }
    return [
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
    ];
};

let memOrgs: OrganizationDashboardItem[] = getInitialOrgs();

const persistOrgs = () => {
    if (!IS_SERVER) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memOrgs));
    }
};

export const createOrganization = async (data: Partial<OrganizationDashboardItem>): Promise<OrganizationDashboardItem> => {
    const newOrg: OrganizationDashboardItem = {
        id: `org-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name || 'New Organization',
        type: data.type || 'BROKERAGE',
        email: data.email || '',
        phone: data.phone || '',
        timezone: data.timezone || 'America/Toronto',
        ddfStatus: DDFStatus.HEALTHY,
        leads30d: 0,
        subscriptionPlan: data.subscriptionPlan || SubscriptionPlan.BASIC,
        status: data.status || OrgStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        domain: data.domain || '',
        logo: data.logo,
        template: data.template || 'modern-realty',
        allowedTemplates: data.allowedTemplates || [data.template || 'modern-realty'],
        modules: data.modules || { ddfSync: true, leadCRM: true }
    };

    memOrgs.unshift(newOrg);
    persistOrgs();
    return newOrg;
};

export const getOrganizations = async (params: GetOrgsParams): Promise<GetOrgsResponse> => {
    try {
        // In a real app we'd call the API:
        // const response = await apiClient.get<GetOrgsResponse>('/super-admin/organizations', { params });
        // return response.data;

        let filtered = [...memOrgs];
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
    } catch (error) {
        console.error("Failed to fetch organizations", error);
        return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
};

export const getOrganizationById = async (id: string): Promise<OrganizationDashboardItem | null> => {
    // In mock mode, find it from the list
    const response = await getOrganizations({ page: 1, limit: 100 });
    return response.items.find((org: any) => org.id === id) || null;
};

export const updateOrgStatus = async (id: string, status: OrgStatus): Promise<void> => {
    try {
        const idx = memOrgs.findIndex(o => o.id === id);
        if (idx === -1) throw new Error('Organization not found');

        memOrgs[idx].status = status;
        memOrgs[idx].isActive = status === OrgStatus.ACTIVE;
        memOrgs[idx].updatedAt = new Date().toISOString();

        persistOrgs();

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
        memOrgs = memOrgs.filter(o => o.id !== id);
        persistOrgs();

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
