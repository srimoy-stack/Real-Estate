'use client';

import React, { useState, useEffect } from 'react';
import { Listing, ListingFilters } from '@repo/types';
import { listingService } from '@repo/services';
import { UnifiedPropertyCard } from '@/components/ui';

interface SearchGridProps {
    initialListings: Listing[];
    filters: ListingFilters;
}

export const SearchGrid = ({ initialListings, filters }: SearchGridProps) => {
    const [listings, setListings] = useState<Listing[]>(initialListings);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    // Reset when filters change (initialListings will change because the page is a server component)
    useEffect(() => {
        setListings(initialListings);
        setPage(1);
        // We don't have totalCount in props, so we'll fetch metadata if initialListings is exactly the limit
        if (initialListings.length === (filters.limit || 12)) {
            setHasMore(true); // Tentative
        } else {
            setHasMore(false);
        }
    }, [initialListings, filters.limit]);

    const loadMore = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const nextPage = page + 1;

        try {
            const response = await listingService.search({
                ...filters,
                page: nextPage,
                limit: 12
            });

            if (response.success && response.data) {
                const newListings = response.data;
                const { pagination } = response;

                setListings(prev => [...prev, ...newListings]);
                setPage(nextPage);
                setHasMore(nextPage < (pagination?.totalPages || 0));
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more listings:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    if (listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 rounded-[48px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8">
                    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="text-3xl font-black text-slate-900 italic mb-3">No properties found</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Try adjusting your filters for more results</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((listing, index) => (
                    <div
                        key={listing.id}
                        className="animate-in fade-in slide-in-from-bottom-10 duration-700"
                        style={{ animationDelay: `${(index % 6) * 100}ms` }}
                    >
                        <UnifiedPropertyCard listing={listing} index={index} />
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="group relative px-12 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10">
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : 'Explore More Results'}
                        </span>
                        <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                </div>
            )}
        </div>
    );
};
