'use client';

import React from 'react';
import { SearchBar } from './SearchBar';

export const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax Effect (simulated) */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
                    alt="Luxury Home"
                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                {/* Modern Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="max-w-5xl space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/10 backdrop-blur-xl border border-indigo-500/20 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Market Leader In Luxury Real Estate</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                            Find Your <span className="text-white italic">Dream Home</span> <br className="hidden md:block" /> With Confidence.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-200 font-medium max-w-xl leading-relaxed">
                            Explore our curated selection of premium listings across the country's most desirable communities. Experience a new standard of luxury living.
                        </p>
                    </div>

                    {/* Injected Search Bar */}
                    <div className="pt-8">
                        <SearchBar />
                    </div>

                    <div className="flex flex-wrap items-center gap-8 pt-6">
                        <div className="flex -space-x-3 overflow-hidden">
                            {[1, 2, 3, 4].map(i => (
                                <img key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-900" src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                            ))}
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 ring-2 ring-slate-900 text-white text-[10px] font-bold">
                                +2k
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 font-bold">
                            Join over <span className="text-white">2,400+</span> satisfied homeowners who found their perfect match.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
