import { Suspense } from 'react';
import { Metadata } from 'next';
import { listingService } from '@repo/services';
import { SearchFilters } from '@/components/listings/SearchFilters';
import { SearchGrid } from '@/components/listings/SearchGrid';
import { PropertyType, ListingStatus, ListingFilters } from '@repo/types';

export const metadata: Metadata = {
    title: 'Advanced Property Search | Skyline Estates',
    description: 'Find your dream home with our advanced property search filters. Explore luxury listings, condos, and detached homes.',
};

import { SearchBar } from '@/components/sections/SearchBar';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Parse filters from URL
    const filters: ListingFilters = {
        city: searchParams.city as string,
        propertyType: searchParams.type as PropertyType,
        status: searchParams.status as ListingStatus,
        minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
        bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined,
        bathrooms: searchParams.bathrooms ? Number(searchParams.bathrooms) : undefined,
        keyword: searchParams.keyword as string,
        sort: (searchParams.sort as any) || 'newest',
        page: 1,
        limit: 12,
    };

    const response = await listingService.search(filters);
    const initialListings = response.success ? response.data : [];

    return (
        <main className="min-h-screen bg-white pt-32 pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Search Header */}
                <div className="mb-16 space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
                            <span className="w-12 h-px bg-indigo-600"></span>
                            Advanced Search
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic mb-4">
                                    Curate Your <span className="text-indigo-600">Perspective</span>.
                                </h1>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    {initialListings.length > 0
                                        ? `Revealing ${initialListings.length} premium opportunities matched for you`
                                        : 'Refine your search to discover exclusive listings'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[40px] border border-slate-100">
                        <SearchBar />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-96 flex-shrink-0">
                        <div className="sticky top-32">
                            <Suspense fallback={<div className="h-[800px] w-full bg-slate-50 rounded-[40px] animate-pulse" />}>
                                <SearchFilters />
                            </Suspense>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1 min-w-0">
                        <Suspense fallback={
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[32px] animate-pulse" />
                                ))}
                            </div>
                        }>
                            <SearchGrid initialListings={initialListings} filters={filters} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    );
}
