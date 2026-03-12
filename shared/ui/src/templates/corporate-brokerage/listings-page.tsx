'use client';

import React, { useState } from 'react';
import { PropertyCard, mockListings } from '../shared';
import { PropertyType } from '@repo/types';

export const ListingsPage: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? mockListings : mockListings.filter(l => l.propertyType === filter);

    return (
        <div className="py-12 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Property Search</h1>
                <p className="text-slate-500 mb-8">Browse {mockListings.length} properties across our network.</p>

                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 flex flex-wrap gap-3 items-center">
                    <input type="text" placeholder="Search by city, address, or MLS#..." className="flex-1 min-w-[200px] px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer">
                        <option value="all">All Types</option>
                        <option value={PropertyType.CONDO}>Condo</option>
                        <option value={PropertyType.DETACHED}>Detached</option>
                        <option value={PropertyType.TOWNHOUSE}>Townhouse</option>
                        <option value={PropertyType.COMMERCIAL}>Commercial</option>
                    </select>
                    <button className="px-6 py-2 bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-600 transition-all">Search</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(l => <PropertyCard key={l.id} listing={l} variant="corporate" />)}
                </div>
            </div>
        </div>
    );
};
