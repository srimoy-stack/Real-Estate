'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { userSavedItemService, listingQueryApi } from '@repo/services';
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

        if (isAuthenticated && user?.id) {
            const fetchData = async () => {
                try {
                    const savedRecords = await userSavedItemService.getSavedListings(user.id);
                    const fullListings = await Promise.all(
                        savedRecords.map(async (record: any) => {
                            const l = await listingQueryApi.getListingByMlsId(record.listingId);
                            if (!l) return null;
                            return l as unknown as Listing;
                        })
                    );
                    setSavedListings(fullListings.filter(Boolean) as Listing[]);
                } catch (error) {
                    console.error('Failed to fetch saved listings:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        } else if (hasHydrated) {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id, hasHydrated, router]);

    const handleRemoveListing = async (e: React.MouseEvent, mlsNumber: string) => {
        e.stopPropagation();
        if (!user) return;
        await userSavedItemService.removeSavedListing(user.id, mlsNumber);
        setSavedListings((prev: Listing[]) => prev.filter((l: Listing) => l.mlsNumber !== mlsNumber));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen bg-[#FDFDFF] pt-24 pb-20 overflow-hidden">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-50/30 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Clean Production Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-12 border-b border-slate-100 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">
                                My Collections
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Saved <span className="text-indigo-600">Properties</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Total Assets</p>
                            <p className="text-xl font-black text-indigo-600 leading-none">{savedListings.length}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-100" />
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Status</p>
                            <p className="text-xl font-black text-emerald-500 leading-none truncate">Active</p>
                        </div>
                    </div>
                </div>

                {/* Property Grid */}
                {savedListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {savedListings.map((listing: Listing, i: number) => (
                            <div 
                                key={listing.mlsNumber || listing.id} 
                                className="relative group/card animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" 
                                style={{ animationDelay: `${i * 75}ms` }}
                            >
                                {/* Precise Floating Remove Button */}
                                <div className="absolute top-5 right-5 z-30 pointer-events-none group-hover/card:pointer-events-auto opacity-0 group-hover/card:opacity-100 transition-all duration-200">
                                    <button
                                        onClick={(e) => handleRemoveListing(e, listing.mlsNumber)}
                                        className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform scale-90 group-hover/card:scale-100 border border-slate-100"
                                        title="Remove"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <UnifiedPropertyCard listing={listing} index={i} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 space-y-6 max-w-md mx-auto px-6">
                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                                ✨
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Empty</h2>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                    You haven&apos;t saved any listings yet. Start exploring to curate your personal collection of architectural marvels.
                                </p>
                            </div>
                            <div className="pt-4">
                                <button 
                                    onClick={() => router.push('/search')} 
                                    className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                                >
                                    Browse Marketplace
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
