'use client';

import { Navbar, ErrorBoundary, NotificationManager, ImpersonationBanner } from '@repo/ui';
import { ProtectedLayout, Role, useAuthStore } from '@repo/auth';
import { useRouter } from 'next/navigation';

const navItems = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Organizations', href: '/organizations' },
    { label: 'Agents', href: '/agents' },
    { label: 'Access Control', href: '/access-control' },
    { label: 'Shortcodes', href: '/shortcodes' },
    { label: 'Audit Logs', href: '/audit-logs' },
    { label: 'Subscriptions', href: '/subscriptions' },
    { label: 'Templates', href: '/templates' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isImpersonating, originalUser, user, stopImpersonation, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <ProtectedLayout allowedRoles={[Role.SUPER_ADMIN]}>
            <ImpersonationBanner
                isImpersonating={isImpersonating}
                originalUser={originalUser}
                user={user}
                stopImpersonation={stopImpersonation}
            />
            <Navbar
                brand="Super Admin"
                items={navItems}
                rightContent={
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</span>
                            <span className="text-xs font-bold text-slate-900">{user?.name || 'Super Admin'}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-200 group"
                            title="Sign Out"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                }
            />
            <main className="flex-1 bg-slate-50">
                <div className="mx-auto max-w-[1600px] px-8 pb-8 pt-2">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </div>
            </main>
            <NotificationManager />
        </ProtectedLayout>
    );
}
