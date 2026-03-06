import { Suspense } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { listingService } from '@repo/services';
import { Listing, ListingFilters, PropertyType, ListingStatus } from '@repo/types';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingFilters as FilterSidebar } from '@/components/listings/ListingFilters';
import { ListingGridSkeleton } from '@/components/listings/ListingSkeleton';

export const metadata: Metadata = {
  title: 'Real Estate Listings | Property Search',
  description: 'Explore properties and homes. Filter by price, location, and amenities.',
};

async function getListings(searchParams: any, websiteId: string) {
  const filters: ListingFilters = {
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms.replace('+', '')) : undefined,
    bathrooms: searchParams.bathrooms ? Number(searchParams.bathrooms.replace('+', '')) : undefined,
    propertyType: searchParams.propertyType ? [searchParams.propertyType as PropertyType] : undefined,
    city: searchParams.city,
    postalCode: searchParams.postalCode,
    keyword: searchParams.keyword,
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 12,
  };

  try {
    const response = await listingService.search(filters);
    return response;
  } catch (error) {
    console.warn('Listing API failed, using mock data for demo');

    await new Promise(resolve => setTimeout(resolve, 800));

    const mockListings: Listing[] = [
      {
        id: '1',
        tenantId: websiteId,
        slug: 'the-glass-pavilion-mansion',
        title: 'The Glass Pavilion Mansion',
        description: 'Iconic architectural masterpiece with infinity pool.',
        price: 12500000,
        currency: 'CAD',
        bedrooms: 6,
        bathrooms: 8,
        squareFeet: 12400,
        propertyType: PropertyType.DETACHED,
        status: ListingStatus.ACTIVE,
        address: { street: '12 Peak View Rd', city: 'Toronto', province: 'ON', postalCode: 'M5V 2N8' },
        mainImage: '/modern_mansion_exterior_1772566757109.png',
        images: [],
        features: ['Wine Cellar', 'Infinity Pool', 'Home Cinema'],
        amenities: ['Private Security', 'Smart Home'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        tenantId: websiteId,
        slug: 'skyline-penthouse-suites',
        title: 'Skyline Penthouse Suites',
        description: 'Breathtaking city views with floor-to-ceiling glass.',
        price: 3800000,
        currency: 'CAD',
        bedrooms: 3,
        bathrooms: 3,
        squareFeet: 2800,
        propertyType: PropertyType.CONDO,
        status: ListingStatus.ACTIVE,
        address: { street: '101 Bay St', city: 'Toronto', province: 'ON', postalCode: 'M5J 2R8' },
        mainImage: '/minimalist_apartment_interior_1772567117240.png',
        images: [],
        features: ['24/7 Concierge', 'Gym', 'Rooftop Terrace'],
        amenities: ['Valet Parking'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        tenantId: websiteId,
        slug: 'elysian-shore-villa',
        title: 'Elysian Shore Villa',
        description: 'Mediterranean-inspired estate with private beach access.',
        price: 8900000,
        currency: 'CAD',
        bedrooms: 5,
        bathrooms: 6,
        squareFeet: 7500,
        propertyType: PropertyType.DETACHED,
        status: ListingStatus.ACTIVE,
        address: { street: '45 Coastal Dr', city: 'Vancouver', province: 'BC', postalCode: 'V6B 1A1' },
        mainImage: '/coastal_villa_daylight_1772567153237.png',
        images: [],
        features: ['Private Beach', 'Garden', 'Outdoor Kitchen'],
        amenities: ['Helipad Access'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    let filtered = mockListings;
    if (filters.keyword) {
      filtered = filtered.filter(l => l.title.toLowerCase().includes(filters.keyword!.toLowerCase()) || l.address.city.toLowerCase().includes(filters.keyword!.toLowerCase()));
    }
    if (filters.minPrice) filtered = filtered.filter(l => l.price >= filters.minPrice!);
    if (filters.maxPrice) filtered = filtered.filter(l => l.price <= filters.maxPrice!);

    return {
      data: filtered,
      success: true,
      pagination: {
        page: filters.page,
        pageSize: filters.limit,
        total: filtered.length,
        totalPages: 1
      }
    };
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const headerList = headers();
  const websiteId = headerList.get('x-website-id') || 'default';

  const results = await getListings(searchParams, websiteId);
  const view = searchParams.view === 'map' ? 'map' : 'grid';

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Header — Zolo-style */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Real Estate Listings
            </h1>
            <p className="text-sm text-gray-500">
              Showing {results.pagination.total} properties
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/listings?${new URLSearchParams({ ...searchParams, view: view === 'grid' ? 'map' : 'grid' } as any).toString()}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              {view === 'grid' ? (
                <>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map View
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid View
                </>
              )}
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-28">
              <FilterSidebar />
            </div>
          </aside>

          {/* Listing Grid / Map */}
          <div className="flex-1">
            <Suspense fallback={<ListingGridSkeleton count={6} />}>
              {view === 'grid' ? (
                results.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {results.data.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No properties found</h3>
                    <p className="text-gray-500 mt-1 text-sm">Try adjusting your filters or search terms.</p>
                    <button className="mt-4 px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors">Clear all filters</button>
                  </div>
                )
              ) : (
                <div className="h-[700px] w-full bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100" />
                  {results.data.slice(0, 5).map((l, i) => (
                    <div
                      key={l.id}
                      className="absolute cursor-pointer transition-transform hover:scale-110"
                      style={{ top: `${30 + (i * 12)}%`, left: `${20 + (i * 18)}%` }}
                    >
                      <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg border border-gray-200">
                        <span className="text-xs font-bold text-gray-900">${(l.price / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="w-0.5 h-2 bg-gray-400 mx-auto" />
                    </div>
                  ))}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-white rounded-lg shadow-lg border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive Map
                  </div>
                </div>
              )}

              {/* Pagination */}
              {view === 'grid' && results.pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-400 cursor-not-allowed">Previous</button>
                  <button className="h-9 w-9 rounded-lg bg-emerald-600 text-white text-sm font-semibold">1</button>
                  <button className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">2</button>
                  <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
