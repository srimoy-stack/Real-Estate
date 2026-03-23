'use client';

import React from 'react';
import { PropertyCard, mockListings } from '../shared';
import { PropertyType } from '@repo/types';

interface SeoLandingPageProps {
    config?: {
        city?: string;
        propertyType?: string;
        metaTitle?: string;
        metaDescription?: string;
        heading?: string;
        subheading?: string;
    };
}

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ config }) => {
    const city = config?.city || 'Toronto';
    const propertyType = config?.propertyType || 'All Properties';
    const heading = config?.heading || `${propertyType} for Sale in ${city}`;
    const subheading = config?.subheading || `Browse the latest ${propertyType.toLowerCase()} listings available in ${city} and surrounding areas.`;

    // Filter mock listings based on config
    const filtered = mockListings.filter(l => {
        if (config?.city && l.city.toLowerCase() !== config.city.toLowerCase()) return false;
        if (config?.propertyType && l.propertyType !== config.propertyType) return false;
        return true;
    });
    const listings = filtered.length > 0 ? filtered : mockListings;

    return (
        <div className="bg-white min-h-screen">
            {/* SEO Hero */}
            <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Real Estate Listings</p>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">{heading}</h1>
                    <p className="text-blue-200 max-w-3xl">{subheading}</p>
                    <div className="flex flex-wrap gap-2 mt-6">
                        {config?.city && <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full">📍 {config.city}</span>}
                        {config?.propertyType && <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full">🏠 {config.propertyType}</span>}
                        <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full">📋 {listings.length} Results</span>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 items-center">
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer bg-white">
                        <option>All Cities</option>
                        <option>Toronto</option>
                        <option>Mississauga</option>
                        <option>Muskoka</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer bg-white">
                        <option>All Types</option>
                        <option value={PropertyType.CONDO}>Condo</option>
                        <option value={PropertyType.DETACHED}>Detached</option>
                        <option value={PropertyType.TOWNHOUSE}>Townhouse</option>
                        <option value={PropertyType.COMMERCIAL}>Commercial</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer bg-white">
                        <option>Any Price</option>
                        <option>Under $500K</option>
                        <option>$500K — $1M</option>
                        <option>$1M — $3M</option>
                        <option>$3M+</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer bg-white">
                        <option>Sort: Newest</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                    </select>
                </div>
            </section>

            {/* Listings Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-sm text-slate-400 mb-6">Showing {listings.length} properties</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(l => <PropertyCard key={l.id} listing={l} variant="corporate" />)}
                    </div>
                </div>
            </section>

            {/* SEO Content */}
            <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">About {propertyType} in {city}</h2>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-500 leading-relaxed mb-4">
                            {city} is one of Canada's most dynamic real estate markets, offering a diverse range of property types for buyers at every price point. Whether you're looking for a modern downtown condo, a spacious family home in the suburbs, or a commercial investment opportunity, {city}'s market has something for everyone.
                        </p>
                        <p className="text-slate-500 leading-relaxed mb-4">
                            Our team of experienced advisors specializes in helping clients navigate the {city} real estate landscape. With deep local knowledge and a commitment to professional excellence, we deliver results that consistently exceed expectations.
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            Contact our office today for a complimentary consultation and discover why thousands of Canadians trust CorporateBrokerage for their real estate needs.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 bg-blue-700">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-black text-white">Can't Find What You're Looking For?</h2>
                    <p className="text-blue-200 mt-2 mb-6">Our advisors have access to exclusive off-market listings.</p>
                    <a href="/contact" className="inline-block px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg">Contact an Advisor</a>
                </div>
            </section>
        </div>
    );
};
