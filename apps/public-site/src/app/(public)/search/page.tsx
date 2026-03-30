import { Suspense } from 'react';
import { Metadata } from 'next';
import { listingService } from '@repo/services';
import { SearchFilters } from '@/components/listings/SearchFilters';
import { SearchGrid } from '@/components/listings/SearchGrid';
import { PropertyType, ListingFilters } from '@repo/types';

export const metadata: Metadata = {
    title: 'Advanced Property Search | Skyline Estates',
    description: 'Find your dream home with our advanced property search filters. Explore luxury listings, condos, and detached homes.',
};

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Parse filters from URL
    const filters: ListingFilters = {
        city: searchParams.city as string,
        propertyType: searchParams.type as PropertyType,
        listingType: (searchParams.listingType as any) || 'Residential',
        minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
        bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined,
        bathrooms: searchParams.bathrooms ? Number(searchParams.bathrooms) : undefined,
        minSqft: searchParams.minSqft ? Number(searchParams.minSqft) : undefined,
        maxSqft: searchParams.maxSqft ? Number(searchParams.maxSqft) : undefined,
        keyword: searchParams.keyword as string,
        sort: (searchParams.sort as any) || 'newest',
        page: 1,
        limit: 12,
    };

    const response = await listingService.search(filters);
    const initialListings = response.success ? response.data : [];
    const totalCount = response.pagination?.total || initialListings.length;

    return (
        <main className="min-h-screen bg-slate-50/50">
            {/* Contextual Filters Header — Sticky & Primary */}
            <div className="pt-20">
                <Suspense fallback={<div className="h-20 w-full bg-white border-b border-slate-100 animate-pulse" />}>
                    <SearchFilters />
                </Suspense>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
                                <span className="w-12 h-px bg-indigo-600"></span>
                                {filters.listingType} Discovery
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
                                Properties For <span className="text-indigo-600">Perspective</span>.
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            <span className="text-slate-900">{totalCount}</span> Results Indexed
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="w-full">
                        <Suspense fallback={
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-white rounded-[32px] border border-slate-100 animate-pulse" />
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
