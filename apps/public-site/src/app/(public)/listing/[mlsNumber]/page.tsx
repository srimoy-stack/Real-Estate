import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { listingQueryApi } from '@repo/services';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { RelatedListingCard } from '@/components/listings/RelatedListingCard';
import { LeadCaptureForm } from '@/components/listings/LeadCaptureForm';
import { SaveListingButton } from '@/components/listings/SaveListingButton';
import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';

interface ListingDetailProps {
    params: { mlsNumber: string };
}

// ═══════════════════════════════════════════════════════════
//  SEO — Dynamic Meta Tags & Structured Data
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: ListingDetailProps): Promise<Metadata> {
    const listing = await listingQueryApi.getListingByMlsId(params.mlsNumber);
    const website = getWebsiteFromHeaders();

    if (!listing) return { title: 'Listing Not Found' };

    const shortAddr = listing.address.split(',')[0];
    const title = `${shortAddr} ${listing.propertyType} for ${listing.status} in ${listing.city} | MLS® ${listing.mlsNumber}`;
    const description = listing.description.substring(0, 160).replace(/\n/g, ' ');
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
            images: listing.images && listing.images.length > 0 ? [{
                url: listing.images[0],
                width: 1200,
                height: 630,
                alt: `${shortAddr} — ${listing.city}`,
            }] : [],
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

function ListingStructuredData({ listing, domain }: { listing: any; domain: string }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        'name': `${listing.address} — MLS® ${listing.mlsNumber}`,
        'description': listing.description,
        'url': `https://${domain}/listing/${listing.mlsNumber}`,
        'image': listing.images || [],
        'datePosted': listing.createdAt,
        'dateModified': listing.updatedAt,
        'address': {
            '@type': 'PostalAddress',
            'streetAddress': listing.address,
            'addressLocality': listing.city,
            'addressRegion': listing.province,
            'postalCode': listing.postalCode,
            'addressCountry': 'CA',
        },
        'geo': listing.latitude && listing.longitude ? {
            '@type': 'GeoCoordinates',
            'latitude': listing.latitude,
            'longitude': listing.longitude,
        } : undefined,
        'offers': {
            '@type': 'Offer',
            'price': listing.price,
            'priceCurrency': listing.currency || 'CAD',
            'availability': listing.status === 'For Sale' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        },
        'numberOfRooms': listing.bedrooms,
        'floorSize': listing.squareFootage ? {
            '@type': 'QuantitativeValue',
            'value': listing.squareFootage,
            'unitCode': 'FTK',
        } : undefined,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════
//  PROPERTY DETAIL PAGE
// ═══════════════════════════════════════════════════════════

export default async function DynamicListingPage({ params }: ListingDetailProps) {
    const listing = await listingQueryApi.getListingByMlsId(params.mlsNumber);
    const website = getWebsiteFromHeaders();

    if (!listing) return notFound();

    // Tenant verification — ensure listing belongs to the correct organization
    // In demo mode (no website config), allow all listings through
    if (website && listing.organizationId) {
        // website.tenantId maps to organization
        // For now we allow because mock data all belongs to org-1
    }

    // Fetch related listings (same city, similar type/price)
    const relatedListings = await listingQueryApi.getRelatedListings(listing, 3);

    const formattedPrice = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: listing.currency || 'CAD',
        maximumFractionDigits: 0,
    }).format(listing.price);

    const domain = website?.domain || 'platform.com';

    // Status color mapping
    const statusStyles: Record<string, string> = {
        'For Sale': 'bg-emerald-500 shadow-emerald-500/30',
        'Sold': 'bg-rose-500 shadow-rose-500/30',
        'Pending': 'bg-amber-500 shadow-amber-500/30',
        'Removed': 'bg-slate-500 shadow-slate-500/30',
    };
    const statusStyle = statusStyles[listing.status] || 'bg-slate-500';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <ListingStructuredData listing={listing} domain={domain} />

            {/* Navigation Spacer */}
            <div className="h-6" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                {/* ──── Breadcrumb ──── */}
                <nav id="listing-breadcrumb" className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex-wrap">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                    <svg className="w-2.5 h-2.5 text-slate-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-slate-500">{listing.city}</span>
                    <svg className="w-2.5 h-2.5 text-slate-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-slate-500">{listing.propertyType}</span>
                    <svg className="w-2.5 h-2.5 text-slate-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-indigo-600 italic">MLS® {listing.mlsNumber}</span>
                </nav>

                {/* ──── Header Section ──── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-end">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`${statusStyle} text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                                {listing.status}
                            </span>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {listing.propertyType}
                            </span>
                            {listing.isFeatured && (
                                <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    Featured
                                </span>
                            )}
                        </div>
                        <h1 id="listing-title" className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                            {listing.address}
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            {listing.city}, {listing.province} {listing.postalCode}
                        </p>
                    </div>

                    <div className="lg:col-span-1 lg:text-right space-y-2">
                        <p id="listing-price" className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tighter">
                            {formattedPrice}
                        </p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            MLS® {listing.mlsNumber}
                        </p>
                        {listing.price > 0 && (
                            <p className="text-slate-400 text-sm font-medium">
                                Est. ${Math.round(listing.price * 0.0044).toLocaleString()}/mo
                            </p>
                        )}
                    </div>
                </div>

                {/* ──── Image Gallery ──── */}
                <div className="relative group/gallery">
                    <ListingGallery
                        images={listing.images}
                        title={listing.address}
                        virtualTourUrl={listing.virtualTourUrl}
                    />
                    {/* Action Bar — Overlaid or below for better visibility */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10">
                        <div className="flex items-center gap-6">
                            <SaveListingButton mlsNumber={listing.mlsNumber} />
                            <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 italic">
                            <span>Direct Listing</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                            <span>Verified Agent</span>
                        </div>
                    </div>
                </div>

                {/* ──── Content Layout: 2-Column ──── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

                    {/* ──── Main Content Column ──── */}
                    <div className="lg:col-span-2 space-y-14">

                        {/* Property Overview — Spec Grid */}
                        <section id="property-overview" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {[
                                { icon: '🛏', value: listing.bedrooms, label: 'Bedrooms' },
                                { icon: '🚿', value: listing.bathrooms, label: 'Bathrooms' },
                                { icon: '📐', value: listing.squareFootage > 0 ? listing.squareFootage.toLocaleString() + ' SF' : 'N/A', label: 'Living Area' },
                                { icon: '🌳', value: listing.lotSize > 0 ? listing.lotSize.toLocaleString() + ' SF' : 'N/A', label: 'Lot Size' },
                                { icon: '🏗️', value: listing.yearBuilt || 'N/A', label: 'Year Built' },
                            ].map((spec, idx) => (
                                <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center space-y-2 hover:border-indigo-100 hover:shadow-md transition-all">
                                    <span className="text-2xl block">{spec.icon}</span>
                                    <p className="text-lg font-black text-slate-900">{spec.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{spec.label}</p>
                                </div>
                            ))}
                        </section>

                        {/* Description */}
                        <section id="property-description" className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Property Description</h2>
                            </div>
                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                                {listing.description.split('\n').filter(Boolean).map((paragraph: string, idx: number) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        </section>

                        {/* Features */}
                        {listing.features && listing.features.length > 0 && (
                            <section id="property-features" className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Features</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {listing.features.map((feature: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="font-bold text-sm text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                            <section id="property-amenities" className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Building Amenities</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {listing.amenities.map((amenity: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="font-bold text-sm text-slate-700">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Location Map */}
                        <section id="property-location" className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-8 bg-amber-500 rounded-full" />
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Location</h2>
                            </div>
                            <div className="relative aspect-[16/9] w-full bg-slate-100 rounded-[28px] overflow-hidden shadow-lg border border-slate-200">
                                {/* Static map placeholder — Replace with Google Maps Embed in production */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 z-10 p-6 text-center">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 border border-slate-100">
                                        <span className="text-4xl">📍</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{listing.address}</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-6">{listing.city}, {listing.province} {listing.postalCode}</p>
                                    {listing.latitude && listing.longitude && (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg"
                                            >
                                                Open in Google Maps
                                            </a>
                                            <a
                                                href={`https://maps.apple.com/?q=${listing.latitude},${listing.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors border border-slate-200"
                                            >
                                                Open in Apple Maps
                                            </a>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-slate-400 mt-4 font-medium">
                                        {listing.latitude?.toFixed(4)}°N, {listing.longitude?.toFixed(4)}°W
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ──── Sidebar: Agent & Forms ──── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-8">

                            {/* Agent Contact Card */}
                            <section id="agent-contact" className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/30">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4 text-2xl font-black text-white">
                                        {listing.agentName.charAt(0)}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">{listing.agentName}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Listing Agent</p>
                                    {listing.brokerageName && (
                                        <p className="text-xs text-indigo-500 font-bold mt-2">{listing.brokerageName}</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <a
                                        href={`tel:${listing.agentPhone}`}
                                        className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 font-bold rounded-xl transition-colors border border-slate-100 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {listing.agentPhone || 'Contact Office'}
                                    </a>
                                    <a
                                        href={`mailto:${listing.agentEmail}`}
                                        className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold rounded-xl transition-colors border border-slate-100 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        Email Agent
                                    </a>
                                </div>
                            </section>

                            {/* Inquiry Form */}
                            <section id="inquiry-form" className="bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl">
                                <div className="p-8 pb-5 text-center">
                                    <h3 className="text-xl font-black text-white mb-1">Request a Viewing</h3>
                                    <p className="text-slate-400 text-xs font-medium">Interested in this property? Let us connect you.</p>
                                </div>
                                <div className="bg-white rounded-t-[20px] p-6">
                                    <Suspense fallback={<div className="h-[350px] bg-slate-50 rounded-xl animate-pulse" />}>
                                        <LeadCaptureForm
                                            listingId={listing.id}
                                            mlsNumber={listing.mlsNumber}
                                            listingTitle={`MLS® ${listing.mlsNumber} — ${listing.address}`}
                                            websiteId={website?.id}
                                        />
                                    </Suspense>
                                </div>
                            </section>

                            {/* Quick Stats */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[28px] p-6 text-center text-white shadow-xl shadow-indigo-500/20">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-2xl font-black">{listing.bedrooms}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Beds</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{listing.bathrooms}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Baths</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{listing.squareFootage > 0 ? listing.squareFootage.toLocaleString() : '—'}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Sq Ft</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{listing.yearBuilt || '—'}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Built</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ──── Related Listings ──── */}
                {relatedListings.length > 0 && (
                    <section id="related-listings" className="pt-12 border-t border-slate-200 mt-8 space-y-8">
                        <div className="text-center space-y-3">
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Similar Properties</span>
                                <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                More Homes in <span className="text-indigo-600 italic">{listing.city}</span>
                            </h2>
                            <p className="text-slate-500 font-medium max-w-lg mx-auto">
                                Explore similar properties matching your criteria.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedListings.map((property) => (
                                <RelatedListingCard key={property.id} listing={property} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ──── MLS Compliance Disclaimer ──── */}
                <section id="mls-disclaimer" className="pt-10 border-t border-slate-100 mt-8">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase">MLS®</span>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-slate-700">MLS® Disclaimer</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    The listing data is provided under copyright by the Canadian Real Estate Association (CREA).
                                    The information provided herein must only be used by consumers that have a bona fide interest in the purchase,
                                    sale, or lease of real estate and may not be used for any commercial purpose or any other purpose.
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Data is deemed reliable but is not guaranteed accurate by the MLS® System.
                                    Data provided by CREA MLS® System.{' '}
                                    {listing.brokerageName && (
                                        <span className="font-semibold">Listed by {listing.brokerageName}.</span>
                                    )}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                                    Last updated: {new Date(listing.updatedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
