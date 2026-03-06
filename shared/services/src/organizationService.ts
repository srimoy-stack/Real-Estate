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
}

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
                template: 'Modern Luxury',
                domain: 'skyline-demo.realestate.com',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 452,
                subscriptionPlan: SubscriptionPlan.ENTERPRISE,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-10-15T10:00:00Z'
            },
            {
                id: 'org-2',
                name: 'Jane Doe Properties',
                type: OrgType.AGENT,
                template: 'Minimalist',
                domain: 'janedoe.com',
                ddfStatus: DDFStatus.WARNING,
                leads30d: 87,
                subscriptionPlan: SubscriptionPlan.PREMIUM,
                status: OrgStatus.ACTIVE,
                createdAt: '2023-11-02T14:30:00Z'
            },
            {
                id: 'org-3',
                name: 'Metro Listings',
                type: OrgType.BROKERAGE,
                template: 'Standard',
                domain: 'metro.realestate.ca',
                ddfStatus: DDFStatus.ERROR,
                leads30d: 312,
                subscriptionPlan: SubscriptionPlan.BASIC,
                status: OrgStatus.SUSPENDED,
                createdAt: '2023-09-20T08:15:00Z'
            },
            {
                id: 'org-4',
                name: 'Coastal Homes',
                type: OrgType.BROKERAGE,
                template: 'Beachfront',
                domain: 'coastalhomes.com',
                ddfStatus: DDFStatus.HEALTHY,
                leads30d: 156,
                subscriptionPlan: SubscriptionPlan.PREMIUM,
                status: OrgStatus.INACTIVE,
                createdAt: '2024-01-10T12:00:00Z'
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
