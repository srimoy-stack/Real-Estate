'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { userSavedItemService, listingQueryApi } from '@repo/services';
import { Listing } from '@repo/types';
import { UnifiedPropertyCard } from '@/components/ui';

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
                const fullListings = await Promise.all(
                    listingsRes.map(async (sl: any) => {
                        const l = await listingQueryApi.getListingByMlsId(sl.listingId);
                        if (!l) return null;
                        return l as unknown as Listing;
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

    const handleRemoveListing = async (e: React.MouseEvent, mlsNumber: string) => {
        e.stopPropagation();
        if (!user) return;
        await userSavedItemService.removeSavedListing(user.id, mlsNumber);
        setSavedListings(prev => prev.filter(l => l.mlsNumber !== mlsNumber));
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[32px] animate-pulse border border-slate-100" />
                ))}
            </div>
        );
    }

    if (savedListings.length === 0) {
        return (
            <div className="relative py-40 text-center bg-slate-50/50 rounded-[64px] border-2 border-dashed border-slate-200/60 overflow-hidden group">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <img 
                        src="https://images.unsplash.com/photo-1600607687940-c52fb036999c?q=80&w=2000&auto=format&fit=crop" 
                        className="w-full h-full object-cover"
                        alt=""
                    />
                </div>
                
                <div className="relative z-10 space-y-8 max-w-lg mx-auto px-6">
                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 flex items-center justify-center mx-auto text-4xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                        🏰
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Your collection is <span className="text-[#4F46E5] italic">empty</span></h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            North America&apos;s most exclusive properties are waiting. Start curating your personal real estate portfolio today.
                        </p>
                    </div>
                    <div className="pt-4">
                        <button 
                            onClick={() => router.push('/buy')} 
                            className="h-16 px-12 bg-slate-900 text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-[#4F46E5] hover:shadow-[#4F46E5]/20 transition-all active:scale-95"
                        >
                            Explore Portfolio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {savedListings.map((listing, i) => (
                <div key={listing.mlsNumber || listing.id} className="relative group/card">
                    <button
                        onClick={(e) => handleRemoveListing(e, listing.mlsNumber)}
                        className="absolute top-4 right-4 z-20 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all scale-0 group-hover/card:scale-100 active:scale-90"
                        title="Remove from collection"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    
                    <UnifiedPropertyCard 
                        listing={listing} 
                        index={i} 
                    />
                </div>
            ))}
        </div>
    );
}
