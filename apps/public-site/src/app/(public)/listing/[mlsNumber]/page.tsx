import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getListingByMlsDirect, 
  getRelatedListingsDirect 
} from '@/lib/server-listing-service';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { extractListingDetails } from '@/lib/extract-listing-details';
import {
  PropertySummarySection,
  BuildingDetailsSection,
  InteriorFeaturesSection,
  ExteriorFeaturesSection,
  UtilitiesSection,
  RoomsTableSection,
  LandDetailsSection,
  AssociationSection,
  RealtorBadge,
} from '@/components/listing/PropertyDetailSections';
import {
  SafeImage,
  autoNormalize,
  resolvePrice,
} from '@/components/ui';
import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { MortgageCalculator } from '@/components/listings/MortgageCalculator';
import { PropertyStats } from '@/components/listings/PropertyStats';
import { StickyInquirySidebar } from '@/components/listings/StickyInquirySidebar';
import { SaveButton } from '@/components/listings/SaveButton';
import { SimilarListings as SimilarListingsComp } from '@/components/listings/SimilarListings';
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
          latitude: Number(listing.latitude) ?? 0,
          longitude: Number(listing.longitude) ?? 0,
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

  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
  
  const city = prop.city || 'Canada';
  const province = prop.province || '';
  const postalCode = prop.postalCode || '';
  const propertyType = prop.propertySubType || 'Property';

  const displayTitle = (prop.title && !prop.title.toLowerCase().includes('null'))
    ? prop.title
    : `${prop.bedrooms > 0 ? prop.bedrooms + ' Bedroom ' : ''}${prop.propertySubType || 'Property'} in ${city}`;

  const agentName = listing.agentName || 'Our Listing Team';
  const agentPhoto = listing.agentPhoto || null;
  const agentPhone = listing.agentPhone || null;
  const brokerageName = prop.brokerageName;

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
      <div className="sticky top-[72px] z-40 hidden border-b border-slate-100 bg-white/70 backdrop-blur-xl lg:block">
        <div className="mx-auto max-w-7xl px-8">
          <div className="no-scrollbar flex items-center gap-10 overflow-x-auto py-5">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:text-slate-900 active:scale-95"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:px-8">
        {/* ──── Breadcrumb ──── */}
        <nav
          id="listing-breadcrumb"
          className="flex items-center gap-3 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-slate-300"
        >
          <Link href="/" className="transition-colors hover:text-slate-900 px-1">
            Home
          </Link>
          <div className="h-1 w-1 rounded-full bg-slate-200" />
          <Link href="/search" className="transition-colors hover:text-slate-900 px-1">
            Search
          </Link>
          <div className="h-1 w-1 rounded-full bg-slate-200" />
          <span className="text-slate-400 px-1">{city}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Content */}
          <div className="space-y-20 lg:col-span-8">
            {/* Header & Gallery */}
            <div className="space-y-10">
              <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {(() => {
                      const s = (prop.status || listing.status || '').toLowerCase();
                      const isActive = s === 'active' || s === 'active_under_contract' || s === 'coming_soon';
                      return (
                        <div
                          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}
                        >
                          <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          {isActive ? 'Live Listing' : 'Property Sold/Inactive'}
                        </div>
                      );
                    })()}
                    <div className="rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                      {propertyType}
                    </div>
                    {((listing as any).updatedAt &&
                      new Date().getTime() - new Date((listing as any).updatedAt).getTime() <
                      24 * 60 * 60 * 1000) && (
                        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-100">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                          Price Improvement
                        </div>
                      )}
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                      {displayTitle}
                    </h1>
                    <p className="text-xl font-bold text-slate-400 max-w-2xl">
                      {prop.title !== displayTitle ? prop.title : (city + (province ? `, ${province}` : ''))}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-6 md:items-end">
                  <div className="text-left md:text-right">
                    <p className={`text-4xl font-black tracking-tighter sm:text-5xl ${(prop.price ?? 0) > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {priceDisplay.text}
                    </p>
                    <div className="mt-3 flex items-center justify-start md:justify-end gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">MLS® ID</span>
                      <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-900 border border-slate-100">{listing.mlsNumber}</span>
                    </div>
                  </div>
                  <SaveButton listingId={listing.mlsNumber} variant="full" />
                </div>
              </div>

              {images.length > 0 ? (
                <ListingGallery images={images} title={displayTitle} />
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-[48px] border border-slate-100 bg-slate-900 shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-40 grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md text-white border border-white/20">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h2 className="mb-2 text-xl font-black text-white">No photos available yet</h2>
                    <p className="max-w-md font-bold text-slate-400">Preparation in progress. Contact us for priority access.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Public Remarks */}
            {(listing as any).description && (
              <section id="property-description" className="scroll-mt-32 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">Public Remarks</h2>
                    <div className="mt-1 h-1 w-12 rounded-full bg-slate-100" />
                  </div>
                </div>
                <div className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm shadow-slate-100/50 sm:p-14">
                  <div className="space-y-8 text-[17px] font-bold leading-relaxed text-slate-500">
                    {(listing as any).description
                      .split('\n')
                      .filter(Boolean)
                      .map((p: string, i: number) => (
                        <p key={i} className="first-letter:text-3xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-1">
                          {p}
                        </p>
                      ))}
                  </div>
                </div>
              </section>
            )}

            {/* Deep Property Details */}
            {(() => {
              const details = extractListingDetails(listing);
              return (
                <div id="property-features" className="space-y-16">
                  <PropertySummarySection data={details.propertySummary} />
                  <BuildingDetailsSection data={details.building} />
                  <InteriorFeaturesSection data={details.interior} />
                  <ExteriorFeaturesSection data={details.exterior} />
                  <UtilitiesSection data={details.utilities} />
                  <RoomsTableSection data={details.rooms} />
                  <LandDetailsSection data={details.land} />
                  <AssociationSection data={details.association} />
                  <RealtorBadge moreInformationLink={moreInfoLink} />
                </div>
              );
            })()}

            {prop.price && prop.price > 0 && <MortgageCalculator price={prop.price} />}
            <PropertyStats listing={listing} />

            {/* Location Map */}
            <section id="property-map" className="relative group scroll-mt-32">
                <div className="absolute -inset-4 bg-slate-50 rounded-[64px] border border-slate-100 opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none" />
                <div className="relative aspect-video w-full overflow-hidden rounded-[48px] border border-slate-100 bg-white shadow-2xl transition-all duration-500 group-hover:shadow-indigo-100">
                  <iframe
                    width="100%"
                    height="100%"
                    className="grayscale-[20%] transition-all duration-1000 group-hover:grayscale-0 contrast-110"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${prop.title}, ${city}, ${province} ${postalCode}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  />
                  <div className="absolute top-8 left-8 z-10">
                      <Link
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${prop.title}, ${city}, ${province} ${postalCode}`)}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        View Route in Maps
                      </Link>
                  </div>
                </div>
            </section>

            {/* Agent Detailed Profile */}
            <section id="agent-profile" className="flex flex-col gap-12 rounded-[56px] border border-slate-100 bg-white p-12 shadow-sm transition-all hover:shadow-xl md:flex-row">
              <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-[32px] shadow-2xl bg-slate-100 border-8 border-slate-50 rotate-3 transition-transform hover:rotate-0">
                <SafeImage
                  src={agentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=111827&color=fff&bold=true`}
                  alt={agentName}
                  seed={agentName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-900">{agentName}</h3>
                  </div>
                  {brokerageName && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400">
                      {brokerageName}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
                  <div className="space-y-3">
                    {agentPhone && (
                       <a href={`tel:${agentPhone}`} className="flex items-center gap-3 text-2xl font-black text-slate-900 transition-all hover:text-red-600 hover:translate-x-1">
                         <div className="h-2 w-2 rounded-full bg-red-600" />
                         {agentPhone}
                       </a>
                    )}
                  </div>
                  <div className="space-y-3">
                    {agentPhone && (
                    <span className="flex items-center gap-3 text-2xl font-black text-emerald-600">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    </span>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <a href="#listing-inquiry" className="inline-flex items-center gap-4 rounded-2xl bg-slate-900 px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-slate-800 hover:translate-y-[-2px]">
                    Send Inquiry
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 lg:col-span-4" id="listing-inquiry">
            <StickyInquirySidebar listing={listing as any} />
          </div>
        </div>

        {/* Related Listings */}
        {(() => {
          const details = extractListingDetails(listing);
          const community = details.propertySummary.communityName;
          const locationLabel = community ? `${city} (${community})` : city;

          return relatedListings && relatedListings.length > 0 && (
            <SimilarListingsComp
              listingKey={listing.mlsNumber}
              city={locationLabel}
              limit={8}
              fallbackListings={relatedListings}
            />
          );
        })()}
      </div>
    </div>
  );
}
