'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Predictive Search Input
 * - DB-synced suggestions via /api/search-suggestions
 * - 250ms debounce with AbortController (cancels stale requests)
 * - Keyboard navigation (↑↓ Enter Escape)
 * - Listing counts per city
 * - Max 8 results
 */

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (value: string, type?: 'city' | 'address' | 'type') => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    prefixIcon?: React.ReactNode;
    showTypes?: boolean;
    showAddresses?: boolean;
    onEnter?: () => void;
}

type Suggestion = {
    label: string;
    type: 'city' | 'address' | 'type';
    count?: number;
    city?: string;
};

export function SearchInput({
    value,
    onChange,
    onSelect,
    placeholder = "Search city or address",
    className = "",
    inputClassName = "",
    prefixIcon,
    showTypes = true,
    showAddresses = true,
    onEnter
}: SearchInputProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Filter suggestions based on visibility settings
    const visibleSuggestions = suggestions.filter(s => {
        if (s.type === 'address' && !showAddresses) return false;
        if (s.type === 'type' && !showTypes) return false;
        return true;
    });

    // ─── Fetch logic with debounce + AbortController ─────────────
    useEffect(() => {
        if (!showSuggestions || value.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            // Cancel previous in-flight request
            if (abortRef.current) {
                abortRef.current.abort();
            }

            const controller = new AbortController();
            abortRef.current = controller;

            setIsLoading(true);
            try {
                const res = await fetch(
                    `/api/search-suggestions?q=${encodeURIComponent(value)}`,
                    { signal: controller.signal }
                );
                const data = await res.json();

                // New API returns { suggestions: [...], meta: {...} }
                if (data.suggestions) {
                    setSuggestions(data.suggestions);
                } else if (data.cities) {
                    // Backward compat with old API shape
                    const compat: Suggestion[] = [
                        ...(data.cities || []).map((c: string) => ({ label: c, type: 'city' as const })),
                        ...(data.addresses || []).map((a: string) => ({ label: a, type: 'address' as const })),
                        ...(data.types || []).map((t: string) => ({ label: t, type: 'type' as const })),
                    ];
                    setSuggestions(compat);
                }
                setSelectedIndex(-1);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Failed to fetch suggestions:", err);
                }
            } finally {
                setIsLoading(false);
            }
        }, 250); // 250ms debounce

        return () => {
            clearTimeout(timer);
            if (abortRef.current) {
                abortRef.current.abort();
                abortRef.current = null;
            }
        };
    }, [value, showSuggestions]);

    // ─── Event handlers ──────────────────────────────────────────
    const handleSelect = useCallback((item: Suggestion) => {
        onSelect(item.label, item.type);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    }, [onSelect]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || visibleSuggestions.length === 0) {
            if (e.key === 'Enter' && onEnter) {
                e.preventDefault();
                onEnter();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < visibleSuggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : visibleSuggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < visibleSuggestions.length) {
                    handleSelect(visibleSuggestions[selectedIndex]);
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

    // ─── Section headers ─────────────────────────────────────────
    const getSectionHeader = (type: string, index: number): string | null => {
        if (index === 0) return type === 'city' ? 'Cities' : type === 'type' ? 'Property Types' : 'Addresses';
        const prevType = visibleSuggestions[index - 1]?.type;
        if (prevType !== type) return type === 'city' ? 'Cities' : type === 'type' ? 'Property Types' : 'Addresses';
        return null;
    };

    return (
        <div className={`${className}`} ref={containerRef}>
            <div className="relative group">
                {prefixIcon}
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
                    aria-expanded={showSuggestions && visibleSuggestions.length > 0}
                    aria-haspopup="listbox"
                    autoComplete="off"
                />
                
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                         <div className="w-3.5 h-3.5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {showSuggestions && (visibleSuggestions.length > 0) && (
                <div 
                    id="predictive-search-results"
                    role="listbox"
                    className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.25)] border border-slate-100 py-3 z-[100] max-h-[450px] overflow-y-auto ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200"
                >
                    {visibleSuggestions.map((item, i) => {
                        const header = getSectionHeader(item.type, i);
                        const isSelected = i === selectedIndex;

                        return (
                            <React.Fragment key={`${item.type}-${item.label}-${i}`}>
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
                                        <div className="flex flex-col">
                                            <span>{highlightMatch(item.label, value)}</span>
                                            {item.type === 'address' && item.city && (
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">{item.city}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.count !== undefined && item.count > 0 && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                isSelected 
                                                    ? 'bg-brand-red/10 text-brand-red' 
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {item.count.toLocaleString()} listings
                                            </span>
                                        )}
                                        <div className={`transition-all duration-200 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
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
