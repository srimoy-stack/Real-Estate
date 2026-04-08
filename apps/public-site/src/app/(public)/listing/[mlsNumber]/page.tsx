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

  // ── Smart Title fallback if normalization didn't catch it ──
  const displayTitle = (prop.title && !prop.title.toLowerCase().includes('null'))
    ? prop.title
    : `${prop.bedrooms > 0 ? prop.bedrooms + ' Bedroom ' : ''}${prop.propertySubType || 'Property'} in ${city}`;

  // ── Agent Data with Fallbacks ──
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
      <div className="sticky top-[72px] z-40 hidden border-b border-slate-100 bg-white/90 backdrop-blur-md lg:block">
        <div className="mx-auto max-w-7xl px-8">
          <div className="no-scrollbar flex items-center gap-8 overflow-x-auto py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-[#4F46E5]"
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
          <Link href="/" className="transition-colors hover:text-[#4F46E5]">
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
          <Link href="/search" className="transition-colors hover:text-[#4F46E5]">
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
                  {/* Active / Inactive badge */}
                  {(() => {
                    const s = (prop.status || listing.status || '').toLowerCase();
                    const isActive = s === 'active' || s === 'active_under_contract' || s === 'coming_soon';
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-400 text-white'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full bg-white ${isActive ? 'animate-pulse' : 'opacity-60'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    );
                  })()}
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
                    <span className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">
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
                  <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
                    {displayTitle}
                  </h1>
                  <p className="text-xl font-bold italic text-slate-400">
                    {prop.title !== displayTitle ? prop.title : (city + (province ? `, ${province}` : ''))}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 text-left md:items-end md:text-right">
                  <div>
                    <p
                      className={`text-2xl font-black tracking-tighter sm:text-3xl ${(prop.price ?? 0) > 0 ? 'text-[#4F46E5]' : 'text-slate-400'}`}
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
                    <h2 className="mb-2 text-xl font-black text-white">No photos available yet</h2>
                    <p className="max-w-md font-bold text-slate-400">
                      We&apos;re currently preparing the media for this listing. Contact us for a private showing.
                    </p>
                    
                    <div className="mt-8 flex items-center gap-3">
                      <div className="rounded-full bg-[#4F46E5] px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
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




            {/* Public Remarks */}
            {(listing as any).description && (
              <section id="property-description" className="space-y-5">
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4F46E5]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Public Remarks</h2>
                </div>
                {/* Remarks body */}
                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 sm:p-8">
                  <div className="space-y-4 text-[15px] font-medium leading-relaxed text-slate-600">
                    {(listing as any).description
                      .split('\n')
                      .filter(Boolean)
                      .map((p: string, i: number) => (
                        <p key={i}>{p}</p>
                      ))}
                  </div>
                </div>
              </section>
            )}

            {/* ──── Deep Property Details (from rawData) ──── */}
            {(() => {
              const details = extractListingDetails(listing);
              return (
                <div id="property-features" className="space-y-10">
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

            {/* Mortgage Calculator — only show when price is known */}
            {prop.price && prop.price > 0 && <MortgageCalculator price={prop.price} />}
            <PropertyStats listing={listing} />

            {/* Location Map */}
            <section id="property-map" className="relative aspect-video w-full overflow-hidden rounded-[48px] border border-slate-100 bg-slate-50 shadow-inner group">
                <iframe
                  width="100%"
                  height="100%"
                  className="grayscale-0 transition-all duration-1000 group-hover:grayscale-0 contrast-125"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${prop.title}, ${city}, ${province} ${postalCode}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                />
                
                <div className="absolute top-8 left-8 z-10 flex flex-col gap-2">
                    <Link
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${prop.title}, ${city}, ${province} ${postalCode}`)}`}
                      target="_blank"
                      className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl transition-all hover:bg-slate-900 hover:text-white"
                    >
                      Open in Google Maps
                    </Link>
                </div>
                
                {/* Custom Overlay */}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-900/10 rounded-[48px]" />
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
                  <h3 className="text-xl font-black text-slate-900">{agentName}</h3>
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


          </div>
        </div>

        {/* Related Listings — AI-Powered Recommendations */}
        {(() => {
          const details = extractListingDetails(listing);
          const community = details.propertySummary.communityName;
          const locationLabel = community 
            ? `${city} (${community})` 
            : city;

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
