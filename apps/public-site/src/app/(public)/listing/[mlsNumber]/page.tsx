import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { listingService } from '@repo/services';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { RelatedListingCard } from '@/components/listings/RelatedListingCard';
import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { MortgageCalculator } from '@/components/listings/MortgageCalculator';
import { PropertyStats } from '@/components/listings/PropertyStats';
import { StickyInquirySidebar } from '@/components/listings/StickyInquirySidebar';
import { SaveButton } from '@/components/listings/SaveButton';

interface ListingDetailProps {
    params: { mlsNumber: string };
}

// ... generateMetadata and ListingStructuredData remain the same ...
export async function generateMetadata({ params }: ListingDetailProps): Promise<Metadata> {
    const listing = await listingService.getByMLS(params.mlsNumber);
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
            'availability': listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
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

export default async function DynamicListingPage({ params }: ListingDetailProps) {
    const listing = await listingService.getByMLS(params.mlsNumber);
    if (!listing) return notFound();

    const relatedListings = await listingService.getRelatedListings(listing, 4);
    const formattedPrice = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: listing.currency || 'CAD',
        maximumFractionDigits: 0,
    }).format(listing.price);

    const statusStyles: Record<string, string> = {
        'ACTIVE': 'bg-emerald-500 shadow-emerald-500/30',
        'SOLD': 'bg-rose-500 shadow-rose-500/30',
        'PENDING': 'bg-amber-500 shadow-amber-500/30',
        'OFF_MARKET': 'bg-slate-500 shadow-slate-500/30',
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
            <div className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 hidden lg:block">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4">
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors whitespace-nowrap"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

                {/* ──── Breadcrumb ──── */}
                <nav id="listing-breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 overflow-hidden whitespace-nowrap">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                    <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <Link href="/search" className="hover:text-indigo-600 transition-colors">Listings</Link>
                    <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-slate-500">{listing.city}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Header & Gallery */}
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`${statusStyle} text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                                            {listing.status}
                                        </span>
                                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {listing.propertyType}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                        {listing.title || listing.address}
                                    </h1>
                                    <p className="text-xl text-slate-400 font-bold italic">{listing.address}, {listing.city}</p>
                                </div>
                                <div className="text-left md:text-right flex flex-col items-center md:items-end gap-4">
                                    <div>
                                        <p className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tighter">{formattedPrice}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-2">MLS® {listing.mlsNumber}</p>
                                    </div>
                                    <SaveButton listingId={listing.id} variant="full" />
                                </div>
                            </div>

                            <ListingGallery images={listing.images} title={listing.address} />
                        </div>

                        {/* Property Overview */}
                        <section id="property-overview" className="bg-slate-50/50 p-10 rounded-[48px] border border-slate-100">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { label: 'Bedrooms', value: listing.bedrooms, icon: '🛏️' },
                                    { label: 'Bathrooms', value: listing.bathrooms, icon: '🚿' },
                                    { label: 'Square Ft', value: listing.squareFootage?.toLocaleString(), icon: '📐' },
                                    { label: 'Year Built', value: '2022', icon: '📅' },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            {item.icon} {item.label}
                                        </p>
                                        <p className="text-xl font-black text-slate-900">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Description */}
                        <section id="property-description" className="space-y-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Description</h2>
                            <div className="prose prose-slate prose-lg max-w-none text-slate-500 font-medium leading-relaxed">
                                {listing.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                            </div>
                        </section>

                        {/* Components from Screenshots */}
                        <MortgageCalculator price={listing.price} />
                        <PropertyStats />

                        {/* Location */}
                        <section id="property-map" className="space-y-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Location</h2>
                            <div className="aspect-video w-full bg-slate-100 rounded-[48px] overflow-hidden relative border border-slate-100 group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778545894-da20a8555616?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center grayscale opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 text-2xl animate-bounce">📍</div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{listing.address}</h3>
                                    <p className="text-slate-500 font-bold max-w-md">{listing.city}, {listing.province} {listing.postalCode}</p>
                                    <Link href={`https://maps.google.com/?q=${listing.address}`} target="_blank" className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Open in Maps</Link>
                                </div>
                            </div>
                        </section>

                        {/* Agent Detailed Profile */}
                        <section id="agent-profile" className="bg-slate-50/50 p-12 rounded-[48px] border border-slate-100 flex flex-col md:flex-row gap-12">
                            <div className="w-48 h-48 rounded-[32px] overflow-hidden shadow-2xl shrink-0">
                                <img src={listing.agentPhoto || 'https://i.pravatar.cc/300'} alt={listing.agentName} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900">{listing.agentName}</h3>
                                    <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mt-2">Certified Listing Agent</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <a href={`tel:${listing.agentPhone}`} className="flex flex-col space-y-1">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Direct Phone</span>
                                        <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors uppercase">{listing.agentPhone}</span>
                                    </a>
                                    <a href={`mailto:${listing.agentEmail}`} className="flex flex-col space-y-1">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</span>
                                        <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors uppercase">{listing.agentEmail}</span>
                                    </a>
                                </div>
                                <div className="pt-6 border-t border-slate-200/50 flex gap-4">
                                    <button className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-slate-100">F</button>
                                    <button className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-slate-100">X</button>
                                    <button className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-slate-100">IN</button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4">
                        <StickyInquirySidebar listing={listing as any} />
                    </div>
                </div>

                {/* Related Listings */}
                {relatedListings.length > 0 && (
                    <section id="related-listings" className="pt-24 space-y-12">
                        <div className="flex items-end justify-between">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Similar Listings</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Hand-picked for you in {listing.city}</p>
                            </div>
                            <Link href="/search" className="hidden sm:flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest hover:gap-5 transition-all">
                                View all
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedListings.map(l => (
                                <RelatedListingCard key={l.id} listing={l} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
