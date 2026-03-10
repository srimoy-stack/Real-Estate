'use client';

import React from 'react';
import Link from 'next/link';
import { Listing, ListingStatus } from '@repo/types';
import { mockListings, PropertyCard } from '../shared';

interface ListingDetailPageProps {
    listing?: Listing;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ listing }) => {
    const item = listing || mockListings[0];
    const price = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(item.price);
    const similar = mockListings.filter(l => l.id !== item.id).slice(0, 3);

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/listings" className="hover:text-indigo-600 transition-colors">Listings</Link>
                    <span>/</span>
                    <span className="text-slate-600 font-medium">{item.title}</span>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="max-w-7xl mx-auto px-6 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                    <div className="bg-slate-100 rounded-3xl flex items-center justify-center"><span className="text-slate-400">Main Image</span></div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-slate-100 rounded-2xl flex items-center justify-center"><span className="text-slate-400 text-sm">Photo {i}</span></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.status === ListingStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : item.status === ListingStatus.SOLD ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                {item.status}
                            </span>
                            <span className="text-slate-400 text-sm">{item.propertyType}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{item.title}</h1>
                        <p className="text-slate-400 mt-1">{item.address.street}, {item.address.city}, {item.address.province}</p>
                        <p className="text-indigo-600 text-3xl font-black mt-4">{price}</p>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Bedrooms', value: item.bedrooms },
                            { label: 'Bathrooms', value: item.bathrooms },
                            { label: 'Sq. Ft.', value: item.squareFeet?.toLocaleString() || 'N/A' },
                            { label: 'Year Built', value: item.yearBuilt || 'N/A' },
                        ].map(s => (
                            <div key={s.label} className="p-4 bg-slate-50 rounded-2xl text-center">
                                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-4">About This Property</h2>
                        <p className="text-slate-500 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Features */}
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-4">Features & Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[...item.features, ...item.amenities].map(f => (
                                <div key={f} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                    <span className="text-indigo-600">✓</span>
                                    <span className="text-sm text-slate-700 font-medium">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="sticky top-24 space-y-6">
                        <div className="p-6 border border-slate-200 rounded-3xl bg-white shadow-xl">
                            <h3 className="text-lg font-black text-slate-900 mb-4">Schedule a Viewing</h3>
                            <div className="space-y-3">
                                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                                <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                                <input type="tel" placeholder="Phone" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                                <textarea placeholder="Message" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none" />
                                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200">Request Viewing</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-8">Similar Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {similar.map(l => <PropertyCard key={l.id} listing={l} variant="default" />)}
                    </div>
                </div>
            </section>
        </div>
    );
};
