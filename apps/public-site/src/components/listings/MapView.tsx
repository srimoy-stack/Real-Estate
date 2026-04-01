'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { SafeImage } from '@/components/ui';
import { autoNormalize, NormalizedProperty } from '@/components/ui/normalize-property';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
    (window as any).L = L;
    require('leaflet-draw');

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// ─── Format Price for Marker ───────────────────────────────────
function formatMarkerPrice(price: number | null): string {
    if (price === null || price === undefined || price <= 0) return 'Price TBD';
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}k`;
    return `$${price}`;
}

// ─── Marker Icons ────────────────────────────────────────────────
const createMarkerIcon = (label: string, isHovered: boolean, isActive: boolean) => {
    if (typeof window === 'undefined') return undefined;
    
    const bgColor = isActive ? 'bg-red-600' : isHovered ? 'bg-red-500' : 'bg-slate-900';
    const textColor = 'text-white';
    const scale = isActive || isHovered ? 'scale-110 shadow-xl' : 'scale-100 shadow-md';
    const zIndex = isActive ? 'z-[1000]' : isHovered ? 'z-[900]' : 'z-[100]';

    return new L.DivIcon({
        className: `custom-price-marker ${zIndex}`,
        html: `<div class="px-2 py-1 rounded-full ${bgColor} ${textColor} ${scale} border border-white/50 font-black text-[10px] tracking-tight transition-all duration-300 flex items-center justify-center min-w-[45px]">
                 ${label}
               </div>`,
        iconSize: [45, 24],
        iconAnchor: [22, 12],
    });
};


// ─── Types ───────────────────────────────────────────────────────
export interface DrawBounds {
    latMin: number;
    latMax: number;
    lngMin: number;
    lngMax: number;
}

export interface MapViewProps {
    listings: any[];
    activeListingId?: string | null;
    hoveredListingId?: string | null;
    enableDraw?: boolean;
    onDrawComplete?: (bounds: DrawBounds) => void;
    onDrawClear?: () => void;
    onMarkerClick?: (listingId: string) => void;
    isDrawActive?: boolean;
}

// ─── BoundsUpdater ───────────────────────────────────────────────
function BoundsUpdater({ listings, skipUpdate }: { listings: NormalizedProperty[]; skipUpdate?: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (skipUpdate || listings.length === 0) return;
        const geotagged = listings.filter(l => l.latitude && l.longitude);
        if (geotagged.length > 0) {
            const bounds = L.latLngBounds(geotagged.map(l => [l.latitude!, l.longitude!] as [number, number]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [listings, map, skipUpdate]);
    return null;
}

// ─── DrawControl Component ───────────────────────────────────────
function DrawControl({ 
    onDrawComplete, 
    isDrawActive 
}: { 
    onDrawComplete?: (bounds: DrawBounds) => void;
    isDrawActive?: boolean;
}) {
    const map = useMap();
    const activeHandlerRef = useRef<any>(null);
    const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

    useEffect(() => {
        if (!map) return;
        const drawnItems = drawnItemsRef.current;
        map.addLayer(drawnItems);
        return () => { map.removeLayer(drawnItems); };
    }, [map]);

    const stopDrawing = useCallback(() => {
        if (activeHandlerRef.current) {
            activeHandlerRef.current.disable();
            activeHandlerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!map) return;
        if (!isDrawActive) {
            stopDrawing();
            return;
        }

        const handler = new (L as any).Draw.Rectangle(map, {
            shapeOptions: {
                color: '#ef4444', // red-500
                weight: 3,
                fillOpacity: 0.1,
                fillColor: '#ef4444',
                dashArray: '5, 10'
            }
        });

        activeHandlerRef.current = handler;
        handler.enable();

        const handleCreated = (e: any) => {
            drawnItemsRef.current.clearLayers();
            drawnItemsRef.current.addLayer(e.layer);

            const bounds = e.layer.getBounds();
            onDrawComplete?.({
                latMin: bounds.getSouth(),
                latMax: bounds.getNorth(),
                lngMin: bounds.getWest(),
                lngMax: bounds.getEast(),
            });
            stopDrawing();
        };

        map.on(L.Draw.Event.CREATED, handleCreated);
        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
            stopDrawing();
        };
    }, [map, isDrawActive, onDrawComplete, stopDrawing]);

    return null;
}

// ─── MapView Component ───────────────────────────────────────────
export const MapView: React.FC<MapViewProps> = ({ 
    listings, 
    activeListingId,
    hoveredListingId,
    enableDraw = false,
    onDrawComplete,
    onDrawClear,
    onMarkerClick,
    isDrawActive = false,
}) => {
    const [hasDrawnArea, setHasDrawnArea] = useState(false);

    const normalizedListings = useMemo(() => 
        listings.map(l => autoNormalize(l)), 
    [listings]);


    const handleDrawComplete = useCallback((bounds: DrawBounds) => {
        setHasDrawnArea(true);
        onDrawComplete?.(bounds);
    }, [onDrawComplete]);


    return (
        <div className="relative w-full h-full bg-[#f8f9fa] rounded-[32px] overflow-hidden border border-slate-200 group shadow-inner z-0">
            <MapContainer
                center={[43.6532, -79.3832]}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                <BoundsUpdater listings={normalizedListings} skipUpdate={hasDrawnArea || isDrawActive} />

                {enableDraw && (
                    <DrawControl
                        onDrawComplete={handleDrawComplete}
                        isDrawActive={isDrawActive}
                    />
                )}

                {listings.map((l: any) => {
                    const id = l.ListingKey || l.id;
                    const lat = l.Latitude || l.latitude;
                    const lng = l.Longitude || l.longitude;
                    const price = l.ListPrice || l.price;

                    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

                    const isHovered = hoveredListingId === id;
                    const isActive = activeListingId === id;
                    
                    return (
                        <Marker
                            key={id}
                            position={[lat, lng]}
                            icon={createMarkerIcon(formatMarkerPrice(price), isHovered, isActive)}
                            eventHandlers={{
                                click: () => onMarkerClick?.(id),
                            }}
                        >
                            <Popup className="custom-popup" closeButton={false}>
                                <div className="w-64 overflow-hidden rounded-2xl bg-white shadow-2xl">
                                    <div className="relative aspect-video w-full bg-slate-100">
                                        <SafeImage
                                            src={l.Media?.[0]?.MediaURL || l.imageUrl || ''}
                                            alt={l.UnparsedAddress}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h4 className="text-sm font-black text-slate-900 truncate">{l.UnparsedAddress || l.title || 'Property'}</h4>
                                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50">
                                            <span className="text-sm font-black text-red-600">{formatMarkerPrice(price)}</span>
                                            <Link href={`/listing/${id}`} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all hover:bg-emerald-600">
                                                View Home
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Premium Overlays */}
            <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">Live Inventory</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 leading-none">Syncing with Board MLS®</span>
                    </div>
                </div>
            </div>

            {/* Draw Mode Interaction Hint */}
            {isDrawActive && (
                <div className="absolute inset-0 z-[1001] bg-slate-900/10 pointer-events-none flex items-center justify-center animate-in fade-in duration-500">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-2xl px-6 py-4 shadow-2xl flex flex-col items-center gap-3 border border-white/10 scale-in-center">
                        <div className="flex items-center gap-2">
                             <svg className="w-5 h-5 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-xs font-black uppercase tracking-widest">Draw Search Area</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest opacity-80">Click and drag on the map to filter homes</p>
                    </div>
                </div>
            )}

            {/* Custom Clear Button if Filter Active */}
            {hasDrawnArea && !isDrawActive && (
                 <div className="absolute top-6 right-6 z-[1000]">
                    <button 
                        onClick={() => { setHasDrawnArea(false); onDrawClear?.(); }}
                        className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl shadow-xl px-4 py-2.5 transition-all hover:bg-emerald-700 active:scale-95 group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Clear Area Filter</span>
                    </button>
                 </div>
            )}

            <style jsx global>{`
                .custom-map-popup .leaflet-popup-content-wrapper { padding: 0 !important; overflow: hidden; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
                .custom-map-popup .leaflet-popup-content { margin: 0 !important; width: 280px !important; }
                .custom-map-popup .leaflet-popup-tip-container { display: none; }
                .leaflet-draw-tooltip { 
                    background: #0f172a; border-radius: 8px; color: white; padding: 6px 12px; 
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
                    border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
                .custom-map-marker { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>
        </div>
    );
};
