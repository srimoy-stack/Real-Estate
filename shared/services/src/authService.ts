import { useAuthStore } from '@repo/auth';

/**
 * Mock Auth Service
 * Simulates login, logout, registration, and session management using local storage.
 */
export const authService = {
    /**
     * Simulate a login.
     * In a real app, this would call a backend API.
     */
    login: async (email: string, _password?: string): Promise<void> => {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const { setAuth } = useAuthStore.getState();

        const mockUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            role: 'viewer' as any,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setAuth(mockUser, 'mock-jwt-token-' + Date.now());
        console.log('[Mock Auth] User logged in:', mockUser.email);
    },

    /**
     * Simulate registration.
     */
    register: async (name: string, email: string, _password?: string): Promise<void> => {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { setAuth } = useAuthStore.getState();

        const mockUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            role: 'viewer' as any,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setAuth(mockUser, 'mock-jwt-token-' + Date.now());
        console.log('[Mock Auth] User registered and logged in:', mockUser.email);
    },

    /**
     * Clear the user session.
     */
    logout: async (): Promise<void> => {
        const { logout } = useAuthStore.getState();
        logout();
        console.log('[Mock Auth] User logged out');
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
