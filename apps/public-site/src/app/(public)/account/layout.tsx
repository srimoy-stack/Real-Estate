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
        <div className="min-h-screen bg-white pb-20">
            {/* High-End Dashboard Header */}
            <div className="bg-slate-50/50 border-b border-slate-100 pt-20 pb-16 px-6 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        {/* User Identity & Welcome */}
                        <div className="flex items-start gap-8">
                            <div className="w-24 h-24 rounded-[32px] bg-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-slate-200 border-4 border-white transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                {user.name.charAt(0)}
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-8 bg-[#4F46E5] rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4F46E5]">Exclusive Member</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                                    Welcome back, <span className="text-[#4F46E5] italic">{user.name.split(' ')[0]}</span>
                                </h1>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {user.email} · Account ID: {user.id.slice(0, 8)}
                                </p>
                            </div>
                        </div>

                        {/* Stats / Quick Overview */}
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="px-8 py-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#4F46E5] transition-colors">Saved Assets</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">08</p>
                            </div>
                            <div className="px-8 py-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#4F46E5] transition-colors">Market Alerts</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">03</p>
                            </div>
                            <div className="px-8 py-6 bg-[#4F46E5] rounded-3xl shadow-2xl shadow-indigo-100 group cursor-pointer hover:-translate-y-1 transition-all duration-500">
                                <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Portfolio Value</p>
                                <p className="text-xl font-black text-white tracking-tighter">$12.4M</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-16 flex flex-wrap bg-white/50 backdrop-blur-md p-2 rounded-[24px] border border-slate-100 gap-2 w-full lg:w-fit shadow-inner">
                        <Link
                            href="/account/saved-listings"
                            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${pathname === '/account/saved-listings'
                                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            Collection
                        </Link>
                        <Link
                            href="/account/saved-searches"
                            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${pathname === '/account/saved-searches'
                                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            Alerts
                        </Link>
                        <Link
                            href="/account/profile"
                            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${pathname === '/account/profile'
                                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Identity
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-20">
                {children}
            </main>

            {/* Premium Settings Section */}
            <div className="max-w-7xl mx-auto px-6 mt-32">
                <div className="p-16 bg-[#111113] rounded-[56px] text-white flex flex-col xl:flex-row items-center justify-between gap-16 relative overflow-hidden shadow-[0_48px_80px_-16px_rgba(0,0,0,0.3)] group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4F46E5]/10 rounded-full -mr-[300px] -mt-[300px] blur-[120px] transition-all group-hover:bg-[#4F46E5]/20 duration-1000" />
                    
                    <div className="space-y-6 relative max-w-xl text-center xl:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Security Core</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter leading-none">Account <span className="text-[#4F46E5] italic">Identity</span> & Privacy</h2>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">Manage your secure credentials, notification preferences, and discrete market access settings in one central hub.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 relative w-full lg:w-auto">
                        <button className="h-16 px-12 bg-white text-slate-900 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                            Manage Credentials
                        </button>
                        <button
                            onClick={() => logout()}
                            className="h-16 px-12 bg-white/5 border border-white/10 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 transition-all active:scale-95"
                        >
                            End Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
