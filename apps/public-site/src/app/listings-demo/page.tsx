'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { ListingCard } from './components/ListingCard';
import { ListingGridSkeleton } from './components/Skeletons';
import { EmptyState, ErrorState } from './components/StateDisplays';
import { Pagination } from './components/Pagination';
import { fetchListings } from './api';
import { MLSProperty, FilterState, DEFAULT_FILTERS } from './types';

const ITEMS_PER_PAGE = 12;

export default function ListingsDemoPage() {
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [listings, setListings] = useState<MLSProperty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    const resultsRef = useRef<HTMLDivElement>(null);

    // Trigger search with current filters and page
    const doSearch = useCallback(
        async (page: number = 1) => {
            try {
                setIsLoading(true);
                setError(null);
                setHasSearched(true);

                const data = await fetchListings(filters, page, ITEMS_PER_PAGE);
                console.log(`[MLS Demo] Received ${data.listings.length} listings out of ${data.total} total (Page ${page})`);

                setListings(data.listings);
                setTotalCount(data.total);
                setCurrentPage(page);

                // Scroll to top of results on page change
                if (page > 1 && resultsRef.current) {
                    resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } catch (err: any) {
                console.error('[MLS Demo] Search error:', err.message);
                setError(err.message || 'Failed to fetch live listings from MLS');
            } finally {
                setIsLoading(false);
            }
        },
        [filters]
    );

    // Initial load or filter search (resets page)
    const handleSearch = () => {
        doSearch(1);
    };

    useEffect(() => {
        doSearch(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.listingType]); // Re-fetch when Residential/Commercial toggles

    const handleHeroSearch = () => {
        doSearch(1);
    };

    const handleSearchQueryChange = (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));
    };

    const handleListingTypeChange = (type: 'Residential' | 'Commercial') => {
        setFilters((prev) => ({ ...prev, listingType: type }));
    };

    const handlePageChange = (page: number) => {
        doSearch(page);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* ─── Hero Section ──────────────────────────────────────────────── */}
            <HeroSection
                searchQuery={filters.searchQuery}
                onSearchQueryChange={handleSearchQueryChange}
                listingType={filters.listingType}
                onListingTypeChange={handleListingTypeChange}
                onSearch={handleHeroSearch}
            />

            {/* ─── Filter Bar ────────────────────────────────────────────────── */}
            <FilterBar
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={handleSearch}
                isLoading={isLoading}
            />

            {/* ─── Listings Section ──────────────────────────────────────────── */}
            <main ref={resultsRef} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
                {/* Results header */}
                {hasSearched && !isLoading && !error && listings.length > 0 && (
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {totalCount.toLocaleString()} Properties Found
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">
                                Showing verified property listings
                                {filters.city ? ` in ${filters.city}` : ''}
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

                {/* Loading State */}
                {isLoading && <ListingGridSkeleton count={8} />}

                {/* Error State */}
                {error && !isLoading && (
                    <ErrorState message={error} onRetry={handleSearch} />
                )}

                {/* Empty State */}
                {!isLoading && !error && hasSearched && listings.length === 0 && (
                    <EmptyState />
                )}

                {/* Listings Grid */}
                {!isLoading && listings.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in">
                        {listings.map((listing, index) => (
                            <ListingCard
                                key={listing.ListingKey || index}
                                listing={listing}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* Proper Pagination Controls */}
                {!isLoading && listings.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalCount}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                        isLoading={isLoading}
                    />
                )}
            </main>

            {/* ─── Footer ────────────────────────────────────────────────────── */}
            <footer className="mt-20 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 text-sm font-bold text-white">
                                RE
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 tracking-tight">
                                    Premium Real Estate Platform
                                </span>
                                <span className="block text-[10px] text-gray-400 font-medium">
                                    VERIFIED DATA FEED
                                </span>
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

            {/* ─── Global Styles ─────────────────────────────────────────────── */}
            <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
        </div>
    );
}
