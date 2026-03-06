import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { listingService } from '@repo/services';
import { PropertyType, ListingStatus, Listing } from '@repo/types';
import { LeadCaptureForm } from '@/components/listings/LeadCaptureForm';

interface ListingDetailProps {
  params: { id: string };
}

// Add structured data (LD+JSON) for SEO
function ListingStructuredData({ listing, baseUrl }: { listing: any, baseUrl: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': listing.title,
    'description': listing.description,
    'url': `${baseUrl}/listings/${listing.slug}`,
    'image': `${baseUrl}${listing.mainImage}`,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': listing.address.street,
      'addressLocality': listing.address.city,
      'addressRegion': listing.address.province,
      'postalCode': listing.address.postalCode,
      'addressCountry': 'CA'
    },
    'offers': {
      '@type': 'Offer',
      'price': listing.price,
      'priceCurrency': listing.currency,
      'availability': 'https://schema.org/InStock',
      'validFrom': listing.createdAt
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

async function getListing(idOrSlug: string, websiteId: string) {
  try {
    const listing = await listingService.getById(idOrSlug);
    if (listing && listing.tenantId === websiteId) {
      return listing;
    }
  } catch (e) { }

  // Mock for demo
  const mockListings: Listing[] = [
    {
      id: '1',
      tenantId: 'website_1',
      slug: 'the-glass-pavilion-mansion',
      externalId: 'MLS-12345',
      title: 'The Glass Pavilion Mansion',
      description: 'Immaculate luxury estate featuring a stunning open-concept design with floor-to-ceiling glass walls that frame panoramic mountain and ocean views. This architectural masterpiece boasts professional-grade appliances, a heated infinity pool, and a private wine cellar that can hold over 1,000 bottles. Every detail has been meticulously crafted to provide the ultimate living experience.',
      price: 12500000,
      currency: 'CAD',
      bedrooms: 6,
      bathrooms: 8,
      squareFeet: 12400,
      lotSize: 2.5,
      yearBuilt: 2022,
      propertyType: PropertyType.DETACHED,
      status: ListingStatus.ACTIVE,
      address: { unit: '', street: '12 Peak View Rd', city: 'Toronto', province: 'ON', postalCode: 'M5V 2N8' },
      mainImage: '/modern_mansion_exterior_1772566757109.png',
      images: [
        '/minimalist_apartment_interior_1772567117240.png',
        '/coastal_villa_daylight_1772567153237.png',
        '/modern_mansion_exterior_1772566757109.png'
      ],
      features: ['Wine Cellar', 'Infinity Pool', 'Home Cinema', 'Chef Kitchen', 'Smart Home System'],
      amenities: ['Private Security', 'Helipad Access', 'Valet Parking'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      tenantId: 'website_1',
      slug: 'skyline-penthouse-suites',
      title: 'Skyline Penthouse Suites',
      description: 'Elite penthouse in the heart of the financial district. Featuring ultra-modern finishes, private elevator access, and a terrace overlooking the entire city skyline. This unit represents the peak of urban luxury living.',
      price: 3800000,
      currency: 'CAD',
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 2800,
      yearBuilt: 2020,
      propertyType: PropertyType.CONDO,
      status: ListingStatus.ACTIVE,
      address: { unit: 'PH 01', street: '101 Bay St', city: 'Toronto', province: 'ON', postalCode: 'M5J 2R8' },
      mainImage: '/minimalist_apartment_interior_1772567117240.png',
      images: [
        '/minimalist_apartment_interior_1772567117240.png',
        '/coastal_villa_daylight_1772567153237.png'
      ],
      features: ['Private Elevator', 'Smart Home', 'Chef Kitchen'],
      amenities: ['24/7 Concierge', 'Gym', 'Rooftop Terrace'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const found = mockListings.find(l => l.id === idOrSlug || l.slug === idOrSlug);
  if (found && (found.tenantId === websiteId || websiteId === 'default')) {
    return found;
  }

  return null;
}

export async function generateMetadata({
  params,
}: ListingDetailProps): Promise<Metadata> {
  const headersList = headers();
  const domain = headersList.get('host') || 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${domain}`;

  const websiteId = headersList.get('x-website-id') || 'default';
  const listing = await getListing(params.id, websiteId);

  if (!listing) return { title: 'Listing Not Found' };

  const canonical = `${baseUrl}/listings/${listing.slug}`;

  return {
    title: `${listing.title} | Real Estate`,
    description: listing.description.substring(0, 160),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: listing.title,
      description: listing.description,
      url: canonical,
      siteName: 'Real Estate Platform',
      images: [{
        url: `${baseUrl}${listing.mainImage}`,
        width: 1200,
        height: 630,
        alt: listing.title,
      }],
      type: 'website',
    }
  };
}

export default async function ListingDetailPage({ params }: ListingDetailProps) {
  const headersList = headers();
  const domain = headersList.get('host') || 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${domain}`;

  const websiteId = headersList.get('x-website-id') || 'default';
  const listing = await getListing(params.id, websiteId);

  if (!listing) return notFound();

  const monthlyPayment = Math.round(listing.price * 0.0044);
  const addedDate = new Date(listing.createdAt);
  const hoursAgo = Math.round((Date.now() - addedDate.getTime()) / (1000 * 60 * 60));

  return (
    <div className="min-h-screen bg-white">
      <ListingStructuredData listing={listing} baseUrl={baseUrl} />

      {/* Navigation Bar Spacing */}
      <div className="h-20" />

      {/* Breadcrumbs — Zolo-style */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">← Back to Search</Link>
          <span className="text-gray-300">›</span>
          <Link href="/listings" className="hover:text-emerald-600 transition-colors">
            {listing.address.province}
          </Link>
          <span className="text-gray-300">›</span>
          <Link href="/listings" className="hover:text-emerald-600 transition-colors">
            {listing.address.city}
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-900 font-medium">{listing.address.street}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Image Gallery — Zolo-style */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-6 rounded-xl overflow-hidden">
          <div className="md:col-span-7 relative aspect-[16/11] overflow-hidden group cursor-pointer">
            <Image
              src={listing.mainImage}
              alt={listing.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-2">
            {listing.images.slice(0, 3).map((img: string, i: number) => (
              <div key={i} className="relative overflow-hidden group cursor-pointer aspect-[4/3]">
                <Image
                  src={img}
                  alt={`${listing.title} gallery ${i}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
            <div className="relative overflow-hidden bg-gray-800 flex items-center justify-center cursor-pointer group aspect-[4/3]">
              {listing.images[0] && (
                <Image
                  src={listing.images[0]}
                  alt="View more"
                  fill
                  className="absolute inset-0 object-cover opacity-30 group-hover:scale-110 transition-transform duration-500"
                />
              )}
              <div className="relative z-10 text-center text-white">
                <svg className="w-8 h-8 mx-auto mb-1.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold">See all {listing.images.length + 1} Photos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-8">

            {/* Title + Price Header — Zolo-style */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {listing.address.unit ? `${listing.address.unit} - ` : ''}{listing.address.street}
                </h1>
                <p className="text-gray-500">
                  {listing.address.city},{' '}
                  <span className="text-emerald-600 hover:underline cursor-pointer">{listing.address.postalCode}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  View on Map
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 115.367-2.684 3 3 0 01-5.367 2.684zm0 9.316a3 3 0 115.368 2.684 3 3 0 01-5.368-2.684z" /></svg>
                  Share
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Save
                </button>
              </div>
            </div>

            {/* Price & Key Specs — Zolo-style */}
            <div className="border-b border-gray-100 pb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price)}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    est. <span className="font-medium">${monthlyPayment.toLocaleString()}</span> /mo
                  </span>
                  <span className="ml-3 text-sm text-emerald-600 font-medium hover:underline cursor-pointer">
                    Get pre-qualified
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-semibold">{listing.bedrooms} bed</span>
                  <span className="font-semibold">{listing.bathrooms} bath</span>
                  {listing.squareFeet && <span className="font-semibold">{listing.squareFeet.toLocaleString()} sqft</span>}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-gray-900">For Sale</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">Added {hoursAgo} hours ago</span>
              </div>
            </div>

            {/* Property Details Table — Zolo-style */}
            <div className="border-b border-gray-100 pb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                {[
                  { label: 'Type', value: listing.propertyType.replace('_', ' ') },
                  { label: 'Added', value: addedDate.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) },
                  { label: 'Style', value: 'Modern' },
                  { label: 'Updated', value: new Date(listing.updatedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) },
                  { label: 'Size', value: listing.squareFeet ? `${listing.squareFeet.toLocaleString()} sqft` : 'No Data' },
                  { label: 'Last Checked', value: 'Just now' },
                  { label: 'Lot Size', value: listing.lotSize ? `${listing.lotSize} acres` : 'No Data' },
                  { label: 'MLS®#', value: listing.externalId || 'N/A' },
                  { label: 'Year Built', value: listing.yearBuilt || 'N/A' },
                  { label: 'Listed By', value: 'EXP REALTY' },
                  { label: 'Taxes', value: 'No Data' },
                  { label: 'Walk Score', value: '7' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-sm font-semibold text-gray-900 min-w-[80px]">{item.label}:</span>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-100 pb-8">
              <p className="text-gray-700 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Features & Amenities — Zolo-style */}
            <div className="border-b border-gray-100 pb-8">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                See More Facts and Features
              </button>
            </div>

            {/* Affordability Section — Zolo-style */}
            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Affordability</h2>

              <p className="text-gray-600 mb-4">
                You can afford a home up to{' '}
                <span className="text-2xl font-bold text-gray-900">$637,531</span>
                {' '}or{' '}
                <span className="text-2xl font-bold text-gray-900">$3,380</span>
                <span className="text-gray-500 text-sm"> /mo</span>
              </p>

              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {listing.address.street} at <span className="font-semibold">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price)}</span> is <span className="font-semibold">${monthlyPayment.toLocaleString()}</span> /mo
                </p>
              </div>

              {/* Affordability Score Bar — Zolo-style gradient */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Afford Score™ <span className="text-lg font-bold text-gray-900">36</span></span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full" />
                  {/* Score indicator */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: '36%' }}>
                    <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-700 shadow-md" />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
                  <span>Aggressive</span>
                  <span>Stretching</span>
                  <span>Affordable</span>
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Annual Income', value: '$100,000', prefix: '$' },
                  { label: 'Interest Rate', value: '4.84', suffix: '%' },
                  { label: 'Monthly Debts', value: '$0', prefix: '$' },
                  { label: 'Mortgage free in', value: '25 Years' },
                  { label: 'Down Payment', value: '$50,000', prefix: '$' },
                  { label: 'Property Price', value: new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 }).format(listing.price), prefix: '$' },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="text-xs text-gray-500 mb-1 block">{field.label}</label>
                    <div className="relative">
                      {field.prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{field.prefix}</span>
                      )}
                      <input
                        type="text"
                        defaultValue={field.value}
                        className={`w-full border border-gray-200 rounded-lg py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${field.prefix ? 'pl-7 pr-3' : 'px-3'}`}
                      />
                      {field.suffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{field.suffix}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Location</h3>
              <div className="relative h-[350px] w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-3 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="relative h-6 w-6 bg-emerald-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white shadow-lg rounded-lg border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Neighborhood</p>
                    <p className="text-sm font-medium text-gray-900">{listing.address.city}, {listing.address.province}</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.address.street} ${listing.address.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  >
                    Get Directions
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* DDF Disclaimer */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The listing data above is provided under copyright by the Canadian Real Estate Association. The listing data is deemed reliable but is not guaranteed accurate by the Canadian Real Estate Association nor by this platform. The information provided on this page, including the Affordability, Afford Score™, and Affordability Coach, are provided for informational purposes only and should not be used or relied upon as professional financial advice.
              </p>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <Suspense fallback={<div className="h-[400px] bg-gray-100 animate-pulse rounded-xl" />}>
                <LeadCaptureForm
                  listingId={listing.id}
                  listingTitle={`${listing.address.street}, ${listing.address.city}`}
                  tenantId={websiteId}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
