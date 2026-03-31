'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { savedListingsService, listingService } from '@repo/services';
import { Listing } from '@repo/types';
import { UnifiedPropertyCard } from '@/components/ui';

export default function SavedListingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, hasHydrated } = useAuth();
    const [savedListings, setSavedListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.push('/login?redirect=/saved-listings');
            return;
        }

        if (isAuthenticated && user) {
            const fetchSavedListings = async () => {
                setLoading(true);
                try {
                    const savedRecords = await savedListingsService.getSavedListings(user.id);
                    
                    // Fetch full listing details for each saved record
                    const listingsPromises = savedRecords.map(async (record) => {
                        // Using search with id filter or getByMLS if listingId is mlsNumber
                        // Based on the data model, listingId could be either. 
                        // In our mock, we use the MLS number or internal ID.
                        const res = await listingService.getByMLS(record.listingId);
                        return res;
                    });

                    const results = await Promise.all(listingsPromises);
                    setSavedListings(results.filter((l): l is Listing => !!l));
                } catch (error) {
                    console.error('Failed to fetch saved listings:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchSavedListings();
        }
    }, [isAuthenticated, user, hasHydrated, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-64 bg-slate-100 rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[4/3] bg-slate-50 rounded-[32px]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 space-y-4">
                    <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
                        <span className="w-12 h-px bg-indigo-600"></span>
                        Personal Collection
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic">
                        Your Saved <span className="text-indigo-600">Listings</span>.
                    </h1>
                </div>

                {savedListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {savedListings.map((listing) => (
                            <div 
                                key={listing.id} 
                                className="animate-in fade-in slide-in-from-bottom-10 duration-700"
                            >
                                <UnifiedPropertyCard listing={listing} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 rounded-[48px] bg-slate-50 border border-slate-100 text-center px-6">
                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-xl">
                            <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 italic mb-3">You have no saved listings yet.</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-10 max-w-md">
                            Start exploring our exclusive portfolio to curate your favorites.
                        </p>
                        <button 
                            onClick={() => router.push('/search')}
                            className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
                        >
                            Browse Listings
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
