"use client";

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthStore } from './authStore';
import { apiAuthConfig } from '@repo/api-client';

const AuthContext = createContext<ReturnType<typeof useAuthStore> | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useAuthStore();

    // Bridge the gap between store and api client to avoid cyclic dependency.
    useEffect(() => {
        apiAuthConfig.getToken = () => useAuthStore.getState().accessToken;
        apiAuthConfig.getTenantId = () => useAuthStore.getState().user?.tenantId || null;
        apiAuthConfig.setToken = (newToken: string) => useAuthStore.getState().setToken(newToken);
        apiAuthConfig.onLogout = () => useAuthStore.getState().logout();

        // Local Development: Sync impersonation from URL if available
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const isImpersonating = params.get('impersonating') === 'true';

            if (token && isImpersonating && !useAuthStore.getState().isImpersonating) {
                console.log("[AUTH] Detecting impersonation session from URL redirect...");
                // In a real app, we'd verify the token first.
                // For mock, we set a generic impersonated user if one isn't already set.
                if (!useAuthStore.getState().user) {
                    useAuthStore.getState().setAuth({
                        id: 'impersonated-dev',
                        name: 'Impersonated User',
                        email: 'impersonated@demo.com',
                        role: 'BROKERAGE_ADMIN' as any,
                        tenantId: 'demo-tenant'
                    }, token);
                    useAuthStore.setState({
                        isImpersonating: true,
                        originalUser: { id: 'admin', name: 'Super Admin', email: 'admin@system.com', role: 'SUPER_ADMIN' as any }
                    });
                }
                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, []);

    const value = useMemo(() => store, [store]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
