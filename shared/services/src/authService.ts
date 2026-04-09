import { useAuthStore } from '@repo/auth';
import { apiClient } from '@repo/api-client';

/**
 * Auth Service
 * Integrated with the JWT API for login, registration, and session management.
 */
export const authService = {
    /**
     * Real login call to API.
     */
    login: async (email: string, password?: string): Promise<void> => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { user, accessToken } = response.data;
            
            const { setAuth } = useAuthStore.getState();
            setAuth(user, accessToken);
            console.log('[Auth Service] User logged in:', user.email);
        } catch (error) {
            console.error('[Auth Service] Login failed:', error);
            throw error;
        }
    },

    /**
     * Real registration call to API.
     */
    register: async (name: string, email: string, password?: string): Promise<void> => {
        try {
            const response = await apiClient.post('/auth/signup', { name, email, password });
            const { user, accessToken } = response.data;
            
            const { setAuth } = useAuthStore.getState();
            setAuth(user, accessToken);
            console.log('[Auth Service] User registered:', user.email);
        } catch (error) {
            console.error('[Auth Service] Registration failed:', error);
            throw error;
        }
    },

    /**
     * Clear the user session.
     */
    logout: async (): Promise<void> => {
        try {
            // Optional: call backend logout if implemented
            await apiClient.post('/auth/logout').catch(() => {});
        } finally {
            const { logout } = useAuthStore.getState();
            logout();
            console.log('[Auth Service] User logged out');
        }
    },

    /**
     * Get the currently logged-in user.
     */
    getCurrentUser: () => {
        const { user } = useAuthStore.getState();
        return user;
    },

    /**
     * Check if a user is currently authenticated.
     */
    isAuthenticated: () => {
        const { isAuthenticated } = useAuthStore.getState();
        return isAuthenticated;
    }
};
