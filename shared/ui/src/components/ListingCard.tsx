import React from 'react';
import { Listing } from '@repo/types';

export interface ListingCardProps {
    listing: Listing & { isFeatured?: boolean };
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    const formattedPrice = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0
    }).format(listing.price);

    const getStatusStyle = (status: string) => {
        const lower = status.toLowerCase();
        if (lower.includes('sale') || lower.includes('active')) return 'bg-emerald-500 text-white';
        if (lower.includes('sold')) return 'bg-rose-500 text-white';
        if (lower.includes('pending')) return 'bg-amber-500 text-white';
        return 'bg-slate-500 text-white';
    };

    const statusStyle = getStatusStyle(listing.status);

    return (
        <div className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
            {/* Image & Badges */}
            <div className="relative aspect-[4/3] overflow-hidden shrink-0 bg-slate-100">
                <img
                    src={listing.mainImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'}
                    alt={listing.address}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />

                {/* Badges Overlay */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <span className={`${statusStyle} px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl`}>
                        {listing.status}
                    </span>
                    <span className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20">
                        {listing.propertyType}
                    </span>
                </div>

                {listing.isFeatured && (
                    <div className="absolute top-6 right-6 z-10">
                        <span className="bg-amber-400 text-amber-950 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20">
                            Featured
                        </span>
                    </div>
                )}

                {/* Listing Agent / MLS Indicator */}
                <div className="absolute bottom-6 left-6 z-10">
                    <div className="bg-slate-900/40 backdrop-blur-sm px-4 py-2 rounded-xl text-[9px] font-bold text-white uppercase tracking-widest border border-white/10">
                        MLS® {listing.mlsNumber}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-3xl font-black text-indigo-600 tracking-tighter mb-1">{formattedPrice}</p>
                        <p className="text-slate-900 font-bold text-sm tracking-tight line-clamp-1">{listing.address}</p>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{listing.city}, {listing.province}</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 py-5 border-y border-slate-50 mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Beds</span>
                        <span className="text-sm font-bold text-slate-900">{listing.bedrooms}</span>
                    </div>
                    <div className="flex flex-col border-x border-slate-50 px-4">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Baths</span>
                        <span className="text-sm font-bold text-slate-900">{listing.bathrooms}</span>
                    </div>
                    <div className="flex flex-col pl-4">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Area</span>
                        <span className="text-sm font-bold text-slate-900">{listing.squareFootage?.toLocaleString()} <span className="text-[10px]">SF</span></span>
                    </div>
                </div>

                {/* Short Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
                    {listing.description || 'Stunning professional showcase listing with premium features and architectural details throughout.'}
                </p>

                {/* Action */}
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600 italic">
                            {listing.agentName[0]}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listed by {listing.agentName.split(' ')[0]}</span>
                    </div>
                    <a
                        href={`/listing/${listing.mlsNumber}`}
                        className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
                    >
                        View Profile
                    </a>
                </div>
            </div>
        </div>
    );
};
