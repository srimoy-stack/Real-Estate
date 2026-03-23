'use client';

import React from 'react';
import { PropertyCard, mockListings } from '../shared';
import { PropertyType } from '@repo/types';

interface SeoLandingPageProps {
    config?: { city?: string; propertyType?: string; heading?: string; subheading?: string; };
}

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ config }) => {
    const city = config?.city || 'North York';
    const propertyType = config?.propertyType || 'Homes';
    const heading = config?.heading || `${propertyType} for Sale in ${city}`;

    const filtered = mockListings.filter(l => {
        if (config?.city && l.city.toLowerCase() !== config.city.toLowerCase()) return false;
        if (config?.propertyType && l.propertyType !== config.propertyType) return false;
        return true;
    });
    const listings = filtered.length > 0 ? filtered : mockListings;

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-slate-800 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-teal-200 text-xs uppercase tracking-widest mb-3">Curated Listings</p>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">{heading}</h1>
                    <p className="text-teal-100 max-w-2xl">{config?.subheading || `Browse my curated selection of ${propertyType.toLowerCase()} in ${city}.`}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full">📍 {city}</span>
                        <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full">📋 {listings.length} Results</span>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3">
                    <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer">
                        <option>All Areas</option><option>North York</option><option>Scarborough</option><option>Mississauga</option>
                    </select>
                    <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer">
                        <option>All Types</option>
                        <option value={PropertyType.CONDO}>Condo</option>
                        <option value={PropertyType.DETACHED}>Detached</option>
                        <option value={PropertyType.TOWNHOUSE}>Townhouse</option>
                    </select>
                    <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer">
                        <option>Any Price</option><option>Under $500K</option><option>$500K — $1M</option><option>$1M+</option>
                    </select>
                </div>
            </section>

            {/* Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(l => <PropertyCard key={l.id} listing={l} variant="default" />)}
                    </div>
                </div>
            </section>

            {/* SEO Content */}
            <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">{propertyType} in {city}</h2>
                    <p className="text-slate-500 leading-relaxed mb-4">
                        {city} offers a diverse real estate landscape with options for first-time buyers, growing families, and investors. With strong transit connections, excellent schools, and vibrant communities, it remains one of the GTA's most popular areas.
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                        As a local specialist, I can provide insider knowledge and off-market opportunities that you won't find elsewhere. Contact me for a personalized consultation.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 bg-teal-600">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-black text-white">Can't Find What You Want?</h2>
                    <p className="text-teal-100 mt-2 mb-6">I can set up custom alerts for new listings matching your criteria.</p>
                    <a href="/contact" className="inline-block px-8 py-3 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all shadow-lg">Contact Me</a>
                </div>
            </section>
        </div>
    );
};
