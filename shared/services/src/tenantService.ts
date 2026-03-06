import { apiClient } from '@repo/api-client';

export interface TenantConfig {
    id: string;
    domain: string;
    website_title?: string;
    theme_config?: Record<string, any>;
    logo_url?: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
}

export const tenantService = {
    getTenantByDomain: async (domain: string): Promise<TenantConfig | null> => {
        try {
            const response = await apiClient.get<TenantConfig>(`/tenants/domain/${domain}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    getTenantSettings: async (): Promise<TenantConfig | null> => {
        try {
            const response = await apiClient.get<TenantConfig>('/tenants/settings');
            return response.data;
        } catch (error) {
            return null;
        }
    },

    updateTenantSettings: async (settings: Partial<TenantConfig>): Promise<TenantConfig> => {
        const response = await apiClient.patch<TenantConfig>('/tenants/settings', settings);
        return response.data;
    }
};
