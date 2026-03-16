'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Listing } from '@repo/types';

interface MapViewProps {
    listings: Listing[];
    onMarkerClick?: (listing: Listing) => void;
    activeListingId?: string | null;
    onMapUpdate?: () => void;
}

/**
 * MapView Component
 * Renders a premium map placeholder with interactive markers.
 */
export const MapView: React.FC<MapViewProps> = ({ listings, activeListingId, onMapUpdate }) => {
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    // Filter listings with coordinates
    const geotaggedListings = listings.filter(l => l.latitude && l.longitude);

    // Normalize coordinates for the SVG viewport
    const bounds = geotaggedListings.length > 0
        ? {
            minLat: Math.min(...geotaggedListings.map(l => l.latitude!)),
            maxLat: Math.max(...geotaggedListings.map(l => l.latitude!)),
            minLng: Math.min(...geotaggedListings.map(l => l.longitude!)),
            maxLng: Math.max(...geotaggedListings.map(l => l.longitude!)),
        }
        : { minLat: 43.6, maxLat: 43.7, minLng: -79.4, maxLng: -79.3 };

    const latRange = (bounds.maxLat - bounds.minLat) || 0.1;
    const lngRange = (bounds.maxLng - bounds.minLng) || 0.1;
    const padding = 0.1;

    const getPos = (lat: number, lng: number) => ({
        x: ((lng - bounds.minLng) / lngRange) * (1 - 2 * padding) + padding,
        y: 1 - (((lat - bounds.minLat) / latRange) * (1 - 2 * padding) + padding),
    });

    const formatPrice = (val: number) =>
        new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="relative w-full h-full bg-[#E5E3DF] rounded-[48px] overflow-hidden border border-slate-200 group">
            {/* Map Placeholder Visuals */}
            <div className="absolute inset-0 opacity-40">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <pattern id="mapGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#94a3b8" strokeWidth="1" />
                        </pattern>
                        <pattern id="streetPattern" width="300" height="300" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                            <rect width="300" height="40" x="0" y="50" fill="#CBD5E1" />
                            <rect width="300" height="40" x="0" y="180" fill="#CBD5E1" />
                            <rect width="40" height="300" x="80" y="0" fill="#CBD5E1" />
                            <rect width="40" height="300" x="220" y="0" fill="#CBD5E1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mapGrid)" />
                    <rect width="100%" height="100%" fill="url(#streetPattern)" />
                    {/* Water bodies */}
                    <path d="M0,800 Q200,750 400,850 T800,800 L800,1000 L0,1000 Z" fill="#BAE6FD" opacity="0.6" />
                </svg>
            </div>

            {/* Markers */}
            <div className="absolute inset-0 z-10">
                {geotaggedListings.map(listing => {
                    const pos = getPos(listing.latitude!, listing.longitude!);
                    const isActive = activeListingId === listing.id || selectedListing?.id === listing.id;

                    return (
                        <button
                            key={listing.id}
                            onClick={() => setSelectedListing(listing)}
                            className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-500 cursor-pointer ${isActive ? 'z-30' : 'hover:z-20'}`}
                            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                        >
                            <div className="relative group">
                                <div className={`px-3 py-1.5 rounded-xl font-black text-xs shadow-2xl transition-all duration-300 whitespace-nowrap border-2 ${isActive
                                    ? 'bg-indigo-600 text-white border-indigo-400 scale-110'
                                    : 'bg-white text-slate-900 border-white hover:bg-slate-900 hover:text-white hover:border-slate-700'
                                    }`}>
                                    {formatPrice(listing.price)}
                                </div>
                                <div className={`absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 shadow-xl transition-colors ${isActive ? 'bg-indigo-600' : 'bg-white group-hover:bg-slate-900'
                                    }`} />

                                {isActive && (
                                    <div className="absolute -inset-2 rounded-2xl border-2 border-indigo-400 animate-ping opacity-20" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selection Preview Card */}
            {selectedListing && (
                <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 z-40">
                    <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="relative aspect-video">
                            <button
                                onClick={() => setSelectedListing(null)}
                                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <img
                                src={selectedListing.mainImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                className="w-full h-full object-cover"
                                alt={selectedListing.title}
                            />
                            <div className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {selectedListing.status.replace('_', ' ')}
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="mb-4">
                                <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">{selectedListing.title}</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none truncate">{selectedListing.address}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-xl font-black text-indigo-600">{formatPrice(selectedListing.price)}</span>
                                <Link
                                    href={`/listing/${selectedListing.mlsNumber}`}
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-100"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Interaction Legend */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 glass-header rounded-2xl border border-white/40 shadow-xl px-5 py-3 select-none">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Live Map View (Simulated)</span>
                </div>
                <button
                    onClick={() => onMapUpdate?.()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v16c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V4c0-1.105-.895-2-2-2H6c-1.105 0-2 .895-2 2z" /></svg>
                    Search this Area
                </button>
            </div>

            <style jsx>{`
                .glass-header {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                }
            `}</style>
        </div>
    );
};
