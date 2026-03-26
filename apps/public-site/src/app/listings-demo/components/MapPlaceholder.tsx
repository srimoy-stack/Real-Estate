'use client';

import React from 'react';

interface MapPlaceholderProps {
    city?: string;
}

export function MapPlaceholder({ city = 'Target Area' }: MapPlaceholderProps) {
    return (
        <div className="relative w-full h-[400px] mb-8 rounded-[48px] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Map Contours (Simulated) */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
                <path d="M0,500 Q250,400 500,500 T1000,500" fill="none" stroke="white" strokeWidth="2" />
                <path d="M200,0 Q300,250 200,500 T200,1000" fill="none" stroke="white" strokeWidth="2" />
                <path d="M800,0 Q700,250 800,500 T800,1000" fill="none" stroke="white" strokeWidth="2" />
            </svg>

            {/* Pulsing Hotspots (Simulated Listings) */}
            {[
                { top: '30%', left: '40%' },
                { top: '45%', left: '55%' },
                { top: '60%', left: '35%' },
                { top: '25%', left: '70%' },
                { top: '55%', left: '65%' },
            ].map((pos, i) => (
                <div key={i} className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2" style={{ top: pos.top, left: pos.left }}>
                    <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
                    <div className="absolute inset-1 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                </div>
            ))}

            {/* Scanning Effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-[scan_4s_linear_infinite]" />

            {/* UI Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-8 py-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-105">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">Geo-Search Active</span>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">Scanning {city} & Peripheral Municipalities</p>
                    </div>
                </div>
            </div>

            {/* Coordinate Display */}
            <div className="absolute bottom-6 right-8 font-mono text-[9px] text-gray-500 uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                Targeting Geofence: {city} Board Data
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
            `}</style>
        </div>
    );
}

