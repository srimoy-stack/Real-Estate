'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { MLSProperty } from '../types';
import { formatMLSPrice, formatMLSNumber } from '../utils';

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

    const imageUrl =
        !imgError && listing.Media?.[0]?.MediaURL
            ? listing.Media[0].MediaURL
            : PLACEHOLDER_IMAGE;

    const price = formatMLSPrice(listing.ListPrice, listing.LeaseAmount);

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
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={() => setImgError(true)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                <div className="absolute left-3 top-3">
                    <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm ${getStatusColor(listing.StandardStatus)}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                        {listing.StandardStatus}
                    </span>
                </div>

                <div className="absolute right-3 top-3">
                    <span className="rounded-lg bg-black/40 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm shadow-inner">
                        ID: {listing.ListingId}
                    </span>
                </div>

                {/* Price tag on image - adding suppressHydrationWarning to prevent price locale mismatches */}
                <div className={`absolute bottom-3 left-3 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
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
                            <span className="text-sm font-bold text-gray-800">{listing.BedroomsTotal}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">bd</span>
                        </div>
                    )}

                    {listing.BathroomsTotalInteger != null && (
                        <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                            <span className="text-sm font-bold text-gray-800">{listing.BathroomsTotalInteger}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">ba</span>
                        </div>
                    )}

                    {listing.LivingArea != null && listing.LivingArea > 0 && (
                        <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                            <span suppressHydrationWarning className="text-sm font-bold text-gray-800">
                                {formatMLSNumber(listing.LivingArea)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">sqft</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex gap-3">
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
                    {listing.CommonInterest && (
                        <span className="text-emerald-600/70">{listing.CommonInterest}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
