'use client';

import React, { useState } from 'react';
import {
    FilterState,
    DEFAULT_FILTERS,
    TRANSACTION_TYPES,
    PROPERTY_TYPES,
    BED_OPTIONS,
    BATH_OPTIONS,
    PRICE_RANGES,
    SQFT_RANGES,
    LAND_SIZE_RANGES,
    BUILDING_TYPES,
    STOREY_RANGES,
    OWNERSHIP_TYPES,
    MAINT_FEE_RANGES,
    TAX_RANGES,
    YEAR_BUILT_RANGES,
    SORT_OPTIONS,
    CANADIAN_CITIES,
} from '../types';
import { formatMLSNumber } from '../utils';

interface FilterBarProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onSearch: () => void;
    isLoading: boolean;
}

/* ─── Reusable Select ──────────────────────────────────────────────────────── */
function FilterSelect({
    id, label, value, options, onChange, className = '',
}: {
    id: string; label: string; value: string;
    options: { label: string; value: string }[];
    onChange: (v: string) => void;
    className?: string;
}) {
    return (
        <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
            <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</label>
            <div className="relative">
                <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 pr-7 text-xs font-medium text-gray-700 outline-none transition-all hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );
}

/* ─── Range Select (No Min — No Max) ───────────────────────────────────────── */
function RangeSelect({
    id, label, minValue, maxValue, minOptions, maxOptions, onMinChange, onMaxChange,
    prefix = '', suffix = '',
}: {
    id: string; label: string;
    minValue: string; maxValue: string;
    minOptions: string[]; maxOptions: string[];
    onMinChange: (v: string) => void; onMaxChange: (v: string) => void;
    prefix?: string; suffix?: string;
}) {
    const formatLabel = (v: string, placeholder: string) => {
        if (!v) return placeholder;
        return `${prefix}${formatMLSNumber(Number(v))}${suffix}`;
    };
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
            <div className="flex items-center gap-1">
                <select id={`${id}-min`} value={minValue} onChange={(e) => onMinChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/80 px-2 py-2 text-xs font-medium text-gray-700 outline-none transition-all hover:border-emerald-300 focus:border-emerald-500 cursor-pointer"
                >
                    {minOptions.map((v) => <option key={v} value={v} suppressHydrationWarning>{formatLabel(v, 'No min')}</option>)}
                </select>
                <span className="text-gray-300 text-xs font-bold">–</span>
                <select id={`${id}-max`} value={maxValue} onChange={(e) => onMaxChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/80 px-2 py-2 text-xs font-medium text-gray-700 outline-none transition-all hover:border-emerald-300 focus:border-emerald-500 cursor-pointer"
                >
                    {maxOptions.map((v) => <option key={v} value={v} suppressHydrationWarning>{formatLabel(v, 'No max')}</option>)}
                </select>
            </div>
        </div>
    );
}

/* ─── Main FilterBar ───────────────────────────────────────────────────────── */
export function FilterBar({ filters, onFiltersChange, onSearch, isLoading }: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const update = (key: keyof FilterState, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const resetFilters = () => {
        onFiltersChange({ ...DEFAULT_FILTERS, searchQuery: filters.searchQuery, listingType: filters.listingType });
    };

    const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
        if (['searchQuery', 'listingType'].includes(key)) return false;
        const def = DEFAULT_FILTERS[key as keyof FilterState];
        return val !== def;
    });

    const activeCount = Object.entries(filters).filter(([key, val]) => {
        if (['searchQuery', 'listingType', 'transactionType'].includes(key)) return false;
        const def = DEFAULT_FILTERS[key as keyof FilterState];
        return val !== def;
    }).length;

    return (
        <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-xl shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* ── Primary Row ────────────────────────────────────────────── */}
                <div className="flex items-end gap-3 py-3 flex-wrap">

                    {/* Transaction Type Pills */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Transaction</span>
                        <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                            {TRANSACTION_TYPES.map((type) => (
                                <button key={type} id={`filter-tx-${type.toLowerCase().replace(' ', '-')}`}
                                    onClick={() => update('transactionType', type)}
                                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${filters.transactionType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >{type}</button>
                            ))}
                        </div>
                    </div>

                    {/* City */}
                    <FilterSelect id="f-city" label="City" value={filters.city}
                        options={[{ label: 'All Cities', value: '' }, ...CANADIAN_CITIES.map((c) => ({ label: c, value: c }))]}
                        onChange={(v) => update('city', v)} />

                    {/* Price */}
                    <RangeSelect id="f-price" label="Price" prefix="$"
                        minValue={filters.minPrice} maxValue={filters.maxPrice}
                        minOptions={PRICE_RANGES.min} maxOptions={PRICE_RANGES.max}
                        onMinChange={(v) => update('minPrice', v)} onMaxChange={(v) => update('maxPrice', v)} />

                    {/* Beds */}
                    <FilterSelect id="f-beds" label="Beds" value={filters.beds}
                        options={BED_OPTIONS.map((b) => ({ label: b, value: b }))}
                        onChange={(v) => update('beds', v)} />

                    {/* Baths */}
                    <FilterSelect id="f-baths" label="Baths" value={filters.baths}
                        options={BATH_OPTIONS.map((b) => ({ label: b, value: b }))}
                        onChange={(v) => update('baths', v)} />

                    {/* Sorting */}
                    <FilterSelect id="f-sort" label="Sort By" 
                        value={`${filters.sortBy}${filters.sortBy === 'price' ? `_${filters.order}` : ''}`}
                        options={SORT_OPTIONS}
                        onChange={(v) => {
                            if (v.includes('_')) {
                                const [by, ord] = v.split('_');
                                onFiltersChange({ ...filters, sortBy: by, order: ord as any });
                            } else {
                                onFiltersChange({ ...filters, sortBy: v, order: 'desc' });
                            }
                        }} />

                    {/* Advanced Toggle + Actions */}
                    <div className="flex items-center gap-2 self-end ml-auto">
                        <button onClick={() => setIsExpanded(!isExpanded)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-all ${isExpanded ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Filters
                            {activeCount > 0 && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">{activeCount}</span>
                            )}
                        </button>

                        {hasActiveFilters && (
                            <button id="filter-reset" onClick={resetFilters}
                                className="rounded-lg px-3 py-2 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                                Reset
                            </button>
                        )}

                        <button id="filter-search" onClick={onSearch} disabled={isLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            Search
                        </button>
                    </div>
                </div>

                {/* ── Advanced Filters Panel ──────────────── */}
                {isExpanded && (
                    <div className="border-t border-gray-100 py-4 animate-in">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-4">

                            {/* Property Type */}
                            <FilterSelect id="f-proptype" label="Property Type" value={filters.propertyType}
                                options={PROPERTY_TYPES.map((t) => ({ label: t, value: t }))}
                                onChange={(v) => update('propertyType', v)} />

                            {/* Square Footage */}
                            <RangeSelect id="f-sqft" label="Square Footage" suffix=" sqft"
                                minValue={filters.minSqft} maxValue={filters.maxSqft}
                                minOptions={SQFT_RANGES.min} maxOptions={SQFT_RANGES.max}
                                onMinChange={(v) => update('minSqft', v)} onMaxChange={(v) => update('maxSqft', v)} />

                            {/* Land Size */}
                            <RangeSelect id="f-land" label="Land Size" suffix=" sqft"
                                minValue={filters.minLandSize} maxValue={filters.maxLandSize}
                                minOptions={LAND_SIZE_RANGES.min} maxOptions={LAND_SIZE_RANGES.max}
                                onMinChange={(v) => update('minLandSize', v)} onMaxChange={(v) => update('maxLandSize', v)} />

                            {/* Listed Since */}
                            <div className="flex flex-col gap-1 min-w-0">
                                <label htmlFor="f-listed" className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Listed Since</label>
                                <input id="f-listed" type="date" value={filters.listedSince}
                                    onChange={(e) => update('listedSince', e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs font-medium text-gray-700 outline-none transition-all hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            {/* Building Type */}
                            <FilterSelect id="f-bldgtype" label="Building Type" value={filters.buildingType}
                                options={BUILDING_TYPES.map((t) => ({ label: t, value: t }))}
                                onChange={(v) => update('buildingType', v)} />

                            {/* Storeys */}
                            <RangeSelect id="f-storeys" label="Storeys"
                                minValue={filters.minStoreys} maxValue={filters.maxStoreys}
                                minOptions={STOREY_RANGES.min} maxOptions={STOREY_RANGES.max}
                                onMinChange={(v) => update('minStoreys', v)} onMaxChange={(v) => update('maxStoreys', v)} />

                            {/* Ownership / Title */}
                            <FilterSelect id="f-ownership" label="Ownership / Title" value={filters.ownershipType}
                                options={OWNERSHIP_TYPES.map((t) => ({ label: t, value: t }))}
                                onChange={(v) => update('ownershipType', v)} />

                            {/* Maintenance Fees */}
                            <RangeSelect id="f-maint" label="Maintenance Fees" prefix="$" suffix="/mo"
                                minValue={filters.minMaintFee} maxValue={filters.maxMaintFee}
                                minOptions={MAINT_FEE_RANGES.min} maxOptions={MAINT_FEE_RANGES.max}
                                onMinChange={(v) => update('minMaintFee', v)} onMaxChange={(v) => update('maxMaintFee', v)} />

                            {/* Property Tax - Yearly */}
                            <RangeSelect id="f-tax" label="Property Tax - Yearly" prefix="$"
                                minValue={filters.minTax} maxValue={filters.maxTax}
                                minOptions={TAX_RANGES.min} maxOptions={TAX_RANGES.max}
                                onMinChange={(v) => update('minTax', v)} onMaxChange={(v) => update('maxTax', v)} />

                            {/* Year Built */}
                            <RangeSelect id="f-year" label="Year Built"
                                minValue={filters.minYearBuilt} maxValue={filters.maxYearBuilt}
                                minOptions={YEAR_BUILT_RANGES.min} maxOptions={YEAR_BUILT_RANGES.max}
                                onMinChange={(v) => update('minYearBuilt', v)} onMaxChange={(v) => update('maxYearBuilt', v)} />

                            {/* Featured Only */}
                            <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                                <button
                                    onClick={() => onFiltersChange({ ...filters, featured: !filters.featured })}
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${filters.featured ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                                >
                                    <svg className="h-3.5 w-3.5" fill={filters.featured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Featured Only
                                </button>
                            </div>

                            {/* Keywords */}
                            <div className="flex flex-col gap-1 min-w-0 sm:col-span-2">
                                <label htmlFor="f-keywords" className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Keywords</label>
                                <input id="f-keywords" type="text" value={filters.keywords}
                                    onChange={(e) => update('keywords', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                                    placeholder="Waterfront, Garage, Pool..."
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
