'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SearchParams } from './SearchBar';
import { fetchAggregatedListings, fetchListings } from '@/app/listings-demo/api';
import { FilterBar } from '@/app/listings-demo/components/FilterBar';
import { UnifiedPropertyCard } from '@/components/ui';
import { ListingGridSkeleton } from '@/app/listings-demo/components/Skeletons';
import { EmptyState, ErrorState } from '@/app/listings-demo/components/StateDisplays';
import { MLSProperty, FilterState, DEFAULT_FILTERS } from '@/app/listings-demo/types';
import { resolveGeoBounds } from '@/app/listings-demo/utils';
import { useAuth } from '@repo/auth';
import { LeadCaptureModal } from '@/components/auth/LeadCaptureModal';

const PAGE_SIZE = 15;

interface HomeSearchResultsProps {
    searchParams: SearchParams | null;
}

export const HomeSearchResults = ({ searchParams }: HomeSearchResultsProps) => {
    const [listings, setListings] = useState<MLSProperty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [globalTotalCount, setGlobalTotalCount] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const { isAuthenticated, hasHydrated } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleAuthRequired = () => {
        setIsLoginModalOpen(true);
    };

    const [filters, setFilters] = useState<FilterState>({
        ...DEFAULT_FILTERS,
        city: 'Toronto',
        propertyType: 'Commercial,Lease', // LOCKED: Homepage only shows Commercial & Lease
    });

    const searchIdRef = useRef<number>(0);
    const resultsRef = useRef<HTMLDivElement>(null);
    const hasAutoLoaded = useRef(false);

    // Core search — same API as listings-demo
    const executeSearch = useCallback(async (activeFilters: FilterState, scrollToResults = true) => {
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

            const baseBounds = resolveGeoBounds(activeFilters.city);
            const enrichedFilters = { ...activeFilters, ...baseBounds };

            const data = await fetchAggregatedListings(enrichedFilters, PAGE_SIZE);

            if (currentSearchId !== searchIdRef.current) return;

            setListings(data.listings);
            setFilteredTotal(data.total);
            setGlobalTotalCount(data.platformTotal || data.totalCount || 0);
            setTotalPages(Math.ceil(data.total / PAGE_SIZE));
            setCurrentPage(1);

            if (scrollToResults) {
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } catch (err: any) {
            if (currentSearchId === searchIdRef.current) {
                setError(err.message || 'Search failed');
            }
        } finally {
            if (currentSearchId === searchIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    // Pagination
    const goToPage = async (page: number) => {
        if (isLoading || page < 1 || (totalPages > 0 && page > totalPages)) return;

        try {
            setIsLoading(true);
            setError(null);

            const bounds = resolveGeoBounds(filters.city);
            const enrichedFilters = { ...filters, ...bounds };

            const res = await fetchListings(enrichedFilters, page, PAGE_SIZE);

            setListings(res.listings);
            setCurrentPage(page);
            setFilteredTotal(res.total);
            setTotalPages(Math.ceil(res.total / PAGE_SIZE));

            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err: any) {
            setError(err.message || 'Failed to load page');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-load on page load — no click required
    useEffect(() => {
        if (!hasAutoLoaded.current) {
            hasAutoLoaded.current = true;
            executeSearch(filters, false);
        }
    }, [filters, executeSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Scroll-based Gating Trigger ─────────────
    useEffect(() => {
        if (!isAuthenticated && hasHydrated && resultsRef.current) {
            let timer: NodeJS.Timeout;

            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    // Longer delay for search results as they are more "exploratory"
                    timer = setTimeout(() => {
                        setIsLoginModalOpen(true);
                    }, 2000);
                } else {
                    clearTimeout(timer);
                }
            }, { threshold: 0.1 });

            observer.observe(resultsRef.current);

            return () => {
                observer.disconnect();
                clearTimeout(timer);
            };
        }
    }, [isAuthenticated, hasHydrated]);

    // When hero search bar submits — update filters and re-search
    useEffect(() => {
        if (searchParams) {
            const newFilters: FilterState = {
                ...filters,
                city: searchParams.city || 'Toronto',
                searchQuery: searchParams.query || '',
                listingType: searchParams.listingType,
                propertyType: 'Commercial,Lease', // LOCKED: Homepage never shows Residential
                minPrice: searchParams.minPrice || '',
                maxPrice: searchParams.maxPrice || '',
                sortBy: 'newest',
                order: 'desc',
            };
            setFilters(newFilters);
            executeSearch(newFilters, true);
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <section ref={resultsRef} className="w-full bg-slate-50/80 scroll-mt-4">
            {/* Full FilterBar — same as listings-demo */}
            <FilterBar
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={() => executeSearch(filters)}
                isLoading={isLoading}
            />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Results Header */}
                {hasSearched && !isLoading && !error && listings.length > 0 && (
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Showing results for {filters.city || 'All Cities'}
                            </h2>
                            <p className="text-sm text-slate-700 font-bold uppercase tracking-wider mt-1">
                                {globalTotalCount.toLocaleString()} total platform properties · Found {filteredTotal.toLocaleString()} {filteredTotal === 1 ? 'match' : 'matches'} ·
                                <span className="text-brand-red ml-1">{(filters.city || 'ALL CITIES').toUpperCase()}</span>
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[10px] font-black text-brand-red shadow-sm border border-indigo-100 uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                            </span>
                            Live Platform Data · Verified Listings
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && <ListingGridSkeleton count={8} />}

                {/* Error */}
                {error && !isLoading && (
                    <ErrorState message={error} onRetry={() => executeSearch(filters)} />
                )}

                {/* Empty */}
                {!isLoading && !error && hasSearched && listings.length === 0 && (
                    <EmptyState />
                )}

                {/* Results Grid */}
                {!isLoading && listings.length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-slate-200" />
                            <div className="px-5 py-2 rounded-full bg-brand-red text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg">
                                {(filters.city || 'Results').toUpperCase()} · {filteredTotal.toLocaleString()} MATCHES
                            </div>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                            {listings.slice(0, PAGE_SIZE).map((l: MLSProperty, i: number) => (
                                <UnifiedPropertyCard 
                                    key={l.ListingKey || `l-${i}`} 
                                    listing={l} 
                                    index={i} 
                                    onAuthRequired={(!isAuthenticated && hasHydrated) ? handleAuthRequired : undefined}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && listings.length > 0 && totalPages > 1 && (
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
                                                    ? 'bg-brand-red text-white shadow-lg shadow-indigo-200'
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
            </div>

            <style jsx global>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            <LeadCaptureModal 
                isOpen={isLoginModalOpen} 
                onSuccess={() => setIsLoginModalOpen(false)} 
            />
        </section>
    );
};
