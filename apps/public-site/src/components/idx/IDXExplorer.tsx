'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { listingService } from '@repo/services';
import { Listing, PropertyType, ListingStatus } from '@repo/types';
import { UnifiedPropertyCard } from '@/components/ui';
import { IDXMapPlaceholder } from './IDXMapPlaceholder';

// ─── Filter State ──────────────────────────────────────
interface FilterState {
    city: string;
    postalCode: string;
    propertyType: string;
    priceRange: string;
    bedrooms: string;
    bathrooms: string;
    status: string;
    sort: string;
    keyword: string;
}

const initialFilters: FilterState = {
    city: '',
    postalCode: '',
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    status: '',
    sort: 'newest',
    keyword: '',
};

const ITEMS_PER_PAGE = 12;

// ─── Price Range Helpers ───────────────────────────────
const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Under $500K', value: '0-500000' },
    { label: '$500K – $1M', value: '500000-1000000' },
    { label: '$1M – $2M', value: '1000000-2000000' },
    { label: '$2M – $5M', value: '2000000-5000000' },
    { label: '$5M+', value: '5000000-' },
];

function parsePriceRange(range: string): { min?: number; max?: number } {
    if (!range) return {};
    const [min, max] = range.split('-');
    return {
        min: min ? Number(min) : undefined,
        max: max ? Number(max) : undefined,
    };
}

