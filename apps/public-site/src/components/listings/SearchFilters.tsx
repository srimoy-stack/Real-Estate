'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyType, ListingStatus } from '@repo/types';

interface FilterState {
    priceRange: string;
    bedrooms: string;
    bathrooms: string;
    type: string;
    status: string;
    city: string;
    keyword: string;
    sort: string;
}

export const SearchFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Determine initial price range from min/max params if available
    const getInitialPriceRange = () => {
        const min = searchParams.get('minPrice');
        const max = searchParams.get('maxPrice');
        if (min === '0' && max === '500000') return '0-500k';
        if (min === '500000' && max === '1000000') return '500k-1m';
        if (min === '1000000' && max === '2000000') return '1m-2m';
        if (min === '2000000') return '2m+';
        return '';
    };

    const [filters, setFilters] = useState<FilterState>({
        priceRange: getInitialPriceRange(),
        bedrooms: searchParams.get('bedrooms') || '',
        bathrooms: searchParams.get('bathrooms') || '',
        type: searchParams.get('type') || '',
        status: searchParams.get('status') || '',
        city: searchParams.get('city') || '',
        keyword: searchParams.get('keyword') || '',
        sort: searchParams.get('sort') || 'newest',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Immediate update on select change, debounced for text
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();

            // Map price range selection back to min/max params
            if (filters.priceRange) {
                if (filters.priceRange === '0-500k') {
                    params.set('minPrice', '0');
                    params.set('maxPrice', '500000');
                } else if (filters.priceRange === '500k-1m') {
                    params.set('minPrice', '500000');
                    params.set('maxPrice', '1000000');
                } else if (filters.priceRange === '1m-2m') {
                    params.set('minPrice', '1000000');
                    params.set('maxPrice', '2000000');
                } else if (filters.priceRange === '2m+') {
                    params.set('minPrice', '2000000');
                }
            }

            Object.entries(filters).forEach(([key, value]) => {
                if (key !== 'priceRange' && value) params.set(key, value);
            });

            const newQuery = params.toString();
            const currentQuery = searchParams.toString();

            if (newQuery !== currentQuery) {
                router.push(`/search?${newQuery}`, { scroll: false });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [filters, router, searchParams]);

    const clearFilters = () => {
        setFilters({
            priceRange: '',
            bedrooms: '',
            bathrooms: '',
            type: '',
            status: '',
            city: '',
            keyword: '',
            sort: 'newest',
        });
        router.push('/search', { scroll: false });
    };

    const inputClasses = "w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold";
    const selectClasses = "w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer font-bold";

    return (
        <div className="space-y-8 rounded-[32px] bg-white p-8 border border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 italic">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors"
                >
                    Reset All
                </button>
            </div>

            <div className="space-y-6">
                {/* Search Keyword */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keyword</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="keyword"
                            placeholder="MLS®, Address, Title..."
                            value={filters.keyword}
                            onChange={handleInputChange}
                            className={`${inputClasses} pl-11`}
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</label>
                    <select
                        name="city"
                        value={filters.city}
                        onChange={handleInputChange}
                        className={selectClasses}
                    >
                        <option value="">All Cities</option>
                        <option value="Toronto">Toronto</option>
                        <option value="Vancouver">Vancouver</option>
                        <option value="Mississauga">Mississauga</option>
                        <option value="Muskoka">Muskoka</option>
                        <option value="Calgary">Calgary</option>
                    </select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price Range</label>
                    <select
                        name="priceRange"
                        value={filters.priceRange}
                        onChange={handleInputChange}
                        className={selectClasses}
                    >
                        <option value="">Any Price</option>
                        <option value="0-500k">$0 - $500k</option>
                        <option value="500k-1m">$500k - $1M</option>
                        <option value="1m-2m">$1M - $2M</option>
                        <option value="2m+">$2M+</option>
                    </select>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Type</label>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleInputChange}
                        className={selectClasses}
                    >
                        <option value="">All Types</option>
                        {Object.values(PropertyType).map(type => (
                            <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleInputChange}
                        className={selectClasses}
                    >
                        <option value="">Any Status</option>
                        {Object.values(ListingStatus).map(status => (
                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Beds & Baths */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Beds</label>
                        <select
                            name="bedrooms"
                            value={filters.bedrooms}
                            onChange={handleInputChange}
                            className={selectClasses}
                        >
                            <option value="">Any</option>
                            {['1', '2', '3', '4', '5'].map(val => (
                                <option key={val} value={val}>{val}+</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baths</label>
                        <select
                            name="bathrooms"
                            value={filters.bathrooms}
                            onChange={handleInputChange}
                            className={selectClasses}
                        >
                            <option value="">Any</option>
                            {['1', '2', '3', '4'].map(val => (
                                <option key={val} value={val}>{val}+</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort By</label>
                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleInputChange}
                        className={selectClasses}
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Results update automatically
                </p>
            </div>
        </div>
    );
};
