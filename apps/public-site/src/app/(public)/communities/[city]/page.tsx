import { notFound } from 'next/navigation';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Listing } from '@repo/types';
import { communitiesService, listingService } from '@repo/services';
import { ListingCard } from '@/components/listings/ListingCard';

interface CityPageProps {
    params: { city: string };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
    const community = await communitiesService.getCommunityBySlug(params.city);
    if (!community) return { title: 'City Not Found' };

    return {
        title: `Homes for Sale in ${community.name} | Real Estate Listings`,
        description: `Browse the latest real estate listings in ${community.name}. Find condos, detached houses, and townhomes for sale in ${community.name}.`,
    };
}

export default async function CityDetailPage({ params }: CityPageProps) {
    const community = await communitiesService.getCommunityBySlug(params.city);
    if (!community) return notFound();

    // Fetch listings for this city
    const { data: listings } = await listingService.search({ city: community.name, limit: 12 });

    return (
        <div className="bg-white min-h-screen">
            {/* City Banner */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <img
                    src={community.image}
                    alt={community.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/60 transition-opacity duration-700" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-8">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        <Link href="/communities" className="hover:text-white transition-colors">Communities</Link>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        <span className="text-white">{community.name}</span>
                    </nav>

                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none italic uppercase">
                        {community.name}
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-emerald-500" />
                        <span className="text-emerald-400 font-black uppercase tracking-widest text-xs">{community.listingCount} Available Listings</span>
                        <div className="h-px w-12 bg-emerald-500" />
                    </div>
                </div>
            </section>

            {/* City Description */}
            <section className="py-24 bg-slate-50 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Living in <span className="text-indigo-600">{community.name}</span></h2>
                    <p className="text-slate-500 text-xl font-medium leading-relaxed italic">
                        "{community.description}"
                    </p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        {community.amenities.map((amenity: string, i: number) => (
                            <span key={i} className="px-5 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Listings Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Latest <span className="text-indigo-600">Listings</span></h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Newly added properties in {community.name}</p>
                        </div>
                        <Link href={`/ search ? city = ${community.name} `} className="h-12 px-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                            Explore All Properties
                        </Link>
                    </div>

                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {listings.map((listing: Listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center space-y-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <div className="text-4xl">🏝️</div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase">No Listings Found</h3>
                                <p className="text-slate-400 font-medium">We couldn't find any active listings in {community.name} at this time.</p>
                            </div>
                            <Link href="/search" className="inline-block text-indigo-600 font-black uppercase text-xs tracking-widest border-b-2 border-indigo-600 pb-1">Browse Other Areas</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center lg:px-24">
                        <div className="space-y-2">
                            <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{(community.avgPrice / 1000000).toFixed(1)}M</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Price</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{community.listingCount}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Listings</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl font-black text-slate-900 tracking-tighter italic">24h</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response Rate</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
