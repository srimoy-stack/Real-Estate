'use client';

import React from 'react';
import { PropertyCard, mockListings } from '../shared';

export const ListingsPage: React.FC = () => (
    <div className="py-16 bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-4xl font-light text-slate-900">Properties</h1>
            <div className="h-px w-16 bg-slate-900 mt-6 mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {mockListings.map(l => <PropertyCard key={l.id} listing={l} variant="minimal" />)}
            </div>
        </div>
    </div>
);
