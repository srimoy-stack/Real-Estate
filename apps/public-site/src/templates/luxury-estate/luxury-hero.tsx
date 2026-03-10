'use client';

import React, { useState } from 'react';

const cities = ['All Cities', 'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'];
const types = ['All Types', 'Penthouse', 'Estate', 'Villa', 'Waterfront', 'Condo'];
const priceRanges = ['Any Price', '$1M - $3M', '$3M - $5M', '$5M - $10M', '$10M+'];

export const LuxuryHero: React.FC = () => {
    const [city, setCity] = useState('All Cities');
    const [type, setType] = useState('All Types');
    const [price, setPrice] = useState('Any Price');

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950 z-10" />
                <div className="absolute inset-0 bg-slate-900">
                    {/* Geometric accent lines */}
                    <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500/10 to-transparent" />
                    <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(180,130,50,0.08),transparent_70%)]" />
                </div>
            </div>

            {/* Content */}
            <div className="relative z-20 max-w-[1400px] mx-auto px-8 py-48 w-full">
                <div className="max-w-4xl">
                    {/* Pre-title */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px w-16 bg-amber-500" />
                        <span className="text-amber-400/80 text-[11px] font-black uppercase tracking-[0.4em]">Exclusive Collection • Est. 2008</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85]">
                        <span className="block">Exclusive</span>
                        <span className="block text-amber-400 italic">Luxury</span>
                        <span className="block">Properties</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-white/40 text-lg md:text-xl mt-8 max-w-xl font-light leading-relaxed">
                        Discover premium homes in Canada&apos;s most desirable locations. Curated for the discerning buyer.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex gap-12 mt-12">
                        {[
                            { value: '$2.8B+', label: 'Total Sales' },
                            { value: '400+', label: 'Luxury Homes' },
                            { value: '98%', label: 'Client Satisfaction' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-20 max-w-5xl">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-sm p-3 flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <label className="text-[9px] font-black text-amber-400/60 uppercase tracking-[0.3em] absolute top-2 left-4">Location</label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full pt-7 pb-3 px-4 bg-white/5 border border-white/5 rounded-sm text-white text-sm font-medium outline-none focus:border-amber-500/30 transition-colors cursor-pointer appearance-none"
                            >
                                {cities.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 relative">
                            <label className="text-[9px] font-black text-amber-400/60 uppercase tracking-[0.3em] absolute top-2 left-4">Property Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full pt-7 pb-3 px-4 bg-white/5 border border-white/5 rounded-sm text-white text-sm font-medium outline-none focus:border-amber-500/30 transition-colors cursor-pointer appearance-none"
                            >
                                {types.map((t) => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 relative">
                            <label className="text-[9px] font-black text-amber-400/60 uppercase tracking-[0.3em] absolute top-2 left-4">Price Range</label>
                            <select
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full pt-7 pb-3 px-4 bg-white/5 border border-white/5 rounded-sm text-white text-sm font-medium outline-none focus:border-amber-500/30 transition-colors cursor-pointer appearance-none"
                            >
                                {priceRanges.map((p) => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                            </select>
                        </div>
                        <button className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-[0.2em] rounded-sm transition-all duration-300 flex items-center gap-3 whitespace-nowrap shadow-2xl shadow-amber-500/20">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Explore</span>
                <div className="w-px h-12 bg-gradient-to-b from-amber-500/50 to-transparent animate-pulse" />
            </div>
        </section>
    );
};
