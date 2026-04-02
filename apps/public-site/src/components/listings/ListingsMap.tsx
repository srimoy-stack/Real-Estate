'use client';

import React, { useEffect, useState } from 'react';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';


// ─── Constants ──────────────────────────────────────────────────────────────

// Fix Leaflet default icon issues in Next.js
const customIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapEventHandlerProps {
    onBoundsChange: (bounds: L.LatLngBounds) => void;
}

function MapEventHandler({ onBoundsChange }: MapEventHandlerProps) {
    const map = useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds());
        },
        zoomend: () => {
            onBoundsChange(map.getBounds());
        },
    });
    return null;
}

interface ListingsMapProps {
    initialListings: any[];
}

/**
 * ListingsMap — High-performance cluster map for property discovery.
 * Uses react-leaflet for rendering and react-leaflet-cluster for markers.
 */
export function ListingsMap({ initialListings }: ListingsMapProps) {
    const [listings] = useState<any[]>(initialListings);
    const [center, setCenter] = useState<[number, number]>([43.6532, -79.3832]);
    const [zoom] = useState(12);

    // Initial center calculation based on listings
    useEffect(() => {
        if (!initialListings || initialListings.length === 0) return;

        // Default center (Toronto approximate)
        const defaultCenter: [number, number] = [43.6532, -79.3832];
        const withCoords = initialListings.filter(l => 
            (l.location?.lat ?? l.latitude ?? l.Latitude) != null && 
            (l.location?.lng ?? l.longitude ?? l.Longitude) != null
        );
        
        if (withCoords.length > 0) {
            const avgLat = withCoords.reduce((sum, l) => sum + (l.location?.lat ?? l.latitude ?? l.Latitude ?? 0), 0) / withCoords.length;
            const avgLng = withCoords.reduce((sum, l) => sum + (l.location?.lng ?? l.longitude ?? l.Longitude ?? 0), 0) / withCoords.length;
            
            // Validate result to avoid NaN
            if (!isNaN(avgLat) && !isNaN(avgLng)) {
                setCenter([avgLat, avgLng]);
            } else {
                setCenter(defaultCenter);
            }
        }
    }, [initialListings]);

    const handleBoundsChange = (_bounds: L.LatLngBounds) => {
        // Logic for fetching markers based on bounds could go here
        // Currently we just use the initial set for demo stability
    };

    return (
        <div className="h-[750px] w-full rounded-[40px] overflow-hidden relative shadow-2xl border border-white z-0">
            <MapContainer
                key={`${center[0]}-${center[1]}`} // Force re-render when center changes radically
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEventHandler onBoundsChange={handleBoundsChange} />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                >
                    {listings.map((listing) => {
                        const lat = listing.location?.lat ?? listing.latitude ?? listing.Latitude;
                        const lng = listing.location?.lng ?? listing.longitude ?? listing.Longitude;
                        if (lat == null || lng == null) return null;

                        const id = listing.id || listing.mlsNumber || listing.ListingKey || listing.listingKey;

                        return (
                            <Marker
                                key={id}
                                position={[lat, lng]}
                                icon={customIcon}
                            >
                                <Popup className="custom-popup" closeButton={false} minWidth={240}>
                                    <div className="p-0 space-y-3">
                                        <div className="relative h-32 w-full rounded-t-xl overflow-hidden">
                                            <SafeImage
                                                src={(listing.images && listing.images[0]) || listing.primaryPhotoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                                alt={listing.address || listing.UnparsedAddress || 'Property'}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[9px] font-black uppercase tracking-widest text-slate-900">
                                                {listing.propertyType || listing.PropertyType}
                                            </div>
                                        </div>
                                        <div className="px-4 pb-4 space-y-2">
                                            <p className="text-xl font-black text-slate-900">${(listing.price || listing.ListPrice || 0).toLocaleString()}</p>
                                            <p className="text-xs font-medium text-slate-500 line-clamp-1">{listing.address || listing.UnparsedAddress}</p>
                                            <div className="flex items-center gap-3 pt-2 text-[10px] font-bold text-slate-400">
                                                <span>🛏️ {listing.bedrooms ?? listing.BedroomsTotal ?? 0} Beds</span>
                                                <span>🛁 {listing.bathrooms ?? listing.BathroomsTotalInteger ?? 0} Baths</span>
                                            </div>
                                            <Link
                                                href={`/listing/${listing.mlsNumber || listing.ListingKey}`}
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
                    background-color: rgba(217, 119, 6, 0.6);
                    border: none;
                }
                .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
                    background-color: rgb(217, 119, 6);
                    color: white;
                    font-weight: 900;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
}
