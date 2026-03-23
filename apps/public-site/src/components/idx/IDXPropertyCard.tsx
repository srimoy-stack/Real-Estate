'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@repo/types';
import { SaveButton } from '@/components/listings/SaveButton';

interface IDXPropertyCardProps {
    listing: Listing;
    isHighlighted?: boolean;
    onHover?: (listingId: string | null) => void;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: 'bg-emerald-500', text: 'text-white', label: 'For Sale' },
    SOLD: { bg: 'bg-rose-500', text: 'text-white', label: 'Sold' },
    PENDING: { bg: 'bg-amber-500', text: 'text-white', label: 'Pending' },
    OFF_MARKET: { bg: 'bg-slate-500', text: 'text-white', label: 'Off Market' },
};

export const IDXPropertyCard: React.FC<IDXPropertyCardProps> = ({
    listing,
    isHighlighted = false,
    onHover,
}) => {
    const price = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0,
    }).format(listing.price);

    const primaryImage =
        listing.mainImage ||
        (listing.images && listing.images[0]) ||
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';

    const status = statusConfig[listing.status] || statusConfig.ACTIVE;
    const sqft = listing.squareFootage || listing.squareFeet || 0;

    return (
        <Link
            href={`/listing/${listing.mlsNumber}`}
            className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 h-full ${isHighlighted
                ? 'border-indigo-400 shadow-xl shadow-indigo-100 scale-[1.02]'
                : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1'
                }`}
            onMouseEnter={() => onHover?.(listing.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                        className={`${status.bg} ${status.text} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg`}
                    >
                        {status.label}
                    </span>
                    {listing.isFeatured && (
                        <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                            Featured
                        </span>
                    )}
                </div>
                {/* Save Button */}
                <div className="absolute top-3 right-3 z-10">
                    <SaveButton listingId={listing.id} />
                </div>

                {/* Price Overlay */}
                <div className="absolute bottom-3 left-3">
                    <span className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-lg font-black tracking-tight shadow-2xl">
                        {price}
                    </span>
                </div>

                {/* Image count */}
                {listing.images && listing.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {listing.images.length}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title & Address */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1 mb-1">
                    {listing.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-3">
                    <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{listing.address}, {listing.city}</span>
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
                    {listing.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {listing.bedrooms} Beds
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        {listing.bathrooms} Baths
                    </span>
                    {sqft > 0 && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                            {sqft.toLocaleString()} sqft
                        </span>
                    )}
                </div>

                {/* MLS & Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        MLS® {listing.mlsNumber}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};
