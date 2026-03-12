'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { ListingCardField } from '@repo/services';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pin icon
const customIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Q5NzcwNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxMGMwIDctOSAxMy05IDEyczktNiA5LTEzYTkgOSAwIDAgMC0xOCAwYzAgNyA5IDEzIDkgMTNaIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0id2hpdGUiIHN0cm9rZT0ibm9uZSI+PC9jaXJjbGU+PC9zdmc+',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

interface MapEventHandlerProps {
    onBoundsChange: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
}

function MapEventHandler({ onBoundsChange }: MapEventHandlerProps) {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            onBoundsChange({
                minLat: bounds.getSouthWest().lat,
                maxLat: bounds.getNorthEast().lat,
                minLng: bounds.getSouthWest().lng,
                maxLng: bounds.getNorthEast().lng,
            });
        },
        zoomend: () => {
            const bounds = map.getBounds();
            onBoundsChange({
                minLat: bounds.getSouthWest().lat,
                maxLat: bounds.getNorthEast().lat,
                minLng: bounds.getSouthWest().lng,
                maxLng: bounds.getNorthEast().lng,
            });
        },
    });
    return null;
}

interface ListingsMapProps {
    initialListings: ListingCardField[];
}

export function ListingsMap({ initialListings }: ListingsMapProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<ListingCardField[]>(initialListings);

    // Default center (Toronto approximate)
    const defaultCenter: [number, number] = [43.6532, -79.3832];

    // Calculate initial center based on available listings
    const center = useMemo(() => {
        const withCoords = initialListings.filter(l => l.latitude && l.longitude);
        if (withCoords.length > 0) {
            const avgLat = withCoords.reduce((sum, l) => sum + l.latitude!, 0) / withCoords.length;
            const avgLng = withCoords.reduce((sum, l) => sum + l.longitude!, 0) / withCoords.length;
            return [avgLat, avgLng] as [number, number];
        }
        return defaultCenter;
    }, [initialListings]);

    // Update listings when props change (e.g., from server-side filtering)
    useEffect(() => {
        setListings(initialListings);
    }, [initialListings]);

    const handleBoundsChange = (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('minLat', bounds.minLat.toString());
        current.set('maxLat', bounds.maxLat.toString());
        current.set('minLng', bounds.minLng.toString());
        current.set('maxLng', bounds.maxLng.toString());

        // Remove page param to reset pagination when map moves
        current.delete('page');

        // We use shallow routing to update the URL without full a page reload if possible,
        // but Next.js App Router relies on router.push for server component re-rendering.
        router.push(`/listings?${current.toString()}`, { scroll: false });
    };

    return (
        <div className="h-[750px] w-full rounded-[40px] overflow-hidden relative shadow-2xl border border-white z-0">
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

                <MapEventHandler onBoundsChange={handleBoundsChange} />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                >
                    {listings.map((listing) => {
                        if (!listing.latitude || !listing.longitude) return null;

                        return (
                            <Marker
                                key={listing.id}
                                position={[listing.latitude, listing.longitude]}
                                icon={customIcon}
                            >
                                <Popup className="custom-popup" closeButton={false} minWidth={240}>
                                    <div className="p-0 space-y-3">
                                        <div className="relative h-32 w-full rounded-t-xl overflow-hidden">
                                            <img
                                                src={listing.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                                alt={listing.address}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[9px] font-black uppercase tracking-widest text-slate-900">
                                                {listing.propertyType}
                                            </div>
                                        </div>
                                        <div className="px-4 pb-4 space-y-2">
                                            <p className="text-xl font-black text-slate-900">${listing.price.toLocaleString()}</p>
                                            <p className="text-xs font-medium text-slate-500 line-clamp-1">{listing.address}</p>

                                            <div className="flex items-center gap-3 pt-2 text-[10px] font-bold text-slate-400">
                                                <span>🛏️ {listing.bedrooms} Beds</span>
                                                <span>🛁 {listing.bathrooms} Baths</span>
                                            </div>

                                            <Link
                                                href={`/listing/${listing.mlsNumber}`}
                                                className="block w-full py-2 mt-3 text-center bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Custom Leaflet Styles */}
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    padding: 0;
                    overflow: hidden;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                }
                .leaflet-popup-content {
                    margin: 0;
                    width: 240px !important;
                }
                .leaflet-popup-tip-container {
                    visibility: hidden;
                }
                .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
                    background-color: rgba(217, 119, 6, 0.6); /* Amber 600 */
                }
                .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
                    background-color: rgb(217, 119, 6);
                    color: white;
                    font-weight: 900;
                    font-family: inherit;
                }
            `}</style>
        </div>
    );
}
