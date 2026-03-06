import { useAuthStore } from '@repo/auth';

export const authService = {
    login: async (_email: string, _password: string): Promise<void> => {
        const { setAuth } = useAuthStore.getState();
        // Here you would normally call the API and then setAuth
        // For now, mirroring the store's basic structure
        console.log('Login attempt for:', _email, !!setAuth);
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
