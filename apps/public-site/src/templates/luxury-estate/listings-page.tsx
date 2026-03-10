'use client';

import React, { useState } from 'react';
import { PropertyCard, mockListings } from '../shared';

export const ListingsPage: React.FC = () => {
    const [sort, setSort] = useState('price-desc');
    const sorted = [...mockListings].sort((a, b) => sort === 'price-desc' ? b.price - a.price : a.price - b.price);

    return (
        <div className="py-16 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-16">
                    <div>
                        <div className="flex items-center gap-4 mb-4"><div className="h-px w-12 bg-amber-500" /><span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Portfolio</span></div>
                        <h1 className="text-5xl font-black text-white tracking-tighter italic">The Collection</h1>
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value)} className="bg-slate-900 border border-white/10 text-white/60 text-xs px-4 py-2 rounded-lg outline-none cursor-pointer">
                        <option value="price-desc">Price: High to Low</option>
                        <option value="price-asc">Price: Low to High</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sorted.map(l => <PropertyCard key={l.id} listing={l} variant="luxury" />)}
                </div>
            </div>
        </div>
    );
};
