'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@repo/types';

interface ListingCardProps {
    listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
    return (
        <Link
            href={`/listings/${listing.slug || listing.id}`}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={listing.mainImage}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${listing.status === 'ACTIVE'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                        }`}>
                        {listing.status === 'ACTIVE' ? 'For Sale' : listing.status}
                    </span>
                </div>

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
                        {listing.address.city}, {listing.address.province}
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
                <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    <span className="font-medium">{listing.bedrooms} bed</span>
                    <span className="font-medium">{listing.bathrooms} bath</span>
                    {listing.squareFeet && (
                        <span className="font-medium">{listing.squareFeet.toLocaleString()} sqft</span>
                    )}
                </div>
            </div>
        </Link>
    );
};
