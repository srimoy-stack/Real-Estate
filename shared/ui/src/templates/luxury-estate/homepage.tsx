'use client';

import React from 'react';
import { LuxuryHero } from './luxury-hero';
import { FeaturedLuxuryListings } from './featured-luxury-listings';
import { PropertyGallery } from './property-gallery';
import { AgentSpotlight } from './agent-spotlight';
import { Testimonials } from './testimonials';

export const Homepage: React.FC = () => (
    <>
        <LuxuryHero />

        {/* Trust bar */}
        <section className="bg-slate-900/50 border-y border-white/5">
            <div className="max-w-[1400px] mx-auto px-8 py-8 flex flex-wrap items-center justify-center gap-12 md:gap-20">
                {['Forbes', 'Wall Street Journal', 'Robb Report', 'Luxury Listings', 'Globe & Mail'].map((pub) => (
                    <span key={pub} className="text-white/10 text-sm font-bold uppercase tracking-[0.3em]">{pub}</span>
                ))}
            </div>
        </section>

        <FeaturedLuxuryListings />

        <PropertyGallery />

        {/* Lifestyle Categories */}
        <section className="py-32 bg-slate-950">
            <div className="max-w-[1400px] mx-auto px-8">
                <div className="text-center mb-20">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px w-12 bg-amber-500" />
                        <span className="text-amber-400/80 text-[11px] font-black uppercase tracking-[0.4em]">Explore By Lifestyle</span>
                        <div className="h-px w-12 bg-amber-500" />
                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tighter">
                        Find Your <span className="text-amber-400 italic">Lifestyle</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Waterfront', desc: 'Harbour & lakefront estates', icon: '🌊', count: '45' },
                        { title: 'Penthouse', desc: 'Sky-high luxury residences', icon: '🏙️', count: '32' },
                        { title: 'Heritage', desc: 'Architecturally significant', icon: '🏛️', count: '28' },
                        { title: 'Contemporary', desc: 'Modern architectural marvels', icon: '✦', count: '56' },
                    ].map((cat) => (
                        <a key={cat.title} href="#" className="group p-10 bg-white/[0.02] border border-white/5 rounded-sm hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition-all duration-500">
                            <span className="text-4xl block mb-6">{cat.icon}</span>
                            <h3 className="text-white text-lg font-bold group-hover:text-amber-400 transition-colors">{cat.title}</h3>
                            <p className="text-white/25 text-sm mt-2">{cat.desc}</p>
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                <span className="text-amber-400/50 text-[10px] font-black uppercase tracking-widest">{cat.count} Properties</span>
                                <svg className="w-5 h-5 text-white/10 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>

        <AgentSpotlight />

        <Testimonials />

        {/* CTA Section */}
        <section className="py-32 bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(180,130,50,0.06),transparent_60%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

            <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px w-8 bg-amber-500" />
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <div className="h-px w-8 bg-amber-500" />
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                    Schedule a <span className="text-amber-400 italic">Private</span> Tour
                </h2>
                <p className="text-white/30 text-lg mt-6 max-w-lg mx-auto font-light leading-relaxed">
                    Experience these extraordinary residences in person. Our concierge team will arrange an exclusive, private viewing at your convenience.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                    <a href="/contact" className="px-12 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-[0.25em] rounded-sm transition-all shadow-2xl shadow-amber-500/20 flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book Private Viewing
                    </a>
                    <a href="tel:4165553548" className="px-12 py-5 border border-white/10 hover:border-amber-500/30 text-white/60 hover:text-amber-400 font-bold text-[11px] uppercase tracking-[0.25em] rounded-sm transition-all flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Concierge
                    </a>
                </div>
            </div>
        </section>
    </>
);
