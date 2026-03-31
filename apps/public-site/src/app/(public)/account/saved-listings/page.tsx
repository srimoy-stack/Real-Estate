'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { SafeImage } from '@/components/ui';
import { userSavedItemService, listingQueryApi } from '@repo/services';
import { Listing } from '@repo/types';

export default function SavedListingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [savedListings, setSavedListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const listingsRes = await userSavedItemService.getSavedListings(user.id);
                // Fetch actual listing data for the saved listing IDs
                const fullListings = await Promise.all(
                    listingsRes.map(async (sl) => {
                        const l = await listingQueryApi.getListingByMlsId(sl.listingId);
                        if (!l) return null;

                        // Map InternalListing to Listing type
                        return {
                            ...l,
                            slug: l.mlsNumber,
                            title: l.address,
                            mainImage: l.images[0] || '',
                            status: l.status.toUpperCase().replace(' ', '_'), // Crude mapping for Status enum
                        } as unknown as Listing;
                    })
                );
                setSavedListings(fullListings.filter(Boolean) as Listing[]);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleRemoveListing = async (mlsNumber: string) => {
        if (!user) return;
        await userSavedItemService.removeSavedListing(user.id, mlsNumber);
        setSavedListings(prev => prev.filter(l => l.mlsNumber !== mlsNumber));
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-96 bg-white rounded-[40px] animate-pulse shadow-sm" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedListings.map(listing => (
                <div key={listing.id} className="group relative bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100">
                    <div className="aspect-[4/3] bg-slate-200 overflow-hidden relative">
                        <SafeImage
                            src={listing.mainImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                            alt={listing.address}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest">
                            {listing.city}
                        </div>
                        <button
                            onClick={() => handleRemoveListing(listing.mlsNumber)}
                            className="absolute top-6 right-6 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-all scale-0 group-hover:scale-100"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    <div className="p-8 space-y-4">
                        <div>
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">{listing.propertyType}</p>
                            <h3 className="text-xl font-black text-slate-900 line-clamp-1">{listing.title || listing.address}</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-black text-slate-900">${listing.price.toLocaleString()}</p>
                            <div className="flex gap-4">
                                <span className="text-[10px] font-bold text-slate-400">🛏️ {listing.bedrooms}</span>
                                <span className="text-[10px] font-bold text-slate-400">🛁 {listing.bathrooms}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                            <button
                                onClick={() => router.push(`/listing/${listing.mlsNumber}`)}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {savedListings.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-100 space-y-6">
                    <div className="text-6xl mx-auto">🏘️</div>
                    <div className="space-y-2">
                        <p className="text-2xl font-black text-slate-900">No properties saved yet</p>
                        <p className="text-slate-500 font-medium italic">Start exploring our premium listings to find your dream home.</p>
                    </div>
                    <button onClick={() => router.push('/listings')} className="px-8 py-4 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                        Explore Listings
                    </button>
                </div>
            )}
        </div>
    );
}
