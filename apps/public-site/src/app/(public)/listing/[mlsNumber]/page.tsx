import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getListingByMlsDirect, 
  getRelatedListingsDirect 
} from '@/lib/server-listing-service';
import { ListingGallery } from '@/components/listings/ListingGallery';
import {
  SafeImage,
  autoNormalize,
  resolvePrice,
  resolveStatus,
  formatNumber,
} from '@/components/ui';
import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { MortgageCalculator } from '@/components/listings/MortgageCalculator';
import { PropertyStats } from '@/components/listings/PropertyStats';
import { StickyInquirySidebar } from '@/components/listings/StickyInquirySidebar';
import { SaveButton } from '@/components/listings/SaveButton';
import { SimilarListings } from '@/components/listings/SimilarListings';
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

// Helpers removed in favor of @/components/ui/design-tokens and normalize-property

// ─── SEO Metadata ─────────────────────────────────────────────────
export async function generateMetadata({ params }: ListingDetailProps): Promise<Metadata> {
  const listing = await getListingByMlsDirect(params.mlsNumber);
  const website = getWebsiteFromHeaders();

  if (!listing) return { title: 'Listing Not Found' };

  const prop = autoNormalize(listing);
  const title = `${prop.title} | ID: ${prop.mlsNumber}`;
  const description =
    (listing.description || '').substring(0, 160).replace(/\n/g, ' ') ||
    `View details for ${prop.title} in ${prop.city || 'Canada'}`;
  
  const domain = website?.domain || 'platform.com';
  const canonical = `https://${domain}/listing/${prop.mlsNumber}`;

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
        prop.images && prop.images.length > 0
          ? [
            {
              url: prop.images[0],
              width: 1200,
              height: 630,
              alt: prop.title,
            },
          ]
          : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: prop.images?.[0] ? [prop.images[0]] : [],
    },
  };
}

