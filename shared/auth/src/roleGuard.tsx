"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { Role } from './authTypes';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Role[];
    fallbackUrl?: string;
}

/**
 * Higher-order component to restrict access based on user role.
 * Redirects unauthorized users to a 403 / Forbidden page.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    fallbackUrl = '/403'
}) => {
    const { user, isAuthenticated, isLoading, isImpersonating, hasHydrated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (hasHydrated && !isLoading) {
            if (!isAuthenticated) {
                // Not authenticated -> redirect to login (convention: /login)
                router.push('/login' as any);
                return;
            }

            // Authenticated but check roles
            if (user && !allowedRoles.includes(user.role)) {
                router.push(fallbackUrl as any);
                return;
            }

            // Tenant Suspension Enforcement (Bypassed by impersonating Super Admins)
            if (user?.tenantStatus === 'SUSPENDED' && !isImpersonating) {
                router.push('/suspended' as any);
                return;
            }
        }
    }, [hasHydrated, isLoading, isAuthenticated, user, isImpersonating, allowedRoles, router, fallbackUrl]);

    // Prevent flicker while loading auth state or hydrating
    if (!hasHydrated || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Role check for direct component return
    if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
        return null;
    }

    return <>{children}</>;
};
