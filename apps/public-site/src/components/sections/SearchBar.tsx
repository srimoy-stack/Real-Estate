'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchParams {
    city: string;
    query: string;
    listingType: 'Residential' | 'Commercial';
    propertyType: string;
    minPrice?: string;
    maxPrice?: string;
}

interface SuggestionMeta {
    fallbackUsed: boolean;
    fallbackTerm: string | null;
    queryMs: number;
}

interface Suggestions {
    cities: string[];
    addresses: string[];
    types: string[];
    meta?: SuggestionMeta;
}

interface FlatSuggestion {
    type: 'city' | 'address' | 'type';
    value: string;
    subtitle: string;
}

interface SearchBarProps {
    isCommercial?: boolean;
}

export const SearchBar = ({ isCommercial = true }: SearchBarProps) => {
    const router = useRouter();
    const [city, setCity] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestions>({ cities: [], addresses: [], types: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // ─── Build flat suggestions list with section labels ─────────
    const flatSuggestions: FlatSuggestion[] = [
        ...suggestions.cities.map(c => ({ type: 'city' as const, value: c, subtitle: 'City' })),
        ...suggestions.types.map(t => ({ type: 'type' as const, value: t, subtitle: 'Property Type' })),
        ...suggestions.addresses.map(a => ({ type: 'address' as const, value: a, subtitle: 'Address' })),
    ];

    // ─── Debounced fetch with abort + fallback handling ──────────
    useEffect(() => {
        if (!city || city.trim().length < 2) {
            setSuggestions({ cities: [], addresses: [], types: [] });
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            // Cancel any in-flight request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            try {
                const res = await fetch(
                    `/api/search-suggestions?q=${encodeURIComponent(city.trim())}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error('API error');
                const data: Suggestions = await res.json();

                // Only apply if this is still the latest request
                if (!controller.signal.aborted) {
                    setSuggestions(data);
                    // Show dropdown if there are ANY results (guaranteed by fallback API)
                    const hasResults = data.cities.length > 0 || data.addresses.length > 0 || data.types.length > 0;
                    setShowSuggestions(hasResults);
                    setSelectedIndex(-1);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('Fetch error:', err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [city]);

    // ─── Close on click outside ─────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isSearchEnabled = city.trim() !== '' || propertyType !== '' || priceRange !== '';

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

        setShowSuggestions(false);
        router.push(`/search?${params.toString()}`);
    }, [city, propertyType, priceRange, isCommercial, router]);

    // ─── Keyboard navigation ────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || flatSuggestions.length === 0) {
            if (e.key === 'Enter' && isSearchEnabled) handleSearch();
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < flatSuggestions.length - 1 ? prev + 1 : 0 // wrap around
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : flatSuggestions.length - 1 // wrap around
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
                    selectSuggestion(flatSuggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
            case 'Tab':
                setShowSuggestions(false);
                break;
        }
    };

    // ─── Selection handler ──────────────────────────────────────
    const selectSuggestion = useCallback((item: FlatSuggestion) => {
        if (item.type === 'type') {
            setPropertyType(item.value);
            handleSearch(city, item.value);
        } else {
            setCity(item.value);
            handleSearch(item.value);
        }
        setShowSuggestions(false);
        setSelectedIndex(-1);
    }, [city, handleSearch]);

    // ─── Scroll active item into view ───────────────────────────
    useEffect(() => {
        if (selectedIndex >= 0 && suggestionRef.current) {
            const items = suggestionRef.current.querySelectorAll('[data-suggestion-item]');
            items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    // ─── Section header helper ──────────────────────────────────
    const getSectionHeader = (type: string, index: number): string | null => {
        if (index === 0) return type === 'city' ? 'Cities' : type === 'type' ? 'Property Types' : 'Addresses';
        const prevType = flatSuggestions[index - 1]?.type;
        if (prevType !== type) return type === 'city' ? 'Cities' : type === 'type' ? 'Property Types' : 'Addresses';
        return null;
    };

    return (
        <div className="w-full max-w-5xl flex flex-col items-center lg:items-start">
            <div className="w-full bg-white p-2.5 rounded-[32px] border border-white/20 flex flex-col lg:row items-center gap-2.5">
                <div className="w-full flex flex-col lg:flex-row items-center gap-2.5">
                    {/* City Input with Icon */}
                    <div className="flex-[2] w-full relative group" ref={suggestionRef}>
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand-red transition-colors duration-200">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter City, Address or MLS® #"
                            className="w-full pl-14 pr-4 h-16 rounded-[24px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 focus:ring-8 focus:ring-brand-red/5 outline-none transition-all text-slate-900 text-[15px] font-semibold tracking-tight placeholder:text-slate-400 placeholder:font-normal placeholder:not-italic"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => city.trim().length >= 2 && flatSuggestions.length > 0 && setShowSuggestions(true)}
                            role="combobox"
                            aria-expanded={showSuggestions}
                            aria-controls="search-suggestions-listbox"
                            aria-haspopup="listbox"
                            aria-autocomplete="list"
                            autoComplete="off"
                        />

                        {/* ─── Suggestions Dropdown ─── */}
                        {showSuggestions && flatSuggestions.length > 0 && (
                            <div
                                id="search-suggestions-listbox"
                                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-[24px] shadow-2xl border border-slate-100 py-2 z-[100] max-h-[420px] overflow-y-auto"
                                role="listbox"
                                style={{
                                    animation: 'suggestionSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                }}
                            >
                                {/* Fallback notice */}
                                {suggestions.meta?.fallbackUsed && suggestions.meta?.fallbackTerm && (
                                    <div className="px-6 py-2.5 flex items-center gap-2.5 border-b border-slate-50">
                                        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            Showing results for <span className="font-black text-slate-800">&ldquo;{suggestions.meta.fallbackTerm}&rdquo;</span>
                                        </span>
                                    </div>
                                )}

                                {flatSuggestions.map((item, index) => {
                                    const sectionHeader = getSectionHeader(item.type, index);
                                    return (
                                        <React.Fragment key={`${item.type}-${item.value}-${index}`}>
                                            {/* Section divider */}
                                            {sectionHeader && (
                                                <div className="px-6 pt-3 pb-1.5 flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                        {sectionHeader}
                                                    </span>
                                                    <div className="flex-1 h-px bg-slate-100" />
                                                </div>
                                            )}
                                            <button
                                                data-suggestion-item
                                                className={`w-full px-6 py-3 flex items-center gap-4 transition-all duration-150 text-left group/item
                                                    ${index === selectedIndex
                                                        ? 'bg-brand-red/5 text-brand-red'
                                                        : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                onClick={() => selectSuggestion(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                role="option"
                                                aria-selected={index === selectedIndex}
                                            >
                                                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                                    ${index === selectedIndex
                                                        ? 'bg-brand-red/10 text-brand-red'
                                                        : 'bg-slate-100 text-slate-400 group-hover/item:bg-slate-200'
                                                    }`}>
                                                    {item.type === 'city' && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    )}
                                                    {item.type === 'address' && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    )}
                                                    {item.type === 'type' && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[14px] font-semibold tracking-tight truncate">
                                                        {highlightMatch(item.value, city)}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                                        {item.subtitle}
                                                    </span>
                                                </div>

                                                {/* Arrow indicator on selected */}
                                                <div className={`ml-auto shrink-0 transition-all duration-150 ${index === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`}>
                                                    <svg className="w-4 h-4 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                                {/* Query timing footer */}
                                {suggestions.meta?.queryMs !== undefined && (
                                    <div className="px-6 py-2 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                                            {flatSuggestions.length} suggestion{flatSuggestions.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-300 tabular-nums">
                                            {suggestions.meta.queryMs}ms
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No results indicator — only when loading finished and genuinely empty */}
                        {showSuggestions && !isLoading && flatSuggestions.length === 0 && city.trim().length >= 2 && (
                            <div
                                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-[24px] shadow-2xl border border-slate-100 py-6 z-[100]"
                                style={{ animation: 'suggestionSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                            >
                                <div className="flex flex-col items-center gap-2 px-6">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <p className="text-sm font-semibold text-slate-500">No suggestions found</p>
                                    <p className="text-[11px] text-slate-400">Try a different search term or press Enter to search anyway</p>
                                </div>
                            </div>
                        )}
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

            <style jsx>{`
                @keyframes suggestionSlideIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// ─── Highlight matching text ────────────────────────────────────
function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query || query.trim().length < 2) return text;
    const safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    const parts = text.split(regex);

    if (parts.length === 1) return text;

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="text-brand-red font-black">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}
