import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { listingQueryApi } from '@repo/services';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { ListingCard } from '@repo/ui';
import { LeadCaptureForm } from '@/components/listings/LeadCaptureForm';

interface ListingDetailProps {
    params: { mlsNumber: string };
}

export async function generateMetadata({ params }: ListingDetailProps): Promise<Metadata> {
    const listing = await listingQueryApi.getListingByMlsId(params.mlsNumber);

    if (!listing) return { title: 'Listing Not Found' };

    // Prevent duplicate content scaling issues (Requirement 4)
    const canonical = `https://your-domain.com/listing/${listing.mlsNumber}`;

    return {
        title: `${listing.address} | MLS® ${listing.mlsNumber}`,
        description: listing.description.substring(0, 160),
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: `${listing.address} | Real Estate`,
            description: listing.description.substring(0, 160),
            url: canonical,
            siteName: 'Real Estate Platform',
            images: listing.images && listing.images.length > 0 ? [{
                url: listing.images[0],
                width: 1200,
                height: 630,
                alt: listing.address,
            }] : [],
            type: 'website',
        }
    };
}

// Add structured schema data (LD+JSON) for SEO (Requirement 3)
function ListingStructuredData({ listing }: { listing: any }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        'name': `${listing.address} - MLS® ${listing.mlsNumber}`,
        'description': listing.description,
        'url': `https://your-domain.com/listing/${listing.mlsNumber}`,
        'image': listing.images && listing.images.length > 0 ? listing.images[0] : '',
        'address': {
            '@type': 'PostalAddress',
            'streetAddress': listing.address,
            'addressLocality': listing.city,
            'addressRegion': listing.province,
            'postalCode': listing.postalCode,
            'addressCountry': 'CA'
        },
        'offers': {
            '@type': 'Offer',
            'price': listing.price,
            'priceCurrency': 'CAD',
            'availability': 'https://schema.org/InStock',
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default async function DynamicListingPage({ params }: ListingDetailProps) {
    // Fetch specific listing dynamically using the mlsId route param
    const listing = await listingQueryApi.getListingByMlsId(params.mlsNumber);

    if (!listing) return notFound();

    // Fetch related listings based on the same city
    const { listings: relatedListings } = await listingQueryApi.searchListings({
        city: listing.city,
        limit: 3,
    });

    // Filter out the current one
    const filteredRelated = relatedListings.filter(l => l.mlsNumber !== listing.mlsNumber).slice(0, 3);

    const formattedPrice = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price);

    // Calculate map src
    const mapQ = encodeURIComponent(`${listing.address}, ${listing.city}, ${listing.province} ${listing.postalCode}`);

    return (
        <div className="min-h-screen bg-slate-50">
            <ListingStructuredData listing={listing} />

            {/* Navigation Padding */}
            <div className="h-20" />

            {/* Primary Container */}
            <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

                {/* Header Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-slate-900">{listing.city}</span>
                    <span>/</span>
                    <span className="text-slate-900">{listing.address}</span>
                </nav>

                {/* Header Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {listing.status}
                            </span>
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                                MLS® {listing.mlsNumber}
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                            {listing.address}
                        </h1>
                        <p className="text-xl text-slate-500 font-medium">
                            {listing.city}, {listing.province} {listing.postalCode}
                        </p>
                    </div>

                    <div className="lg:col-span-1 text-left lg:text-right border-l-4 border-amber-400 pl-6 lg:border-l-0 lg:pl-0">
                        <p className="text-5xl font-black text-indigo-600 tracking-tighter">
                            {formattedPrice}
                        </p>
                        <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">
                            {listing.propertyType}
                        </p>
                    </div>
                </div>

                {/* Dynamic Interactive Gallery Component */}
                <ListingGallery images={listing.images} title={listing.address} />

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Core Specifications */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="text-center space-y-2">
                                <span className="text-3xl">🛏</span>
                                <p className="text-2xl font-black text-slate-900">{listing.bedrooms}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bedrooms</p>
                            </div>
                            <div className="text-center space-y-2">
                                <span className="text-3xl">🚿</span>
                                <p className="text-2xl font-black text-slate-900">{listing.bathrooms}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bathrooms</p>
                            </div>
                            <div className="text-center space-y-2">
                                <span className="text-3xl">📐</span>
                                <p className="text-2xl font-black text-slate-900">{listing.squareFootage > 0 ? listing.squareFootage.toLocaleString() : 'N/A'}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sq Ft</p>
                            </div>
                            <div className="text-center space-y-2">
                                <span className="text-3xl">🌳</span>
                                <p className="text-2xl font-black text-slate-900">{listing.lotSize > 0 ? listing.lotSize : 'N/A'}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lot Acres</p>
                            </div>
                        </div>

                        {/* Description Narrative */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Property Description</h2>
                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                                {listing.description.split('\n').map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        {/* Features & Amenities */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Features & Amenities</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {listing.amenities && listing.amenities.length > 0 ? (
                                    listing.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="font-bold text-slate-700">{amenity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-slate-400 italic font-medium p-4 bg-white rounded-2xl border border-slate-100">
                                        No specific amenities recorded for this MLS® listing.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Map */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Location</h2>
                            <div className="aspect-[21/9] w-full bg-slate-200 rounded-[32px] overflow-hidden shadow-inner border border-slate-100">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0" style={{ border: 0 }}
                                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_ACTUAL_API_KEY_HERE&q=${mapQ}`}
                                    allowFullScreen
                                    loading="lazy"
                                    title="Property Location"
                                    className="bg-slate-200 w-full h-full grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                                {/* Fallback overlay if API key isn't provided (for demo purposes) */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-sm z-10 p-6 text-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-4">
                                        📍
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{listing.address}</h3>
                                    <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                                        Open in Maps
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sticky Sidebar: Agent & Forms */}
                    <div className="col-span-1">
                        <div className="sticky top-28 space-y-8">

                            {/* Agent Contact Details */}
                            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6 text-2xl font-black text-white">
                                    {listing.agentName.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-1">{listing.agentName}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Listing Agent</p>

                                <div className="space-y-4">
                                    <a href={`tel:${listing.agentPhone}`} className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 font-bold rounded-2xl transition-colors border border-slate-100">
                                        📞 {listing.agentPhone || 'Contact Office'}
                                    </a>
                                    <a href={`mailto:${listing.agentEmail}`} className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold rounded-2xl transition-colors border border-slate-100">
                                        ✉️ Email Agent
                                    </a>
                                </div>
                            </div>

                            {/* Inquiry Form Lead Capture */}
                            <Suspense fallback={<div className="h-[400px] bg-white rounded-[32px] border border-slate-100 animate-pulse shadow-sm" />}>
                                <div className="bg-slate-900 rounded-[32px] p-2 overflow-hidden shadow-2xl">
                                    <div className="p-8 pb-4 text-center">
                                        <h3 className="text-2xl font-black text-white italic mb-2">Request Viewing</h3>
                                        <p className="text-slate-400 text-xs font-medium">Interested in this property? Let's connect.</p>
                                    </div>
                                    <div className="bg-white rounded-[24px] p-6 m-2">
                                        <LeadCaptureForm
                                            listingId={listing.id}
                                            listingTitle={`Inquiry: MLS® ${listing.mlsNumber} - ${listing.address}`}
                                            tenantId="default"
                                        />
                                    </div>
                                </div>
                            </Suspense>

                        </div>
                    </div>

                </div>

                {/* Related Listings Ribbon */}
                {filteredRelated.length > 0 && (
                    <div className="pt-16 border-t border-slate-200 mt-16 space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">More Homes in <span className="text-indigo-600">{listing.city}</span></h2>
                            <p className="text-slate-500 font-medium mt-2">Explore similar properties nearby.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRelated.map((property) => (
                                <ListingCard key={property.id} listing={property} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
