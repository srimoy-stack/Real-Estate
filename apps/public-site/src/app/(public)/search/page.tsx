'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { LeadGate } from '@/components/auth/LeadGate';
import { FilterBar } from '@/app/listings-demo/components/FilterBar';
import { UnifiedPropertyCard } from '@/components/ui';
import { ListingGridSkeleton } from '@/app/listings-demo/components/Skeletons';
import { EmptyState, ErrorState } from '@/app/listings-demo/components/StateDisplays';
import { fetchAggregatedListings, fetchListings } from '@/app/listings-demo/api';
import { MLSProperty, FilterState, DEFAULT_FILTERS } from '@/app/listings-demo/types';
import { resolveGeoBounds } from '@/app/listings-demo/utils';
import { IDXMapPlaceholder } from '@/components/idx/IDXMapPlaceholder';

const PAGE_SIZE = 90;

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, hasHydrated } = useAuth();
    const isGated = hasHydrated && !isAuthenticated;

    // Lock body scroll when auth gate is active
    useEffect(() => {
        if (isGated) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isGated]);

    const transaction = searchParams.get('transaction') || 'buy';
    const isLeaseMode = transaction === 'lease';

    // ─── Search State ───────────────────────────────────────────
    const [filters, setFilters] = useState<FilterState>(() => {
        const transType = isLeaseMode ? 'For Rent' : 'For Sale';
        const propType = searchParams.get('propertyType') || 'Retail';
        const listType = 'Commercial' as const;

        return {
            ...DEFAULT_FILTERS,
            searchQuery: searchParams.get('q') || '',
            city: searchParams.get('city') || 'Toronto',
            listingType: listType,
            propertyType: propType,
            transactionType: transType,
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            sortBy: searchParams.get('sortBy') || 'newest',
            order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
            province: searchParams.get('province') || '',
        };
    });

    // ─── Component State ─────────────────────────────────────────
    const [listings, setListings] = useState<MLSProperty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [globalTotalCount, setGlobalTotalCount] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [selectedMapListing, setSelectedMapListing] = useState<any>(null);

    const searchIdRef = useRef<number>(0);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Enforce Commercial Lease rules when transaction param changes
    useEffect(() => {
        if (isLeaseMode) {
            const leaseFilters = {
                ...filters,
                transactionType: 'For Rent',
                propertyType: (filters.propertyType === 'Commercial' || filters.propertyType === 'Any') ? 'Retail' : filters.propertyType,
                listingType: 'Commercial'
            } as FilterState;
            setFilters(leaseFilters);
            handleSearch(leaseFilters);
        } else if (transaction === 'buy') {
            const buyFilters = {
                ...filters,
                transactionType: 'For Sale',
                propertyType: (filters.propertyType === 'Commercial' || filters.propertyType === 'Any') ? 'Retail' : filters.propertyType,
                listingType: 'Commercial',
            } as FilterState;
            setFilters(buyFilters);
            handleSearch(buyFilters);
        }
    }, [transaction]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Core Search ────────────────────────────────────────────
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

            const data = await fetchAggregatedListings(enrichedFilters, PAGE_SIZE);

            if (currentSearchId !== searchIdRef.current) return;

            setListings(data.listings);
            setFilteredTotal(data.total);
            setGlobalTotalCount(data.platformTotal || data.totalCount || 0);
            setTotalPages(Math.ceil(data.total / PAGE_SIZE));
            setCurrentPage(1);

            // Sync URL
            const url = new URL(window.location.href);
            if (activeFilters.city) url.searchParams.set('city', activeFilters.city);
            if (activeFilters.searchQuery) url.searchParams.set('q', activeFilters.searchQuery);
            if (activeFilters.propertyType && activeFilters.propertyType !== 'Any') {
                url.searchParams.set('propertyType', activeFilters.propertyType);
            } else {
                url.searchParams.delete('propertyType');
            }
            url.searchParams.set('listingType', activeFilters.listingType);
            if (activeFilters.province) url.searchParams.set('province', activeFilters.province);
            if (transaction) url.searchParams.set('transaction', transaction);
            router.replace(url.pathname + url.search, { scroll: false });

        } catch (err: any) {
            if (currentSearchId === searchIdRef.current) {
                setError(err.message || 'Search failed');
            }
        } finally {
            if (currentSearchId === searchIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [filters, router, transaction]);

    // ─── Pagination ─────────────────────────────────────────────
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

    // ─── Commercial Mode ───────────────────────────────────────────
    // Both Buy and Lease are commercial-first — no residential toggle needed.
    // Sub-type filtering (Office, Retail, etc.) is handled by the FilterBar.

    // Auto-search on mount if not triggered by transaction effect
    useEffect(() => {
        if (hasSearched) return;
        handleSearch();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Render View ───────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col relative">
            {isGated && <LeadGate />}

            <div className={isGated ? 'blur-sm brightness-75 pointer-events-none select-none transition-all duration-500 flex-1' : 'transition-all duration-500 flex-1'}>
                
                {/* ─── Compact Search Header ─── */}
                <div className="pt-20 pb-5 bg-white border-b border-slate-100">
                    <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-1.5">
                                    <span className="w-8 h-px bg-brand-red" />
                                    Commercial {isLeaseMode ? 'Lease' : 'Sale'}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {isLeaseMode ? 'Commercial Lease' : 'Commercial Properties'}
                                    <span className="text-slate-200 mx-2">·</span>
                                    <span className="text-brand-red">{filters.city || 'Ontario'}</span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-black text-slate-900 tabular-nums">{globalTotalCount.toLocaleString()}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Listings</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden sm:block">MLS® Verified</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Unified Sticky Control Bar ─── */}
                <div className="sticky top-[72px] z-[40] bg-white border-b-2 border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">

                        {/* Top row: mode badge + result count + view toggle */}
                        <div className="flex items-center justify-between h-11 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">Commercial Mode</span>
                                </div>
                                <div className="w-px h-4 bg-slate-200" />
                                <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {isLeaseMode ? 'Leasing Opportunities' : 'Asset Disposition &amp; Sales'}
                                </span>
                                {filteredTotal > 0 && (
                                    <>
                                        <div className="w-px h-4 bg-slate-200" />
                                        <span className="text-[10px] font-black text-brand-red uppercase tracking-wider tabular-nums">
                                            {filteredTotal.toLocaleString()} Results
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                                        viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                                        viewMode === 'map' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                    Interactive Map
                                </button>
                            </div>
                        </div>

                        {/* Bottom row: filter bar (no longer self-sticky) */}
                        <FilterBar
                            filters={filters}
                            onFiltersChange={setFilters}
                            onSearch={() => handleSearch()}
                            isLoading={isLoading}
                            isLeaseMode={isLeaseMode}
                            isCommercialMode={true}
                        />
                    </div>
                </div>

                {/* ─── Results Area ─── */}
                <main ref={resultsRef} className={`mx-auto px-4 sm:px-6 lg:px-8 flex-1 ${viewMode === 'map' ? 'pt-4 pb-6 max-w-[1800px]' : 'pt-12 pb-24 max-w-7xl min-h-[700px]'}`}>
                    {error && <ErrorState message={error} onRetry={() => handleSearch()} />}

                    {isLoading && <ListingGridSkeleton count={8} />}
                    
                    {!isLoading && !error && (
                        <>
                            {listings.length === 0 ? (
                                <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
                            ) : (
                                <>
                                    {viewMode === 'map' ? (
                                        /* Production split-screen: 60% listings | 40% map */
                                        <div className="flex h-[calc(100vh-210px)] rounded-2xl overflow-hidden border border-slate-200 shadow-xl">

                                            {/* LEFT: Listings Panel — 60% with 2-col grid + independent scroll */}
                                            <div className="w-[60%] flex flex-col bg-white border-r border-slate-100 min-h-0">

                                                {/* Panel header */}
                                                <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex-shrink-0">
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                                                            {listings.length.toLocaleString()} Properties
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                            {filters.city || 'All Cities'} · Commercial
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red/5 rounded-full border border-brand-red/10">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                                                        <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">Live MLS®</span>
                                                    </div>
                                                </div>

                                                {/* 2-col scrollable grid */}
                                                <div className="flex-1 overflow-y-auto custom-results-scrollbar p-4 min-h-0">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {listings.map((l, i) => (
                                                            <div key={l.ListingId || l.ListingKey} className="transform transition-transform hover:scale-[1.01]">
                                                                <UnifiedPropertyCard
                                                                    listing={l}
                                                                    index={i}
                                                                    onAuthRequired={(!isAuthenticated && hasHydrated) ? () => {} : undefined}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Pagination footer — always visible, never scrolls */}
                                                {totalPages > 1 && (
                                                    <div className="flex-shrink-0 border-t border-slate-100 bg-white px-5 py-2.5 flex items-center justify-between">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider tabular-nums">
                                                            Page {currentPage} / {totalPages}
                                                            <span className="text-slate-300 mx-1.5">·</span>
                                                            {filteredTotal.toLocaleString()} total
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                disabled={currentPage === 1}
                                                                onClick={() => goToPage(currentPage - 1)}
                                                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-30 hover:border-brand-red hover:text-brand-red transition-colors text-slate-600 text-sm"
                                                            >←</button>
                                                            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                                                                const pg = currentPage <= 3 ? idx + 1 : currentPage + idx - 2;
                                                                if (pg < 1 || pg > totalPages) return null;
                                                                return (
                                                                    <button key={pg} onClick={() => goToPage(pg)}
                                                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === pg ? 'bg-brand-red text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-red hover:text-brand-red'}`}
                                                                    >{pg}</button>
                                                                );
                                                            })}
                                                            <button
                                                                disabled={currentPage === totalPages}
                                                                onClick={() => goToPage(currentPage + 1)}
                                                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-30 hover:border-brand-red hover:text-brand-red transition-colors text-slate-600 text-sm"
                                                            >→</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* RIGHT: Map — 40% */}
                                            <div className="relative w-[40%] flex-shrink-0">
                                                <div className="absolute top-3 right-3 z-[2] pointer-events-none">
                                                    <div className="bg-white/95 backdrop-blur-xl rounded-xl px-3 py-2 shadow-lg border border-white/60 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{listings.length} Plotted</span>
                                                    </div>
                                                </div>
                                                <IDXMapPlaceholder
                                                    listings={listings.map(l => ({
                                                        id: l.ListingId || l.ListingKey,
                                                        title: l.UnparsedAddress || 'Property',
                                                        address: l.UnparsedAddress || '',
                                                        city: l.City || '',
                                                        price: l.ListPrice || 0,
                                                        bedrooms: l.BedroomsTotal || 0,
                                                        bathrooms: l.BathroomsTotalInteger || 0,
                                                        squareFootage: l.LivingArea || 0,
                                                        mlsNumber: l.ListingId || '',
                                                        location: { lat: l.Latitude, lng: l.Longitude },
                                                        mainImage: l.Media?.[0]?.MediaURL || '',
                                                        status: l.StandardStatus || 'ACTIVE'
                                                    } as any))}
                                                    highlightedListingId={null}
                                                    onMarkerClick={(l) => setSelectedMapListing(l)}
                                                    onMarkerClose={() => setSelectedMapListing(null)}
                                                    selectedListing={selectedMapListing}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                            {listings.map((l, i) => (
                                                <UnifiedPropertyCard key={l.ListingId || l.ListingKey} listing={l} index={i} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination (List mode only) */}
                                    {viewMode === 'list' && totalPages > 1 && (() => {
                                        // Build page numbers with ellipsis
                                        const pages: (number | '...')[] = [];
                                        const delta = 2; // pages around current
                                        const left = Math.max(2, currentPage - delta);
                                        const right = Math.min(totalPages - 1, currentPage + delta);

                                        pages.push(1);
                                        if (left > 2) pages.push('...');
                                        for (let i = left; i <= right; i++) pages.push(i);
                                        if (right < totalPages - 1) pages.push('...');
                                        if (totalPages > 1) pages.push(totalPages);

                                        return (
                                            <div className="mt-20 flex flex-col items-center gap-5">
                                                <div className="flex items-center gap-1.5">
                                                    {/* Prev */}
                                                    <button
                                                        disabled={currentPage === 1}
                                                        onClick={() => goToPage(currentPage - 1)}
                                                        className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold flex items-center gap-1 disabled:opacity-30 hover:border-brand-red hover:text-brand-red transition-all"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                                        Prev
                                                    </button>

                                                    {/* Page Numbers */}
                                                    {pages.map((p, i) =>
                                                        p === '...' ? (
                                                            <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-xs font-bold">
                                                                ···
                                                            </span>
                                                        ) : (
                                                            <button
                                                                key={p}
                                                                onClick={() => goToPage(p)}
                                                                disabled={currentPage === p}
                                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                                                    currentPage === p
                                                                        ? 'bg-brand-red text-white shadow-lg shadow-brand-red/25'
                                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-red hover:text-brand-red'
                                                                }`}
                                                            >
                                                                {p}
                                                            </button>
                                                        )
                                                    )}

                                                    {/* Next */}
                                                    <button
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => goToPage(currentPage + 1)}
                                                        className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold flex items-center gap-1 disabled:opacity-30 hover:border-brand-red hover:text-brand-red transition-all"
                                                    >
                                                        Next
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                </div>

                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    Page {currentPage} of {totalPages} · {filteredTotal.toLocaleString()} Results
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </>
                            )}
                        </>
                    )}
                </main>

                <footer className="mt-20 border-t border-slate-100 bg-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <div className="h-4 w-4 bg-[#4F46E5] flex-shrink-0 rounded-[1px]" />
                                <div className="flex items-baseline leading-none">
                                    <span className="text-lg font-black text-slate-900 tracking-tighter uppercase">Square</span>
                                    <span className="text-lg font-black text-[#4F46E5] tracking-tighter uppercase ml-0.5">FT</span>
                                </div>
                            </div>
                            <span className="font-black text-slate-900 tracking-tight ml-2">SquareFT Realty</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                            © 2026 SquareFT · MLS® Verified Data · All Rights Reserved
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
