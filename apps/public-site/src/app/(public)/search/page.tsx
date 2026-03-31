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

    // ─── Search State ───────────────────────────────────────────
    const [filters, setFilters] = useState<FilterState>(() => ({
        ...DEFAULT_FILTERS,
        searchQuery: searchParams.get('q') || '',
        city: searchParams.get('city') || 'Toronto',
        listingType: (searchParams.get('listingType') as 'Residential' | 'Commercial') || 'Residential',
        propertyType: searchParams.get('propertyType') || 'Any',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || 'newest',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    }));

    // ─── Property Type Filter Handler ───────────────────────────────────
    const PROPERTY_TYPE_OPTIONS = [
        { label: 'All Types', value: 'Any', icon: '🏢' },
        { label: 'Residential', value: 'Residential', icon: '🏠' },
        { label: 'Commercial', value: 'Commercial', icon: '🏗️' },
        { label: 'Lease', value: 'Lease', icon: '📝' },
    ];

    const handlePropertyTypeChange = (value: string) => {
        const newFilters = { ...filters, propertyType: value };
        setFilters(newFilters);
        handleSearch(newFilters);
    };

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
    }, [filters, router]);

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

    // ─── Auto-search on mount ───────────────────────────────────
    useEffect(() => {
        handleSearch();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col relative">
            {/* ─── Auth Gate: Blocks entire page until login/register ─── */}
            {isGated && <LeadGate />}

            {/* ─── Gated Content Wrapper ─── */}
            <div className={isGated ? 'blur-sm brightness-75 pointer-events-none select-none transition-all duration-500' : 'transition-all duration-500'}>

            {/* ─── Search Header ─────────────────────── */}
            <div className="pt-20 bg-white border-b border-slate-100 relative overflow-hidden">

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-red">
                                <span className="w-12 h-px bg-brand-red"></span>
                                {filters.propertyType === 'Any' ? 'All Property' : filters.propertyType} Discovery
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                                Properties For <span className="text-brand-red italic">Perspective</span>.
                            </h1>
                            <p className="text-slate-600 font-medium max-w-lg">
                                Search thousands of verified MLS® listings with advanced filters. Updated in real-time from the CREA DDF® network.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-5 py-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                                </span>
                                <span className="text-brand-red font-black">{globalTotalCount.toLocaleString()}</span>
                                <span className="text-slate-600">Properties</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Hero Search Bar (Light Mode) ──── */}
                    <div className="w-full max-w-4xl">
                        <div className="bg-white border border-slate-200 rounded-[28px] p-2 shadow-xl shadow-slate-200/50">
                            <div className="flex flex-col sm:flex-row items-stretch gap-2">
                                {/* Location Input */}
                                <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-[20px] px-5 py-4 border border-slate-100 hover:border-slate-200 transition-all group">
                                    <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">Location</label>
                                        <input
                                            id="hero-search-city"
                                            type="text"
                                            placeholder="City, Address or Postal Code..."
                                            value={filters.city}
                                            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                            className="w-full bg-transparent border-none outline-none text-slate-900 text-[15px] font-bold placeholder:text-slate-400 placeholder:font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Keyword Input */}
                                <div className="hidden sm:flex items-center gap-3 w-64 bg-slate-50 rounded-[20px] px-5 py-4 border border-slate-100 hover:border-slate-200 transition-all">
                                    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                    </svg>
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">Keyword</label>
                                        <input
                                            id="hero-search-keyword"
                                            type="text"
                                            placeholder="MLS® #, feature..."
                                            value={filters.searchQuery}
                                            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                            className="w-full bg-transparent border-none outline-none text-slate-900 text-[14px] font-bold placeholder:text-slate-400 placeholder:font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    id="hero-search-btn"
                                    onClick={() => handleSearch()}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-red hover:bg-red-600 disabled:bg-slate-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[20px] transition-all duration-300 active:scale-[0.97] whitespace-nowrap shadow-lg shadow-red-500/20 hover:shadow-red-600/40 hover:-translate-y-0.5"
                                >
                                    {isLoading ? (
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    )}
                                    Search
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                                Popular:
                            </p>
                            {['Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'].map((city) => (
                                <button
                                    key={city}
                                    onClick={() => { setFilters(prev => ({ ...prev, city })); handleSearch({ ...filters, city }); }}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-red transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Property Type Selector ─────────────── */}
            <div className="bg-white border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                            Property Type
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {PROPERTY_TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    id={`filter-type-${opt.value.toLowerCase()}`}
                                    onClick={() => handlePropertyTypeChange(opt.value)}
                                    className={`group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                        filters.propertyType === opt.value
                                            ? 'bg-brand-red text-white scale-[1.02]'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-sm">{opt.icon}</span>
                                    {opt.label}
                                    {filters.propertyType === opt.value && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white/80 border border-brand-red"></span>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Filter Bar (Sticky) ───────────────── */}
            <FilterBar
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={() => handleSearch()}
                isLoading={isLoading}
            />

            {/* ─── Results Area ──────────────────────── */}
            <main ref={resultsRef} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
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
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[10px] font-black text-brand-red border border-red-100 uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                            </span>
                            REALTOR.ca® · Live MLS® Data
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && <ListingGridSkeleton count={8} />}

                {/* Error */}
                {error && !isLoading && (
                    <ErrorState message={error} onRetry={() => handleSearch()} />
                )}

                {/* Empty */}
                {!isLoading && !error && hasSearched && listings.length === 0 && (
                    <EmptyState />
                )}

                {/* Results Grid */}
                {!isLoading && listings.length > 0 && (
                    <div className="flex flex-col gap-12">
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-slate-200" />
                                <div className="px-5 py-2 rounded-full bg-brand-red text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                    {(filters.city || 'Results').toUpperCase()} · {filteredTotal.toLocaleString()} MATCHES
                                </div>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {listings.map((l: MLSProperty, i: number) => (
                                    <UnifiedPropertyCard key={l.ListingKey || `l-${i}`} listing={l} index={i} />
                                ))}
                            </div>
                        </section>
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
                                                ? 'bg-brand-red text-white shadow-lg shadow-red-200'
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

            {/* Footer */}
            <footer className="mt-20 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red shadow-lg shadow-brand-red/20 text-sm font-bold text-white">
                                RE
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 tracking-tight">Skyline Estates Realty</span>
                                <span className="block text-[10px] text-gray-400 font-medium">MLS® VERIFIED DATA · REALTOR.ca® PARTNER</span>
                            </div>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-[8px] text-slate-400 max-w-sm leading-relaxed">
                                The trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by The Canadian Real Estate Association (CREA).
                            </p>
                            <p className="mt-2 text-xs font-bold text-gray-900">
                                © {new Date().getFullYear()} Skyline Estates. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            </div>{/* End Gated Content Wrapper */}

            <style jsx global>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
}
