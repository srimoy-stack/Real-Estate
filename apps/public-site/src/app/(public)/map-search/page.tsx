'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { listingService } from '@repo/services';
import { Listing, PropertyType } from '@repo/types';
import { UnifiedPropertyCard } from '@/components/ui';
import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/listings/MapView').then((mod) => mod.MapView),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 animate-pulse rounded-[32px] flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Interactive Map...</span>
      </div>
    )
  }
);

export default function MapBasedSearchPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const [activeListingId, setActiveListingId] = useState<string | null>(null);

    // Filters
    const [filters, setFilters] = useState({
        city: '',
        propertyType: '' as any,
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
    });

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const query: any = {
                city: filters.city || undefined,
                propertyType: filters.propertyType || undefined,
                minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
                bathrooms: filters.bathrooms ? Number(filters.bathrooms) : undefined,
                limit: 20
            };
            const response = await listingService.search(query);
            if (response.success) {
                setListings(response.data);
                setTotalCount(response.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <main className="min-h-screen bg-white">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)] overflow-hidden">

                {/* Left Panel: Filters and Grid — Realtor.ca High-Density Style */}
                <aside className={`flex-1 flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-500 overflow-hidden ${showMap ? 'lg:w-[50%] xl:w-[45%]' : 'lg:w-full'
                    }`}>

                    {/* Compact Filter Header */}
                    <div className="bg-white p-5 border-b border-slate-100 shadow-sm z-10">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    Properties <span className="text-brand-red">in {filters.city || 'Canada'}</span>
                                </h1>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {totalCount.toLocaleString()} Listings Found
                                </span>
                            </div>
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-sm"
                            >
                                {showMap ? 'Hide Map' : 'Show Map View'}
                            </button>
                        </div>

                        {/* Professional Compact Filter Bar */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
                            <input
                                placeholder="City/MLS®"
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700 focus:bg-white focus:border-brand-red outline-none transition-all placeholder:text-slate-300"
                            />

                            <select
                                value={filters.propertyType}
                                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <option value="">Prop Type</option>
                                {Object.values(PropertyType).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>

                            <select
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700"
                            >
                                <option value="">Min Price</option>
                                <option value="500000">$500k</option>
                                <option value="1000000">$1M</option>
                                <option value="2000000">$2M</option>
                            </select>

                            <select
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700"
                            >
                                <option value="">Max Price</option>
                                <option value="1000000">$1M</option>
                                <option value="2000000">$2M</option>
                                <option value="5000000">$5M</option>
                            </select>

                            <select
                                value={filters.bedrooms}
                                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700"
                            >
                                <option value="">Beds</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                            </select>

                            <select
                                value={filters.bathrooms}
                                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700"
                            >
                                <option value="">Baths</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                            </select>
                        </div>
                    </div>

                    {/* Listings Scrollable Area — dense grid */}
                    <div className="flex-1 overflow-y-auto p-5 scroll-smooth custom-scrollbar bg-slate-50/30">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                                {listings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        onMouseEnter={() => setActiveListingId(listing.id)}
                                        onMouseLeave={() => setActiveListingId(null)}
                                        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    >
                                        <UnifiedPropertyCard listing={listing} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <span className="text-4xl">🔎</span>
                                <h3 className="text-lg font-black text-slate-900 uppercase">No Listings Found</h3>
                                <p className="text-xs text-slate-400 font-bold max-w-xs">Adjust your filters to discover more properties in the MLS® network.</p>
                                <button
                                    onClick={() => setFilters({ city: '', propertyType: '' as any, minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '' })}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red hover:underline"
                                >
                                    Reset Discovery
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Panel: Map */}
                {showMap && (
                    <section className="flex-1 h-full relative p-4 bg-white lg:p-6 lg:pl-0 animate-in fade-in slide-in-from-right-8 duration-700">
                        <MapView
                            listings={listings}
                            activeListingId={activeListingId}
                        />
                    </section>
                )}

                {/* Mobile Toggle Button */}
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
