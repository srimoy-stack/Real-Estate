'use client';

import React from 'react';
import Link from 'next/link';
import { Listing, ListingStatus } from '@repo/types';

interface ListingCardProps {
    listing: Listing;
}

const statusStyles: Record<ListingStatus, { label: string; bg: string; text: string }> = {
    [ListingStatus.ACTIVE]: { label: 'For Sale', bg: 'bg-emerald-500', text: 'text-white' },
    [ListingStatus.SOLD]: { label: 'Sold', bg: 'bg-rose-500', text: 'text-white' },
    [ListingStatus.PENDING]: { label: 'Pending', bg: 'bg-amber-500', text: 'text-white' },
    [ListingStatus.OFF_MARKET]: { label: 'Off Market', bg: 'bg-slate-500', text: 'text-white' },
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    const price = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price);
    const status = statusStyles[listing.status];

    return (
        <Link href={`/listings/${listing.slug}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                {/* Image */}
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                            <span className="text-slate-300 text-xs">Property Image</span>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className={`${status.bg} ${status.text} px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg`}>
                            {status.label}
                        </span>
                    </div>

                    {/* Save icon */}
                    <button className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all group/save">
                        <svg className="w-4 h-4 text-slate-400 group-hover/save:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[5]" />
                </div>

                {/* Content */}
                <div className="p-5">
                    <p className="text-xl font-black text-slate-900 tracking-tight">{price}</p>
                    <h3 className="text-slate-700 font-bold mt-1 group-hover:text-amber-600 transition-colors">{listing.title}</h3>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {listing.address}, {listing.city}
                    </p>

                    {/* Specs */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                        {listing.bedrooms > 0 && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                <span className="text-slate-500 text-sm font-medium">{listing.bedrooms} Beds</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4" /></svg>
                            <span className="text-slate-500 text-sm font-medium">{listing.bathrooms} Baths</span>
                        </div>
                        {listing.squareFeet && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                <span className="text-slate-500 text-sm font-medium">{listing.squareFeet.toLocaleString()} sqft</span>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <button className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-amber-500 group-hover:text-slate-900 group-hover:shadow-lg group-hover:shadow-amber-200/50">
                        View Listing
                    </button>
                </div>
            </div>
        </Link>
    );
};
