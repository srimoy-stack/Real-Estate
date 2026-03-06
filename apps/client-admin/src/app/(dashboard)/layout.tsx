'use client';

import { ProtectedLayout, Role, useAuthStore } from '@repo/auth';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { ImpersonationBanner, ErrorBoundary, NotificationManager } from '@repo/ui';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isImpersonating, originalUser, user, stopImpersonation } = useAuthStore();

    return (
        <ProtectedLayout allowedRoles={[Role.BROKERAGE_ADMIN, Role.AGENT_ADMIN]}>
            <ImpersonationBanner
                isImpersonating={isImpersonating}
                originalUser={originalUser}
                user={user}
                stopImpersonation={stopImpersonation}
            />
            <div className="flex min-h-screen bg-slate-50 text-slate-900">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 ml-72 overflow-x-hidden">
                    <div className="min-h-screen p-8 lg:p-12 animate-in fade-in duration-700">
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
