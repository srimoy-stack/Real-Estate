'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { ListingCard } from './components/ListingCard';
import { ListingGridSkeleton } from './components/Skeletons';
import { EmptyState, ErrorState } from './components/StateDisplays';
import { fetchAggregatedListings, scoreListing } from './api';

import { MLSProperty, FilterState, DEFAULT_FILTERS } from './types';
import { resolveGeoBounds } from './utils';
import { MapPlaceholder } from './components/MapPlaceholder';
import { useSearchParams, useRouter } from 'next/navigation';

// Standardized page size for API and UI
// Standardized page size for API and UI
const PAGE_SIZE = 90;

export default function ListingsDemoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [filters, setFilters] = useState<FilterState>(() => ({
        ...DEFAULT_FILTERS,
        searchQuery: searchParams.get('q') || '',
        city: searchParams.get('city') || 'Toronto'
    }));

    const [listings, setListings] = useState<MLSProperty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [globalTotalCount, setGlobalTotalCount] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const searchIdRef = useRef<number>(0);
    const resultsRef = useRef<HTMLDivElement>(null);

    const selectedCity = filters.city || 'Toronto';

    // ─── Phase 3: UI-Only Render Limit (Top 50) ──────────────────────
    const activeListings = useMemo(() => {
        return listings; // Show all listings returned by the batch/page
    }, [listings]);

    const primaryListings = useMemo(() => {
        if (!activeListings.length) return [];
        const search = selectedCity.toLowerCase();
        return activeListings.filter(l => scoreListing(l, search) > 0);
    }, [activeListings, selectedCity]);

    const nearbyListings = useMemo(() => {
        if (!activeListings.length) return [];
        const search = selectedCity.toLowerCase();
        return activeListings.filter(l => scoreListing(l, search) === 0);
    }, [activeListings, selectedCity]);

    // Initial search
    const handleSearch = useCallback(async (customFilters?: FilterState) => {
        const currentSearchId = ++searchIdRef.current;

        try {
            setIsLoading(true);
            setError(null);
            setHasSearched(true);
            setListings([]);
            setFilteredTotal(0);
            setGlobalTotalCount(0);
            setCurrentPage(1);
            setTotalPages(0);

            const activeFilters = customFilters || filters;
            const baseBounds = resolveGeoBounds(activeFilters.city);
            const enrichedFilters = { ...activeFilters, ...baseBounds };

            console.log(`[Search #${currentSearchId}] Fetching batches for ${activeFilters.city}...`);

            // Fetch multiple pages (0, 100, 200) in parallel internally
            const data = await fetchAggregatedListings(enrichedFilters, PAGE_SIZE);

            if (currentSearchId !== searchIdRef.current) return;

            setListings(data.listings);
            setFilteredTotal(data.total);
            setGlobalTotalCount(data.totalCount || 0);
            setTotalPages(Math.ceil(data.total / PAGE_SIZE)); 
            setCurrentPage(1);

            // Sync URL
            const url = new URL(typeof window !== 'undefined' ? window.location.href : '');
            url.searchParams.set('q', activeFilters.searchQuery);
            url.searchParams.set('city', activeFilters.city);
            router.push(url.pathname + url.search, { scroll: false });

        } catch (err: any) {
            setError(err.message || 'Search failed');
        } finally {
            setIsLoading(false);
        }
    }, [filters, router]);

    // Go to specific page
    const goToPage = async (page: number) => {
        if (isLoading || page < 1 || (totalPages > 0 && page > totalPages)) return;

        try {
            setIsLoading(true);
            setError(null);

            const bounds = resolveGeoBounds(filters.city);
            const enrichedFilters = { ...filters, ...bounds };

            // fetchListings handles single page fetch
            const { fetchListings } = await import('./api');
            const res = await fetchListings(enrichedFilters, page, PAGE_SIZE);

            setListings(res.listings);
            setCurrentPage(page);
            setFilteredTotal(res.total);
            setTotalPages(Math.ceil(res.total / PAGE_SIZE));

            // Scroll to results
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err: any) {
            setError(err.message || 'Failed to load page');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [handleSearch, filters.listingType]);

    const handleSearchQueryChange = (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));
    };

    const handleListingTypeChange = (type: 'Residential' | 'Commercial') => {
        setFilters((prev) => ({ ...prev, listingType: type }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <HeroSection
                searchQuery={filters.searchQuery}
                onSearchQueryChange={handleSearchQueryChange}
                listingType={filters.listingType}
                onListingTypeChange={handleListingTypeChange}
                onSearch={() => handleSearch()}
                totalCount={globalTotalCount}
            />

            <FilterBar
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={() => handleSearch()}
                isLoading={isLoading}
            />

            <main ref={resultsRef} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
                {hasSearched && !isLoading && !error && (
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                Showing results for {filters.city}
                                <span className="text-gray-400 font-medium text-base ml-2">(including nearby areas)</span>
                            </h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                                {globalTotalCount.toLocaleString()} total platform properties · Found {filteredTotal.toLocaleString()} match for your search ·
                                <span className="text-emerald-600 ml-1">{(filters.city || 'ALL CITIES').toUpperCase()} & SURROUNDINGS</span>
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Sync
                        </div>
                    </div>
                )}

                {hasSearched && !error && <MapPlaceholder city={filters.city} />}

                {isLoading && <ListingGridSkeleton count={8} />}

                {error && !isLoading && (
                    <ErrorState message={error} onRetry={() => handleSearch()} />
                )}

                {!isLoading && !error && hasSearched && listings.length === 0 && (
                    <EmptyState />
                )}

                {!isLoading && listings.length > 0 && (
                    <div className="flex flex-col gap-12">
                        {primaryListings.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <div className="px-5 py-2 rounded-full bg-emerald-600 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg">
                                        Top results for {selectedCity} · {primaryListings.length.toLocaleString()}
                                    </div>
                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {primaryListings.map((l, i) => <ListingCard key={l.ListingKey || `p-${i}`} listing={l} index={i} />)}
                                </div>
                            </section>
                        )}

                        {nearbyListings.length > 0 && (
                            <section aria-label="Nearby Results">
                                <div className="flex items-center gap-4 mb-6 mt-4">
                                    <div className="h-px flex-1 bg-slate-100" />
                                    <div className="px-5 py-2 rounded-full bg-slate-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border border-slate-200/50">
                                        Nearby listings · {nearbyListings.length.toLocaleString()}
                                    </div>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-80 transition-opacity hover:opacity-100">
                                    {nearbyListings.map((l, i) => <ListingCard key={l.ListingKey || `s-${i}`} listing={l} index={i + primaryListings.length} />)}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && listings.length > 0 && (
                    <div className="mt-16 flex flex-col items-center gap-8 border-t border-slate-100 pt-12">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="hidden sm:flex items-center gap-2">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                    : 'border border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="sm:hidden px-4 text-sm font-bold text-slate-600">
                                Page {currentPage} of {totalPages}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Page {currentPage} of {totalPages} • {filteredTotal.toLocaleString()} total matching results
                        </p>
                    </div>
                )}
            </main>

            <footer className="mt-20 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 text-sm font-bold text-white">
                                RE
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 tracking-tight">Premium Real Estate Platform</span>
                                <span className="block text-[10px] text-gray-400 font-medium">VERIFIED DATA FEED</span>
                            </div>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="mt-2 text-xs font-bold text-gray-900">
                                © {new Date().getFullYear()} Real Estate Platform All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
}
