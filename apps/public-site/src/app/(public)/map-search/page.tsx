'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { UnifiedPropertyCard } from '@/components/ui';
import { FilterBar } from '@/app/listings-demo/components/FilterBar';
import { fetchAggregatedListings, fetchListings } from '@/app/listings-demo/api';
import { MLSProperty, FilterState, DEFAULT_FILTERS } from '@/app/listings-demo/types';
import { resolveGeoBounds } from '@/app/listings-demo/utils';
import dynamic from 'next/dynamic';
import type { DrawBounds } from '@/components/listings/MapView';

const MapView = dynamic(
  () => import('@/components/listings/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Interactive Map...</span>
      </div>
    )
  }
);

const PAGE_SIZE = 90;

// ─── Property Type Pill Options ─────────────────────────────────
const PROPERTY_TYPE_OPTIONS = [
    { label: 'All Types', value: 'Any', icon: '🏢' },
    { label: 'Residential', value: 'Residential', icon: '🏠' },
    { label: 'Commercial', value: 'Commercial', icon: '🏗️' },
    { label: 'Lease', value: 'Lease', icon: '📝' },
];

export default function MapBasedSearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [listings, setListings] = useState<MLSProperty[]>([]);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [globalTotalCount, setGlobalTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const [activeListingId, setActiveListingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // ─── Draw State ─────────────────────────────────────────────
    const [isDrawActive, setIsDrawActive] = useState(false);
    const [drawnBounds, setDrawnBounds] = useState<DrawBounds | null>(null);

    const searchIdRef = useRef<number>(0);

    // ─── Filters (same FilterState as search page) ──────────────
    const [filters, setFilters] = useState<FilterState>(() => ({
        ...DEFAULT_FILTERS,
        searchQuery: searchParams.get('q') || '',
        city: searchParams.get('city') || '',
        propertyType: searchParams.get('propertyType') || 'Any',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || 'newest',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    }));

    // ─── Core Search ────────────────────────────────────────────
    const handleSearch = useCallback(async (customFilters?: FilterState, customBounds?: DrawBounds | null) => {
        const currentSearchId = ++searchIdRef.current;

        try {
            setLoading(true);
            setListings([]);
            setFilteredTotal(0);
            setGlobalTotalCount(0);
            setCurrentPage(1);
            setTotalPages(0);

            const activeFilters = customFilters || filters;
            const activeBounds = customBounds !== undefined ? customBounds : drawnBounds;
            
            // Use drawn bounds if available, otherwise fall back to city-based bounds
            let enrichedFilters: FilterState;
            if (activeBounds) {
                enrichedFilters = {
                    ...activeFilters,
                    latitudeMin: activeBounds.latMin,
                    latitudeMax: activeBounds.latMax,
                    longitudeMin: activeBounds.lngMin,
                    longitudeMax: activeBounds.lngMax,
                };
            } else {
                const baseBounds = activeFilters.city ? resolveGeoBounds(activeFilters.city) : {};
                enrichedFilters = { ...activeFilters, ...baseBounds };
            }

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
            else url.searchParams.delete('city');
            if (activeFilters.searchQuery) url.searchParams.set('q', activeFilters.searchQuery);
            if (activeFilters.propertyType && activeFilters.propertyType !== 'Any') {
                url.searchParams.set('propertyType', activeFilters.propertyType);
            } else {
                url.searchParams.delete('propertyType');
            }
            router.replace(url.pathname + url.search, { scroll: false });

        } catch (err: any) {
            if (currentSearchId === searchIdRef.current) {
                console.error('Map search failed:', err);
            }
        } finally {
            if (currentSearchId === searchIdRef.current) {
                setLoading(false);
            }
        }
    }, [filters, drawnBounds, router]);

    // ─── Draw Handlers ──────────────────────────────────────────
    const handleDrawComplete = useCallback((bounds: DrawBounds) => {
        setDrawnBounds(bounds);
        setIsDrawActive(false);
        // Trigger search with the drawn bounds
        handleSearch(undefined, bounds);
    }, [handleSearch]);

    const handleDrawClear = useCallback(() => {
        setDrawnBounds(null);
        // Re-search without bounds
        handleSearch(undefined, null);
    }, [handleSearch]);

    const toggleDrawMode = useCallback(() => {
        setIsDrawActive(prev => !prev);
    }, []);

    const clearDrawnArea = useCallback(() => {
        setDrawnBounds(null);
        setIsDrawActive(false);
        handleSearch(undefined, null);
    }, [handleSearch]);

    // ─── Pagination ─────────────────────────────────────────────
    const goToPage = async (page: number) => {
        if (loading || page < 1 || (totalPages > 0 && page > totalPages)) return;

        try {
            setLoading(true);
            
            let enrichedFilters: FilterState;
            if (drawnBounds) {
                enrichedFilters = {
                    ...filters,
                    latitudeMin: drawnBounds.latMin,
                    latitudeMax: drawnBounds.latMax,
                    longitudeMin: drawnBounds.lngMin,
                    longitudeMax: drawnBounds.lngMax,
                };
            } else {
                const bounds = filters.city ? resolveGeoBounds(filters.city) : {};
                enrichedFilters = { ...filters, ...bounds };
            }
            
            const res = await fetchListings(enrichedFilters, page, PAGE_SIZE);

            setListings(res.listings);
            setCurrentPage(page);
            setFilteredTotal(res.total);
            setTotalPages(Math.ceil(res.total / PAGE_SIZE));
        } catch (err: any) {
            console.error('Failed to load page:', err);
        } finally {
            setLoading(false);
        }
    };

    // ─── Property Type Quick Toggle ─────────────────────────────
    const handlePropertyTypeChange = (value: string) => {
        const newFilters = { ...filters, propertyType: value };
        setFilters(newFilters);
        handleSearch(newFilters);
    };

    // ─── Auto-search on mount ───────────────────────────────────
    useEffect(() => {
        handleSearch();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <main className="min-h-screen bg-white">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)] overflow-hidden">

                {/* ══════════ LEFT PANEL: Filters + Listings ══════════ */}
                <aside className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-500 overflow-hidden ${showMap ? 'lg:w-[55%] xl:w-[50%]' : 'lg:w-full'
                    }`}>

                    {/* ── Header ── */}
                    <div className="bg-white px-5 pt-5 pb-3 border-b border-slate-100 shadow-sm z-10">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    Properties <span className="text-brand-red">in {filters.city || 'Canada'}</span>
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {filteredTotal.toLocaleString()} Matches
                                    </span>
                                    {globalTotalCount > 0 && (
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            · {globalTotalCount.toLocaleString()} Platform Total
                                        </span>
                                    )}
                                    {drawnBounds && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            Custom Area
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[9px] font-black text-brand-red border border-red-100 uppercase tracking-widest">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-red" />
                                    </span>
                                    REALTOR.ca® · Live MLS® Data
                                </div>

                                {/* Draw Area Toggle */}
                                <button
                                    onClick={toggleDrawMode}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-1.5 ${
                                        isDrawActive
                                            ? 'bg-red-600 text-white shadow-red-600/20'
                                            : drawnBounds
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {isDrawActive ? 'Drawing...' : drawnBounds ? 'Redraw' : 'Draw Area'}
                                </button>

                                {/* Clear Drawn Area */}
                                {drawnBounds && (
                                    <button
                                        onClick={clearDrawnArea}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                                        title="Clear drawn area"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowMap(!showMap)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-sm"
                                >
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </button>
                            </div>
                        </div>

                        {/* ── Property Type Quick Tabs ── */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mr-1">
                                Type
                            </span>
                            {PROPERTY_TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handlePropertyTypeChange(opt.value)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                        filters.propertyType === opt.value
                                            ? 'bg-brand-red text-white shadow-sm'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-xs">{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Full FilterBar (same as /search) ── */}
                    <FilterBar
                        filters={filters}
                        onFiltersChange={setFilters}
                        onSearch={() => handleSearch()}
                        isLoading={loading}
                    />

                    {/* ── Listings Scrollable Area ── */}
                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth custom-scrollbar bg-slate-50/30">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                                    {listings.map((listing) => (
                                        <div
                                            key={listing.ListingKey}
                                            onMouseEnter={() => setActiveListingId(listing.ListingKey)}
                                            onMouseLeave={() => setActiveListingId(null)}
                                            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        >
                                            <UnifiedPropertyCard listing={listing} />
                                        </div>
                                    ))}
                                </div>

                                {/* ── Pagination ── */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-100">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 text-xs shadow-sm transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                let pageNum: number;
                                                if (totalPages <= 5) pageNum = i + 1;
                                                else if (currentPage <= 3) pageNum = i + 1;
                                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                                else pageNum = currentPage - 2 + i;

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => goToPage(pageNum)}
                                                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                                                            ? 'bg-brand-red text-white shadow-sm'
                                                            : 'border border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 text-xs shadow-sm transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>

                                        <span className="ml-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {currentPage}/{totalPages}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <span className="text-4xl">🔎</span>
                                <h3 className="text-lg font-black text-slate-900 uppercase">No Listings Found</h3>
                                <p className="text-xs text-slate-400 font-bold max-w-xs">
                                    {drawnBounds 
                                        ? 'No listings found within the drawn area. Try drawing a larger area or clearing the selection.'
                                        : 'Adjust your filters to discover more properties in the MLS® network.'
                                    }
                                </p>
                                <div className="flex items-center gap-3">
                                    {drawnBounds && (
                                        <button
                                            onClick={clearDrawnArea}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 hover:underline"
                                        >
                                            Clear Area
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            const resetFilters = { ...DEFAULT_FILTERS };
                                            setFilters(resetFilters);
                                            setDrawnBounds(null);
                                            handleSearch(resetFilters, null);
                                        }}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red hover:underline"
                                    >
                                        Reset Discovery
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ══════════ RIGHT PANEL: Map ══════════ */}
                {showMap && (
                    <section className="flex-1 h-full relative p-4 bg-white lg:p-6 lg:pl-0 animate-in fade-in slide-in-from-right-8 duration-700">
                        <MapView
                            listings={listings}
                            activeListingId={activeListingId}
                            enableDraw={true}
                            isDrawActive={isDrawActive}
                            onDrawComplete={handleDrawComplete}
                            onDrawClear={handleDrawClear}
                        />
                    </section>
                )}

                {/* Mobile Toggle */}
                <button
                    onClick={() => setShowMap(!showMap)}
                    className="lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 active:scale-95 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    {showMap ? 'Show Listings' : 'Show Map'}
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </main>
    );
}