// ─── Component ─────────────────────────────────────────
export const IDXExplorer: React.FC = () => {
    // State
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [listings, setListings] = useState<Listing[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [mobileMapOpen, setMobileMapOpen] = useState(false);
    const [highlightedId, _setHighlightedId] = useState<string | null>(null);
    const [selectedMapListing, setSelectedMapListing] = useState<Listing | null>(null);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // ─── Build Query ───────────────────────────────────
    const buildQuery = useCallback(
        (pageNum: number) => {
            const { min, max } = parsePriceRange(filters.priceRange);
            const query: any = {
                sort: filters.sort,
                page: pageNum,
                limit: ITEMS_PER_PAGE,
            };
            if (filters.city) query.city = filters.city;
            if (filters.propertyType) query.propertyType = filters.propertyType;
            if (filters.status) query.status = filters.status;
            if (min !== undefined) query.minPrice = min;
            if (max !== undefined) query.maxPrice = max;
            if (filters.bedrooms) query.bedrooms = Number(filters.bedrooms);
            if (filters.bathrooms) query.bathrooms = Number(filters.bathrooms);
            if (filters.keyword) query.keyword = filters.keyword;
            return query;
        },
        [filters]
    );

    // ─── Fetch Listings ────────────────────────────────
    const fetchListings = useCallback(async () => {
        setLoading(true);
        setPage(1);
        try {
            const query = buildQuery(1);
            const response = await listingService.search(query);
            if (response.success) {
                setListings(response.data);
                setTotalCount(response.pagination.total);
            }
        } catch (err) {
            console.error('[IDXExplorer] Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, [buildQuery]);

    // Initial fetch and refetch on filter change
    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    // ─── Load More ─────────────────────────────────────
    const handleLoadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            const query = buildQuery(nextPage);
            const response = await listingService.search(query);
            if (response.success) {
                setListings((prev) => [...prev, ...response.data]);
                setPage(nextPage);
            }
        } catch (err) {
            console.error('[IDXExplorer] Load more failed:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const hasMore = listings.length < totalCount;

    // ─── Filter Handlers ───────────────────────────────
    const updateFilter = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters(initialFilters);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.city) count++;
        if (filters.propertyType) count++;
        if (filters.priceRange) count++;
        if (filters.bedrooms) count++;
        if (filters.bathrooms) count++;
        if (filters.status) count++;
        if (filters.keyword) count++;
        return count;
    }, [filters]);

    // ─── Select Styles ────────────────────────────────
    const selectClass =
        'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer';
    const inputClass =
        'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-semibold placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all';

    // ─── Skeleton Cards ────────────────────────────────
    const SkeletonCard = () => (
        <div className="animate-pulse rounded-2xl bg-white border border-slate-100 overflow-hidden">
            <div className="aspect-[16/10] bg-slate-200" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="flex gap-3 pt-2">
                    <div className="h-3 bg-slate-100 rounded w-14" />
                    <div className="h-3 bg-slate-100 rounded w-14" />
                    <div className="h-3 bg-slate-100 rounded w-16" />
                </div>
                <div className="h-3 bg-slate-50 rounded w-1/3 pt-2" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
            {/* ─── Page Header ────────────────────────────── */}
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-2">
                            <span className="w-8 h-px bg-indigo-600" />
                            IDX Property Explorer
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                            Find Your{' '}
                            <span className="text-indigo-600 italic">Dream Home</span>
                        </h1>
                        <p className="text-sm font-medium text-slate-400 mt-2">
                            {loading
                                ? 'Searching properties...'
                                : `${totalCount} ${totalCount === 1 ? 'property' : 'properties'} available`}
                        </p>
                    </div>

                    {/* View toggles */}
                    <div className="flex items-center gap-3">
                        {/* Desktop map toggle */}
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showMap
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            {showMap ? 'Hide Map' : 'Show Map'}
                        </button>

                        {/* Mobile map toggle */}
                        <button
                            onClick={() => setMobileMapOpen(!mobileMapOpen)}
                            className={`lg:hidden flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mobileMapOpen
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white text-slate-600 border border-slate-200'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Map
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Search Bar ─────────────────────────────── */}
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 mb-6">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-5">
                    {/* Main row: key search inputs + button */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                        {/* Keyword */}
                        <div className="lg:col-span-2 relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Address, MLS®, Keyword..."
                                value={filters.keyword}
                                onChange={(e) => updateFilter('keyword', e.target.value)}
                                className={`${inputClass} pl-10`}
                            />
                        </div>

                        {/* City */}
                        <select
                            value={filters.city}
                            onChange={(e) => updateFilter('city', e.target.value)}
                            className={selectClass}
                        >
                            <option value="">All Cities</option>
                            <option value="Toronto">Toronto</option>
                            <option value="Vancouver">Vancouver</option>
                            <option value="Mississauga">Mississauga</option>
                            <option value="Muskoka">Muskoka</option>
                            <option value="Calgary">Calgary</option>
                        </select>

                        {/* Property Type */}
                        <select
                            value={filters.propertyType}
                            onChange={(e) => updateFilter('propertyType', e.target.value)}
                            className={selectClass}
                        >
                            <option value="">All Types</option>
                            {Object.values(PropertyType).map((type) => (
                                <option key={type} value={type}>
                                    {type.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>

                        {/* Price Range */}
                        <select
                            value={filters.priceRange}
                            onChange={(e) => updateFilter('priceRange', e.target.value)}
                            className={selectClass}
                        >
                            {priceRanges.map((range) => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>

                        {/* Beds */}
                        <select
                            value={filters.bedrooms}
                            onChange={(e) => updateFilter('bedrooms', e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Beds</option>
                            {['1', '2', '3', '4', '5'].map((v) => (
                                <option key={v} value={v}>{v}+ Beds</option>
                            ))}
                        </select>

                        {/* Baths */}
                        <select
                            value={filters.bathrooms}
                            onChange={(e) => updateFilter('bathrooms', e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Baths</option>
                            {['1', '2', '3', '4'].map((v) => (
                                <option key={v} value={v}>{v}+ Baths</option>
                            ))}
                        </select>
                    </div>

                    {/* Expandable filters + controls */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                        {/* Toggle more filters */}
                        <button
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            <svg
                                className={`w-4 h-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            {filtersExpanded ? 'Less Filters' : 'More Filters'}
                        </button>

                        {/* Status quick pill */}
                        <select
                            value={filters.status}
                            onChange={(e) => updateFilter('status', e.target.value)}
                            className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:border-indigo-400 outline-none cursor-pointer"
                        >
                            <option value="">Any Status</option>
                            {Object.values(ListingStatus).map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={filters.sort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                            className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:border-indigo-400 outline-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>

                        {/* Active filter count & clear */}
                        {activeFilterCount > 0 && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                                </span>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Expanded Filter Row */}
                    {filtersExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-50 animate-[slideDown_0.2s_ease-out]">
                            {/* Postal Code */}
                            <input
                                type="text"
                                placeholder="Postal Code (e.g. M5J 2R8)"
                                value={filters.postalCode}
                                onChange={(e) => updateFilter('postalCode', e.target.value)}
                                className={inputClass}
                            />
                            {/* Placeholder for future: min/max sqft, lot size, etc. */}
                            <div className="flex items-center justify-center text-xs text-slate-300 font-medium italic">
                                More filters coming soon
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Mobile Map (collapsible) ───────────────── */}
            {mobileMapOpen && (
                <div className="lg:hidden mx-auto max-w-[1600px] px-4 sm:px-6 mb-6 animate-[slideDown_0.3s_ease-out]">
                    <div className="h-[400px] rounded-2xl overflow-hidden">
                        <IDXMapPlaceholder
                            listings={listings}
                            highlightedListingId={highlightedId}
                            onMarkerClick={(listing) => setSelectedMapListing(listing)}
                            onMarkerClose={() => setSelectedMapListing(null)}
                            selectedListing={selectedMapListing}
                        />
                    </div>
                </div>
            )}

            {/* ─── Main Content: Grid + Map ───────────────── */}
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                <div className="flex gap-6">
                    {/* ─ Listings Panel ─ */}
                    <div className={`flex-1 min-w-0 ${showMap ? 'lg:w-[60%]' : 'w-full'}`}>
                        {/* Results count bar */}
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {loading
                                    ? 'Loading...'
                                    : `Showing ${listings.length} of ${totalCount} properties`}
                            </p>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 rounded-3xl bg-white border border-slate-100 shadow-xl">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 italic mb-2">
                                    No properties found
                                </h3>
                                <p className="text-slate-400 font-medium text-sm mb-6 max-w-sm text-center">
                                    Try adjusting your search filters or expanding your search area to find more properties.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${showMap ? 'xl:grid-cols-2 2xl:grid-cols-3' : 'xl:grid-cols-3 2xl:grid-cols-4'
                                    }`}>
                                    {listings.map((listing, index) => (
                                        <div
                                            key={listing.id}
                                            className="opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]"
                                            style={{ animationDelay: `${(index % 12) * 50}ms` }}
                                        >
                                            <UnifiedPropertyCard
                                                listing={listing}
                                                index={index}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Load More */}
                                {hasMore && (
                                    <div className="flex justify-center mt-12">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="group relative px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                {loadingMore ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Loading More...
                                                    </>
                                                ) : (
                                                    <>
                                                        Load More Properties
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                        </svg>
                                                    </>
                                                )}
                                            </span>
                                            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        </button>
                                    </div>
                                )}

                                {/* Showing count */}
                                <div className="flex justify-center mt-6">
                                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">
                                        Showing {listings.length} of {totalCount} results
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ─ Map Panel (desktop) ─ */}
                    {showMap && (
                        <div className="hidden lg:block lg:w-[40%] flex-shrink-0">
                            <div className="sticky top-28 h-[calc(100vh-8rem)]">
                                <IDXMapPlaceholder
                                    listings={listings}
                                    highlightedListingId={highlightedId}
                                    onMarkerClick={(listing) => setSelectedMapListing(listing)}
                                    onMarkerClose={() => setSelectedMapListing(null)}
                                    selectedListing={selectedMapListing}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Animations ─────────────────────────────── */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};
