'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingLauncher() {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-3xl w-full space-y-10 text-center animate-in fade-in duration-500">
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Super Admin</span>
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">New Onboarding</h1>
                    <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">Select the type of entity you want to onboard.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Brokerage */}
                    <button
                        onClick={() => router.push('/onboard-brokerage')}
                        className="group p-10 bg-white border-2 border-slate-100 rounded-[40px] hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 text-left space-y-5"
                    >
                        <div className="h-16 w-16 bg-indigo-100 rounded-[20px] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            🏢
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Brokerage Entity</h2>
                            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                                Onboard a real estate brokerage firm with company details, template assignment, listing configuration, and website setup.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            Start Onboarding <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </button>

                    {/* Agent */}
                    <button
                        onClick={() => router.push('/onboard-agent')}
                        className="group p-10 bg-white border-2 border-slate-100 rounded-[40px] hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300 text-left space-y-5"
                    >
                        <div className="h-16 w-16 bg-violet-100 rounded-[20px] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                            👤
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Individual Agent</h2>
                            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                                Onboard an individual real estate agent with personal details, website template, listing filters, and SEO configuration.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-violet-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            Start Onboarding <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
