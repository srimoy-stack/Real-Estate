'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const SearchBar = () => {
    const router = useRouter();
    const [city, setCity] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [bedrooms, setBedrooms] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        if (propertyType) params.set('type', propertyType);
        if (bedrooms) params.set('bedrooms', bedrooms);

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
        <div className="w-full max-w-6xl">
            <div className="bg-white/80 backdrop-blur-2xl p-2 sm:p-3 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white flex flex-col lg:flex-row items-center gap-2 group/bar">

                {/* City Input with Icon */}
                <div className="flex-[1.8] w-full relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-5 h-5 group-focus-within/bar:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by City or MLS®"
                        className="w-full pl-14 pr-4 h-16 rounded-[24px] bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500/30 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all text-slate-900 text-sm font-black tracking-tight placeholder:text-slate-400 placeholder:font-bold"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                {/* Property Type with custom arrow/icon */}
                <div className="flex-1 w-full relative group min-w-[140px]">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <select
                        className="w-full pl-11 pr-10 h-16 rounded-[24px] bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500/30 outline-none transition-all text-slate-900 text-[10px] xl:text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                    >
                        <option value="">Prop Type</option>
                        <option value="DETACHED">House</option>
                        <option value="CONDO">Condo</option>
                        <option value="TOWNHOUSE">Townhouse</option>
                        <option value="COMMERCIAL">Commercial</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {/* Price Range */}
                <div className="flex-1 w-full relative group min-w-[140px]">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <select
                        className="w-full pl-11 pr-10 h-16 rounded-[24px] bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500/30 outline-none transition-all text-slate-900 text-[10px] xl:text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                    >
                        <option value="">Range</option>
                        <option value="0-500k">$0 - $500k</option>
                        <option value="500k-1m">$500k - $1M</option>
                        <option value="1m-2m">$1M - $2M</option>
                        <option value="2m+">$2M+</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {/* Bedrooms */}
                <div className="flex-1 w-full relative group min-w-[120px]">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </div>
                    <select
                        className="w-full pl-11 pr-10 h-16 rounded-[24px] bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500/30 outline-none transition-all text-slate-900 text-[10px] xl:text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                    >
                        <option value="">Bedrooms</option>
                        <option value="1">1+ Bed</option>
                        <option value="2">2+ Beds</option>
                        <option value="3">3+ Beds</option>
                        <option value="4">4+ Beds</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {/* Large Search Button */}
                <button
                    onClick={handleSearch}
                    className="w-full lg:w-auto h-16 px-10 bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[24px] transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3 shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Search
                </button>

            </div>
        </div>
    );
};
