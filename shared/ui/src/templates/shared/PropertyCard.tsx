'use client';

import React from 'react';
import Link from 'next/link';
import { Listing, ListingStatus } from '@repo/types';

export interface PropertyCardProps {
    listing: Listing;
    variant?: 'default' | 'compact' | 'luxury' | 'minimal' | 'corporate';
}

const statusColors: Record<ListingStatus, { bg: string; text: string; label: string }> = {
    [ListingStatus.ACTIVE]: { bg: 'bg-emerald-500', text: 'text-white', label: 'For Sale' },
    [ListingStatus.SOLD]: { bg: 'bg-rose-500', text: 'text-white', label: 'Sold' },
    [ListingStatus.PENDING]: { bg: 'bg-amber-500', text: 'text-white', label: 'Pending' },
    [ListingStatus.OFF_MARKET]: { bg: 'bg-slate-500', text: 'text-white', label: 'Off Market' },
};

import { useTemplate } from '../TemplateContext';

export const PropertyCard: React.FC<PropertyCardProps> = ({ listing, variant = 'default' }) => {
    const { onNavigate } = useTemplate();
    const status = statusColors[listing.status];
    const price = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price);
    const address = `${listing.address}, ${listing.city}`;

    const handlePropertyClick = (e: React.MouseEvent) => {
        if (onNavigate) {
            e.preventDefault();
            onNavigate(`/listing/${listing.mlsNumber}`);
        }
    };

    if (variant === 'luxury') {
        return (
            <Link href={`/listings/${listing.slug}`} onClick={handlePropertyClick} className="group block">
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[4/5] shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-600 text-sm">Property Image</span>
                    </div>
                    <div className="absolute top-4 left-4 z-20">
                        <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>{status.label}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <p className="text-amber-400 text-2xl font-black tracking-tighter">{price}</p>
                        <h3 className="text-white text-lg font-bold mt-1 group-hover:text-amber-200 transition-colors">{listing.title}</h3>
                        <p className="text-white/60 text-sm mt-1">{address}</p>
                        <div className="flex gap-4 mt-4 text-white/80 text-xs font-bold">
                            {listing.bedrooms > 0 && <span>{listing.bedrooms} Beds</span>}
                            <span>{listing.bathrooms} Baths</span>
                            {listing.squareFeet && <span>{listing.squareFeet.toLocaleString()} sqft</span>}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === 'compact') {
        return (
            <Link href={`/listings/${listing.slug}`} onClick={handlePropertyClick} className="group flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all bg-white">
                <div className="w-32 h-24 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <span className="text-slate-400 text-xs">Image</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`${status.bg} ${status.text} px-2 py-0.5 rounded text-[9px] font-black uppercase`}>{status.label}</span>
                    </div>
                    <h3 className="text-slate-900 font-bold text-sm truncate group-hover:text-indigo-600 transition-colors">{listing.title}</h3>
                    <p className="text-slate-400 text-xs truncate">{address}</p>
                    <p className="text-indigo-600 font-black text-sm mt-1">{price}</p>
                </div>
            </Link>
        );
    }

    if (variant === 'minimal') {
        return (
            <Link href={`/listings/${listing.slug}`} onClick={handlePropertyClick} className="group block">
                <div className="aspect-[3/2] bg-slate-100 rounded-lg overflow-hidden mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-slate-400 text-sm">Property Image</span></div>
                    <div className="absolute top-3 right-3">
                        <span className={`${status.bg} ${status.text} px-2 py-0.5 text-[9px] font-bold uppercase rounded`}>{status.label}</span>
                    </div>
                </div>
                <p className="text-slate-900 font-medium group-hover:text-slate-600 transition-colors">{listing.title}</p>
                <p className="text-slate-400 text-sm mt-0.5">{address}</p>
                <p className="text-slate-900 font-bold mt-2">{price}</p>
            </Link>
        );
    }

    if (variant === 'corporate') {
        return (
            <Link href={`/listings/${listing.slug}`} onClick={handlePropertyClick} className="group block border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all bg-white">
                <div className="aspect-[16/10] bg-slate-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-slate-400 text-sm">Property Image</span></div>
                    <div className="absolute top-0 left-0">
                        <span className={`${status.bg} ${status.text} px-4 py-1.5 text-[10px] font-bold uppercase`}>{status.label}</span>
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="text-slate-900 font-bold group-hover:text-blue-700 transition-colors">{listing.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{address}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="flex gap-3 text-xs text-slate-500 font-medium">
                            {listing.bedrooms > 0 && <span>{listing.bedrooms} BD</span>}
                            <span>{listing.bathrooms} BA</span>
                            {listing.squareFeet && <span>{listing.squareFeet.toLocaleString()} SF</span>}
                        </div>
                        <p className="text-blue-700 font-black text-lg">{price}</p>
                    </div>
                </div>
            </Link>
        );
    }

    // Default variant
    return (
        <Link href={`/listings/${listing.slug}`} onClick={handlePropertyClick} className="group block rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all bg-white">
            <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Property Image</span>
                </div>
                <div className="absolute top-3 left-3">
                    <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>{status.label}</span>
                </div>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg group-hover:text-indigo-600 transition-colors">{listing.title}</h3>
                        <p className="text-slate-400 text-sm mt-0.5">{address}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="flex gap-4 text-xs text-slate-500 font-semibold">
                        {listing.bedrooms > 0 && <span className="flex items-center gap-1">🛏 {listing.bedrooms}</span>}
                        <span className="flex items-center gap-1">🚿 {listing.bathrooms}</span>
                        {listing.squareFeet && <span className="flex items-center gap-1">📐 {listing.squareFeet.toLocaleString()} sqft</span>}
                    </div>
                    <p className="text-indigo-600 font-black text-lg">{price}</p>
                </div>
            </div>
        </Link>
    );
};
