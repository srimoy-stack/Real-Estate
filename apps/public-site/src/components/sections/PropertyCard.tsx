import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@repo/types';
import { SaveButton } from '@/components/listings/SaveButton';

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
            className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 h-full"
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
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`${statusColor} text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                        {statusLabel}
                    </span>
                    {listing.isFeatured && (
                        <span className="bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                            Premier
                        </span>
                    )}
                </div>

                {/* Save Button */}
                <div className="absolute top-4 right-4 z-10">
                    <SaveButton listingId={listing.id} />
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-4 left-4">
                    <span className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-lg font-black tracking-tight shadow-xl">
                        {formattedPrice}
                    </span>
                </div>

                {/* Agent Avatar */}
                {listing.agentPhoto && (
                    <div className="absolute bottom-4 right-4">
                        <div className="relative w-10 h-10 rounded-xl bg-white p-0.5 shadow-xl overflow-hidden group-hover:rotate-3 transition-transform">
                            <Image
                                src={listing.agentPhoto}
                                fill
                                className="object-cover rounded-[10px]"
                                alt={listing.agentName}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="space-y-1 mb-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">
                        {listing.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="truncate">{listing.address}, {listing.city}</span>
                    </p>
                </div>

                <div className="flex items-center gap-5 pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{listing.bedrooms}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{listing.bathrooms}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Baths</span>
                    </div>
                    {(listing.squareFootage || listing.squareFeet) && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900">{((listing.squareFootage || listing.squareFeet || 0)).toLocaleString()}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SqFt</span>
                        </div>
                    )}
                    <div className="ml-auto">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
