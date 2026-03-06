'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyType } from '@repo/types';

interface FilterState {
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    propertyType: string;
    city: string;
    postalCode: string;
    keyword: string;
}

export const ListingFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState<FilterState>({
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        bathrooms: searchParams.get('bathrooms') || '',
        propertyType: searchParams.get('propertyType') || '',
        city: searchParams.get('city') || '',
        postalCode: searchParams.get('postalCode') || '',
        keyword: searchParams.get('keyword') || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Debounced update to URL
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });

            const newQuery = params.toString();
            const currentQuery = searchParams.toString();

            if (newQuery !== currentQuery) {
                router.push(`/listings?${newQuery}`, { scroll: false });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [filters, router, searchParams]);

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            bathrooms: '',
            propertyType: '',
            city: '',
            postalCode: '',
            keyword: '',
        });
        router.push('/listings', { scroll: false });
    };

    const inputClasses = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all";
    const selectClasses = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer";

    return (
        <div className="space-y-5 rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                    Reset All
                </button>
            </div>

            <div className="space-y-4">
                {/* Search Keyword */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="keyword"
                            placeholder="Address, city or MLS® #"
                            value={filters.keyword}
                            onChange={handleInputChange}
                            className={`${inputClasses} pl-9`}
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min Price"
                            value={filters.minPrice}
                            onChange={handleInputChange}
                            className={inputClasses}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max Price"
                            value={filters.maxPrice}
                            onChange={handleInputChange}
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Beds & Baths */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">Beds</label>
                        <select
                            name="bedrooms"
                            value={filters.bedrooms}
                            onChange={handleInputChange}
                            className={selectClasses}
                        >
                            <option value="">Any</option>
                            {['1', '2', '3', '4', '5+'].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">Baths</label>
                        <select
                            name="bathrooms"
                            value={filters.bathrooms}
                            onChange={handleInputChange}
                            className={selectClasses}
                        >
                            <option value="">Any</option>
                            {['1', '2', '3', '4+'].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">City</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="e.g. Toronto"
                            value={filters.city}
                            onChange={handleInputChange}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">Postal Code</label>
                        <input
                            type="text"
                            name="postalCode"
                            placeholder="e.g. M5V"
                            value={filters.postalCode}
                            onChange={handleInputChange}
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Property Type */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Property Type</label>
                    <select
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleInputChange}
                        className={selectClasses}
                    >
                        <option value="">All Types</option>
                        {Object.values(PropertyType).map(type => (
                            <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Results update automatically
                </p>
            </div>
        </div>
    );
};
