'use client';

import React from 'react';
import { mockListings } from '../shared';
import { LuxuryListingCard } from './luxury-listing-card';

export const FeaturedLuxuryListings: React.FC = () => {
    const featured = mockListings.slice(0, 6);

    return (
        <section className="py-32 bg-slate-950 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.02] to-transparent" />

            <div className="max-w-[1400px] mx-auto px-8 relative z-10">
                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-16 bg-amber-500" />
                            <span className="text-amber-400/80 text-[11px] font-black uppercase tracking-[0.4em]">Curated Selection</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                            Featured <span className="text-amber-400 italic">Luxury</span>
                            <br />Listings
                        </h2>
                        <p className="text-white/30 text-lg mt-4 max-w-md font-light">Handpicked properties from our exclusive portfolio, representing the pinnacle of real estate.</p>
                    </div>
                    <a
                        href="/listings"
                        className="mt-8 md:mt-0 inline-flex items-center gap-3 text-amber-400 text-[11px] font-black uppercase tracking-[0.25em] hover:text-amber-300 group transition-colors"
                    >
                        View All Properties
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {featured.map((listing, i) => (
                        <LuxuryListingCard
                            key={listing.id}
                            listing={listing}
                            variant={i < 2 ? 'large' : 'standard'}
                        />
                    ))}
                </div>

                {/* Bottom accent */}
                <div className="flex items-center justify-center mt-20">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                </div>
            </div>
        </section>
    );
};
