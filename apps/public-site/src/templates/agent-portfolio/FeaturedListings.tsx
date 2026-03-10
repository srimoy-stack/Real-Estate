'use client';
// Dummy comment

import React from 'react';
import Link from 'next/link';
import { mockListings } from '../shared';
import { ListingCard } from './listing-card';

export const FeaturedListings: React.FC = () => {
    const featured = mockListings.slice(0, 3);

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px w-12 bg-amber-400" />
                    <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">Portfolio</span>
                </div>
                <div className="flex items-end justify-between mb-14">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            Featured <span className="italic text-amber-500">Listings</span>
                        </h2>
                        <p className="text-slate-400 mt-3 text-lg max-w-xl">
                            Handpicked properties from my exclusive portfolio — each one personally vetted and ready for viewing.
                        </p>
                    </div>
                    <Link
                        href="/listings"
                        className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                    >
                        View All
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>

                {/* Listing grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featured.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="text-center mt-12 md:hidden">
                    <Link
                        href="/listings"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg"
                    >
                        View All Listings
                    </Link>
                </div>
            </div>
        </section>
    );
};
