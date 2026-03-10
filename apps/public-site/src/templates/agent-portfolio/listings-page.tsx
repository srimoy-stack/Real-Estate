'use client';

import React, { useState } from 'react';
import { PropertyCard, mockListings } from '../shared';

export const ListingsPage: React.FC = () => {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    return (
        <div className="py-12 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My Listings</h1>
                        <p className="text-slate-400 mt-2">{mockListings.length} properties currently represented</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                        <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>
                {view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockListings.map(l => <PropertyCard key={l.id} listing={l} variant="default" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mockListings.map(l => <PropertyCard key={l.id} listing={l} variant="compact" />)}
                    </div>
                )}
            </div>
        </div>
    );
};
