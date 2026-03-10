'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@repo/types';
import { mockListings, PropertyCard } from '../shared';

interface Props { listing?: Listing; }

export const ListingDetailPage: React.FC<Props> = ({ listing }) => {
    const item = listing || mockListings[0];
    const price = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(item.price);
    const similar = mockListings.filter(l => l.id !== item.id).slice(0, 3);

    return (
        <div className="bg-white min-h-screen">
            <div className="bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-3 text-sm text-slate-400">
                    <Link href="/" className="hover:text-blue-700">Home</Link> / <Link href="/listings" className="hover:text-blue-700">Properties</Link> / <span className="text-slate-600">{item.title}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-3 mb-8 h-[400px]">
                    <div className="col-span-2 bg-slate-100 rounded-lg flex items-center justify-center"><span className="text-slate-400">Main Image</span></div>
                    <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-[calc(50%-0.375rem)] bg-slate-100 rounded-lg flex items-center justify-center"><span className="text-slate-400 text-sm">Photo</span></div>)}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-16">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>
                                <p className="text-slate-500 mt-1">{item.address.street}, {item.address.city}, {item.address.province} {item.address.postalCode}</p>
                            </div>
                            <p className="text-blue-700 text-3xl font-black">{price}</p>
                        </div>

                        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            {[{ l: 'Bedrooms', v: item.bedrooms }, { l: 'Bathrooms', v: item.bathrooms }, { l: 'Area (sqft)', v: item.squareFeet?.toLocaleString() || '—' }, { l: 'Year Built', v: item.yearBuilt || '—' }].map(s => (
                                <div key={s.l} className="text-center">
                                    <p className="text-xl font-bold text-slate-900">{s.v}</p>
                                    <p className="text-xs text-slate-500 mt-1">{s.l}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">Property Description</h2>
                            <p className="text-slate-600 leading-relaxed">{item.description}</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">Features & Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {[...item.features, ...item.amenities].map(f => <div key={f} className="flex items-center gap-2 py-2"><span className="text-blue-700">•</span><span className="text-sm text-slate-600">{f}</span></div>)}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="sticky top-20 border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Inquire About This Property</h3>
                            <div className="space-y-3">
                                <input type="text" placeholder="Full Name" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                <input type="email" placeholder="Email Address" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                <textarea rows={3} placeholder="Your message..." className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" />
                                <button className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-all">Submit Inquiry</button>
                            </div>
                            <p className="text-xs text-slate-400 mt-4 text-center">Or call us at 1-800-REALTY</p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">Similar Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{similar.map(l => <PropertyCard key={l.id} listing={l} variant="corporate" />)}</div>
                </div>
            </section>
        </div>
    );
};
