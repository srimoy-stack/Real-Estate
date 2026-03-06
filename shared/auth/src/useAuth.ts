'use client';

import { useCallback, useState } from 'react';
import { useAuthStore } from './authStore';
import { apiClient, createAuditLog, AuditEventType } from '@repo/api-client';

/**
 * Custom hook to interact with the authentication system.
 * Provides user state and auth actions.
 */
export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        accessToken,
        isImpersonating,
        originalUser,
        setAuth,
        logout: clearStore,
        startImpersonation: setImpersonation,
        stopImpersonation: resetImpersonation
    } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (credentials: any) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { user, accessToken } = response.data;
            setAuth(user, accessToken);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [setAuth]);

    const logout = useCallback(async () => {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            clearStore();
        }
    }, [clearStore]);

    const refreshToken = useCallback(async () => {
        try {
            const response = await apiClient.post('/auth/refresh');
            const { user, accessToken } = response.data;
            setAuth(user, accessToken);
        } catch (error) {
            clearStore();
            throw error;
        }
    }, [setAuth, clearStore]);

    const startImpersonation = useCallback(async (userId: string) => {
        try {
            const response = await apiClient.post(`/auth/impersonate/${userId}`);
            const { user: impersonatedUser, accessToken: newAccessToken } = response.data;

            // Use the provided startImpersonation logic from store
            // We need to pass both original and impersonated users
            const currentOriginalUser = isImpersonating ? originalUser : user;

            if (currentOriginalUser && impersonatedUser) {
                setImpersonation(currentOriginalUser, impersonatedUser);
                useAuthStore.setState({ accessToken: newAccessToken });

                // Audit Log
                await createAuditLog({
                    eventType: AuditEventType.IMPERSONATION_START,
                    actorId: currentOriginalUser.id,
                    actorName: currentOriginalUser.name,
                    targetId: impersonatedUser.id,
                    targetName: impersonatedUser.name,
                    tenantId: impersonatedUser.tenantId,
                    status: 'SUCCESS',
                    metadata: { orgId: userId }
                });
            }
        } catch (error) {
            throw error;
        }
    }, [user, isImpersonating, originalUser, setImpersonation]);

    const exitImpersonation = useCallback(async () => {
        try {
            const currentImpersonatedUser = user;
            const currentActor = originalUser || user;

            await apiClient.post('/auth/impersonate/exit');
            resetImpersonation();

            // Audit Log
            if (currentActor && currentImpersonatedUser) {
                await createAuditLog({
                    eventType: AuditEventType.IMPERSONATION_STOP,
                    actorId: currentActor.id,
                    actorName: currentActor.name,
                    targetId: currentImpersonatedUser.id,
                    targetName: currentImpersonatedUser.name,
                    tenantId: currentImpersonatedUser.tenantId,
                    status: 'SUCCESS'
                });
            }

            // To restore the actual session we might need to refresh
            await refreshToken();
        } catch (error) {
            clearStore();
            throw error;
        }
    }, [resetImpersonation, refreshToken, clearStore]);

    return {
        user,
        role: user?.role,
        tenantId: user?.tenantId,
        isAuthenticated,
        accessToken,
        isImpersonating,
        originalUser,
        isLoading,
        login,
        logout,
        refreshToken,
        startImpersonation,
        exitImpersonation,
    };
};
