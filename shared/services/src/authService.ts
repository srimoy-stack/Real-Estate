import { useAuthStore } from '@repo/auth';

export const authService = {
    login: async (_email: string, _password: string): Promise<void> => {
        const { setAuth } = useAuthStore.getState();
        // Here you would normally call the API
        const mockUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            name: _email.split('@')[0],
            email: _email,
            role: 'viewer' as any,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setAuth(mockUser, 'mock-jwt-token');
    },

    register: async (name: string, email: string, _password: string): Promise<void> => {
        const { setAuth } = useAuthStore.getState();
        console.log('Register attempt for:', email);
        const mockUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            role: 'viewer' as any,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setAuth(mockUser, 'mock-jwt-token');
    },

    resetPassword: async (email: string): Promise<void> => {
        console.log('Reset password link sent to:', email);
        // Simulate API call
        return new Promise(resolve => setTimeout(resolve, 1000));
    },

    logout: async (): Promise<void> => {
        const { logout } = useAuthStore.getState();
        logout();
    },

    getCurrentUser: () => {
        const { user } = useAuthStore.getState();
        return user;
    },

    isAuthenticated: () => {
        const { isAuthenticated } = useAuthStore.getState();
        return isAuthenticated;
    }
};
