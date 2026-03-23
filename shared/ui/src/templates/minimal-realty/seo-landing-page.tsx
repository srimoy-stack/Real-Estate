'use client';

import React from 'react';
import Link from 'next/link';
import { PropertyCard, mockListings } from '../shared';
import { PropertyType } from '@repo/types';

interface SeoLandingPageProps {
    config?: { city?: string; propertyType?: string; heading?: string; subheading?: string; };
}

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ config }) => {
    const city = config?.city || 'Toronto';
    const propertyType = config?.propertyType || 'Properties';
    const heading = config?.heading || `${propertyType} in ${city}`;

    const filtered = mockListings.filter(l => {
        if (config?.city && l.city.toLowerCase() !== config.city.toLowerCase()) return false;
        if (config?.propertyType && l.propertyType !== config.propertyType) return false;
        return true;
    });
    const listings = filtered.length > 0 ? filtered : mockListings;

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="py-24 border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Link href="/" className="hover:text-slate-900">Home</Link><span>/</span>
                        <Link href="/listings" className="hover:text-slate-900">Listings</Link><span>/</span>
                        <span className="text-slate-900">{city}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">{heading}</h1>
                    <p className="text-slate-400 mt-3">{config?.subheading || `${listings.length} properties available.`}</p>
                </div>
            </section>

            {/* Filters */}
            <section className="py-4 border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-4">
                    <select className="px-0 py-2 border-0 border-b border-slate-200 text-sm outline-none cursor-pointer bg-transparent">
                        <option>All areas</option><option>Leslieville</option><option>Roncesvalles</option><option>Riverdale</option>
                    </select>
                    <select className="px-0 py-2 border-0 border-b border-slate-200 text-sm outline-none cursor-pointer bg-transparent">
                        <option>All types</option>
                        <option value={PropertyType.CONDO}>Condo</option>
                        <option value={PropertyType.DETACHED}>House</option>
                        <option value={PropertyType.TOWNHOUSE}>Townhouse</option>
                    </select>
                    <select className="px-0 py-2 border-0 border-b border-slate-200 text-sm outline-none cursor-pointer bg-transparent">
                        <option>Any price</option><option>Under $500K</option><option>$500K — $1M</option><option>$1M+</option>
                    </select>
                </div>
            </section>

            {/* Grid */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {listings.map(l => <PropertyCard key={l.id} listing={l} variant="default" />)}
                    </div>
                </div>
            </section>

            {/* SEO Content */}
            <section className="py-16 border-t border-slate-200">
                <div className="max-w-3xl mx-auto px-6">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-4">About {city}</p>
                    <p className="text-slate-500 leading-relaxed">
                        {city} continues to attract buyers who value quality, community, and well-designed spaces. We curate listings that reflect these values — no noise, just properties worth your time. Contact us for a quiet conversation about your options.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 border-t border-slate-200">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-xl font-light text-slate-900">Not finding it?</h2>
                    <p className="text-slate-400 mt-3 mb-8 text-sm">We can set up a custom search for you.</p>
                    <a href="/contact" className="inline-block px-8 py-3 bg-slate-900 text-white text-sm hover:bg-slate-800 transition-all">Let's talk</a>
                </div>
            </section>
        </div>
    );
};
