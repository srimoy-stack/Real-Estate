'use client';

import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
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
import type { DrawBounds } from '@/components/listings/MapView';

const MapView = lazy(() => import('@/components/listings/MapView').then(m => ({ default: m.MapView })));

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
        const searchQuery = searchParams.get('q') || '';
        let cityValue = ''; // Default to All Cities on load as requested
        let provinceValue = searchParams.get('province') || '';

        // Smart detect: if user typed "ontario" in city field, treat it as province
        if (cityValue?.toLowerCase() === 'ontario' || cityValue?.toLowerCase() === 'on') {
            provinceValue = 'Ontario';
            cityValue = '';
        }

        const propType = searchParams.get('propertyType') || 'Any';
        const listType = 'Any' as const;

        return {
            ...DEFAULT_FILTERS,
            searchQuery: searchQuery,
            city: cityValue,
            province: provinceValue,
            listingType: listType,
            propertyType: propType,
            transactionType: transType,
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            sortBy: searchParams.get('sortBy') || 'newest',
            order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
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
    const [selectedMapListing, setSelectedMapListing] = useState<string | null>(null);
    const [isDrawActive, setIsDrawActive] = useState(false);
    const [drawBounds, setDrawBounds] = useState<DrawBounds | null>(null);

    const searchIdRef = useRef<number>(0);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Set transaction type and trigger search — backend handles prioritization
    useEffect(() => {
        const transType = isLeaseMode ? 'For Rent' : 'For Sale';
        const updatedFilters = {
            ...filters,
            transactionType: transType,
        } as FilterState;
        setFilters(updatedFilters);
        handleSearch(updatedFilters);
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
            const bounds = resolveGeoBounds(activeFilters.city);
            const enrichedFilters = { ...activeFilters, ...(bounds || {}) };

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
    }, [filters, router, transaction, resolveGeoBounds]);

    // ─── Pagination ─────────────────────────────────────────────
    const goToPage = async (page: number) => {
        if (isLoading || page < 1 || (totalPages > 0 && page > totalPages)) return;

        try {
            setIsLoading(true);
            setError(null);

            const bounds = resolveGeoBounds(filters.city);
            const enrichedFilters = { ...filters, ...(bounds || {}) };
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
                                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#4F46E5] mb-1.5">
                                    <span className="w-8 h-px bg-[#4F46E5]" />
                                    Commercial {isLeaseMode ? 'Lease' : 'Sale'}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {isLeaseMode ? 'Commercial Lease' : 'Commercial Properties'}
                                    <span className="text-slate-200 mx-2">·</span>
                                    <span className="text-[#4F46E5]">{filters.city || filters.province || 'All Cities'}</span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
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
                                        <span className="text-[10px] font-black text-[#4F46E5] uppercase tracking-wider tabular-nums">
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
                <main ref={resultsRef} className={`flex-1 ${viewMode === 'map' ? '' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24 min-h-[700px]'}`}>
                    {error && <ErrorState message={error} onRetry={() => handleSearch()} />}

                    {isLoading && <div className={viewMode === 'map' ? 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8' : ''}><ListingGridSkeleton count={8} /></div>}
                    
                    {!isLoading && !error && (
                        <>
                            {listings.length === 0 ? (
                                <div className={viewMode === 'map' ? 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8' : ''}>
                                    <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
                                </div>
                            ) : (
                                <>
                                    {viewMode === 'map' ? (
                                        /* ═══════════════════════════════════════════════════════════
                                           PRODUCTION SPLIT-SCREEN: listings panel | interactive map
                                           Fill remaining viewport below the sticky control bar
                                           ═══════════════════════════════════════════════════════════ */
                                        <div className="flex" style={{ height: 'calc(100vh - 180px)' }}>

                                            {/* ── LEFT: Listings Panel (50%) ── */}
                                            <div className="w-1/2 flex flex-col bg-white border-r border-slate-200 min-h-0">

                                                {/* Panel toolbar */}
                                                <div className="flex items-center justify-between px-5 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex-shrink-0">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider leading-none">
                                                                {filteredTotal.toLocaleString()} Properties
                                                                {drawBounds && <span className="text-[#4F46E5] ml-1.5">· Map Area</span>}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                {filters.city || 'All Cities'} · {filters.propertyType !== 'Any' ? filters.propertyType : 'Commercial'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setIsDrawActive(!isDrawActive)}
                                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                isDrawActive
                                                                    ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-lg shadow-[#4F46E5]/30'
                                                                    : drawBounds
                                                                        ? 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/30 hover:bg-[#4F46E5]/20'
                                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-[#4F46E5] hover:text-[#4F46E5]'
                                                            }`}
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                            {isDrawActive ? 'Drawing...' : drawBounds ? 'Redraw' : 'Draw Area'}
                                                        </button>
                                                        {drawBounds && (
                                                            <button
                                                                onClick={() => {
                                                                    setDrawBounds(null);
                                                                    const clearedFilters: FilterState = {
                                                                        ...filters,
                                                                        latitudeMin: undefined,
                                                                        latitudeMax: undefined,
                                                                        longitudeMin: undefined,
                                                                        longitudeMax: undefined,
                                                                    };
                                                                    setFilters(clearedFilters);
                                                                    handleSearch(clearedFilters);
                                                                }}
                                                                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                Clear
                                                            </button>
                                                        )}
                                                        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#4F46E5]/8 rounded-xl border border-[#4F46E5]/15">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                                                            <span className="text-[9px] font-black text-[#4F46E5] uppercase tracking-widest">Live</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Scrollable listings grid */}
                                                <div className="flex-1 overflow-y-auto p-3 min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                                                    <div className="grid grid-cols-2 gap-2.5">
                                                        {listings.map((l, i) => (
                                                            <div
                                                                key={l.ListingId || l.ListingKey}
                                                                className={`rounded-xl transition-all duration-200 cursor-pointer ${
                                                                    selectedMapListing === (l.ListingId || l.ListingKey)
                                                                        ? 'ring-2 ring-[#4F46E5] shadow-lg shadow-[#4F46E5]/10 scale-[1.01]'
                                                                        : 'hover:shadow-md'
                                                                }`}
                                                                onMouseEnter={() => setSelectedMapListing(l.ListingId || l.ListingKey)}
                                                                onMouseLeave={() => setSelectedMapListing(null)}
                                                            >
                                                                <UnifiedPropertyCard
                                                                    listing={l}
                                                                    index={i}
                                                                    onAuthRequired={(!isAuthenticated && hasHydrated) ? () => {} : undefined}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Compact pagination footer */}
                                                {totalPages > 1 && (
                                                    <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 py-2 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                            {filteredTotal.toLocaleString()} results
                                                        </span>
                                                        <div className="flex items-center gap-0.5">
                                                            <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-20 hover:bg-slate-100 transition-colors text-slate-500 text-xs">
                                                                ‹
                                                            </button>
                                                            {(() => {
                                                                const pages: (number | '...')[] = [];
                                                                if (totalPages <= 7) {
                                                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                                                } else {
                                                                    pages.push(1);
                                                                    if (currentPage > 3) pages.push('...');
                                                                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                                                                    if (currentPage < totalPages - 2) pages.push('...');
                                                                    pages.push(totalPages);
                                                                }
                                                                return pages.map((p, idx) =>
                                                                    p === '...' ? (
                                                                        <span key={`e${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-300 text-[10px]">···</span>
                                                                    ) : (
                                                                        <button key={p} onClick={() => goToPage(p)}
                                                                            className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                                                                                currentPage === p
                                                                                    ? 'bg-[#0F172A] text-white'
                                                                                    : 'text-slate-500 hover:bg-slate-100'
                                                                            }`}
                                                                        >{p}</button>
                                                                    )
                                                                );
                                                            })()}
                                                            <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-20 hover:bg-slate-100 transition-colors text-slate-500 text-xs">
                                                                ›
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── RIGHT: Interactive Map (50%) ── */}
                                            <div className="w-1/2 relative">
                                                <Suspense fallback={
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-10 h-10 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Interactive Map...</span>
                                                        </div>
                                                    </div>
                                                }>
                                                    <MapView
                                                        listings={listings}
                                                        activeListingId={selectedMapListing}
                                                        hoveredListingId={selectedMapListing}
                                                        enableDraw={true}
                                                        isDrawActive={isDrawActive}
                                                        onDrawComplete={(bounds) => {
                                                            setDrawBounds(bounds);
                                                            setIsDrawActive(false);
                                                            const geoFilters: FilterState = {
                                                                ...filters,
                                                                latitudeMin: bounds.latMin,
                                                                latitudeMax: bounds.latMax,
                                                                longitudeMin: bounds.lngMin,
                                                                longitudeMax: bounds.lngMax,
                                                            };
                                                            setFilters(geoFilters);
                                                            handleSearch(geoFilters);
                                                        }}
                                                        onDrawClear={() => {
                                                            setDrawBounds(null);
                                                            const clearedFilters: FilterState = {
                                                                ...filters,
                                                                latitudeMin: undefined,
                                                                latitudeMax: undefined,
                                                                longitudeMin: undefined,
                                                                longitudeMax: undefined,
                                                            };
                                                            setFilters(clearedFilters);
                                                            handleSearch(clearedFilters);
                                                        }}
                                                        onMarkerClick={(id) => setSelectedMapListing(id)}
                                                    />
                                                </Suspense>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ═══════════════════════════════════════════
                                           LIST VIEW: Standard responsive grid
                                           ═══════════════════════════════════════════ */
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {listings.map((l, i) => (
                                                <UnifiedPropertyCard key={l.ListingId || l.ListingKey} listing={l} index={i} />
                                            ))}
                                        </div>
                                    )}

                                    {/* ═══════════════════════════════════════════
                                        PAGINATION (List mode only)
                                        Production-grade: 1 2 3 ... N with ellipsis
                                       ═══════════════════════════════════════════ */}
                                    {viewMode === 'list' && totalPages > 1 && (() => {
                                        const pages: (number | '...')[] = [];
                                        if (totalPages <= 7) {
                                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                                        } else {
                                            pages.push(1);
                                            if (currentPage > 3) pages.push('...');
                                            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                                            if (currentPage < totalPages - 2) pages.push('...');
                                            pages.push(totalPages);
                                        }

                                        return (
                                            <div className="mt-16 flex flex-col items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    {/* Prev */}
                                                    <button
                                                        disabled={currentPage === 1}
                                                        onClick={() => goToPage(currentPage - 1)}
                                                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                                        Previous
                                                    </button>

                                                    {/* Page Numbers */}
                                                    {pages.map((p, i) =>
                                                        p === '...' ? (
                                                            <span key={`ellipsis-${i}`} className="w-11 h-11 flex items-center justify-center text-slate-400 text-xs font-bold select-none">
                                                                ···
                                                            </span>
                                                        ) : (
                                                            <button
                                                                key={p}
                                                                onClick={() => goToPage(p)}
                                                                disabled={currentPage === p}
                                                                className={`w-11 h-11 rounded-xl text-sm font-black transition-all ${
                                                                    currentPage === p
                                                                        ? 'bg-[#0F172A] text-white shadow-lg shadow-[#0F172A]/20'
                                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-[#4F46E5] hover:text-[#4F46E5]'
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
                                                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all"
                                                    >
                                                        Next
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                </div>

                                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
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
            </div>
        </div>
    );
}
