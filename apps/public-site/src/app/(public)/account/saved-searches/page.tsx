'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { userSavedItemService } from '@repo/services';
import { SavedSearch } from '@repo/types';

export default function SavedSearchesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const searchesRes = await userSavedItemService.getSavedSearches(user.id);
                setSavedSearches(searchesRes);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleRemoveSearch = async (id: string) => {
        await userSavedItemService.removeSavedSearch(id);
        setSavedSearches(prev => prev.filter(s => s.id !== id));
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-64 bg-white rounded-[40px] animate-pulse shadow-sm" />
                ))}
            </div>
        );
    }

    return (
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
    );
}
