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
        <div className="bg-slate-950 min-h-screen text-white">
            {/* Hero Image */}
            <div className="relative h-[70vh] bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-slate-700">Full-Bleed Property Image</span></div>
                <div className="absolute bottom-0 left-0 right-0 z-20 max-w-7xl mx-auto px-6 pb-12">
                    <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
                        <Link href="/" className="hover:text-amber-400">Home</Link><span>/</span>
                        <Link href="/listings" className="hover:text-amber-400">Collection</Link><span>/</span>
                        <span className="text-white/60">{item.title}</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter">{item.title}</h1>
                    <p className="text-white/40 mt-2">{item.address.street}, {item.address.city}</p>
                    <p className="text-amber-400 text-4xl font-black mt-4">{price}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-16">
                    <div className="grid grid-cols-4 gap-6">
                        {[{ l: 'Beds', v: item.bedrooms }, { l: 'Baths', v: item.bathrooms }, { l: 'Sq Ft', v: item.squareFeet?.toLocaleString() || '—' }, { l: 'Year', v: item.yearBuilt || '—' }].map(s => (
                            <div key={s.l} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl text-center">
                                <p className="text-3xl font-black text-white">{s.v}</p>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">{s.l}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-4">About the Residence</h2>
                        <p className="text-white/50 leading-relaxed">{item.description}</p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-6">Features</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[...item.features, ...item.amenities].map(f => (
                                <div key={f} className="p-3 border border-white/5 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-sm text-white/70">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="sticky top-24 p-8 bg-slate-900 border border-white/5 rounded-3xl">
                        <h3 className="text-lg font-black text-white mb-6">Private Viewing</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-amber-500 placeholder-white/20" />
                            <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-amber-500 placeholder-white/20" />
                            <input type="tel" placeholder="Phone" className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-amber-500 placeholder-white/20" />
                            <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-xl transition-all">Request Access</button>
                        </div>
                    </div>
                </div>
            </div>

            <section className="py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-2xl font-black text-white mb-8">From the Collection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {similar.map(l => <PropertyCard key={l.id} listing={l} variant="luxury" />)}
                    </div>
                </div>
            </section>
        </div>
    );
};
