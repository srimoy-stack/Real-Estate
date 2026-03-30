'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* ─── Constants ────────────────────────────────────────────────────────── */
const BED_OPTIONS = ['Any', '1+', '2+', '3+', '4+', '5+'];
const BATH_OPTIONS = ['Any', '1+', '2+', '3+', '4+'];

const PRICE_RANGES = {
    min: ['', '50000', '100000', '200000', '300000', '500000', '750000', '1000000'],
    max: ['', '200000', '300000', '500000', '750000', '1000000', '1500000', '2000000', '5000000'],
};

const SQFT_RANGES = {
    min: ['', '500', '750', '1000', '1500', '2000', '3000'],
    max: ['', '1000', '1500', '2000', '3000', '4000', '5000', '10000'],
};

const CANADIAN_CITIES = [
    'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton',
    'Mississauga', 'Winnipeg', 'Hamilton', 'Brampton', 'Surrey', 'Halifax',
    'London', 'Windsor', 'Markham', 'Kitchener', 'Victoria', 'Oshawa'
];

/* ─── Components ───────────────────────────────────────────────────────── */

function FilterSelect({
    label, value, options, onChange, className = '',
}: {
    label: string; value: string;
    options: { label: string; value: string }[];
    onChange: (v: string) => void;
    className?: string;
}) {
    return (
        <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 pr-8 text-xs font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-500 focus:bg-white cursor-pointer"
                >
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );
}

function RangeSelect({
    label, minValue, maxValue, minOptions, maxOptions, onMinChange, onMaxChange,
    prefix = '', suffix = '',
}: {
    label: string;
    minValue: string; maxValue: string;
    minOptions: string[]; maxOptions: string[];
    onMinChange: (v: string) => void; onMaxChange: (v: string) => void;
    prefix?: string; suffix?: string;
}) {
    const formatLabel = (v: string, placeholder: string) => {
        if (!v) return placeholder;
        const num = parseInt(v);
        if (isNaN(num)) return v;
        if (num >= 1000000) return `${prefix}${num / 1000000}M${suffix}`;
        if (num >= 1000) return `${prefix}${num / 1000}k${suffix}`;
        return `${prefix}${v}${suffix}`;
    };

    return (
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex items-center gap-1">
                <select
                    value={minValue}
                    onChange={(e) => onMinChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50/50 px-2 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-500 focus:bg-white cursor-pointer"
                >
                    {minOptions.map((v) => <option key={v} value={v}>{formatLabel(v, 'Min')}</option>)}
                </select>
                <span className="text-slate-300 text-[10px] font-black">/</span>
                <select
                    value={maxValue}
                    onChange={(e) => onMaxChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50/50 px-2 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-500 focus:bg-white cursor-pointer"
                >
                    {maxOptions.map((v) => <option key={v} value={v}>{formatLabel(v, 'Max')}</option>)}
                </select>
            </div>
        </div>
    );
}

export const SearchFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isExpanded, setIsExpanded] = useState(false);

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        type: searchParams.get('type') || '',
        listingType: searchParams.get('listingType') || 'Residential',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        bathrooms: searchParams.get('bathrooms') || '',
        minSqft: searchParams.get('minSqft') || '',
        maxSqft: searchParams.get('maxSqft') || '',
        keyword: searchParams.get('keyword') || '',
        sort: searchParams.get('sort') || 'newest',
    });

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Auto-update URL when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });

            const newQuery = params.toString();
            const currentQuery = searchParams.toString();

            if (newQuery !== currentQuery) {
                router.push(`/search?${newQuery}`, { scroll: false });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [filters, router, searchParams]);

    const activeCount = Object.entries(filters).filter(([key, val]) => {
        if (['listingType', 'sort'].includes(key)) return false;
        return !!val;
    }).length;

    return (
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-sm transition-all duration-500">
            <div className="mx-auto max-w-7xl px-4 py-4">
                <div className="flex flex-wrap items-end gap-4 lg:gap-6">

                    {/* Listing Type Toggle */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</span>
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 mt-0.5">
                            {(['Residential', 'Commercial'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => updateFilter('listingType', type)}
                                    className={`rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${filters.listingType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* City Select */}
                    <FilterSelect
                        label="City"
                        value={filters.city}
                        options={[{ label: 'All Cities', value: '' }, ...CANADIAN_CITIES.map(c => ({ label: c, value: c }))]}
                        onChange={(v) => updateFilter('city', v)}
                        className="w-36 lg:w-44"
                    />

                    {/* Price Range */}
                    <RangeSelect
                        label="Price Range"
                        prefix="$"
                        minValue={filters.minPrice}
                        maxValue={filters.maxPrice}
                        minOptions={PRICE_RANGES.min}
                        maxOptions={PRICE_RANGES.max}
                        onMinChange={(v) => updateFilter('minPrice', v)}
                        onMaxChange={(v) => updateFilter('maxPrice', v)}
                    />

                    {/* Beds */}
                    <FilterSelect
                        label="Beds"
                        value={filters.bedrooms}
                        options={BED_OPTIONS.map(b => ({ label: b, value: b.replace('+', '') }))}
                        onChange={(v) => updateFilter('bedrooms', v === 'Any' ? '' : v)}
                        className="w-24"
                    />

                    {/* More Filters Toggle */}
                    <div className="flex items-center gap-3 ml-auto self-end pb-0.5">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Filters
                            {activeCount > 0 && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-black text-white ml-1 shadow-lg shadow-indigo-200">
                                    {activeCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setFilters({
                                city: '', type: '', listingType: 'Residential', minPrice: '', maxPrice: '',
                                bedrooms: '', bathrooms: '', minSqft: '', maxSqft: '', keyword: '', sort: 'newest'
                            })}
                            className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Expanded Filters */}
                {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Property Sub Type */}
                        <FilterSelect
                            label="Property Type"
                            value={filters.type}
                            options={[
                                { label: 'All Types', value: '' },
                                { label: 'House', value: 'DETACHED' },
                                { label: 'Condo', value: 'CONDO' },
                                { label: 'Townhouse', value: 'TOWNHOUSE' }
                            ]}
                            onChange={(v) => updateFilter('type', v)}
                        />

                        {/* Bathrooms */}
                        <FilterSelect
                            label="Baths"
                            value={filters.bathrooms}
                            options={BATH_OPTIONS.map(b => ({ label: b, value: b.replace('+', '') }))}
                            onChange={(v) => updateFilter('bathrooms', v === 'Any' ? '' : v)}
                        />

                        {/* Sqft Range */}
                        <RangeSelect
                            label="Square Footage"
                            suffix=" sqft"
                            minValue={filters.minSqft}
                            maxValue={filters.maxSqft}
                            minOptions={SQFT_RANGES.min}
                            maxOptions={SQFT_RANGES.max}
                            onMinChange={(v) => updateFilter('minSqft', v)}
                            onMaxChange={(v) => updateFilter('maxSqft', v)}
                        />

                        {/* Keyword Search */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Keywords</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filters.keyword}
                                    onChange={(e) => updateFilter('keyword', e.target.value)}
                                    placeholder="Pool, Waterfront, MLS® ID..."
                                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-xs font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-500 focus:bg-white"
                                />
                                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        {/* Sorting */}
                        <FilterSelect
                            label="Sort By"
                            value={filters.sort}
                            options={[
                                { label: 'Newest First', value: 'newest' },
                                { label: 'Price: Low to High', value: 'price_asc' },
                                { label: 'Price: High to Low', value: 'price_desc' }
                            ]}
                            onChange={(v) => updateFilter('sort', v)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
