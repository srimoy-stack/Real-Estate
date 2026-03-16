'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { listingService } from '@repo/services';
import { Listing, PropertyType } from '@repo/types';
import { PropertyCard } from '@/components/sections/PropertyCard';
import { MapView } from '@/components/listings/MapView';

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

                {/* Left Panel: Filters and Grid */}
                <aside className={`flex-1 flex flex-col h-full bg-slate-50 border-r border-slate-100 transition-all duration-500 overflow-hidden ${showMap ? 'lg:w-[55%] xl:w-[45%]' : 'lg:w-full'
                    }`}>

                    {/* Filter Header */}
                    <div className="bg-white p-6 border-b border-slate-100 shadow-sm z-10">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                                World <span className="text-indigo-600">Explorer</span>.
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {totalCount} Properties Found
                                </span>
                                <button
                                    onClick={() => setShowMap(!showMap)}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                >
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </button>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                            <select
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="">All Cities</option>
                                <option value="Toronto">Toronto</option>
                                <option value="Vancouver">Vancouver</option>
                                <option value="Mississauga">Mississauga</option>
                            </select>

                            <select
                                value={filters.propertyType}
                                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="">Property Type</option>
                                {Object.values(PropertyType).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>

                            <select
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="">Min Price</option>
                                <option value="500000">$500k</option>
                                <option value="1000000">$1M</option>
                                <option value="2000000">$2M</option>
                            </select>

                            <select
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="">Max Price</option>
                                <option value="1000000">$1M</option>
                                <option value="2000000">$2M</option>
                                <option value="5000000">$5M</option>
                            </select>

                            <select
                                value={filters.bedrooms}
                                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-400 outline-none transition-all"
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
                                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="">Baths</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                            </select>
                        </div>
                    </div>

                    {/* Listings Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/3] bg-white rounded-3xl animate-pulse shadow-sm" />
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                                {listings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        onMouseEnter={() => setActiveListingId(listing.id)}
                                        onMouseLeave={() => setActiveListingId(null)}
                                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                                    >
                                        <PropertyCard listing={listing} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <div className="text-5xl">🏘️</div>
                                <h3 className="text-xl font-black text-slate-900 italic">No properties match your filters.</h3>
                                <button
                                    onClick={() => setFilters({ city: '', propertyType: '' as any, minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '' })}
                                    className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    Reset Filters
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
                            onMapUpdate={fetchListings}
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
