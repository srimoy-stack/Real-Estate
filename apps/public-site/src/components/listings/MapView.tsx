'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@repo/types';

interface MapViewProps {
    listings: Listing[];
    onMarkerClick?: (listing: Listing) => void;
    activeListingId?: string | null;
}

/**
 * MapView Component
 * Renders a premium map placeholder with interactive markers.
 */
export const MapView: React.FC<MapViewProps> = ({ listings, activeListingId }) => {
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
        <div className="relative w-full h-full bg-[#f8f9fa] rounded-[32px] overflow-hidden border border-slate-200 group shadow-inner">
            {/* Map Placeholder Visuals — Refined for professional look */}
            <div className="absolute inset-0 opacity-[0.15]">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <pattern id="mapGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#222" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mapGrid)" />
                </svg>
            </div>

            {/* Price Markers — Realtor.ca Style */}
            <div className="absolute inset-0 z-10">
                {geotaggedListings.map(listing => {
                    const pos = getPos(listing.latitude!, listing.longitude!);
                    const isActive = activeListingId === listing.id || selectedListing?.id === listing.id;

                    return (
                        <button
                            key={listing.id}
                            onClick={() => setSelectedListing(listing)}
                            className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 cursor-pointer ${isActive ? 'z-30 scale-110' : 'hover:z-20 hover:scale-105'}`}
                            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                        >
                            <div className="relative group/pin">
                                <div className={`px-2.5 py-1.5 rounded-lg font-black text-[10px] shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all duration-300 whitespace-nowrap border-2 ${isActive
                                    ? 'bg-[#d0021b] text-white border-white'
                                    : 'bg-white text-slate-800 border-slate-100 group-hover/pin:bg-[#d0021b] group-hover/pin:text-white group-hover/pin:border-white'
                                    }`}>
                                    {formatPrice(listing.price)}
                                </div>
                                {/* Pin Point */}
                                <div className={`absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 border-r border-b transition-colors ${isActive ? 'bg-[#d0021b] border-white' : 'bg-white border-slate-100 group-hover/pin:bg-[#d0021b] group-hover/pin:border-white'
                                    }`} />

                                {isActive && (
                                    <div className="absolute -inset-3 rounded-2xl border-2 border-brand-red animate-ping opacity-20" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selection Preview Card — Realtor Styled */}
            {selectedListing && (
                <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-72 z-40">
                    <div className="bg-white rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <div className="relative aspect-video">
                            <button
                                onClick={() => setSelectedListing(null)}
                                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-brand-red transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <Image
                                src={selectedListing.mainImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                fill
                                className="object-cover"
                                alt={selectedListing.title}
                            />
                            <div className="absolute top-2 left-2 bg-[#d0021b] text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                                {selectedListing.status.replace('_', ' ')}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-3">
                                <h4 className="text-sm font-black text-slate-900 leading-tight mb-0.5">{selectedListing.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none truncate">{selectedListing.address}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <span className="text-base font-black text-brand-red italic">{formatPrice(selectedListing.price)}</span>
                                <Link
                                    href={`/listing/${selectedListing.mlsNumber}`}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-md active:scale-95"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Interaction Legend */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl px-4 py-2.5 select-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Verified MLS® Map View</span>
                </div>
            </div>

            <style jsx>{`
                .glass-header {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(16px);
                }
            `}</style>
        </div>
    );
};
