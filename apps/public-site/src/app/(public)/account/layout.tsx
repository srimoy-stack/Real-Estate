'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@repo/auth';
import Link from 'next/link';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, hasHydrated } = useAuth();

    useEffect(() => {
        if (hasHydrated && !user) {
            router.push('/login');
        }
    }, [user, hasHydrated, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 pt-16 pb-12 px-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-12 bg-emerald-600 rounded-full" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">User Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Real Estate</span> Hub
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                            Welcome back, <span className="text-slate-900 font-bold">{user.name}</span>. Manage your preferences and property alerts.
                        </p>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                        <Link
                            href="/account/saved-listings"
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/account/saved-listings'
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Saved Listings
                        </Link>
                        <Link
                            href="/account/saved-searches"
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/account/saved-searches'
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Property Alerts
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 pt-16">
                {children}
            </main>

            {/* Account Settings Shortcut Card */}
            <div className="max-w-6xl mx-auto px-4 mt-20">
                <div className="p-12 bg-slate-900 rounded-[60px] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="space-y-4 relative">
                        <h2 className="text-2xl font-black tracking-tight">Account <span className="text-emerald-400 italic">Security</span></h2>
                        <p className="text-slate-400 font-medium max-w-md">Update your password, manage linked social accounts, and configure global notification settings.</p>
                    </div>
                    <div className="flex gap-4 relative">
                        <button className="px-8 py-5 bg-white text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all">
                            Manage Credentials
                        </button>
                        <button
                            onClick={() => logout()}
                            className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
