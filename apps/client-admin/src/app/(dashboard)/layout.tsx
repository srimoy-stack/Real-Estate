'use client';

import React from 'react';
import { ProtectedLayout, Role, useAuthStore } from '@repo/auth';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { ImpersonationBanner, ErrorBoundary, NotificationManager } from '@repo/ui';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isImpersonating, originalUser, user, stopImpersonation } = useAuthStore();
    const pathname = usePathname();
    const isWebsiteBuilder = pathname.startsWith('/website-builder');
    const [isCollapsed, setIsCollapsed] = React.useState(isWebsiteBuilder);

    // Sync collapse state with route
    React.useEffect(() => {
        setIsCollapsed(isWebsiteBuilder);
    }, [isWebsiteBuilder]);

    return (
        <ProtectedLayout allowedRoles={[Role.CLIENT_ADMIN, Role.AGENT]}>
            <ImpersonationBanner
                isImpersonating={isImpersonating}
                originalUser={originalUser}
                user={user}
                stopImpersonation={stopImpersonation}
            />
            <div className="flex min-h-screen bg-slate-50 text-slate-900">
                {/* Sidebar - Collapsed for Website Builder, but available */}
                <Sidebar
                    collapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                />

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-300 overflow-x-hidden ${isCollapsed ? 'ml-20' : 'ml-72'}`}>
                    <div className={`${isWebsiteBuilder ? '' : 'p-8 lg:p-12'} min-h-screen animate-in fade-in duration-700`}>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
            <NotificationManager />
        </ProtectedLayout>
    );
}
