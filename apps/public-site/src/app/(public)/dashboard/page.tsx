'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@repo/auth';
import Image from 'next/image';
import { userSavedItemService, listingQueryApi } from '@repo/services';
import { SavedSearch, Listing } from '@repo/types';

export default function UserDashboard() {
    const router = useRouter();
    const { user, logout, hasHydrated } = useAuth();
    const [savedListings, setSavedListings] = useState<Listing[]>([]);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'listings' | 'searches'>('listings');

    useEffect(() => {
        if (hasHydrated && !user) {
            router.push('/login');
        }
    }, [user, hasHydrated, router]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [listingsRes, searchesRes] = await Promise.all([
                    userSavedItemService.getSavedListings(user.id),
                    userSavedItemService.getSavedSearches(user.id)
                ]);

                // Fetch actual listing data for the saved listing IDs
                const fullListings = await Promise.all(
                    listingsRes.map(async (sl) => {
                        const l = await listingQueryApi.getListingByMlsId(sl.listingId);
                        if (!l) return null;
                        return {
                            ...l,
                            slug: l.mlsNumber,
                            title: l.address,
                            mainImage: l.images[0] || '',
                            status: l.status.toUpperCase().replace(' ', '_'),
                        } as unknown as Listing;
                    })
                );

                setSavedListings(fullListings.filter(Boolean) as Listing[]);
                setSavedSearches(searchesRes);
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

    const handleRemoveSearch = async (id: string) => {
        await userSavedItemService.removeSavedSearch(id);
        setSavedSearches(prev => prev.filter(s => s.id !== id));
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 pt-16 pb-12 px-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-12 bg-emerald-600 rounded-full" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">User Dashboard</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-slate-900">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Real Estate</span> Hub
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                            Welcome back, <span className="text-slate-900 font-bold">{user.name}</span>. Manage your preferences and property alerts.
                        </p>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                        <button
                            onClick={() => setTab('listings')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'listings'
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Saved Listings
                        </button>
                        <button
                            onClick={() => setTab('searches')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'searches'
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Property Alerts
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 pt-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-96 bg-white rounded-[40px] animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {tab === 'listings' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {savedListings.map(listing => (
                                    <div key={listing.id} className="group relative bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100">
                                        <div className="aspect-[4/3] bg-slate-200 overflow-hidden relative">
                                            <Image
                                                src={listing.mainImage}
                                                alt={listing.title}
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
                                                <h3 className="text-xl font-black text-slate-900 line-clamp-1">{listing.title}</h3>
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
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {savedSearches.map(search => (
                                    <div key={search.id} className="p-10 bg-white rounded-[50px] shadow-sm border border-slate-100 space-y-8 group hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Active Alert</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900">{search.name}</h3>
                                                <p className="text-[11px] font-bold text-slate-400 italic">Saved on {new Date(search.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveSearch(search.id)}
                                                className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                            >
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {Object.entries(search.filters).map(([key, value]) => {
                                                if (!value || key === 'page' || key === 'limit') return null;
                                                return (
                                                    <div key={key} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                        <span className="text-slate-400 mr-2">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                                        {value.toString()}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="pt-8 border-t border-slate-50 flex gap-4">
                                            <button
                                                onClick={() => {
                                                    const params = new URLSearchParams();
                                                    Object.entries(search.filters).forEach(([k, v]) => v && params.append(k, v.toString()));
                                                    router.push(`/listings?${params.toString()}`);
                                                }}
                                                className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                            >
                                                Run Search
                                            </button>
                                            <button className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {savedSearches.length === 0 && (
                                    <div className="col-span-full py-32 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-100 space-y-6">
                                        <div className="text-6xl mx-auto">🔎</div>
                                        <div className="space-y-2">
                                            <p className="text-2xl font-black text-slate-900">No saved searches</p>
                                            <p className="text-slate-500 font-medium italic">Save your filters from the search page to receive instant property alerts.</p>
                                        </div>
                                        <button onClick={() => router.push('/listings')} className="px-8 py-4 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                                            Go to Search
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Account Settings Shortcut Card */}
            <div className="max-w-6xl mx-auto px-4 mt-20">
                <div className="p-12 bg-slate-900 rounded-[60px] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="space-y-4 relative">
                        <h2 className="text-4xl font-black tracking-tight">Account <span className="text-emerald-400 italic">Security</span></h2>
                        <p className="text-slate-400 font-medium max-w-md">Update your password, manage linked social accounts, and configure global notification settings.</p>
                    </div>
                    <div className="flex gap-4 relative">
                        <button className="px-8 py-5 bg-white text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all">
                            Manage Credentials
                        </button>
                        <button
                            onClick={() => logout()}
                            className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
