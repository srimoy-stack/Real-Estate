'use client';

import React from 'react';
import Image from 'next/image';

interface HeroSectionProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    listingType: 'Residential' | 'Commercial';
    onListingTypeChange: (type: 'Residential' | 'Commercial') => void;
    onSearch: () => void;
}

export function HeroSection({
    searchQuery,
    onSearchQueryChange,
    listingType,
    onListingTypeChange,
    onSearch,
}: HeroSectionProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSearch();
    };

    return (
        <section className="relative w-full overflow-hidden" style={{ minHeight: '480px' }}>
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/images/hero-listings.png"
                    alt="Luxury real estate"
                    fill
                    priority
                    className="object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/[0.05] blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 sm:py-28">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium tracking-wide text-white/90 uppercase">
                        Live MLS Feed • Updated in Real-Time
                    </span>
                </div>

                {/* Headline */}
                <h1 className="mb-3 text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Find Your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                        Dream Property
                    </span>
                </h1>
                <p className="mb-10 max-w-xl text-center text-base text-white/70 sm:text-lg font-light">
                    Search thousands of verified MLS listings across Canada
                </p>

                {/* Toggle Buttons */}
                <div className="mb-6 inline-flex rounded-xl bg-white/10 p-1 backdrop-blur-md border border-white/20">
                    {(['Residential', 'Commercial'] as const).map((type) => (
                        <button
                            key={type}
                            id={`hero-toggle-${type.toLowerCase()}`}
                            onClick={() => onListingTypeChange(type)}
                            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${listingType === type
                                ? 'bg-white text-gray-900 shadow-lg shadow-white/20'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-2xl">
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

                        <div className="relative flex items-center rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/20 border border-white/50">
                            {/* Search icon */}
                            <div className="pl-5 text-gray-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <input
                                id="hero-search-input"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchQueryChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="City, Address, or MLS number..."
                                className="flex-1 bg-transparent px-4 py-4 text-base text-gray-800 placeholder-gray-400 outline-none sm:text-lg"
                            />

                            <button
                                id="hero-search-button"
                                onClick={onSearch}
                                className="m-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-600/40 hover:from-emerald-500 hover:to-teal-500 active:scale-95"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 flex items-center gap-8 text-white/60">
                    <div className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                        </svg>
                        <span>500K+ Listings</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>All Provinces</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Verified MLS Data</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
