import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@repo/types';
import { SaveButton } from '@/components/listings/SaveButton';
import { RealtorBadge } from '@/components/listings/RealtorBadge';

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
    const formattedPrice = new Intl.NumberFormat('en-CA', {
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
                ? 'border-brand-red shadow-xl shadow-brand-red/10 scale-[1.02]'
                : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-red hover:-translate-y-1'
                }`}
            onMouseEnter={() => onHover?.(listing.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Image section */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                    src={primaryImage}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                         <span
                            className={`${status.bg} ${status.text} px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg`}
                        >
                            {status.label}
                        </span>
                        {listing.isFeatured && (
                            <span className="bg-slate-900/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg">
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
                <div className="absolute top-3 right-3 z-10">
                    <SaveButton listingId={listing.id} />
                </div>

                {/* Quick Stats Overlay (Realtor.ca often has overlays for quick glance) */}
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-2xl shadow-black/20 border border-white">
                         <span className="text-lg font-black text-brand-red leading-none italic">{formattedPrice}</span>
                    </div>
                </div>

                {/* Image count */}
                {listing.images && listing.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1.5 leading-none">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {listing.images.length}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title & Address */}
                <div className="mb-3">
                    <h3 className="text-[13px] font-black text-slate-900 group-hover:text-brand-red transition-colors leading-tight line-clamp-1 mb-0.5 uppercase tracking-tight">
                        {listing.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-brand-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{listing.address}, {listing.city}</span>
                    </p>
                </div>

                <div className="h-px bg-slate-50 mb-3" />

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900">{listing.bedrooms}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Beds</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900">{listing.bathrooms}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Baths</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900">{sqft > 0 ? sqft.toLocaleString() : 'N/A'}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">SqFt</span>
                    </div>
                </div>

                {/* Footer Section: MLS + DDF */}
                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">
                            MLS® {listing.mlsNumber}
                        </span>
                        <RealtorBadge variant="minimal" />
                    </div>
                    
                    <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-brand-red group-hover:border-transparent transition-all">
                        <svg className="w-3 h-3 text-slate-400 group-hover:text-white transition-all transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};
