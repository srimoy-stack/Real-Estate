"use client";

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthStore } from './authStore';
import { Role } from './authTypes';
import { apiAuthConfig } from '@repo/api-client';

const AuthContext = createContext<ReturnType<typeof useAuthStore> | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useAuthStore();

    // Bridge the gap between store and api client to avoid cyclic dependency.
    useEffect(() => {
        apiAuthConfig.getToken = () => useAuthStore.getState().accessToken;
        (apiAuthConfig as any).getOrganizationId = () => useAuthStore.getState().user?.organizationId || null;
        apiAuthConfig.setToken = (newToken: string) => useAuthStore.getState().setToken(newToken);
        apiAuthConfig.onLogout = () => useAuthStore.getState().logout();

        // Auto-fix outdated mock sessions to prevent 403 loops
        const currentUser = useAuthStore.getState().user;

        if (currentUser && (currentUser.role as string) === 'BROKERAGE_ADMIN') {
            console.warn("[DEV MODE] Clearing outdated BROKERAGE_ADMIN session...");
            useAuthStore.getState().logout();
        }

        // Local Development: Sync impersonation from URL if available
        const params = new URLSearchParams(window.location.search);
        const isImpersonatingStr = params.get('impersonating') === 'true';
        const orgId = params.get('orgId');
        const orgName = params.get('orgName');

        if (isImpersonatingStr && orgId && !useAuthStore.getState().isImpersonating) {
            console.log("[AUTH] Detecting impersonation session from URL redirect...");

            // Store in local storage for this port (3002)
            localStorage.setItem('isImpersonating', 'true');
            localStorage.setItem('impersonatedOrgId', orgId);
            localStorage.setItem('impersonatedOrgName', orgName || 'Unknown Organization');

            // Initialize the impersonated state in the store
            useAuthStore.getState().setAuth({
                id: `cln_${orgId}`,
                name: `Admin @ ${orgName}`,
                email: `admin@${orgId}.com`,
                role: Role.CLIENT_ADMIN,
                organizationId: orgId
            }, "mock-access-token");

            useAuthStore.setState({
                isImpersonating: true,
                originalUser: { id: 'super-admin-01', name: 'Super Admin', email: 'admin@system.com', role: Role.SUPER_ADMIN }
            });

            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
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
