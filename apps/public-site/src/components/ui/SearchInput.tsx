'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Shared SearchInput Component
 * Implements predictive search with debouncing, suggestions, and keyboard navigation.
 */

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (value: string, type?: 'city' | 'address' | 'type') => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    showTypes?: boolean;
    showAddresses?: boolean;
    onEnter?: () => void;
}

type SuggestionItem = {
    value: string;
    type: 'city' | 'address' | 'type';
};

export function SearchInput({
    value,
    onChange,
    onSelect,
    placeholder = "Search city or address",
    className = "",
    inputClassName = "",
    showTypes = true,
    showAddresses = true,
    onEnter
}: SearchInputProps) {
    const [suggestions, setSuggestions] = useState<{
        cities: string[];
        addresses: string[];
        types: string[];
        meta?: { fallbackUsed?: boolean; fallbackTerm?: string; queryMs?: number };
    }>({ cities: [], addresses: [], types: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Flattened list for easy indexing
    const flatSuggestions: SuggestionItem[] = [
        ...suggestions.cities.map(v => ({ value: v, type: 'city' as const })),
        ...(showAddresses ? suggestions.addresses.map(v => ({ value: v, type: 'address' as const })) : []),
        ...(showTypes ? suggestions.types.map(v => ({ value: v, type: 'type' as const })) : [])
    ];

    // ─── Fetch logic ─────────────────────────────────────────────
    useEffect(() => {
        if (!showSuggestions || value.trim().length < 2) {
            setSuggestions({ cities: [], addresses: [], types: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(value)}`);
                const data = await res.json();
                setSuggestions(data);
                setSelectedIndex(-1);
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value, showSuggestions]);

    // ─── Event handlers ──────────────────────────────────────────
    const handleSelect = useCallback((item: SuggestionItem) => {
        onSelect(item.value, item.type);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    }, [onSelect]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || flatSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < flatSuggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatSuggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
                    handleSelect(flatSuggestions[selectedIndex]);
                } else if (onEnter) {
                    setShowSuggestions(false);
                    onEnter();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getSectionHeader = (type: string, index: number): string | null => {
        if (index === 0) return type === 'city' ? 'Cities' : type === 'type' ? 'Property Types' : 'Addresses';
        const prevType = flatSuggestions[index - 1]?.type;
        if (prevType !== type) return type === 'city' ? 'Cities' : type === 'type' ? 'Property Types' : 'Addresses';
        return null;
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative group">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => value.trim().length >= 2 && setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`w-full ${inputClassName}`}
                    role="combobox"
                    aria-controls="predictive-search-results"
                    aria-expanded={showSuggestions && flatSuggestions.length > 0}
                    aria-haspopup="listbox"
                    autoComplete="off"
                />
                
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                         <div className="w-3.5 h-3.5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {showSuggestions && (flatSuggestions.length > 0) && (
                <div 
                    id="predictive-search-results"
                    role="listbox"
                    className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.25)] border border-slate-100 py-3 z-[100] max-h-[450px] overflow-y-auto ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200"
                >
                    {suggestions.meta?.fallbackUsed && (
                        <div className="px-5 py-2 mb-2 border-b border-slate-50 flex items-center gap-2 bg-amber-50/30">
                             <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Broad search: <span className="text-slate-900">{suggestions.meta.fallbackTerm}</span></span>
                        </div>
                    )}

                    {flatSuggestions.map((item, i) => {
                        const header = getSectionHeader(item.type, i);
                        const isSelected = i === selectedIndex;

                        return (
                            <React.Fragment key={`${item.type}-${item.value}-${i}`}>
                                {header && (
                                    <div className="px-5 pt-3 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white">
                                        {header}
                                    </div>
                                )}
                                <div
                                    onMouseMove={() => setSelectedIndex(i)}
                                    onClick={() => handleSelect(item)}
                                    className={`px-5 py-3 text-xs font-semibold cursor-pointer transition-all flex items-center justify-between group/item ${
                                        isSelected ? 'bg-slate-50 text-brand-red' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            isSelected ? 'bg-brand-red/10 text-brand-red' : 'bg-slate-100 text-slate-400'
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
                                        <span>{highlightMatch(item.value, value)}</span>
                                    </div>
                                    <div className={`transition-all duration-200 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

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
                    <span key={i} className="text-brand-red font-black underline decoration-brand-red/20 underline-offset-4">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}
