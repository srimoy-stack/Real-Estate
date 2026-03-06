import axios from 'axios';

/**
 * Global configuration for auth integration.
 * This object will be populated by the AuthProvider to bridge the gap between
 * the auth store and the API client without creating a circular dependency.
 */
export const apiAuthConfig = {
    getToken: () => null as string | null,
    getTenantId: () => null as string | null,
    onLogout: () => { },
    setToken: (_token: string) => { },
};

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for secure cookies (refresh tokens)
});

// Request interceptor: Inject access token and tenant ID
apiClient.interceptors.request.use((config) => {
    const token = apiAuthConfig.getToken();
    const tenantId = apiAuthConfig.getTenantId();

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId && config.headers) {
        config.headers['x-tenant-id'] = tenantId;
    }

    return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Response interceptor: Handle 401 and Token Refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token via the API
                const refreshResponse = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = refreshResponse.data;

                if (!accessToken) {
                    throw new Error('No access token received from refresh endpoint');
                }

                // Update the store via our bridge callback
                apiAuthConfig.setToken(accessToken);

                // Process queued requests
                processQueue(null, accessToken);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed → Process queue with error and logout
                processQueue(refreshError, null);
                apiAuthConfig.onLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


export { apiClient };

export enum AuditEventType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    IMPERSONATION_START = 'IMPERSONATION_START',
    IMPERSONATION_STOP = 'IMPERSONATION_STOP',
    ORG_CREATED = 'ORG_CREATED',
    ORG_SUSPENDED = 'ORG_SUSPENDED',
    ORG_ACTIVATED = 'ORG_ACTIVATED',
    TEMPLATE_ASSIGNED = 'TEMPLATE_ASSIGNED',
    ROLE_CHANGED = 'ROLE_CHANGED',
    DDF_CONFIG_UPDATED = 'DDF_CONFIG_UPDATED',
    MODULE_CONFIG_CHANGED = 'MODULE_CONFIG_CHANGED',
    WEBSITE_SYNC = 'WEBSITE_SYNC',
    SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
    SECURITY_VIOLATION = 'SECURITY_VIOLATION',
}

export interface AuditLog {
    id: string;
    timestamp: string;
    eventType: AuditEventType;
    actorId: string;
    actorName: string;
    targetId?: string;
    targetName?: string;
    tenantId?: string;
    metadata?: Record<string, any>;
    status: 'SUCCESS' | 'FAILURE' | 'WARNING';
    ipAddress?: string;
}

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    try {
        console.log(`[AUDIT] ${log.eventType} by ${log.actorName}`, log);
        return await apiClient.post('/audit-logs', log);
    } catch (error) {
        console.error('Failed to create audit log', error);
    }
};

export const getAuditLogs = async (params: any) => {
    const response = await apiClient.get('/audit-logs', { params });
    return response.data;
};
