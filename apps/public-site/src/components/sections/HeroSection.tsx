'use client';

import React from 'react';
import { SafeImage } from '@/components/ui';
import { SearchBar } from './SearchBar';

export const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[95vh] flex items-center justify-center bg-slate-950">
            {/* Background & Decorative Layer — overflow-hidden kept here to clip blobs/zoom */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                    <SafeImage
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
                        alt="Luxury Property Background"
                        fill
                        priority
                        className="object-cover scale-105"
                        style={{ animation: 'slowZoom 30s ease-in-out infinite alternate' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/70 to-slate-900/60" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80" />
                </div>
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] animate-pulse delay-700" />
                <div className="absolute inset-0 opacity-[0.03]" 
                     style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-40">
                <div className="max-w-5xl space-y-12">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">


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
                                Browse thousands of homes, condos, and investment properties listed directly from Canada&apos;s top MLS® boards.
                            </p>
                            

                        </div>
                    </div>

                    {/* Integrated Search Bar with Glass Container */}
                    <div className="pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 ease-out">
                        <div className="relative z-30 p-2 bg-white/[0.03] backdrop-blur-md rounded-[42px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                            <SearchBar />
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
