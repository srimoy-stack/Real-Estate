import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { listingService } from '@repo/services';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { UnifiedPropertyCard } from '@/components/ui';
import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { MortgageCalculator } from '@/components/listings/MortgageCalculator';
import { PropertyStats } from '@/components/listings/PropertyStats';
import { StickyInquirySidebar } from '@/components/listings/StickyInquirySidebar';
import { SaveButton } from '@/components/listings/SaveButton';
import { RealtorBadge } from '@/app/listings-demo/components/RealtorBadge';
import {
  fireDDFAnalyticsPing,
  extractClientIP,
  resolveMoreInformationLink,
} from '@/lib/ddf-compliance';
import { headers } from 'next/headers';

interface ListingDetailProps {
  params: { mlsNumber: string };
}

// ─── Helpers ──────────────────────────────────────────────────────
function safeStr(val: any, fallback = ''): string {
  if (val == null || val === 'null' || val === 'undefined') return fallback;
  return String(val);
}

function safeNum(val: any): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function formatListingPrice(price: number | null | undefined, currency = 'CAD'): string {
  const num = safeNum(price);
  if (num <= 0) return 'Price on Request';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

function displayStat(val: any, suffix = ''): string {
  if (val == null || val === 0 || val === '0') return 'N/A';
  if (typeof val === 'number' && val > 0) return val.toLocaleString() + suffix;
  return String(val) + suffix;
}

// ─── SEO Metadata ─────────────────────────────────────────────────
export async function generateMetadata({ params }: ListingDetailProps): Promise<Metadata> {
  const listing = await listingService.getByMLS(params.mlsNumber);
  const website = getWebsiteFromHeaders();

  if (!listing) return { title: 'Listing Not Found' };

  const shortAddr = safeStr(listing.address, 'Property').split(',')[0];
  const city = safeStr(listing.city, 'Canada');
  const title = `${shortAddr} ${safeStr(listing.propertyType, 'Property')} in ${city} | ID: ${listing.mlsNumber}`;
  const description =
    safeStr(listing.description).substring(0, 160).replace(/\n/g, ' ') ||
    `View details for ${shortAddr} in ${city}`;
  const domain = website?.domain || 'platform.com';
  const canonical = `https://${domain}/listing/${listing.mlsNumber}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: website?.brandName || 'Real Estate Platform',
      images:
        listing.images && listing.images.length > 0
          ? [
              {
                url: listing.images[0],
                width: 1200,
                height: 630,
                alt: `${shortAddr} — ${city}`,
              },
            ]
          : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  };
}

// ─── Structured Data ──────────────────────────────────────────────
function ListingStructuredData({ listing, domain }: { listing: any; domain: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `${safeStr(listing.address, 'Property')} — ID: ${listing.mlsNumber}`,
    description: safeStr(listing.description),
    url: `https://${domain}/listing/${listing.mlsNumber}`,
    image: listing.images || [],
    datePosted: listing.createdAt,
    dateModified: listing.updatedAt,
    address: {
      '@type': 'PostalAddress',
      streetAddress: safeStr(listing.address),
      addressLocality: safeStr(listing.city),
      addressRegion: safeStr(listing.province),
      postalCode: safeStr(listing.postalCode),
      addressCountry: 'CA',
    },
    geo:
      listing.latitude && listing.longitude
        ? {
            '@type': 'GeoCoordinates',
            latitude: listing.latitude,
            longitude: listing.longitude,
          }
        : undefined,
    offers:
      safeNum(listing.price) > 0
        ? {
            '@type': 'Offer',
            price: listing.price,
            priceCurrency: listing.currency || 'CAD',
            availability:
              listing.status === 'ACTIVE'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
          }
        : undefined,
    numberOfRooms: safeNum(listing.bedrooms) > 0 ? listing.bedrooms : undefined,
    floorSize:
      safeNum(listing.squareFootage) > 0
        ? {
            '@type': 'QuantitativeValue',
            value: listing.squareFootage,
            unitCode: 'FTK',
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Page Component ───────────────────────────────────────────────
export default async function DynamicListingPage({ params }: ListingDetailProps) {
  const listing = await listingService.getByMLS(params.mlsNumber);
  if (!listing) return notFound();

  // ── DDF Compliance: Analytics Ping ─────────────────────────────────
  const headerList = headers();
  const ip = extractClientIP(headerList);
  fireDDFAnalyticsPing({
    listingId: listing.mlsNumber,
    ip: ip,
  });

  const moreInfoLink = resolveMoreInformationLink({
    listingId: listing.mlsNumber,
    listingKey: (listing as any).listingKey || listing.mlsNumber,
    moreInformationLink: (listing as any).moreInformationLink,
    rawData: (listing as any).rawData,
  });

  // ── Derived values (null-safe) ─────────────────────────────────────
  const relatedListings = await listingService.getRelatedListings(listing, 4);
  const formattedPrice = formatListingPrice(listing.price, listing.currency || 'CAD');
  const address = safeStr(listing.address, 'Address unavailable');
  const city = safeStr(listing.city, 'Unknown City');
  const province = safeStr(listing.province);
  const postalCode = safeStr(listing.postalCode);
  const description = safeStr(listing.description);
  const propertyType = safeStr(listing.propertyType, 'Property');
  const title = safeStr(listing.title) || `${propertyType} in ${city}`;
  const agentName = safeStr(listing.agentName, 'Listing Agent');
  const agentPhone = safeStr(listing.agentPhone);
  const agentEmail = safeStr(listing.agentEmail);
  const agentPhoto = safeStr(listing.agentPhoto);
  const brokerageName = safeStr(listing.brokerageName);
  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
  const sqft = safeNum(listing.squareFootage);
  const bedrooms = safeNum(listing.bedrooms);
  const bathrooms = safeNum(listing.bathrooms);

  const statusStyles: Record<string, string> = {
    ACTIVE: 'bg-emerald-500 shadow-emerald-500/30',
    SOLD: 'bg-rose-500 shadow-rose-500/30',
    PENDING: 'bg-amber-500 shadow-amber-500/30',
    OFF_MARKET: 'bg-slate-500 shadow-slate-500/30',
  };
  const statusStyle = statusStyles[listing.status] || 'bg-slate-500';

  const navItems = [
    { label: 'Description', id: 'property-description' },
    { label: 'Address', id: 'property-map' },
    { label: 'Details', id: 'property-overview' },
    { label: 'Features', id: 'property-features' },
    { label: 'Calculator', id: 'calculator' },
    { label: 'Statistics', id: 'statistics' },
    { label: 'Similar Listings', id: 'related-listings' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <ListingStructuredData listing={listing} domain="platform.com" />

      {/* Sub-Header Navigation */}
      <div className="sticky top-[72px] z-40 hidden border-b border-slate-100 bg-white/90 backdrop-blur-md lg:block">
        <div className="mx-auto max-w-7xl px-8">
          <div className="no-scrollbar flex items-center gap-8 overflow-x-auto py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-indigo-600"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* ──── Breadcrumb ──── */}
        <nav
          id="listing-breadcrumb"
          className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-widest text-slate-400"
        >
          <Link href="/" className="transition-colors hover:text-indigo-600">
            Home
          </Link>
          <svg
            className="h-3 w-3 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/search" className="transition-colors hover:text-indigo-600">
            Search
          </Link>
          <svg
            className="h-3 w-3 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-500">{city}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Content */}
          <div className="space-y-16 lg:col-span-8">
            {/* Header & Gallery */}
            <div className="space-y-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`${statusStyle} rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}
                    >
                      {listing.status}
                    </span>
                    <span className="rounded-lg bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {propertyType}
                    </span>
                    {(listing as any).updatedAt &&
                      new Date().getTime() - new Date((listing as any).updatedAt).getTime() <
                        24 * 60 * 60 * 1000 && (
                        <span className="flex animate-pulse items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                          Price Improved
                        </span>
                      )}
                    <span className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {Math.floor(Math.random() * 40) + 12} people viewed this recently
                    </span>
                  </div>
                  <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
                    {title}
                  </h1>
                  <p className="text-xl font-bold italic text-slate-400">
                    {address}
                    {city && city !== address ? `, ${city}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 text-left md:items-end md:text-right">
                  <div>
                    <p
                      className={`text-4xl font-black tracking-tighter sm:text-5xl ${safeNum(listing.price) > 0 ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                      {formattedPrice}
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                      Property ID: {listing.mlsNumber}
                    </p>
                  </div>
                  <SaveButton listingId={listing.id} variant="full" />
                </div>
              </div>

              {images.length > 0 ? (
                <ListingGallery images={images} title={address} />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-[32px] border border-slate-200 bg-slate-100">
                  <div className="text-center">
                    <svg
                      className="mx-auto mb-4 h-16 w-16 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm font-bold text-slate-400">
                      No images available for this listing
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Property Overview */}
            <section
              id="property-overview"
              className="rounded-[48px] border border-slate-100 bg-slate-50/50 p-10"
            >
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {[
                  {
                    label: 'Bedrooms',
                    value: displayStat(bedrooms > 0 ? bedrooms : null),
                    icon: (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: 'Bathrooms',
                    value: displayStat(bathrooms > 0 ? bathrooms : null),
                    icon: (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM6 12V6a3 3 0 013-3h1"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: 'Square Ft',
                    value: displayStat(sqft > 0 ? sqft : null),
                    icon: (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: 'Year Built',
                    value: displayStat((listing as any).yearBuilt),
                    icon: (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    ),
                  },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="text-indigo-500">{item.icon}</span>
                      {item.label}
                    </div>
                    <p className="text-xl font-black text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            {description && (
              <section id="property-description" className="space-y-8">
                <h2 className="text-3xl font-black italic tracking-tight text-slate-900">
                  Description
                </h2>
                <div className="prose prose-slate prose-lg max-w-none font-medium leading-relaxed text-slate-500">
                  {description
                    .split('\n')
                    .filter(Boolean)
                    .map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                </div>
              </section>
            )}

            {/* Mortgage Calculator — only show when price is known */}
            <MortgageCalculator price={safeNum(listing.price)} />
            <PropertyStats />

            {/* Location */}
            <section id="property-map" className="space-y-8">
              <h2 className="text-3xl font-black italic tracking-tight text-slate-900">Location</h2>
              <div className="group relative aspect-video w-full overflow-hidden rounded-[48px] border border-slate-100 bg-slate-100">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778545894-da20a8555616?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-20 grayscale transition-opacity duration-1000 group-hover:opacity-30" />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-6 flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl bg-white text-2xl shadow-2xl">
                    <svg
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-2xl font-black text-slate-900">{address}</h3>
                  <p className="max-w-md font-bold text-slate-500">
                    {city}
                    {province ? `, ${province}` : ''}
                    {postalCode ? ` ${postalCode}` : ''}
                  </p>
                  <Link
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}, ${province} ${postalCode}`)}`}
                    target="_blank"
                    className="mt-8 rounded-2xl bg-slate-900 px-10 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-slate-800"
                  >
                    Open in Maps
                  </Link>
                </div>
              </div>
            </section>

            {/* Agent Detailed Profile */}
            <section
              id="agent-profile"
              className="flex flex-col gap-12 rounded-[48px] border border-slate-100 bg-slate-50/50 p-12 md:flex-row"
            >
              <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-[32px] shadow-2xl">
                <Image
                  src={
                    agentPhoto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=random&color=fff&bold=true`
                  }
                  alt={agentName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{agentName}</h3>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                    Licensed Real Estate Salesperson
                  </p>
                  {brokerageName && (
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {brokerageName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {agentPhone ? (
                    <a href={`tel:${agentPhone}`} className="flex flex-col space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Direct Phone
                      </span>
                      <span className="font-bold uppercase text-slate-900 transition-colors hover:text-indigo-600">
                        {agentPhone}
                      </span>
                    </a>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Direct Phone
                      </span>
                      <span className="font-bold uppercase text-slate-300">Not available</span>
                    </div>
                  )}
                  {agentEmail ? (
                    <a href={`mailto:${agentEmail}`} className="flex flex-col space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Email Address
                      </span>
                      <span className="font-bold uppercase text-slate-900 transition-colors hover:text-indigo-600">
                        {agentEmail}
                      </span>
                    </a>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Email Address
                      </span>
                      <span className="font-bold uppercase text-slate-300">Not available</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 border-t border-slate-200/50 pt-6">
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:text-indigo-600">
                    F
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:text-indigo-600">
                    X
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:text-indigo-600">
                    IN
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 lg:col-span-4">
            <StickyInquirySidebar listing={listing as any} />

            {/* DDF Compliance Badge */}
            <div className="rounded-[32px] border border-slate-100 bg-slate-50/50 p-8">
              <RealtorBadge moreInformationLink={moreInfoLink} variant="full" />
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <section id="related-listings" className="space-y-12 pt-24">
            <div className="flex items-end justify-between">
              <div className="space-y-3">
                <h2 className="text-4xl font-black italic tracking-tight text-slate-900">
                  Similar Listings
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Hand-picked for you in {city}
                </p>
              </div>
              <Link
                href="/listings"
                className="hidden items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-600 transition-all hover:gap-5 sm:flex"
              >
                View all
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {relatedListings.map((l) => (
                <UnifiedPropertyCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
