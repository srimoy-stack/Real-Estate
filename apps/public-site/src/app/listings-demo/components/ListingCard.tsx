'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { MLSProperty } from '../types';
import { formatMLSPrice, formatMLSNumber } from '../utils';
import { RealtorBadge } from './RealtorBadge';

interface ListingCardProps {
    listing: MLSProperty;
    index: number;
}

function getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-emerald-500/90 text-white';
        case 'sold':
            return 'bg-red-500/90 text-white';
        case 'pending':
            return 'bg-amber-500/90 text-white';
        default:
            return 'bg-gray-500/90 text-white';
    }
}

/** Relative time string like Realtor.ca: "2 min ago", "3 hours ago", "5 days ago" */
function timeAgo(timestamp: string | undefined | null): string | null {
    if (!timestamp) return null;
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    if (isNaN(then)) return null;

    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (days < 365) return `${Math.floor(days / 30)} ${Math.floor(days / 30) === 1 ? 'month' : 'months'} ago`;
    return `${Math.floor(days / 365)}y ago`;
}

const PLACEHOLDER_IMAGE =
    'data:image/svg+xml;base64,' +
    btoa(
        `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f1f5f9"/>
      <text x="200" y="150" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="16">No Image Available</text>
      <path d="M170 170 L200 140 L230 170" stroke="#cbd5e1" fill="none" stroke-width="2"/>
      <circle cx="180" cy="130" r="8" fill="#cbd5e1"/>
    </svg>`
    );

export function ListingCard({ listing, index }: ListingCardProps) {
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFavourited, setIsFavourited] = useState(false);

    const imageUrl =
        !imgError && listing.Media?.[0]?.MediaURL
            ? listing.Media[0].MediaURL
            : PLACEHOLDER_IMAGE;

    const price = listing.ListPrice || listing.LeaseAmount
        ? formatMLSPrice(listing.ListPrice, listing.LeaseAmount)
        : 'Price not available';

    const freshness = timeAgo(listing.ModificationTimestamp);
    const brokerage = listing.officeName || null;

    return (
        <Link
            href={`/listings-demo/${listing.ListingKey}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1"
            style={{
                animationDelay: `${index * 60}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards',
                opacity: 0,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <NextImage
                    src={imageUrl}
                    alt={listing.UnparsedAddress || 'Property'}
                    fill
                    unoptimized={true}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={() => setImgError(true)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                {/* Status badge — top left */}
                <div className="absolute left-3 top-3">
                    <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm ${getStatusColor(listing.StandardStatus)}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                        {listing.StandardStatus}
                    </span>
                    {listing.isFeatured && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-lg bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm">
                            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            Featured
                        </span>
                    )}
                </div>

                {/* Favourite heart — top right */}
                <button
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsFavourited(!isFavourited);
                    }}
                    aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
                >
                    <svg
                        className={`h-5 w-5 transition-colors duration-200 ${isFavourited ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-transparent'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Freshness tag — bottom left (like Realtor.ca's blue dot) */}
                {freshness && (
                    <div className="absolute bottom-3 left-3 z-10" suppressHydrationWarning>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-bold text-gray-700 shadow-md backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {freshness}
                        </span>
                    </div>
                )}

                {/* Price tag on hover */}
                <div className={`absolute bottom-3 right-3 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                    <span
                        suppressHydrationWarning
                        className="rounded-xl bg-white/95 px-3 py-1.5 text-lg font-bold text-gray-900 shadow-lg backdrop-blur-sm"
                    >
                        {price}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-1.5 flex items-center justify-between">
                    <p suppressHydrationWarning className="text-xl font-bold text-gray-900 tracking-tight">{price}</p>
                    {listing.PropertySubType && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                            {listing.PropertySubType}
                        </span>
                    )}
                </div>

                <h3 className="mb-1 text-sm font-semibold text-gray-800 line-clamp-1">
                    {listing.UnparsedAddress}
                </h3>
                <p className="mb-3 text-xs text-gray-500">
                    {listing.City}, {listing.StateOrProvince} {listing.PostalCode}
                </p>

                <div className="mb-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="flex items-center gap-3 text-gray-500 mb-4">
                    {listing.BedroomsTotal != null && (
                        <div className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <span className="text-sm font-bold text-gray-800">{listing.BedroomsTotal}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">bd</span>
                        </div>
                    )}

                    {listing.BathroomsTotalInteger != null && (
                        <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                            <span className="text-sm font-bold text-gray-800">{listing.BathroomsTotalInteger}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">ba</span>
                        </div>
                    )}

                    {listing.LivingArea != null && listing.LivingArea > 0 && (
                        <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                            <span suppressHydrationWarning className="text-sm font-bold text-gray-800">
                                {formatMLSNumber(listing.LivingArea)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">sqft</span>
                        </div>
                    )}
                </div>

                {/* Footer: Brokerage + Meta */}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    {/* Brokerage name — like Realtor.ca */}
                    {brokerage ? (
                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider line-clamp-1 max-w-[65%]" title={brokerage}>
                            {brokerage}
                        </p>
                    ) : (
                        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                            {listing.ParkingTotal != null && listing.ParkingTotal > 0 && (
                                <div className="flex items-center gap-1 text-gray-500">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    {listing.ParkingTotal} Parking
                                </div>
                            )}
                            {listing.YearBuilt && (
                                <div className="flex items-center gap-1 text-gray-400">
                                    Built {listing.YearBuilt}
                                </div>
                            )}
                        </div>
                    )}
                    {/* MLS ID + Badge */}
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-semibold text-gray-300 tracking-wide">
                            MLS® {listing.ListingId}
                        </span>
                        <RealtorBadge 
                            moreInformationLink={listing.moreInformationLink} 
                            variant="compact" 
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
