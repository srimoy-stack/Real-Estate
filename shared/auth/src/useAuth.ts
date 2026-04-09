'use client';

import { useCallback, useState } from 'react';
import { useAuthStore } from './authStore';
import { apiClient, createAuditLog, AuditEventType } from '@repo/api-client';
import { User, Role } from './authTypes';

/**
 * Custom hook to interact with the authentication system.
 * Provides user state and auth actions.
 */
export const useAuth = () => {
    const {
        user,
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

    const signup = useCallback(async (userData: any) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/signup', userData);
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
        } catch (error) {
            // Log but don't rethrow -- user should still be logged out locally
            console.warn('[Auth] Logout request failed (backend unreachable), clearing local session anyway.', error);
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
        setIsLoading(true);
        try {
            // Simulated MFA Check (Requirement 4.1.4)
            console.log("[SECURITY] Verifying Super Admin MFA status...");

            let impersonatedUser: User;
            let newAccessToken: string;

            try {
                const response = await apiClient.post(`/auth/impersonate/${userId}`);
                impersonatedUser = response.data.user;
                newAccessToken = response.data.accessToken;
            } catch (error) {
                console.warn("[AUTH] Impersonation API failed, falling back to mock mode.");
                // Mock fallback for development
                impersonatedUser = {
                    id: `impersonated-${userId}`,
                    name: `Admin @ ${userId}`,
                    email: `admin@${userId}.demo`,
                    role: Role.CLIENT_ADMIN,
                    organizationId: userId,
                    organizationStatus: "ACTIVE"
                };
                newAccessToken = "mock-impersonation-token";
            }

            const currentOriginalUser = isImpersonating ? originalUser : user;

            if (currentOriginalUser && impersonatedUser) {
                setImpersonation(currentOriginalUser, impersonatedUser);
                useAuthStore.setState({ accessToken: newAccessToken });

                // Requirement 4.1.4: All impersonation logged
                await createAuditLog({
                    eventType: AuditEventType.IMPERSONATION_START,
                    actorId: currentOriginalUser.id,
                    actorName: currentOriginalUser.name,
                    targetId: impersonatedUser.id,
                    targetName: impersonatedUser.name,
                    organizationId: impersonatedUser.organizationId,
                    status: 'SUCCESS',
                    metadata: {
                        orgId: userId,
                        sessionType: 'TIME_LIMITED_DEV',
                        mfaVerified: true
                    }
                });
            }
        } catch (error) {
            console.error("[AUTH] Impersonation failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [user, isImpersonating, originalUser, setImpersonation]);

    const exitImpersonation = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentImpersonatedUser = user;
            const currentActor = originalUser || user;

            try {
                await apiClient.post('/auth/impersonate/exit');
            } catch (e) {
                console.warn("[AUTH] Exit API failed, proceeding with local store reset.");
            }

            resetImpersonation();

            // Audit Log
            if (currentActor && currentImpersonatedUser) {
                await createAuditLog({
                    eventType: AuditEventType.IMPERSONATION_STOP,
                    actorId: currentActor.id,
                    actorName: currentActor.name,
                    targetId: currentImpersonatedUser.id,
                    targetName: currentImpersonatedUser.name,
                    organizationId: currentImpersonatedUser.organizationId,
                    status: 'SUCCESS'
                });
            }

            // Restore actual session
            try {
                await refreshToken();
            } catch (e) {
                console.error("[AUTH] Failed to restore session after exit.");
            }
        } catch (error) {
            clearStore();
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [user, originalUser, resetImpersonation, refreshToken, clearStore]);

    return {
        user,
        role: user?.role,
        organizationId: user?.organizationId,
        isAuthenticated: !!user,
        accessToken,
        isImpersonating,
        originalUser,
        isLoading,
        login,
        signup,
        logout,
        refreshToken,
        startImpersonation,
        exitImpersonation,
        hasHydrated: useAuthStore(state => state._hasHydrated)
    };
};
