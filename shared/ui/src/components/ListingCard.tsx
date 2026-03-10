import React from 'react';
import Link from 'next/link';

export interface ListingCardProps {
    listing: {
        id: string;
        price: number;
        address: string;
        city: string;
        bedrooms: number;
        bathrooms: number;
        propertyType: string;
        status: string;
        description?: string;
        images?: string[];
        isFeatured?: boolean;
    };
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    const formattedPrice = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0
    }).format(listing.price);

    // Dynamic status badge styling
    const getStatusStyle = (status: string) => {
        const lower = status.toLowerCase();
        if (lower.includes('sale') || lower.includes('active')) {
            return 'bg-emerald-500 text-white';
        }
        if (lower.includes('sold')) {
            return 'bg-rose-500 text-white';
        }
        if (lower.includes('pending')) {
            return 'bg-amber-500 text-white';
        }
        return 'bg-slate-500 text-white';
    };

    const statusStyle = getStatusStyle(listing.status);
    const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : null;

    // Truncate description safely
    const shortDescription = listing.description
        ? listing.description.length > 120
            ? `${listing.description.substring(0, 120)}...`
            : listing.description
        : 'A beautiful property waiting for you to call it home. Click for more details and to arrange a viewing.';

    return (
        <div className="group flex flex-col h-full bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            {/* Image Section */}
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={listing.address}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                        Property Image
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <span className={`${statusStyle} px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg`}>
                        {listing.status}
                    </span>
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg w-max">
                        {listing.propertyType}
                    </span>
                </div>

                {listing.isFeatured && (
                    <div className="absolute top-4 right-4 z-10">
                        <span className="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                            Featured
                        </span>
                    </div>
                )}

                {/* Price Tag Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-2xl font-black text-indigo-600 tracking-tight">
                            {formattedPrice}
                        </p>
                        <p className="text-slate-900 font-bold truncate mt-1 text-sm">
                            {listing.address}
                        </p>
                        <p className="text-slate-500 text-xs font-medium">
                            {listing.city}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                {/* Metrics */}
                <div className="flex items-center gap-6 text-sm font-bold text-slate-600 mb-5">
                    {listing.bedrooms > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-indigo-400">🛏</span>
                            <span>{listing.bedrooms} Beds</span>
                        </div>
                    )}
                    {listing.bathrooms > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-indigo-400">🚿</span>
                            <span>{listing.bathrooms} Baths</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                    {shortDescription}
                </p>

                {/* Call To Action */}
                <Link
                    href={`/listings/${listing.id}`}
                    className="mt-auto block w-full text-center bg-slate-50 hover:bg-indigo-600 text-slate-900 hover:text-white font-bold py-3.5 px-6 rounded-xl transition-colors duration-300"
                >
                    View Property Details
                </Link>
            </div>
        </div>
    );
};
