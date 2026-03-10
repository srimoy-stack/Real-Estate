'use client';

import React from 'react';

export const AgentHero: React.FC = () => (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a1628]">
        {/* Background layers */}
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/90 to-[#0a1628]/60 z-10" />
            <div className="absolute inset-0 bg-slate-800">
                {/* Ambient pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>
            {/* Warm glow */}
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-20 max-w-[1400px] mx-auto px-8 py-40 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left content */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px w-10 bg-amber-400" />
                        <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em]">Toronto&apos;s Trusted Advisor</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
                        Helping You Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Perfect Home</span>
                    </h1>

                    <p className="text-white/40 text-lg mt-8 max-w-lg leading-relaxed">
                        With 12+ years of experience and $40M in sales volume, Sarah Mitchell provides elite real estate services across Toronto&apos;s most prestigious neighborhoods.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <a href="/listings" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            View My Listings
                        </a>
                        <a href="#contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/15 hover:border-amber-400/40 text-white/80 hover:text-amber-400 font-bold text-sm uppercase tracking-wider rounded-xl transition-all hover:bg-white/[0.03]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Contact Me
                        </a>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-white/5">
                        {[
                            { value: '12+', label: 'Years Experience' },
                            { value: '150+', label: 'Homes Sold' },
                            { value: '$40M+', label: 'Sales Volume' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                                <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Agent Photo */}
                <div className="relative hidden lg:flex justify-center">
                    <div className="relative w-[420px] h-[520px]">
                        {/* Background card */}
                        <div className="absolute top-8 left-8 right-0 bottom-0 bg-gradient-to-br from-amber-400/10 to-amber-600/5 rounded-3xl border border-amber-400/10" />
                        {/* Photo container */}
                        <div className="relative w-full h-full bg-slate-800 rounded-3xl overflow-hidden border-2 border-white/5 shadow-2xl">
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                                    <svg className="w-12 h-12 text-amber-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <span className="text-white/15 text-sm font-medium">Agent Portrait</span>
                            </div>
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-4 -left-4 bg-[#0a1628] border border-white/5 rounded-2xl p-5 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">98% Satisfaction</p>
                                    <p className="text-white/30 text-[10px]">Client Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <span className="text-[9px] font-bold text-white/15 uppercase tracking-[0.3em]">Scroll</span>
            <div className="w-5 h-8 border border-white/10 rounded-full flex justify-center pt-2">
                <div className="w-1 h-2 bg-amber-400/50 rounded-full animate-bounce" />
            </div>
        </div>
    </section>
);
