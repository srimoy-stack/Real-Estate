import { apiClient } from '@repo/api-client';

export interface DashboardMetrics {
    totalBrokerages: number;
    totalAgents: number;
    activeWebsites: number;
    ddfHealth: 'healthy' | 'warning' | 'error';
    ddfConnected: boolean;
    feedErrors: number;
    leadsTrend: { date: string; value: number }[];
    leadsTotal30d: number;
    errorRate: number;
    apiLatency: number;
    activeTenants: number;
    failedJobs: number;
    subscriptionSummary: {
        basic: number;
        premium: number;
        enterprise: number;
    };
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
    try {
        const response = await apiClient.get<DashboardMetrics>('/super-admin/dashboard/metrics');
        return response.data;
    } catch (error) {
        // Return mock data for demo purposes if API is not available
        return {
            totalBrokerages: 156,
            totalAgents: 1248,
            activeWebsites: 142,
            ddfHealth: 'healthy',
            ddfConnected: true,
            feedErrors: 12,
            leadsTrend: [
                { date: '2024-02-01', value: 45 },
                { date: '2024-02-05', value: 52 },
                { date: '2024-02-10', value: 38 },
                { date: '2024-02-15', value: 65 },
                { date: '2024-02-20', value: 48 },
                { date: '2024-02-25', value: 72 },
                { date: '2024-03-01', value: 85 },
            ],
            leadsTotal30d: 842,
            activeTenants: 156,
            errorRate: 0.12,
            apiLatency: 48,
            failedJobs: 3,
            subscriptionSummary: {
                basic: 45,
                premium: 82,
                enterprise: 29
            }
        };
    }
};
