'use client';

import React from 'react';
import Link from 'next/link';
import { Listing, ListingStatus } from '@repo/types';

interface LuxuryListingCardProps {
    listing: Listing;
    variant?: 'large' | 'standard';
}

const statusMap: Record<ListingStatus, { label: string; color: string }> = {
    [ListingStatus.ACTIVE]: { label: 'For Sale', color: 'bg-emerald-500' },
    [ListingStatus.SOLD]: { label: 'Sold', color: 'bg-rose-500' },
    [ListingStatus.PENDING]: { label: 'Pending', color: 'bg-amber-500' },
    [ListingStatus.OFF_MARKET]: { label: 'Off Market', color: 'bg-slate-500' },
};

export const LuxuryListingCard: React.FC<LuxuryListingCardProps> = ({ listing, variant = 'standard' }) => {
    const price = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price);
    const address = `${listing.address.street}, ${listing.address.city}`;
    const status = statusMap[listing.status];

    if (variant === 'large') {
        return (
            <Link href={`/listings/${listing.slug}`} className="group block relative">
                <div className="relative overflow-hidden rounded-sm aspect-[4/5] md:aspect-[3/4]">
                    {/* Image placeholder */}
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                            </div>
                            <span className="text-white/20 text-xs">Property Image</span>
                        </div>
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Status badge */}
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                        <span className={`${status.color} text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-sm`}>
                            {status.label}
                        </span>
                        {listing.features.length > 0 && (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-sm">
                                Premium
                            </span>
                        )}
                    </div>

                    {/* Save button */}
                    <button className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group/save">
                        <svg className="w-5 h-5 text-white/60 group-hover/save:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                        <p className="text-amber-400 text-3xl md:text-4xl font-black tracking-tighter">{price}</p>
                        <h3 className="text-white text-xl font-bold mt-2 group-hover:text-amber-200 transition-colors duration-300">{listing.title}</h3>
                        <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {address}
                        </p>

                        {/* Specs */}
                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
                            {listing.bedrooms > 0 && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    <span className="text-white/60 text-sm font-medium">{listing.bedrooms} Beds</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4" /></svg>
                                <span className="text-white/60 text-sm font-medium">{listing.bathrooms} Baths</span>
                            </div>
                            {listing.squareFeet && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                    <span className="text-white/60 text-sm font-medium">{listing.squareFeet.toLocaleString()} sqft</span>
                                </div>
                            )}
                        </div>

                        {/* CTA on hover */}
                        <div className="mt-6 overflow-hidden h-0 group-hover:h-12 transition-all duration-500">
                            <span className="inline-flex items-center gap-2 text-amber-400 text-[11px] font-black uppercase tracking-[0.2em] group-hover:translate-y-0 translate-y-4 transition-transform duration-500">
                                View Property
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Standard card
    return (
        <Link href={`/listings/${listing.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-sm aspect-[16/10]">
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <span className="text-white/20 text-xs">Property Image</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20">
                    <span className={`${status.color} text-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] rounded-sm`}>{status.label}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                    <p className="text-amber-400 text-xl font-black tracking-tighter">{price}</p>
                    <h3 className="text-white font-bold mt-1 group-hover:text-amber-200 transition-colors">{listing.title}</h3>
                    <p className="text-white/40 text-xs mt-1">{address}</p>
                    <div className="flex gap-4 mt-3 text-white/50 text-xs font-medium">
                        {listing.bedrooms > 0 && <span>{listing.bedrooms} BD</span>}
                        <span>{listing.bathrooms} BA</span>
                        {listing.squareFeet && <span>{listing.squareFeet.toLocaleString()} SF</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
};
