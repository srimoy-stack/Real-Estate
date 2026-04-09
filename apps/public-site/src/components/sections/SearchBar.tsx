'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/ui';

export interface SearchParams {
    city: string;
    query: string;
    listingType: 'Residential' | 'Commercial';
    propertyType: string;
    minPrice?: string;
    maxPrice?: string;
}

interface SearchBarProps {
    isCommercial?: boolean;
}

export const SearchBar = ({ isCommercial = true }: SearchBarProps) => {
    const router = useRouter();
    const [city, setCity] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');

    // ─── Search execution ───────────────────────────────────────
    const handleSearch = useCallback((overrideCity?: string, overrideType?: string) => {
        const finalCity = overrideCity ?? city;
        const finalType = overrideType ?? propertyType;

        if (!finalCity.trim() && !finalType && !priceRange) return;

        const params = new URLSearchParams();
        const isMls = /^[A-Z]\d+$/i.test(finalCity.trim()) || /^\d{5,}$/.test(finalCity.trim());

        if (isMls) {
            params.set('q', finalCity.trim());
        } else if (finalCity.trim()) {
            params.set('city', finalCity.trim());
        }

        params.set('listingType', isCommercial ? 'Commercial' : 'Residential');
        params.set('province', 'Ontario');

        if (finalType) params.set('propertyType', finalType);

        if (priceRange === '0-500k') {
            params.set('minPrice', '0');
            params.set('maxPrice', '500000');
        } else if (priceRange === '500k-1m') {
            params.set('minPrice', '500000');
            params.set('maxPrice', '1000000');
        } else if (priceRange === '1m-2m') {
            params.set('minPrice', '1000000');
            params.set('maxPrice', '2000000');
        } else if (priceRange === '2m+') {
            params.set('minPrice', '2000000');
        }

        router.push(`/search?${params.toString()}`);
    }, [city, propertyType, priceRange, isCommercial, router]);

    const isSearchEnabled = city.trim() !== '' || propertyType !== '' || priceRange !== '';

    return (
        <div className="w-full max-w-5xl flex flex-col items-center lg:items-start">
            <div className="w-full bg-white p-2.5 rounded-[32px] border border-white/20 flex flex-col lg:flex-row items-center gap-2.5 relative">
                <div className="w-full flex flex-col lg:flex-row items-center gap-2.5">
                    {/* Location Input with Predictive Search */}
                    <div className="flex-[2] w-full relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand-red transition-colors duration-200 z-10">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <SearchInput
                            value={city}
                            onChange={setCity}
                            onSelect={(val, type) => {
                                if (type === 'type') {
                                    setPropertyType(val);
                                    handleSearch(city, val);
                                } else {
                                    setCity(val);
                                    handleSearch(val);
                                }
                            }}
                            onEnter={() => handleSearch()}
                            placeholder="Enter City, Address or MLS® #"
                            inputClassName="w-full pl-14 pr-4 h-16 rounded-[24px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 focus:ring-8 focus:ring-brand-red/5 outline-none transition-all text-slate-900 text-[15px] font-semibold tracking-tight placeholder:text-slate-400 placeholder:font-normal placeholder:not-italic"
                        />
                    </div>

                    {/* Property Type */}
                    <div className="flex-1 w-full relative group min-w-[160px]">
                        <select
                            className="w-full pl-6 pr-10 h-16 rounded-[24px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 outline-none transition-all text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] appearance-none cursor-pointer"
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                        >
                            <option value="" className="text-slate-400">Property Type</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Lease">Lease</option>
                            <option value="Office">Office</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Retail">Retail</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-brand-red transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="flex-1 w-full relative group min-w-[160px]">
                        <select
                            className="w-full pl-6 pr-10 h-16 rounded-[24px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 outline-none transition-all text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] appearance-none cursor-pointer"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                        >
                            <option value="">Price Range</option>
                            <option value="0-500k">Under $500k</option>
                            <option value="500k-1m">$500k - $1M</option>
                            <option value="1m-2m">$1M - $2M</option>
                            <option value="2m+">$2M+</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-brand-red transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => handleSearch()}
                        disabled={!isSearchEnabled}
                        className={`w-full lg:w-auto h-16 px-10 font-black uppercase tracking-[0.25em] text-[11px] rounded-[24px] transition-all flex items-center justify-center gap-3 shrink-0
                            ${isSearchEnabled
                                ? 'bg-brand-red hover:bg-slate-900 text-white active:scale-95 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                            }`}
                    >
                        Search
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

