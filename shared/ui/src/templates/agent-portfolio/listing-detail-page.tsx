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
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="text-sm text-slate-400 mb-6">
                    <Link href="/" className="hover:text-slate-900">Home</Link> / <Link href="/listings" className="hover:text-slate-900">My Listings</Link> / <span className="text-slate-600">{item.title}</span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-10 h-[450px]">
                    <div className="col-span-2 bg-slate-100 rounded-2xl flex items-center justify-center"><span className="text-slate-400">Main Image</span></div>
                    <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-[calc(50%-0.5rem)] bg-slate-100 rounded-xl flex items-center justify-center"><span className="text-slate-400 text-sm">Photo</span></div>)}</div>
                    <div className="space-y-4">{[3, 4].map(i => <div key={i} className="h-[calc(50%-0.5rem)] bg-slate-100 rounded-xl flex items-center justify-center"><span className="text-slate-400 text-sm">Photo</span></div>)}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{item.title}</h1>
                            <p className="text-slate-400 mt-1">{item.address}, {item.city}, {item.province}</p>
                            <p className="text-indigo-600 text-2xl font-black mt-3">{price}</p>
                        </div>
                        <div className="flex gap-6 py-4 border-y border-slate-100">
                            {[{ l: 'Beds', v: item.bedrooms }, { l: 'Baths', v: item.bathrooms }, { l: 'Sq Ft', v: item.squareFeet?.toLocaleString() || '—' }, { l: 'Year', v: item.yearBuilt || '—' }].map(s => (
                                <div key={s.l}><p className="text-xl font-black text-slate-900">{s.v}</p><p className="text-xs text-slate-400">{s.l}</p></div>
                            ))}
                        </div>
                        <p className="text-slate-500 leading-relaxed">{item.description}</p>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Features</h3>
                            <div className="flex flex-wrap gap-2">{[...item.features, ...item.amenities].map(f => <span key={f} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600">{f}</span>)}</div>
                        </div>
                    </div>
                    <div>
                        <div className="sticky top-24 p-6 border border-slate-200 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center"><span className="text-indigo-600 font-black text-xl">S</span></div>
                                <div>
                                    <p className="font-bold text-slate-900">Sarah Mitchell</p>
                                    <p className="text-slate-400 text-sm">Senior Agent</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500" />
                                <input type="email" placeholder="Your Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500" />
                                <textarea placeholder="I'm interested in this property..." rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none" />
                                <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all">Contact Sarah</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-8">More From Sarah</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{similar.map(l => <PropertyCard key={l.id} listing={l} />)}</div>
                </div>
            </section>
        </div>
    );
};
