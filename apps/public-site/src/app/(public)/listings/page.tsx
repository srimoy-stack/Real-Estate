import { Suspense } from 'react';
import { Metadata } from 'next';
import { searchListingsDirect } from '@/lib/server-listing-service';
import { InternalListingStatus } from '@repo/types';
import { UnifiedPropertyCard } from '@/components/ui';
import { ListingFilters as FilterSidebar } from '@/components/listings/ListingFilters';
import { SaveSearchButton } from '@/components/listings/SaveSearchButton';
import { ListingGridSkeleton } from '@/components/listings/ListingSkeleton';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(
  () => import('@/components/listings/ListingsMap').then((mod) => mod.ListingsMap),
  { ssr: false, loading: () => <div className="h-[750px] w-full bg-slate-100 rounded-[40px] animate-pulse"></div> }
);

export const metadata: Metadata = {
  title: 'Search Real Estate Listings | SquareFT',
  description: 'Find your perfect home with our advanced property search. Filter by location, price, property type, and more.',
};

/**
 * Enhanced Listings Search Page
 * Integrates with listingQueryApi for rich mock data and real filtering logic
 */
export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. Prepare Query Parameters
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const page = Number(pageParam) || 1;
  const limit = 12;
  const viewParam = Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view;
  const view = viewParam === 'map' ? 'map' : 'grid';

  const queryParams = {
    city: (Array.isArray(searchParams.city) ? searchParams.city[0] : searchParams.city) as string,
    minPrice: searchParams.minPrice ? Number(Array.isArray(searchParams.minPrice) ? (searchParams.minPrice as string[])[0] : searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(Array.isArray(searchParams.maxPrice) ? (searchParams.maxPrice as string[])[0] : searchParams.maxPrice) : undefined,
    bedrooms: searchParams.bedrooms ? ((Array.isArray(searchParams.bedrooms) ? searchParams.bedrooms[0] : searchParams.bedrooms) === '5+' ? 5 : Number(Array.isArray(searchParams.bedrooms) ? searchParams.bedrooms[0] : searchParams.bedrooms)) : undefined,
    bathrooms: searchParams.bathrooms ? ((Array.isArray(searchParams.bathrooms) ? searchParams.bathrooms[0] : searchParams.bathrooms) === '4+' ? 4 : Number(Array.isArray(searchParams.bathrooms) ? searchParams.bathrooms[0] : searchParams.bathrooms)) : undefined,
    propertyType: searchParams.propertyType ? (Array.isArray(searchParams.propertyType) ? searchParams.propertyType : [searchParams.propertyType as any]) : undefined,
    status: (Array.isArray(searchParams.status) ? (searchParams.status as string[])[0] : (searchParams.status as string)) as InternalListingStatus,
    keyword: (Array.isArray(searchParams.keyword) ? (searchParams.keyword as string[])[0] : (searchParams.keyword as string)) as string,
    sort: ((Array.isArray(searchParams.sort) ? (searchParams.sort as string[])[0] : (searchParams.sort as string)) as any) || 'latest',
    page,
    limit,
  };

  // 2. Fetch Data
  const { listings, totalCount } = await searchListingsDirect(queryParams);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <main className="min-h-screen bg-slate-50/30 pt-24 pb-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

        {/* Search Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                <span className="w-8 h-px bg-red-600"></span>
                Property Search
              </div>
              <div className="h-5 px-2 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest border border-emerald-100 italic">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Live MLS® Sync
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">
              Discover Your <span className="text-red-600">Domain</span>.
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {totalCount} Properties found in {searchParams.city || 'Canada'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown Placeholder */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-xs font-black uppercase tracking-widest text-slate-600">
              <span>Sort: {queryParams.sort === 'latest' ? 'Newest' : queryParams.sort === 'price_asc' ? 'Price Low' : 'Price High'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>

            {/* View Toggle */}
            <div className="bg-slate-200/50 p-1 rounded-xl flex">
              <Link
                href={`/listings?${new URLSearchParams({ ...searchParams as any, view: 'grid' }).toString()}`}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Grid
              </Link>
              <Link
                href={`/listings?${new URLSearchParams({ ...searchParams as any, view: 'map' }).toString()}`}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'map' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Map
              </Link>
            </div>
          </div>
        </div>

        {/* Active Filters & Search Info */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {Object.entries(queryParams).map(([key, value]) => {
            if (!value || ['page', 'limit', 'sort', 'status'].includes(key)) return null;
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            return (
              <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50">
                <span className="text-slate-400">{key}:</span>
                <span>{displayValue}</span>
                <Link
                  href={`/listings?${new URLSearchParams(
                    Object.fromEntries(
                      Object.entries(searchParams).filter(([k]) => k !== (key === 'propertyType' ? 'propertyType' : key))
                    ) as any
                  ).toString()}`}
                  className="ml-1 hover:text-amber-600"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </Link>
              </div>
            );
          })}
          {Object.keys(searchParams).filter(k => !['page', 'limit', 'sort', 'view'].includes(k)).length > 0 && (
            <Link
              href="/listings"
              className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 ml-2"
            >
              Clear All
            </Link>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-28">
              <FilterSidebar />

              <SaveSearchButton filters={queryParams as any} />
            </div>
          </aside>

          {/* Listing Content */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<ListingGridSkeleton count={6} />}>
              {view === 'grid' ? (
                listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map((listing) => (
                      <UnifiedPropertyCard key={listing.id} listing={listing as any} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 italic mb-2">No matching homes</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Try adjusting your filters for more results</p>
                    <Link href="/listings" className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all">Clear All Filters</Link>
                  </div>
                )
              ) : (
                <MapWithNoSSR initialListings={listings as any} />
              )}

              {/* Pagination */}
              {view === 'grid' && totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-3">
                  {page > 1 ? (
                    <Link
                      href={{
                        pathname: '/listings',
                        query: { ...searchParams, page: (page - 1).toString() }
                      }}
                      className="h-12 px-6 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all flex items-center"
                    >
                      Prev
                    </Link>
                  ) : (
                    <span className="h-12 px-6 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center cursor-not-allowed">
                      Prev
                    </span>
                  )}

                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, page - 2);
                    let end = Math.min(totalPages, start + maxVisible - 1);
                    
                    if (end - start + 1 < maxVisible) {
                      start = Math.max(1, end - maxVisible + 1);
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <Link
                          key={i}
                          href={{
                            pathname: '/listings',
                            query: { ...searchParams, page: i.toString() }
                          }}
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all ${page === i ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'}`}
                        >
                          {i}
                        </Link>
                      );
                    }
                    return pages;
                  })()}

                  {page < totalPages ? (
                    <Link
                      href={{
                        pathname: '/listings',
                        query: { ...searchParams, page: (page + 1).toString() }
                      }}
                      className="h-12 px-6 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all flex items-center"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="h-12 px-6 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