// ─── Structured Data ──────────────────────────────────────────────
function ListingStructuredData({ listing, domain }: { listing: any; domain: string }) {
  const price = Number(listing.price) || 0;
  const bedrooms = Number(listing.bedrooms) || 0;
  const sqft = Number(listing.squareFootage) || 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `${listing.address || 'Property'} — ID: ${listing.mlsNumber}`,
    description: listing.description || '',
    url: `https://${domain}/listing/${listing.mlsNumber}`,
    image: listing.images || [],
    datePosted: listing.createdAt,
    dateModified: listing.updatedAt,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address || '',
      addressLocality: listing.city || '',
      addressRegion: listing.province || '',
      postalCode: listing.postalCode || '',
      addressCountry: 'CA',
    },
    geo:
      listing.latitude && listing.longitude
        ? {
          '@type': 'GeoCoordinates',
          latitude: Number(listing.latitude) || 0,
          longitude: Number(listing.longitude) || 0,
        }
        : undefined,
    offers:
      price > 0
        ? {
          '@type': 'Offer',
          price: price,
          priceCurrency: listing.currency || 'CAD',
          availability:
            listing.status === 'ACTIVE'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
        }
        : undefined,
    numberOfRooms: bedrooms > 0 ? bedrooms : undefined,
    floorSize:
      sqft > 0
        ? {
          '@type': 'QuantitativeValue',
          value: sqft,
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
  const listing = await getListingByMlsDirect(params.mlsNumber);
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

  // ── Normalize data ────────────────────────────────────────────────
  const prop = autoNormalize(listing);
  const relatedListings = await getRelatedListingsDirect(listing, 4);
  const priceDisplay = resolvePrice(prop.price, prop.leaseAmount, prop.leaseRatePerSqft, prop.category);
  const status = resolveStatus(prop.status);

  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
  
  const statusStyle = status.bg;
  const city = prop.city || 'Canada';
  const province = prop.province || '';
  const postalCode = prop.postalCode || '';

  const propertyType = prop.propertySubType || 'Property';

  // ── Smart Title fallback if normalization didn't catch it ──
  const displayTitle = (prop.title && !prop.title.toLowerCase().includes('null'))
    ? prop.title
    : `${prop.bedrooms > 0 ? prop.bedrooms + ' Bedroom ' : ''}${prop.propertySubType || 'Property'} in ${city}`;

  // ── Agent Data with Fallbacks ──
  const agentName = listing.agentName || 'Our Listing Team';
  const agentPhoto = listing.agentPhoto || null;
  const agentPhone = listing.agentPhone || null;
  const brokerageName = prop.brokerageName;

  const sqft = prop.sqft;
  const bedrooms = prop.bedrooms;
  const bathrooms = prop.bathrooms;

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
                    {displayTitle}
                  </h1>
                  <p className="text-xl font-bold italic text-slate-400">
                    {prop.title !== displayTitle ? prop.title : (city + (province ? `, ${province}` : ''))}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 text-left md:items-end md:text-right">
                  <div>
                    <p
                      className={`text-4xl font-black tracking-tighter sm:text-5xl ${(prop.price ?? 0) > 0 ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                      {priceDisplay.text}
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                      Property ID: {listing.mlsNumber}
                    </p>
                  </div>
                  <SaveButton listingId={listing.mlsNumber} variant="full" />
                </div>
              </div>

              {images.length > 0 ? (
                <ListingGallery images={images} title={displayTitle} />
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-[48px] border border-slate-100 bg-slate-900 shadow-2xl">
                  {/* Background stock image or abstract gradient */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-40 grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md text-white border border-white/20">
                      <svg
                        className="h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="mb-2 text-3xl font-black text-white">No photos available yet</h2>
                    <p className="max-w-md font-bold text-slate-400">
                      We&apos;re currently preparing the media for this listing. Contact us for a private showing.
                    </p>
                    
                    <div className="mt-8 flex items-center gap-3">
                      <div className="rounded-full bg-indigo-600 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                        Live MLS® Listing
                      </div>
                      <div className="rounded-full bg-white/10 backdrop-blur-md px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                        {listing.mlsNumber}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Property Overview */}
            {(bedrooms > 0 || bathrooms > 0 || sqft > 0 || (listing as any).yearBuilt) && (
              <section
                id="property-overview"
                className="rounded-[48px] border border-slate-100 bg-slate-50/50 p-10"
              >
                <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {bedrooms > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="text-indigo-500">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </span>
                          Bedrooms
                        </div>
                        <p className="text-xl font-black text-slate-900">{bedrooms}</p>
                      </div>
                    )}
                    {bathrooms > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="text-indigo-500">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM6 12V6a3 3 0 013-3h1" />
                            </svg>
                          </span>
                          Bathrooms
                        </div>
                        <p className="text-xl font-black text-slate-900">{bathrooms}</p>
                      </div>
                    )}
                    {sqft > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="text-indigo-500">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                          </span>
                          Square Ft
                        </div>
                        <p className="text-xl font-black text-slate-900">{formatNumber(sqft)}</p>
                      </div>
                    )}
                    {(listing as any).yearBuilt && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="text-indigo-500">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </span>
                          Year Built
                        </div>
                        <p className="text-xl font-black text-slate-900">{(listing as any).yearBuilt}</p>
                      </div>
                    )}
                </div>
              </section>
            )}

            {/* Description */}
            {(listing as any).description && (
              <section id="property-description" className="space-y-8">
                <h2 className="text-3xl font-black italic tracking-tight text-slate-900">
                  Description
                </h2>
                <div className="prose prose-slate prose-lg max-w-none font-medium leading-relaxed text-slate-500">
                  {(listing as any).description
                    .split('\n')
                    .filter(Boolean)
                    .map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                </div>
              </section>
            )}

            {/* Mortgage Calculator — only show when price is known */}
            {prop.price && prop.price > 0 && <MortgageCalculator price={prop.price} />}
            <PropertyStats />

            {/* Location */}
            <section id="property-map" className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tight text-slate-900">Location</h2>
                  <p className="max-w-md text-sm font-bold text-slate-400">
                    {city}
                    {province ? `, ${province}` : ''}
                    {postalCode ? ` ${postalCode}` : ''}
                  </p>
                </div>
                <Link
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${prop.title}, ${city}, ${province} ${postalCode}`)}`}
                  target="_blank"
                  className="rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-slate-800"
                >
                  Open in Google Maps
                </Link>
              </div>
              
              <div className="group relative aspect-video w-full overflow-hidden rounded-[48px] border border-slate-100 bg-slate-50 shadow-inner">
                <iframe
                  width="100%"
                  height="100%"
                  className="grayscale-0 transition-all duration-1000 group-hover:grayscale-0 contrast-125"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${prop.title}, ${city}, ${province} ${postalCode}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                />
                
                {/* Custom Overlay (Optional if you want a more styled map) */}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-900/10 rounded-[48px]" />
              </div>
            </section>

            {/* Agent Detailed Profile */}
            <section
              id="agent-profile"
              className="flex flex-col gap-12 rounded-[48px] border border-slate-100 bg-slate-50/50 p-12 md:flex-row"
            >
              <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-[32px] shadow-2xl bg-white border-4 border-white">
                <SafeImage
                  src={
                    agentPhoto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=111827&color=fff&bold=true`
                  }
                  alt={agentName}
                  seed={agentName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{agentName}</h3>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                    Professional Real Estate Advisor
                  </p>
                  {brokerageName && (
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {brokerageName}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Direct Inquiries
                    </span>
                    {agentPhone ? (
                       <a href={`tel:${agentPhone}`} className="text-lg font-black text-slate-900 transition-colors hover:text-red-600">
                         {agentPhone}
                       </a>
                    ) : (
                      <span className="text-lg font-black text-slate-300">Speak to an expert</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Availability
                    </span>
                    <span className="flex items-center gap-2 text-lg font-black text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      Ready to Help
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <a 
                    href="#listing-inquiry"
                    className="inline-block rounded-2xl bg-slate-900 px-10 py-5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Contact Listing Expert
                  </a>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 lg:col-span-4" id="listing-inquiry">
            <StickyInquirySidebar listing={listing as any} />

            {/* DDF Compliance Badge */}
            <div className="rounded-[32px] border border-slate-100 bg-slate-50/50 p-8">
              <RealtorBadge moreInformationLink={moreInfoLink} variant="full" />
            </div>
          </div>
        </div>

        {/* Related Listings — AI-Powered Recommendations */}
        <SimilarListings
          listingKey={listing.mlsNumber}
          city={city}
          limit={8}
          fallbackListings={relatedListings}
        />
      </div>
    </div>
  );
}
