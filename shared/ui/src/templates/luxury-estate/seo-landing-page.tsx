'use client';

import React from 'react';
import { PropertyCard, mockListings } from '../shared';
import { PropertyType } from '@repo/types';

interface SeoLandingPageProps {
    config?: { city?: string; propertyType?: string; heading?: string; subheading?: string; };
}

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ config }) => {
    const city = config?.city || 'Toronto';
    const propertyType = config?.propertyType || 'Luxury Estates';
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
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900" />
                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <span>Home</span><span>/</span><span>Collection</span><span>/</span><span className="text-amber-400">{city}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: 'Georgia, serif' }}>{heading}</h1>
                    <p className="text-slate-400 mt-3 max-w-2xl">{config?.subheading || `Explore our curated selection of ${propertyType.toLowerCase()} in ${city}.`}</p>
                    <div className="flex flex-wrap gap-2 mt-6">
                        {config?.city && <span className="px-3 py-1 bg-white/5 border border-white/10 text-white text-xs rounded-full">📍 {city}</span>}
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">📋 {listings.length} Properties</span>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3">
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer bg-white">
                        <option>All Areas</option><option>Bridle Path</option><option>Forest Hill</option><option>Rosedale</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer bg-white">
                        <option>All Types</option>
                        <option value={PropertyType.DETACHED}>Estate</option>
                        <option value={PropertyType.CONDO}>Penthouse</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer bg-white">
                        <option>$3M+</option><option>$5M+</option><option>$10M+</option>
                    </select>
                </div>
            </section>

            {/* Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map(l => <PropertyCard key={l.id} listing={l} variant="luxury" />)}
                    </div>
                </div>
            </section>

            {/* SEO Content */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl text-slate-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>Luxury Real Estate in {city}</h2>
                    <p className="text-slate-500 leading-relaxed mb-4">
                        {city}'s luxury market remains one of the most resilient and sought-after in North America. From grand estates in Bridle Path to waterfront penthouses overlooking the harbour, the city offers an unparalleled selection of premium properties for the most discerning buyers.
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                        Our team of senior advisors maintains exclusive relationships with property owners and developers, giving our clients access to listings that are never publicly marketed. Contact our concierge for a private consultation.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-slate-900">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl text-white" style={{ fontFamily: 'Georgia, serif' }}>Seeking Off-Market Properties?</h2>
                    <p className="text-slate-400 mt-2 mb-6">Our most exclusive listings are shared only with qualified buyers.</p>
                    <a href="/contact" className="inline-block px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-all">Request Access</a>
                </div>
            </section>
        </div>
    );
};
