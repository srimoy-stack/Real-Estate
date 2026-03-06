"use client";

import React from 'react';
import { RoleGuard } from './roleGuard';
import { Role } from './authTypes';

interface ProtectedLayoutProps {
    children: React.ReactNode;
    allowedRoles: Role[];
    fallbackUrl?: string; // e.g. /403 or /unauthorized
}

/**
 * Common Layout Wrapper for protected areas.
 * Use this in your App (e.g. Next.js Layout) to restrict access.
 */
export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
    children,
    allowedRoles,
    fallbackUrl
}) => {
    return (
        <RoleGuard allowedRoles={allowedRoles} fallbackUrl={fallbackUrl}>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                {/* Apps can wrap this further with specialized sidebars or navigation */}
                {children}
            </div>
        </RoleGuard>
    );
};
