'use client';

import React, { useState } from 'react';
import { PropertyCard, mockListings } from '../shared';
import { PropertyType } from '@repo/types';

export const ListingsPage: React.FC = () => {
    const [filter, setFilter] = useState<string>('all');
    const filtered = filter === 'all' ? mockListings : mockListings.filter(l => l.propertyType === filter);

    return (
        <div className="py-12 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">All Properties</h1>
                    <p className="text-slate-400 mt-2">Discover your perfect property from our extensive collection.</p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {[{ label: 'All', value: 'all' }, { label: 'Condo', value: PropertyType.CONDO }, { label: 'Detached', value: PropertyType.DETACHED }, { label: 'Townhouse', value: PropertyType.TOWNHOUSE }, { label: 'Commercial', value: PropertyType.COMMERCIAL }].map(f => (
                        <button key={f.value} onClick={() => setFilter(f.value)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === f.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{f.label}</button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map(l => <PropertyCard key={l.id} listing={l} variant="default" />)}
                </div>
                {filtered.length === 0 && <p className="text-center text-slate-400 py-20">No properties match your filter.</p>}
            </div>
        </div>
    );
};
