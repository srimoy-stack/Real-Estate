'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const SearchBar = () => {
    const router = useRouter();
    const [city, setCity] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [listingType, setListingType] = useState<'Residential' | 'Commercial'>('Residential');

    const handleSearch = () => {
        const params = new URLSearchParams();

        // Detect if input is an MLS number (e.g., X1234567 or 1234567)
        const isMls = /^[A-Z]\d+$/i.test(city.trim()) || /^\d{5,}$/.test(city.trim());

        if (city) {
            if (isMls) {
                params.set('keyword', city.trim());
            } else {
                params.set('city', city.trim());
            }
        }

        params.set('listingType', listingType);

        if (propertyType) params.set('type', propertyType);

        if (priceRange) {
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
        }

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-5xl flex flex-col items-center lg:items-start">
            {/* Listing Type Toggle — Realtor.ca Tabs Style */}
            <div className="mb-6 inline-flex rounded-[20px] bg-white/5 p-1 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-2xl">
                {(['Residential', 'Commercial'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setListingType(type)}
                        className={`relative rounded-[16px] px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${listingType === type
                                ? 'bg-brand-red text-white shadow-xl shadow-brand-red/20 scale-[1.02] z-10'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="w-full bg-white/95 backdrop-blur-3xl p-2.5 rounded-[32px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] border border-white/20 flex flex-col lg:row items-center gap-2.5">
                <div className="w-full flex flex-col lg:flex-row items-center gap-2.5">
                    {/* City Input with Icon */}
                    <div className="flex-[2] w-full relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                            <svg className="w-5 h-5 group-focus-within:text-brand-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter City, Address or MLS® #"
                            className="w-full pl-14 pr-4 h-16 rounded-[24px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 focus:ring-8 focus:ring-brand-red/5 outline-none transition-all text-slate-900 text-[15px] font-black tracking-tight placeholder:text-slate-300 placeholder:font-bold italic"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Property Type */}
                    <div className="flex-1 w-full relative group min-w-[160px]">
                        <select
                            className="w-full pl-6 pr-10 h-16 rounded-[24px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 outline-none transition-all text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] appearance-none cursor-pointer"
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                        >
                            <option value="">Property Type</option>
                            <option value="DETACHED">Houses</option>
                            <option value="CONDO">Condos</option>
                            <option value="TOWNHOUSE">Townhouses</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-brand-red transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-brand-red transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="w-full lg:w-auto h-16 px-10 bg-brand-red hover:bg-slate-900 text-white font-black uppercase tracking-[0.25em] text-[11px] rounded-[24px] transition-all shadow-xl shadow-brand-red/20 active:scale-95 flex items-center justify-center gap-3 shrink-0"
                    >
                        Search
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
