'use client';

import React, { useEffect, useState } from 'react';
import { listingQueryApi, ListingCardField } from '@repo/services';
import { InternalListingStatus } from '@repo/types';

interface ListingShortcodeProps {
    attributes: Record<string, string>;
}

export const ListingShortcode: React.FC<ListingShortcodeProps> = ({ attributes }) => {
    const [data, setData] = useState<{ listings: ListingCardField[], totalCount: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);

                // Parse raw string attributes into proper types for listingQueryApi
                const queryParams: any = {};

                if (attributes.mls_id) queryParams.mlsId = attributes.mls_id;
                if (attributes.ids) queryParams.ids = attributes.ids.split(',').map(id => id.trim());
                if (attributes.city) queryParams.city = attributes.city;
                if (attributes.property_type) queryParams.propertyType = attributes.property_type;
                if (attributes.status) {
                    const rawStatus = attributes.status.toLowerCase();
                    if (rawStatus.includes('sale')) queryParams.status = InternalListingStatus.FOR_SALE;
                    else if (rawStatus.includes('sold')) queryParams.status = InternalListingStatus.SOLD;
                    else if (rawStatus.includes('pending')) queryParams.status = InternalListingStatus.PENDING;
                    else queryParams.status = attributes.status as InternalListingStatus;
                }
                if (attributes.min_price) queryParams.minPrice = parseInt(attributes.min_price, 10);
                if (attributes.max_price) queryParams.maxPrice = parseInt(attributes.max_price, 10);
                if (attributes.bedrooms) queryParams.bedrooms = parseInt(attributes.bedrooms, 10);
                if (attributes.bathrooms) queryParams.bathrooms = parseInt(attributes.bathrooms, 10);
                if (attributes.featured === 'true') queryParams.featured = true;
                if (attributes.limit) queryParams.limit = parseInt(attributes.limit, 10);
                if (attributes.sort) queryParams.sort = attributes.sort;

                // Fetch from the shared service
                const response = await listingQueryApi.searchListings(queryParams);
                setData(response);
            } catch (e) {
                console.error('Failed to fetch shortcode listings:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [attributes]);

    if (loading) {
        return (
            <div className="py-12 flex justify-center w-full">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data || data.listings.length === 0) {
        return (
            <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-2xl italic">
                No properties found matching these criteria.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {data.listings.map((listing) => {
                // Map status to a color
                const getStatusColor = (status: InternalListingStatus) => {
                    switch (status) {
                        case InternalListingStatus.FOR_SALE: return 'bg-emerald-500 text-white';
                        case InternalListingStatus.SOLD: return 'bg-rose-500 text-white';
                        case InternalListingStatus.PENDING: return 'bg-amber-500 text-white';
                        default: return 'bg-slate-500 text-white';
                    }
                };

                const statusStyle = getStatusColor(listing.status);

                return (
                    <a key={listing.id} href={`/listings/${listing.id}`} className="group block rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all bg-white relative">
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-10">
                                <span className={`${statusStyle} px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg`}>
                                    {listing.status}
                                </span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium bg-slate-100">
                                {listing.images && listing.images.length > 0 ? (
                                    <img src={listing.images[0]} alt={listing.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : "Property Image"}
                            </div>
                            {listing.isFeatured && (
                                <div className="absolute top-4 right-4 z-10 bg-amber-400 text-amber-950 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Featured
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="text-2xl font-black tracking-tight text-indigo-600 mb-2">
                                ${listing.price.toLocaleString()}
                            </div>
                            <h3 className="text-slate-900 font-bold mb-1 truncate group-hover:text-indigo-600 transition-colors">{listing.address}</h3>
                            <p className="text-slate-500 text-xs font-medium mb-4">{listing.city}, {listing.province}</p>

                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-4 border-t border-slate-50">
                                {listing.bedrooms > 0 && <span className="flex items-center gap-1.5">{listing.bedrooms} Beds</span>}
                                {listing.bathrooms > 0 && <span className="flex items-center gap-1.5">{listing.bathrooms} Baths</span>}
                                {listing.squareFootage > 0 && <span className="flex items-center gap-1.5">{listing.squareFootage.toLocaleString()} SqFt</span>}
                            </div>
                        </div>
                    </a>
                );
            })}
        </div>
    );
};
