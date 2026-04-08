'use client';

import React from 'react';
import { SafeImage } from '@/components/ui';
import { SearchBar } from './SearchBar';

export const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                <SafeImage
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
                    alt="Luxury Property Background"
                    fill
                    priority
                    className="object-cover scale-105"
                    style={{ animation: 'slowZoom 30s ease-in-out infinite alternate' }}
                />
                {/* Advanced Gradient Overlay for better depth */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/70 to-slate-900/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80" />
            </div>

            {/* Decorative Elements - Glowing Orbs */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] animate-pulse delay-700" />
            
            {/* Visual Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-40">
                <div className="max-w-5xl space-y-12">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full shadow-2xl">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/80">Market Activity: Live Ontario Feed</span>
                        </div>

                        {/* Heading with Decorative Span */}
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black text-white tracking-tighter leading-[0.85] filter drop-shadow-2xl">
                                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-rose-400">Next</span><br /> 
                                <span className="relative inline-block mt-2">
                                    Space
                                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-brand-red to-transparent rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"></span>
                                </span>.
                            </h1>
                        </div>

                        {/* Refined Marketing Copy */}
                        <div className="max-w-3xl space-y-6">
                            <p className="text-xl md:text-2xl text-slate-100 font-bold leading-relaxed tracking-tight">
                                Access thousands of verified commercial properties and lease opportunities across Ontario&apos;s top markets.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-brand-red/20 flex items-center justify-center border border-brand-red/30">
                                        <svg className="w-3 h-3 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm md:text-base text-white/70 font-medium leading-relaxed">
                                        Verified pricing and availability data directly from owners and professional brokers.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-brand-red/20 flex items-center justify-center border border-brand-red/30">
                                        <svg className="w-3 h-3 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm md:text-base text-white/70 font-medium leading-relaxed">
                                        Localized insights covering premium retail, commercial, and industrial markets in Ontario.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Search Bar with Glass Container */}
                    <div className="pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 ease-out">
                        <div className="relative p-2 bg-white/[0.03] backdrop-blur-md rounded-[42px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                            <SearchBar />
                        </div>
                    </div>

                    {/* Footer Social Proof Section */}
                    <div className="flex flex-wrap items-center gap-10 pt-10 animate-in fade-in duration-1000 delay-700">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3.5">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="relative h-11 w-11 border-2 border-slate-900 rounded-full overflow-hidden shadow-xl">
                                        <SafeImage
                                            src={`https://i.pravatar.cc/100?u=user_${i}`}
                                            alt="Verified User"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                                <div className="flex items-center justify-center h-11 w-11 rounded-full bg-brand-red border-2 border-slate-900 text-white text-[10px] font-black tracking-tighter shadow-lg shadow-brand-red/20">
                                    +50k
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <p className="text-xs text-white/50 font-black uppercase tracking-[0.2em] leading-tight">
                                Trusted by <span className="text-white">50,000+</span> <br />Investors across Ontario
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slowZoom {
                    from { transform: scale(1.05); }
                    to { transform: scale(1.15); }
                }
                .delay-300 { animation-delay: 300ms; }
                .delay-700 { animation-delay: 700ms; }
            `}</style>
        </section>
    );
};
