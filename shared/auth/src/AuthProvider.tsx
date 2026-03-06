"use client";

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthStore } from './authStore';
import { apiAuthConfig } from '@repo/api-client';

const AuthContext = createContext<ReturnType<typeof useAuthStore> | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useAuthStore();
    const { accessToken, user } = store;

    // Bridge the gap between store and api client to avoid cyclic dependency.
    useEffect(() => {
        apiAuthConfig.getToken = () => useAuthStore.getState().accessToken;
        apiAuthConfig.getTenantId = () => useAuthStore.getState().user?.tenantId || null;
        apiAuthConfig.setToken = (newToken: string) => useAuthStore.getState().setToken(newToken);
        apiAuthConfig.onLogout = () => useAuthStore.getState().logout();
    }, []);

    // Also update current store value whenever token or user changes
    useEffect(() => {
        // Updated dependencies for persistence tracking (if any)
    }, [accessToken, user]);

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
