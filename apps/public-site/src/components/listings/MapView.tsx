'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { SafeImage, resolvePrice } from '@/components/ui';
import { autoNormalize, NormalizedProperty } from '@/components/ui/normalize-property';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Declare icons as nullable to avoid SSR errors
let customIcon: any = null;
let activeIcon: any = null;

// Initialize on client
if (typeof window !== 'undefined') {
    customIcon = new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div class="w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });

    activeIcon = new L.DivIcon({
        className: 'custom-div-icon active',
        html: `<div class="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-xl animate-pulse"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

function BoundsUpdater({ listings }: { listings: NormalizedProperty[] }) {
    const map = useMap();
    
    useEffect(() => {
        const geotagged = listings.filter(l => l.latitude && l.longitude);
        if (geotagged.length > 0) {
            const bounds = L.latLngBounds(geotagged.map(l => [l.latitude!, l.longitude!] as [number, number]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [listings, map]);
    
    return null;
}

export const MapView: React.FC<{ listings: any[]; activeListingId?: string | null }> = ({ listings, activeListingId }) => {
    const [selectedListing, setSelectedListing] = useState<NormalizedProperty | null>(null);

    const normalizedListings = useMemo(() => 
        listings.map(l => autoNormalize(l)), 
    [listings]);

    const geotaggedListings = useMemo(() => 
        normalizedListings.filter(l => l.latitude && l.longitude),
    [normalizedListings]);

    const getCoords = (l: NormalizedProperty): [number, number] => {
        return [l.latitude!, l.longitude!];
    };

    const center: [number, number] = useMemo(() => {
        if (geotaggedListings.length > 0) {
            const coords = geotaggedListings.map(getCoords);
            const avgLat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
            const avgLng = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
            return [avgLat, avgLng];
        }
        return [43.6532, -79.3832]; // Default Toronto
    }, [geotaggedListings]);

    return (
        <div className="relative w-full h-full bg-[#f8f9fa] rounded-[32px] overflow-hidden border border-slate-200 group shadow-inner z-0">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                <BoundsUpdater listings={normalizedListings} />

                {geotaggedListings.map(listing => {
                    const isActive = activeListingId === listing.id || selectedListing?.id === listing.id;
                    const priceDisplay = resolvePrice(listing.price, (listing as any).leaseAmount, (listing as any).leaseRatePerSqft, listing.category);
                    const pos = getCoords(listing);

                    return (
                        <Marker
                            key={listing.id}
                            position={pos}
                            icon={isActive ? activeIcon : customIcon}
                            eventHandlers={{
                                click: () => setSelectedListing(listing),
                            }}
                        >
                            <Popup className="custom-map-popup" minWidth={280}>
                                <div className="p-0 overflow-hidden rounded-xl">
                                    <div className="relative h-32 w-full">
                                        <SafeImage
                                            src={listing.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                            fill
                                            className="object-cover"
                                            alt={listing.title}
                                        />
                                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg">
                                            {listing.status || 'Active'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h4 className="text-sm font-black text-slate-900 leading-tight mb-0.5 truncate">{listing.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 truncate">{listing.city}, {listing.province}</p>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <span className="text-sm font-black text-red-600">{priceDisplay.text}</span>
                                            <Link
                                                href={listing.href}
                                                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Selection Overview Legend */}
            <div className="absolute top-6 left-6 z-[1000]">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl px-4 py-2.5 select-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Verified MLS® Map View</span>
                </div>
            </div>

            <style jsx global>{`
                .custom-map-popup .leaflet-popup-content-wrapper {
                    padding: 0 !important;
                    overflow: hidden;
                    border-radius: 16px;
                }
                .custom-map-popup .leaflet-popup-content {
                    margin: 0 !important;
                    width: 280px !important;
                }
                .custom-map-popup .leaflet-popup-tip-container {
                    display: none;
                }
            `}</style>
        </div>
    );
};
