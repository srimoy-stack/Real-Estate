'use client';

import { Navbar, ErrorBoundary, NotificationManager, ImpersonationBanner } from '@repo/ui';
import { ProtectedLayout, Role, useAuthStore } from '@repo/auth';

const navItems = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Organizations', href: '/organizations' },
    { label: 'Audit Logs', href: '/audit-logs' },
    { label: 'Subscriptions', href: '/subscriptions' },
    { label: 'Templates', href: '/templates' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isImpersonating, originalUser, user, stopImpersonation } = useAuthStore();

    return (
        <ProtectedLayout allowedRoles={[Role.SUPER_ADMIN]}>
            <ImpersonationBanner
                isImpersonating={isImpersonating}
                originalUser={originalUser}
                user={user}
                stopImpersonation={stopImpersonation}
            />
            <Navbar brand="Super Admin" items={navItems} />
            <main className="flex-1 bg-slate-50">
                <div className="mx-auto max-w-[1600px] p-8">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </div>
            </main>
            <NotificationManager />
        </ProtectedLayout>
    );
}
