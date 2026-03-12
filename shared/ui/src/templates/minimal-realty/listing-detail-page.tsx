'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@repo/types';
import { mockListings, PropertyCard } from '../shared';

interface Props { listing?: Listing; }

export const ListingDetailPage: React.FC<Props> = ({ listing }) => {
    const item = listing || mockListings[0];
    const price = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(item.price);
    const similar = mockListings.filter(l => l.id !== item.id).slice(0, 2);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="text-sm text-slate-400 mb-8">
                    <Link href="/" className="hover:text-slate-900">Home</Link> / <Link href="/listings" className="hover:text-slate-900">Properties</Link> / <span className="text-slate-600">{item.title}</span>
                </div>

                <div className="aspect-[16/7] bg-slate-100 rounded-lg mb-10 flex items-center justify-center">
                    <span className="text-slate-400">Property Image</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-20">
                    <div className="lg:col-span-2 space-y-10">
                        <div>
                            <h1 className="text-3xl font-light text-slate-900">{item.title}</h1>
                            <p className="text-slate-400 mt-2">{item.address}, {item.city}</p>
                            <p className="text-slate-900 text-2xl font-medium mt-4">{price}</p>
                        </div>

                        <div className="flex gap-10 py-6 border-y border-slate-100">
                            {[{ l: 'Beds', v: item.bedrooms }, { l: 'Baths', v: item.bathrooms }, { l: 'Area', v: item.squareFeet ? `${item.squareFeet.toLocaleString()} sqft` : '—' }, { l: 'Built', v: item.yearBuilt || '—' }].map(s => (
                                <div key={s.l}><p className="text-lg font-medium text-slate-900">{s.v}</p><p className="text-xs text-slate-400 mt-0.5">{s.l}</p></div>
                            ))}
                        </div>

                        <p className="text-slate-500 leading-relaxed">{item.description}</p>

                        <div>
                            <h3 className="text-lg font-medium text-slate-900 mb-4">Features</h3>
                            <ul className="space-y-2">
                                {[...item.features, ...item.amenities].map(f => <li key={f} className="text-sm text-slate-500 flex items-center gap-3"><span className="w-1 h-1 bg-slate-300 rounded-full" />{f}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <div className="sticky top-24 space-y-6">
                            <div className="border border-slate-200 rounded-lg p-6">
                                <h3 className="font-medium text-slate-900 mb-4">Inquire</h3>
                                <div className="space-y-3">
                                    <input type="text" placeholder="Name" className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400" />
                                    <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400" />
                                    <textarea placeholder="Message" rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 resize-none" />
                                    <button className="w-full py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-16 pb-8">
                    <h2 className="text-2xl font-light text-slate-900 mb-8">More Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">{similar.map(l => <PropertyCard key={l.id} listing={l} variant="minimal" />)}</div>
                </div>
            </div>
        </div>
    );
};
