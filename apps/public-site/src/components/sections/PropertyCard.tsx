import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@repo/types';
import { SaveButton } from '@/components/listings/SaveButton';
import { RealtorBadge } from '@/components/listings/RealtorBadge';

interface PropertyCardProps {
    listing: Listing;
}

export const PropertyCard = ({ listing }: PropertyCardProps) => {
    if (!listing) return null;

    const price = listing.price || 0;
    const formattedPrice = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0,
    }).format(price);

    // Get primary image
    const primaryImage = listing.mainImage || (listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';

    // Format status label
    const statusLabel = (() => {
        const s = (listing.status || '').toString();
        if (s === 'ACTIVE' || s.toLowerCase().includes('sale')) return 'For Sale';
        if (s === 'SOLD' || s.toLowerCase().includes('sold')) return 'Sold';
        if (s === 'PENDING') return 'Pending';
        return s.replace(/_/g, ' ');
    })();

    const statusColor = (() => {
        const s = (listing.status || '').toString().toLowerCase();
        if (s === 'active' || s.includes('sale')) return 'bg-emerald-500 shadow-emerald-500/25';
        if (s.includes('sold')) return 'bg-rose-500 shadow-rose-500/25';
        if (s.includes('pending')) return 'bg-amber-500 shadow-amber-500/25';
        return 'bg-slate-500 shadow-slate-500/25';
    })();

    return (
        <Link
            href={`/listing/${listing.mlsNumber}`}
            className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-md hover:shadow-2xl hover:border-brand-red transition-all duration-500 h-full"
        >
            {/* Image Container — landscape ratio for consistent grid */}
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Image
                    src={primaryImage}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Status Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`${statusColor} text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg`}>
                            {statusLabel}
                        </span>
                        {listing.isFeatured && (
                            <span className="bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                                Premier
                            </span>
                        )}
                    </div>

                    {/* Freshness Badge */}
                    {(listing as any).modificationTimestamp && (new Date().getTime() - new Date((listing as any).modificationTimestamp).getTime() < 48 * 60 * 60 * 1000) && (
                        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-xl shadow-black/10 border border-white/20 animate-in fade-in slide-in-from-left-4 duration-500 max-w-fit">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#d0021b] flex items-center gap-1.5 leading-none">
                                <span className="h-1 w-1 rounded-full bg-[#d0021b] animate-pulse" />
                                Just Listed
                            </span>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="absolute top-3 right-3 z-10 transition-transform hover:scale-110 active:scale-90">
                    <SaveButton listingId={listing.id} />
                </div>
            </div>

            {/* Content — High Information Density */}
            <div className="p-4 flex flex-col flex-1">
                {/* Price — Large and Red like Realtor.ca */}
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-2xl font-black text-[#d0021b] tracking-tight leading-none italic">
                        {formattedPrice}
                    </span>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">MLS® Number</span>
                        <span className="text-[10px] font-bold text-slate-700 leading-none">{listing.mlsNumber}</span>
                    </div>
                </div>

                {/* Address Section */}
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-red transition-colors leading-tight line-clamp-1">
                        {listing.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide truncate">
                        {listing.address}, {listing.city}
                    </p>
                </div>

                <div className="h-px bg-slate-100 mb-4" />

                {/* Stats Row with Quality Icons */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {listing.bedrooms > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-black text-slate-900">{listing.bedrooms}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Beds</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black text-slate-900">{listing.bathrooms}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Baths</span>
                        </div>
                        {(listing.squareFootage || listing.squareFeet) && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-black text-slate-900">{((listing.squareFootage || listing.squareFeet || 0)).toLocaleString()}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">SqFt</span>
                            </div>
                        )}
                    </div>
                    {/* Compact Compliance Badge */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                        <RealtorBadge variant="minimal" />
                    </div>
                </div>

                {/* Footer: Brokerage + Action */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300 line-clamp-1 max-w-[150px]">
                            {listing.brokerageName || 'REALTOR® Marketplace Professional'}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">Detailed Info</span>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-brand-red group-hover:border-transparent transition-all">
                                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-all transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
