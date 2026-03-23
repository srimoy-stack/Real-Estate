'use client';

import React from 'react';
import { Listing } from '@repo/types';
import { PropertyCard } from './PropertyCard';

export interface FeaturedListingsProps {
    listings: Listing[];
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate';
    title?: string;
    subtitle?: string;
}

import { mockListings } from './mock-data';

export const FeaturedListings: React.FC<FeaturedListingsProps & { id?: string }> = ({
    listings,
    variant = 'default',
    title = 'Featured Properties',
    subtitle = 'Handpicked selections from our premium collection.',
    id,
}) => {
    const displayListings = (listings && listings.length > 0) ? listings : mockListings;


    if (variant === 'luxury') {
        return (
            <section id={id || 'listings'} className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-amber-500" />
                        <span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Curated</span>
                    </div>
                    <div className="flex items-end justify-between mb-16">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">{title}</h2>
                            <p className="text-white/40 mt-3 text-lg">{subtitle}</p>
                        </div>
                        <a href="/listings" className="text-amber-400 text-sm font-bold hover:text-amber-300 transition-colors hidden md:block">View All →</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayListings.slice(0, 6).map(l => <PropertyCard key={l.id} listing={l} variant="luxury" />)}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'corporate') {
        return (
            <section id={id || 'listings'} className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                        <p className="text-slate-500 mt-2 max-w-lg mx-auto">{subtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayListings.slice(0, 6).map(l => <PropertyCard key={l.id} listing={l} variant="corporate" />)}
                    </div>
                    <div className="text-center mt-12">
                        <a href="/listings" className="px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-200">View All Listings</a>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'minimal') {
        return (
            <section id={id || 'listings'} className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-light text-slate-900 tracking-tight">{title}</h2>
                    <div className="h-px w-16 bg-slate-300 mt-6 mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {displayListings.slice(0, 6).map(l => <PropertyCard key={l.id} listing={l} variant="minimal" />)}
                    </div>
                </div>
            </section>
        );
    }

    // Default
    return (
        <section id={id || 'listings'} className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.3em]">Explore</span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-3">{title}</h2>
                    <p className="text-slate-400 mt-3 max-w-lg mx-auto">{subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayListings.slice(0, 6).map(l => <PropertyCard key={l.id} listing={l} variant="default" />)}
                </div>
                <div className="text-center mt-12">
                    <a href="/listings" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-indigo-200 inline-block">View All Properties</a>
                </div>
            </div>
        </section>
    );
};
