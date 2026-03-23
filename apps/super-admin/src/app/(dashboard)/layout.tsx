'use client';

import React from 'react';
import { ErrorBoundary, NotificationManager, ImpersonationBanner } from '@repo/ui';
import { ProtectedLayout, Role, useAuthStore } from '@repo/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
    { label: 'Overview', href: '/dashboard', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { label: 'Organizations', href: '/organizations', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: 'Agents', href: '/agents', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { label: 'Leads', href: '/leads', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: 'Shortcodes', href: '/shortcodes', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
    { label: 'Billing', href: '/billing', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    { label: 'Access Control', href: '/access-control', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { label: 'Templates', href: '/templates', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { label: 'Audit Logs', href: '/audit-logs', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isImpersonating, originalUser, user, stopImpersonation, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const isWebsiteBuilder = pathname.includes('/website-builder');

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isWebsiteBuilder) {
        return (
            <ProtectedLayout allowedRoles={[Role.SUPER_ADMIN]}>
                <main className="h-screen w-screen overflow-hidden">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>
                <NotificationManager />
            </ProtectedLayout>
        );
    }

    return (
        <ProtectedLayout allowedRoles={[Role.SUPER_ADMIN]}>
            <ImpersonationBanner
                isImpersonating={isImpersonating}
                originalUser={originalUser}
                user={user}
                stopImpersonation={stopImpersonation}
            />

            <div className="flex min-h-screen bg-[#F0F4F8]">
                {/* Sidebar */}
                <aside className="fixed inset-y-0 left-0 w-72 bg-[#1C253B] text-white flex flex-col z-50">
                    <div className="p-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xl font-black tracking-tight">Logo</span>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 mt-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] transition-all group ${isActive
                                        ? 'bg-white/10 text-white font-bold'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className={`transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-white'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-sm tracking-wide">{item.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-6 mt-auto">
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white transition-all group"
                        >
                            <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-bold tracking-wide">Settings</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 ml-72 flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 z-40 transition-shadow hover:shadow-sm">
                        <div className="flex-1 max-w-md relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search Search..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-[14px] pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-8 ml-8">
                            <button className="relative p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white transition-all group">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                            </button>

                            <div className="flex items-center gap-3 pl-8 border-l border-slate-100 group cursor-pointer hover:bg-slate-50 transition-all rounded-xl p-1.5">
                                <div className="w-10 h-10 rounded-full bg-slate-900 overflow-hidden shadow-sm flex items-center justify-center border-2 border-white">
                                    <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700 leading-tight">Super</span>
                                    <span className="text-sm font-bold text-slate-700 leading-tight">Administrator</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 ml-1 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="ml-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Sign Out
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-10 overflow-y-auto w-full">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </div>
            </div>

            <NotificationManager />
        </ProtectedLayout>
    );
}
