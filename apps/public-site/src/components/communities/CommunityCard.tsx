import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Community } from '@repo/types';

interface CommunityCardProps {
    community: Community;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
    return (
        <Link href={`/communities/${community.slug}`} className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 block">
            <Image
                src={community.image}
                alt={community.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-8 space-y-4">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                        {community.listingCount} Listings
                    </span>
                    <span className="px-3 py-1 bg-indigo-600/80 backdrop-blur-xl rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                        Avg. ${(community.avgPrice / 1000000).toFixed(1)}M
                    </span>
                </div>

                <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white tracking-tighter leading-none">{community.name}</h3>
                    <p className="text-sm text-slate-200 font-medium line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {community.description}
                    </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {community.amenities.slice(0, 3).map((amenity, i) => (
                            <div key={i} className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-[10px]" title={amenity}>
                                📍
                            </div>
                        ))}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};
