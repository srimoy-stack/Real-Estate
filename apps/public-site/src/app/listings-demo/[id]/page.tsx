                              'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';
import { fetchListingDetail } from '../api';
import { MLSProperty } from '../types';
import { RealtorBadge } from '../components/RealtorBadge';
import { formatMLSPrice, formatMLSNumber } from '../utils';

// ── Analytics Ping Utility ──────────────────────────────────────────────────
const fireAnalyticsPing = async (listingId: string) => {
    try {
        const destId = 'DDF_DEMO_DEST';
        const uuid = `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        fetch(`https://analytics.crea.ca/LogEvents.svc/LogEvents?ListingID=${listingId}&DestinationID=${destId}&EventType=view&UUID=${uuid}`, {
            mode: 'no-cors',
        }).catch(() => { });
    } catch (err) { }
};

export default function ListingDetailPage() {
    const params = useParams();
    const [listing, setListing] = useState<MLSProperty | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    const listingId = params.id as string;

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await fetchListingDetail(listingId);
                setListing(data);
                if (data.ListingId) fireAnalyticsPing(data.ListingId);
            } catch (err: any) {
                setError(err.message || 'Property not found');
            } finally {
                setIsLoading(false);
            }
        };
        if (listingId) load();
    }, [listingId]);

    if (isLoading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Live Property Data...</p>
            </div>
        </div>
    );

    if (error || !listing) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 mb-6">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Unavailable</h1>
                <p className="text-gray-500 mb-8">{error}</p>
                <Link href="/listings-demo" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white">
                    Return to Listings
                </Link>
            </div>
        </div>
    );

    const price = formatMLSPrice(listing.ListPrice, listing.LeaseAmount);
    const media = listing.Media || [];

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between sm:px-6 lg:px-8">
                    <Link href="/listings-demo" className="group flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
                        Back to Search
                    </Link>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property ID</span>
                        <span className="text-xs font-bold text-gray-900">{listing.ListingId}</span>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <section className="mb-12">
                    <div className="relative aspect-[21/9] overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-2xl">
                        {media.length > 0 ? (
                            <SafeImage src={media[activeImage]?.MediaURL} alt={listing.UnparsedAddress} fill className="object-cover" priority />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
                        )}
                    </div>
                    {media.length > 1 && (
                        <div className="mt-6 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {media.slice(0, 20).map((img, idx) => (
                                <button key={idx} onClick={() => setActiveImage(idx)} className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-2xl ${activeImage === idx ? 'ring-4 ring-emerald-500' : 'opacity-70'}`}>
                                    <SafeImage src={img.MediaURL} alt="Gallery" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                    <div className="lg:col-span-2">
                        <div className="mb-10">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{listing.UnparsedAddress}</h1>
                            <p className="text-xl text-gray-500 font-medium">{listing.City}, {listing.StateOrProvince} {listing.PostalCode}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 mb-12">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Beds</span>
                                <span className="text-2xl font-bold text-gray-900">{listing.BedroomsTotal || '--'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Baths</span>
                                <span className="text-2xl font-bold text-gray-900">{listing.BathroomsTotalInteger || '--'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sqft</span>
                                <span suppressHydrationWarning className="text-2xl font-bold text-gray-900">{formatMLSNumber(listing.LivingArea)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Built In</span>
                                <span className="text-2xl font-bold text-gray-900">{listing.YearBuilt || '--'}</span>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Overview</h2>
                            <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.PublicRemarks}</p>
                        </div>

                        {/* Features & Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100 mb-12">
                            <div>
                                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 opacity-60">Listing Financials</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Annual Taxes</span>
                                        <span suppressHydrationWarning className="text-sm font-bold text-gray-900">
                                            {listing.TaxAnnualAmount ? `$${formatMLSNumber(listing.TaxAnnualAmount)}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Tax Year</span>
                                        <span className="text-sm font-bold text-gray-900">{listing.TaxYear || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Condo/HOA Fees</span>
                                        <span suppressHydrationWarning className="text-sm font-bold text-gray-900">
                                            {listing.AssociationFee ? `$${formatMLSNumber(listing.AssociationFee)} / ${listing.AssociationFeeFrequency}` : 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 opacity-60">Lot & Structure</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Lot Area</span>
                                        <span suppressHydrationWarning className="text-sm font-bold text-gray-900">
                                            {listing.LotSizeArea ? `${formatMLSNumber(listing.LotSizeArea)} ${listing.LotSizeUnits}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Stories</span>
                                        <span className="text-sm font-bold text-gray-900">{listing.Stories || '1'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Year Built</span>
                                        <span className="text-sm font-bold text-gray-900">{listing.YearBuilt || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div>
                                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 opacity-60">Property Info</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Subdivision</span>
                                        <span className="text-sm font-bold text-gray-900">{listing.SubdivisionName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Zoning</span>
                                        <span className="text-sm font-bold text-gray-900">{listing.ZoningDescription || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Parking</span>
                                        <span className="text-sm font-bold text-gray-900">{listing.ParkingTotal || '0'} Spaces</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 opacity-60">Views & Exterior</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">View Types</span>
                                        <span className="text-sm font-bold text-gray-900 text-right">{listing.View?.join(', ') || 'Standard'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Attached</span>
                                        <span className="text-sm font-bold text-gray-900">{listing.PropertyAttachedYN ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rooms Breakdown Section */}
                        {listing.Rooms && listing.Rooms.length > 0 && (
                            <div className="mt-12 pt-12 border-t border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Room Breakdown</h3>
                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                                                <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Level</th>
                                                <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Dimensions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {listing.Rooms.map((room, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{room.RoomType}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{room.RoomLevel}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{room.RoomDimensions || '--'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 opacity-60">Listing Compliance</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Listing Agent ID</span>
                                    <span className="text-sm font-bold text-gray-900">{listing.ListAgentKey || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Listing Office ID</span>
                                    <span className="text-sm font-bold text-gray-900">{listing.ListOfficeKey || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="sticky top-24">
                            <div className="rounded-[2.5rem] bg-gray-900 p-10 text-white shadow-2xl border border-white/10">
                                <div className="mb-8">
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 block">List Price</span>
                                    <h2 suppressHydrationWarning className="text-4xl font-black tracking-tighter">{price}</h2>
                                </div>
                                <button className="w-full rounded-2xl bg-emerald-500 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-400 shadow-lg">Request Information</button>
                                <div className="mt-8 pt-8 border-t border-white/10 text-center sm:text-left">
                                    <RealtorBadge listingUrl={listing.ListingURL} moreInformationLink={listing.moreInformationLink} listing={listing} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
