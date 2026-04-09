'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedPropertyCard } from '@/components/ui';
import { LeadGate } from '@/components/auth/LeadGate';
import { useAuth } from '@repo/auth';
import { FilterBar } from '@/app/listings-demo/components/FilterBar';
import { fetchListings } from '@/app/listings-demo/api';
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
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Interactive Maps...</span>
      </div>
    )
  }
);

const PAGE_SIZE = 40; // Smaller page size for faster map search

// ─── Property Type Options ──────────────────────────────────────
const PROPERTY_TYPE_OPTIONS = [
    { label: 'All Homes', value: 'Any', icon: '🌍' },
    { label: 'Residential', value: 'Residential', icon: '🏠' },
    { label: 'Commercial', value: 'Commercial', icon: '🏗️' },
    { label: 'Condo', value: 'Condo', icon: '🏙️' },
];

export default function MapBasedSearchPage() {
    const router = useRouter();

    const [listings, setListings] = useState<MLSProperty[]>([]);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [activeListingId, setActiveListingId] = useState<string | null>(null);
    const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [isGateOpen, setIsGateOpen] = useState(false);
    const { isAuthenticated, hasHydrated } = useAuth();

    const [isDrawActive, setIsDrawActive] = useState(false);
    const [drawnBounds, setDrawnBounds] = useState<DrawBounds | null>(() => {
        if (typeof window === 'undefined') return null;
        const d = new URLSearchParams(window.location.search).get('drawn');
        if (d) { try { return JSON.parse(d); } catch (e) { return null; } }
        return null;
    });

    const searchIdRef = useRef<number>(0);
    const listingRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const [filters, setFilters] = useState<FilterState>(() => {
        const defaults: FilterState = {
            ...DEFAULT_FILTERS,
            searchQuery: '',
            city: '',
            propertyType: 'Any',
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest',
            order: 'desc',
        };

        // Hydrate filters from URL params on initial load
        if (typeof window !== 'undefined') {
            const sp = new URLSearchParams(window.location.search);
            if (sp.get('city')) defaults.city = sp.get('city')!;
            if (sp.get('propertyType') && sp.get('propertyType') !== 'Any') defaults.propertyType = sp.get('propertyType')!;
            if (sp.get('minPrice')) defaults.minPrice = sp.get('minPrice')!;
            if (sp.get('maxPrice')) defaults.maxPrice = sp.get('maxPrice')!;
            if (sp.get('beds') && sp.get('beds') !== 'Any') defaults.beds = sp.get('beds')!;
            if (sp.get('baths') && sp.get('baths') !== 'Any') defaults.baths = sp.get('baths')!;
            if (sp.get('searchQuery')) defaults.searchQuery = sp.get('searchQuery')!;
            if (sp.get('sortBy')) defaults.sortBy = sp.get('sortBy')!;
            if (sp.get('order')) defaults.order = sp.get('order') as 'asc' | 'desc';
        }

        return defaults;
    });

    // ─── Force Body Lock (Critical Fix) ─────────────────────────
    useEffect(() => {
        if (isGateOpen && !isAuthenticated) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
        
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, [isGateOpen, isAuthenticated]);
    
    // Auto-close gate on successful auth
    useEffect(() => {
        if (isAuthenticated) {
            setIsGateOpen(false);
        }
    }, [isAuthenticated]);

    // Auto-open gate on mount for Map Search (Gated flow)
    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            setIsGateOpen(true);
        }
    }, [hasHydrated, isAuthenticated]);

    // ─── Debounced Search Core ──────────────────────────────────
    const performSearch = useCallback(async (activeFilters: FilterState, activeBounds: DrawBounds | null, pageNum: number = 1) => {
        const currentSearchId = ++searchIdRef.current;
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
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

            // Correctly pass pagination to the aggregator
            const data = await fetchListings({ ...enrichedFilters, limit: String(PAGE_SIZE), page: String(pageNum) } as any, pageNum, PAGE_SIZE);

            if (currentSearchId !== searchIdRef.current) return;

            if (pageNum === 1) {
                setListings(data.listings);
                setPage(1);
            } else {
                setListings(prev => [...prev, ...data.listings]);
                setPage(pageNum);
            }
            setFilteredTotal(data.total);

            // Sync URL
            const url = new URL(window.location.href);
            if (activeFilters.city) url.searchParams.set('city', activeFilters.city);
            if (activeBounds) url.searchParams.set('drawn', JSON.stringify(activeBounds));
            else url.searchParams.delete('drawn');
            router.replace(url.pathname + url.search, { scroll: false });
            
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            if (currentSearchId === searchIdRef.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, [router]);

    const debouncedSearchTimer = useRef<NodeJS.Timeout>();
    const debouncedSearch = useCallback((f: FilterState, b: DrawBounds | null) => {
        if (debouncedSearchTimer.current) clearTimeout(debouncedSearchTimer.current);
        debouncedSearchTimer.current = setTimeout(() => performSearch(f, b, 1), 400);
    }, [performSearch]);

    const handleLoadMore = () => {
        if (loading || loadingMore || listings.length >= filteredTotal) return;
        performSearch(filters, drawnBounds, page + 1);
    };

    const handleDrawComplete = useCallback((bounds: DrawBounds) => {
        setDrawnBounds(bounds);
        setIsDrawActive(false);
        debouncedSearch(filters, bounds);
    }, [filters, debouncedSearch]);

    const handleDrawClear = useCallback(() => {
        setDrawnBounds(null);
        debouncedSearch(filters, null);
    }, [filters, debouncedSearch]);

    const handleMarkerClick = useCallback((id: string) => {
        setActiveListingId(id);
        const card = listingRefs.current[id];
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    useEffect(() => { performSearch(filters, drawnBounds); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <main className="fixed inset-0 top-[72px] bg-white overflow-hidden z-10">
            
            <LeadGate 
                isOpen={isGateOpen && !isAuthenticated} 
                onClose={() => setIsGateOpen(false)} 
                mandatory={true}
            />

            <div className={`flex h-full flex-col lg:flex-row overflow-hidden ${!showMap ? 'container mx-auto max-w-[1400px]' : ''} ${(isGateOpen && !isAuthenticated) ? 'blur-sm brightness-75 pointer-events-none' : ''}`}>

                {/* ── LEFT PANEL ── */}
                <aside className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-700 ease-in-out z-40 ${showMap ? 'lg:w-[50%] xl:w-[45%]' : 'w-full'}`}>

                    <div className="bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 z-[70] shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
                                    Interactive <span className="text-red-600">Search</span>
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {loading ? 'Refreshing Results...' : `${filteredTotal.toLocaleString()} Homes in ${filters.city || 'Canada'}`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsDrawActive(!isDrawActive)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 ${
                                        isDrawActive ? 'bg-red-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Draw
                                </button>
                                <button
                                    onClick={() => setShowMap(!showMap)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 shadow-sm"
                                >
                                    {showMap ? 'List Only' : 'Show Map'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {PROPERTY_TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => { const nf = { ...filters, propertyType: opt.value }; setFilters(nf); debouncedSearch(nf, drawnBounds); }}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        filters.propertyType === opt.value
                                            ? 'bg-indigo-50 text-red-600 border-red-200'
                                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="px-0 py-0 border-b border-slate-50 z-[60] sticky top-0 bg-white">
                        <FilterBar
                            filters={filters}
                            onFiltersChange={(nf) => { setFilters(nf); debouncedSearch(nf, drawnBounds); }}
                            onSearch={() => performSearch(filters, drawnBounds)}
                            isLoading={loading}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/10 custom-scrollbar scroll-smooth">
                        <div className={`p-6 ${!showMap ? 'max-w-7xl mx-auto' : ''}`}>
                            {loading && listings.length === 0 ? (
                                <div className={`grid grid-cols-1 ${showMap ? 'xl:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-8`}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-3xl animate-pulse border border-slate-100" />)}
                                </div>
                            ) : listings.length > 0 ? (
                                <>
                                    <div className={`grid grid-cols-1 ${showMap ? 'xl:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-8 pb-12`}>
                                        {listings.map((listing) => (
                                            <div
                                                key={listing.ListingKey}
                                                ref={(el) => { listingRefs.current[listing.ListingKey] = el; }}
                                                onMouseEnter={() => setHoveredListingId(listing.ListingKey)}
                                                onMouseLeave={() => setHoveredListingId(null)}
                                                className={`transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-8 ${
                                                    activeListingId === listing.ListingKey 
                                                        ? 'ring-2 ring-red-500 ring-offset-4 rounded-[40px]' 
                                                        : ''
                                                }`}
                                            >
                                                <UnifiedPropertyCard 
                                                    listing={listing} 
                                                    onAuthRequired={(!isAuthenticated && hasHydrated) ? () => setIsGateOpen(true) : undefined}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {listings.length < filteredTotal && (
                                        <div className="py-20 flex flex-col items-center gap-6 border-t border-slate-50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                You&apos;ve viewed {listings.length} of {filteredTotal} Matches
                                            </p>
                                            <button 
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center gap-4"
                                            >
                                                {loadingMore && (
                                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                )}
                                                Explore Next {PAGE_SIZE} Homes
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-20 text-center px-10">
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic">No Matches Found</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-8">Try adjusting your filters or expanding the search area.</p>
                                    <button onClick={handleDrawClear} className="px-8 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100">Reset Search</button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <footer className="mt-12 p-8 border-t border-slate-100 text-center">
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">SquareFT • MLS® Data Integration</p>
                        </footer>
                    </div>
                </aside>

                {/* ── RIGHT PANEL ── */}
                {showMap && (
                    <section className="flex-1 h-full relative p-0 lg:p-6 lg:pl-0">
                        <div className="w-full h-full lg:rounded-[32px] overflow-hidden border border-slate-200 shadow-xl bg-white relative">
                            <MapView
                                listings={listings}
                                activeListingId={activeListingId}
                                hoveredListingId={hoveredListingId}
                                enableDraw={true}
                                isDrawActive={isDrawActive}
                                onDrawComplete={handleDrawComplete}
                                onDrawClear={handleDrawClear}
                                onMarkerClick={handleMarkerClick}
                            />
                        </div>
                    </section>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </main>
    );
}
