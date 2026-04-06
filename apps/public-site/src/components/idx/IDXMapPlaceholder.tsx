'use client';

import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';
import { Listing } from '@repo/types';

interface IDXMapPlaceholderProps {
    listings: Listing[];
    highlightedListingId: string | null;
    onMarkerClick: (listing: Listing) => void;
    onMarkerClose: () => void;
    selectedListing: Listing | null;
}

export const IDXMapPlaceholder: React.FC<IDXMapPlaceholderProps> = ({
    listings,
    highlightedListingId,
    onMarkerClick,
    onMarkerClose,
    selectedListing,
}) => {
    // Compute map center from listings
    const listingsWithCoords = listings.filter(
        (l) => l.location?.lat && l.location?.lng
    );

    // Normalize coordinates for rendering within our SVG viewport
    const bounds = listingsWithCoords.length > 0
        ? {
            minLat: Math.min(...listingsWithCoords.map((l) => l.location!.lat)),
            maxLat: Math.max(...listingsWithCoords.map((l) => l.location!.lat)),
            minLng: Math.min(...listingsWithCoords.map((l) => l.location!.lng)),
            maxLng: Math.max(...listingsWithCoords.map((l) => l.location!.lng)),
        }
        : { minLat: 43, maxLat: 44, minLng: -80, maxLng: -79 };

    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;
    const padding = 0.15;

    const normalize = (lat: number, lng: number) => ({
        x: ((lng - bounds.minLng) / lngRange) * (1 - 2 * padding) + padding,
        y: 1 - (((lat - bounds.minLat) / latRange) * (1 - 2 * padding) + padding),
    });

    const price = (val: number) => {
        if (!val || val <= 0) return 'Contact Us';
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-slate-100 via-sky-50 to-slate-50 rounded-3xl overflow-hidden border border-slate-200/60">
            {/* Map "Tiles" visual texture */}
            <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity="0.4" />
                        </pattern>
                        <pattern id="smallGrid" width="15" height="15" patternUnits="userSpaceOnUse">
                            <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#94a3b8" strokeWidth="0.3" opacity="0.2" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#smallGrid)" />
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Decorative map features */}
            <div className="absolute inset-0 overflow-hidden">
                {/* "Road" lines */}
                <svg width="100%" height="100%" className="absolute inset-0 opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <line x1="20%" y1="0" x2="35%" y2="100%" stroke="#64748b" strokeWidth="2" strokeDasharray="8 4" />
                    <line x1="60%" y1="0" x2="75%" y2="100%" stroke="#64748b" strokeWidth="2" strokeDasharray="8 4" />
                    <line x1="0" y1="30%" x2="100%" y2="45%" stroke="#64748b" strokeWidth="2" strokeDasharray="8 4" />
                    <line x1="0" y1="70%" x2="100%" y2="60%" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 3" />
                    <path d="M 10% 20% Q 30% 35%, 50% 25% T 90% 40%" fill="none" stroke="#93c5fd" strokeWidth="3" opacity="0.4" />
                </svg>

                {/* "Park" areas */}
                <div className="absolute top-[15%] right-[8%] w-24 h-16 bg-emerald-200/30 rounded-full blur-sm" />
                <div className="absolute bottom-[25%] left-[12%] w-32 h-20 bg-emerald-200/20 rounded-full blur-sm" />
            </div>

            {/* Property Markers */}
            {listingsWithCoords.map((listing) => {
                const pos = normalize(listing.location!.lat, listing.location!.lng);
                const isHighlighted = highlightedListingId === listing.id;
                const isSelected = selectedListing?.id === listing.id;

                return (
                    <button
                        key={listing.id}
                        className={`absolute z-10 transform -translate-x-1/2 -translate-y-full transition-all duration-300 cursor-pointer ${isHighlighted || isSelected ? 'z-30 scale-110' : 'hover:z-20 hover:scale-105'
                            }`}
                        style={{
                            left: `${pos.x * 100}%`,
                            top: `${pos.y * 100}%`,
                        }}
                        onClick={() => onMarkerClick(listing)}
                    >
                        {/* Pin */}
                        <div className="relative">
                            <div
                                className={`px-3 py-1.5 rounded-xl font-black text-xs tracking-tight shadow-xl transition-all duration-300 whitespace-nowrap ${isHighlighted || isSelected
                                    ? 'bg-[#E11B22] text-white shadow-red-200'
                                    : 'bg-white text-slate-900 shadow-slate-300/50 hover:bg-[#E11B22] hover:text-white hover:shadow-red-200'
                                    }`}
                            >
                                {price(listing.price)}
                            </div>
                            {/* Pin tail */}
                            <div
                                className={`absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 shadow-lg transition-colors duration-300 ${isHighlighted || isSelected
                                    ? 'bg-[#E11B22]'
                                    : 'bg-white'
                                    }`}
                            />
                            {/* Pulse ring for highlighted */}
                            {(isHighlighted || isSelected) && (
                                <div className="absolute -inset-2 rounded-2xl border-2 border-[#E11B22]/60 animate-ping opacity-30" />
                            )}
                        </div>
                    </button>
                );
            })}

            {/* Selected Property Preview Card */}
            {selectedListing && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 animate-[slideUp_0.3s_ease-out]">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkerClose();
                                }}
                                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="relative h-36 w-full">
                                <SafeImage
                                    src={
                                        selectedListing.mainImage ||
                                        selectedListing.images?.[0] ||
                                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'
                                    }
                                    alt={selectedListing.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute top-2 left-2">
                                <span className="bg-[#E11B22] text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow">
                                    {selectedListing.status === 'ACTIVE' ? 'For Sale' : (selectedListing.status || 'Active')}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-lg font-black text-[#E11B22] mb-1">
                                {price(selectedListing.price)}
                            </p>
                            <h4 className="text-sm font-bold text-slate-900 mb-0.5 line-clamp-1">
                                {selectedListing.title}
                            </h4>
                            <p className="text-xs text-slate-400 mb-3">
                                {selectedListing.address}, {selectedListing.city}
                            </p>
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
                                {selectedListing.bedrooms > 0 && (
                                    <span>🛏 {selectedListing.bedrooms} Beds</span>
                                )}
                                <span>🚿 {selectedListing.bathrooms} Baths</span>
                                {(selectedListing.squareFootage || selectedListing.squareFeet) && (
                                    <span>
                                        📐{' '}
                                        {(
                                            selectedListing.squareFootage ||
                                            selectedListing.squareFeet ||
                                            0
                                        ).toLocaleString()}{' '}
                                        sqft
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                    Property ID: {selectedListing.mlsNumber}
                                </span>
                                <Link
                                    href={`/listing/${selectedListing.mlsNumber}`}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E11B22] transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom-left attribution */}
            {listingsWithCoords.length < listings.length && (
                <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md rounded-xl px-3 py-2 shadow border border-white/60 pointer-events-none">
                    <p className="text-[10px] text-slate-400 font-semibold">
                        {listings.length - listingsWithCoords.length} listing{listings.length - listingsWithCoords.length !== 1 ? 's' : ''} without coordinates hidden
                    </p>
                </div>
            )}

            {/* Zoom controls (decorative) — moved to bottom-right so they don't clash with parent badge */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <button className="w-9 h-9 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/60 flex items-center justify-center text-slate-600 hover:bg-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                </button>
                <button className="w-9 h-9 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/60 flex items-center justify-center text-slate-600 hover:bg-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                    </svg>
                </button>
            </div>

            {/* Animation styles */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};
