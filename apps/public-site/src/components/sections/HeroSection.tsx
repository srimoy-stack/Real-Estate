'use client';

import React from 'react';
import Image from 'next/image';
import { SearchBar } from './SearchBar';

export const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with optimized overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
                    alt="Luxury Home"
                    fill
                    className="object-cover scale-105 animate-slow-zoom"
                    priority
                />
                {/* Clean, readable gradient overlay — no fog/blur */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/50 to-slate-900/80" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="max-w-4xl space-y-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Powered by Live MLS® Data</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-[0.85]">
                            Find Your Next<br /> <span className="text-brand-red drop-shadow-none">Space</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-white font-semibold max-w-2xl leading-relaxed tracking-wide">
                            Access thousands of verified commercial properties and lease opportunities across Canada&apos;s top markets. Real-time MLS® listings, updated every minute.
                        </p>
                    </div>

                    {/* Integrated Search Bar */}
                    <div className="pt-4">
                        <SearchBar />
                    </div>

                    <div className="flex flex-wrap items-center gap-8 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="relative h-10 w-10 border-2 border-slate-900 rounded-full overflow-hidden">
                                    <Image src={`https://i.pravatar.cc/100?u=${i}`} alt="" fill className="object-cover" />
                                </div>
                            ))}
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-red border-2 border-slate-900 text-white text-[10px] font-black tracking-tighter">
                                +50k
                            </div>
                        </div>
                        <p className="text-xs text-white font-black uppercase tracking-widest">
                            Trusted by <span className="text-brand-red">50,000+</span> investors and businesses across Canada.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
