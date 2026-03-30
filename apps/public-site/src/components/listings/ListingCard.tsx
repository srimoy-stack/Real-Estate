'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@repo/types';
import { useAuth } from '@repo/auth';
import { userSavedItemService } from '@repo/services';

interface ListingCardProps {
    listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (user) {
            userSavedItemService.isListingSaved(user.id, listing.mlsNumber).then(setIsSaved);
        }
    }, [user, listing.mlsNumber]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        if (isSaved) {
            await userSavedItemService.removeSavedListing(user.id, listing.mlsNumber);
            setIsSaved(false);
        } else {
            await userSavedItemService.saveListing(user.id, listing.mlsNumber);
            setIsSaved(true);
        }
    };

    return (
        <Link
            href={`/listing/${listing.mlsNumber}`}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={listing.mainImage || (listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    loading="lazy"
                />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {listing.status === 'ACTIVE' && (
                        <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                            For Sale
                        </span>
                    )}
                    {listing.status === 'SOLD' && (
                        <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">
                            Sold Out
                        </span>
                    )}
                    {listing.status === 'PENDING' && (
                        <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                            Pending
                        </span>
                    )}
                    {listing.status === 'OFF_MARKET' && (
                        <span className="px-3 py-1 bg-slate-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-500/20">
                            Off Market
                        </span>
                    )}

                    {/* New Listing Badge - based on ID for demo or createdAt if available */}
                    {(new Date().getTime() - new Date(listing.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) && (
                        <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                            New
                        </span>
                    )}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleToggleSave}
                    className={`absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-white/80 hover:bg-white text-slate-900 border border-slate-200'
                        } shadow-lg backdrop-blur-sm z-10`}
                >
                    <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Photo Count Badge */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[11px] font-medium text-white">{listing.images.length + 1}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Title & Location */}
                <div className="mb-3">
                    <h3 className="line-clamp-1 text-base font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {listing.city}, {listing.province}
                    </p>
                </div>

                {/* Price */}
                <div className="mb-4">
                    <span className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price)}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                        est. ${Math.round(listing.price * 0.0044).toLocaleString()}/mo
                    </span>
                </div>

                {/* Specs — Zolo-style inline */}
                <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3 mt-auto">
                    <span className="font-medium">{listing.bedrooms} bed</span>
                    <span className="font-medium">{listing.bathrooms} bath</span>
                    {listing.squareFootage && (
                        <span className="font-medium">{listing.squareFootage.toLocaleString()} sqft</span>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            MLS® {listing.mlsNumber}
                        </span>
                        {/* CREA DDF Required: Powered by REALTOR.ca badge */}
                        <div onClick={(e) => e.stopPropagation()}>
                            <a
                                href="https://www.realtor.ca/en"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center"
                            >
                                <Image
                                    src="https://www.realtor.ca/images/en-ca/powered_by_realtor.svg"
                                    alt="Powered by: REALTOR.ca"
                                    width={70}
                                    height={20}
                                    className="opacity-50 hover:opacity-100 transition-opacity"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                        View Details
                    </div>
                </div>
            </div>
        </Link>
    );
};
