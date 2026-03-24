'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useAuth } from '@repo/auth';
import { userSavedItemService } from '@repo/services';

interface RelatedListingCardProps {
    listing: any; // Using any for now to bypass the complex status enum mismatch across services
}

export const RelatedListingCard = ({ listing }: RelatedListingCardProps) => {
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

    const formattedPrice = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0,
    }).format(listing.price);

    const statusColor = (() => {
        const s = listing.status?.toString().toLowerCase() || '';
        if (s.includes('sale') || s.includes('for sale')) return 'bg-emerald-500';
        if (s.includes('sold')) return 'bg-rose-500';
        if (s.includes('pending')) return 'bg-amber-500';
        return 'bg-slate-500';
    })();

    return (
        <Link
            href={`/listing/${listing.mlsNumber}`}
            className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Image
                    src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'}
                    alt={listing.address}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`${statusColor} text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                        {listing.status}
                    </span>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleToggleSave}
                    className={`absolute top-4 right-4 h-9 w-9 rounded-xl flex items-center justify-center transition-all ${isSaved ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-white/80 hover:bg-white text-slate-900 border border-slate-200'
                        } shadow-lg backdrop-blur-sm z-10`}
                >
                    <svg className={`w-4 h-4 ${isSaved ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Property badge */}
                <div className="absolute bottom-4 right-4">
                    <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                        ID: {listing.mlsNumber}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <p className="text-xl font-black text-indigo-600 tracking-tighter mb-1">{formattedPrice}</p>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-0.5">
                    {listing.address}
                </h3>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">
                    {listing.city}, {listing.province}
                </p>

                {/* Specs */}
                <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-50 pt-3 mt-auto">
                    <span className="font-bold">{listing.bedrooms} bed</span>
                    <span className="font-bold">{listing.bathrooms} bath</span>
                    {listing.squareFootage > 0 && (
                        <span className="font-bold">{listing.squareFootage.toLocaleString()} sqft</span>
                    )}
                </div>
            </div>
        </Link>
    );
};
