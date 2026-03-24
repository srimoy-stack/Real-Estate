'use client';

import React from 'react';

export function ListingCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 animate-pulse">
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="h-full w-full flex items-center justify-center">
                    <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            {/* Content placeholder */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-28 rounded-lg bg-gray-200" />
                    <div className="h-5 w-16 rounded-md bg-gray-100" />
                </div>
                <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
                <div className="h-3 w-1/2 rounded-lg bg-gray-100" />
                <div className="h-px bg-gray-100" />
                <div className="flex gap-4">
                    <div className="h-4 w-14 rounded-lg bg-gray-100" />
                    <div className="h-4 w-14 rounded-lg bg-gray-100" />
                    <div className="h-4 w-20 rounded-lg bg-gray-100" />
                </div>
            </div>
        </div>
    );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ListingCardSkeleton key={i} />
            ))}
        </div>
    );
}
