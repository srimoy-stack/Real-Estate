import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { listingService } from '@repo/services';
import { ListingStatus, Listing } from '@repo/types';
import { LeadCaptureForm } from '@/components/listings/LeadCaptureForm';

interface ListingDetailProps {
  params: { id: string };
}

// Add structured data (LD+JSON) for SEO
function ListingStructuredData({ listing, baseUrl }: { listing: Listing, baseUrl: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': listing.title,
    'description': listing.description,
    'url': `${baseUrl}/listings/${listing.slug}`,
    'image': `${baseUrl}${listing.mainImage}`,
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

import { mockListings } from '@repo/ui';

async function getListing(idOrSlug: string, websiteId: string): Promise<Listing | null> {
  try {
    const listing = await listingService.getById(idOrSlug);
    if (listing && (listing.organizationId === websiteId || websiteId === 'default')) {
      return listing;
    }
  } catch (e) { }

  const found = mockListings.find((l: Listing) => l.id === idOrSlug || l.slug === idOrSlug);
  if (found) {
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

  return (
    <div className="min-h-screen bg-slate-50/50">
      <ListingStructuredData listing={listing} baseUrl={baseUrl} />

      {/* Navigation Bar Spacing */}
      <div className="h-20" />

      {/* Improved Gallery Layout: High-Fid Reference Style */}
      <div className="mx-auto max-w-[1440px] px-0 md:px-4 lg:px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-2xl">
          <div className="md:col-span-6 relative h-full overflow-hidden group cursor-pointer">
            <Image
              src={listing.mainImage}
              alt={listing.title}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
          </div>
          <div className="hidden md:grid md:col-span-6 grid-cols-2 grid-rows-2 gap-2 h-full">
            {listing.images.slice(0, 4).map((img: string, i: number) => (
              <div key={i} className="relative overflow-hidden group cursor-pointer">
                <Image
                  src={img}
                  alt={`${listing.title} gallery ${i}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                {i === 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold tracking-widest text-sm uppercase">View all photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Details Column */}
          <div className="lg:col-span-2 space-y-12">

            {/* Header: Title, Price & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-2">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                  <span>/</span>
                  <Link href="/listings" className="hover:text-amber-600 transition-colors">Property Values</Link>
                  <span>/</span>
                  <span className="text-slate-900">{listing.title}</span>
                </nav>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">{listing.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 ${listing.status === ListingStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {listing.status === ListingStatus.ACTIVE ? 'For Sale' : listing.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-lg font-medium">{listing.address}, {listing.city}, {listing.province} {listing.postalCode}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(listing.price)}
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Estimated Payment: ${monthlyPayment.toLocaleString()}/mo</p>
                <div className="flex justify-end gap-3 mt-4">
                  <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 115.367-2.684 3 3 0 01-5.367 2.684zm0 9.316a3 3 0 115.368 2.684 3 3 0 01-5.368-2.684z" /></svg>
                  </button>
                  <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Specs Icons */}
            <div className="flex border-y border-slate-200 divide-x divide-slate-200 py-6">
              <div className="flex-1 flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-xl font-black text-slate-900">{listing.bedrooms} + 1</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bedrooms</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 10l.135-.675M20 10l-.135-.675M12 4v4m0 0l-1.5-1.5M12 8l1.5-1.5M4 10h16M4 10l1.35 6.75A2 2 0 007.3 18h9.4a2 2 0 001.95-1.25L20 10" />
                </svg>
                <span className="text-xl font-black text-slate-900">{listing.bathrooms}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bathrooms</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-xl font-black text-slate-900">{listing.squareFootage?.toLocaleString()}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sq. Ft.</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xl font-black text-slate-900">{listing.lotSize}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acres</span>
              </div>
            </div>

            {/* Listing History Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Listing <span className="text-amber-600">History</span></h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Days On Market</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Event</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Listing ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">May 19, 2024</td>
                      <td className="px-6 py-4 text-sm text-slate-600">0</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">$4,250,000</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Listed</span></td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-400 text-right">{listing.externalId}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors grayscale opacity-60">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">Oct 24, 2022</td>
                      <td className="px-6 py-4 text-sm text-slate-600">12</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">$4,380,000</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">Expired</span></td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-400 text-right">C543212</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Facts Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Key <span className="text-amber-600">Facts</span></h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12 p-8 bg-white rounded-[40px] border border-slate-200">
                {[
                  { label: 'Property Type', value: listing.propertyType.replace('_', ' ') },
                  { label: 'Parking', value: '4 Spaces (2 Garage)' },
                  { label: 'Tax / Year', value: '$14,240.22 / 2024' },
                  { label: 'Bedrooms', value: '4 + 1' },
                  { label: 'Bathrooms', value: '5 Total' },
                  { label: 'Basement', value: 'Walk-out, Finished' },
                  { label: 'Walk Score', value: '72 (Very Walkable)' },
                  { label: 'MLS® ID', value: listing.externalId },
                  { label: 'Lot Size', value: '50.00 x 150.00 Ft' },
                ].map((fact, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{fact.label}</p>
                    <p className="text-base font-black text-slate-900 tracking-tight">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Key <span className="text-amber-600">Description</span></h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed font-medium first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-amber-600 first-letter:mt-1">
                  {listing.description}
                </p>
                <button className="mt-8 px-6 py-3 border border-slate-200 rounded-full text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2">
                  See More Facts and Features
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>

            {/* Affordability Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Afford<span className="text-amber-600">ability</span></h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="p-8 bg-slate-900 rounded-[40px] text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Afford Score™</p>
                      <div className="text-4xl font-black italic">Excellent <span className="text-emerald-500">8.4</span></div>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-red-500 w-[10%]" />
                      <div className="h-full bg-orange-500 w-[20%]" />
                      <div className="h-full bg-yellow-500 w-[30%]" />
                      <div className="h-full bg-emerald-500 w-[40%]" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">Based on your saved profile, this property fits comfortably within your monthly budget and long-term financial goals.</p>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                      <span className="text-sm font-bold">Estimated Monthly</span>
                      <span className="text-xl font-black">${monthlyPayment.toLocaleString()}</span>
                    </div>
                    <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-colors">
                      Full Breakdown
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Building Section (For Multi-unit or just context) */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">The <span className="text-amber-600">Building</span></h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900">Oriole Road Estate</h3>
                    <p className="text-slate-500 font-medium">12 Units Total • Built in 2018 • Luxury Concierge</p>
                  </div>
                  <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">
                    View Building Details
                  </button>
                </div>
              </div>
            </div>

            {/* Neighbourhood Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Neighbour<span className="text-amber-600">hood</span></h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="relative h-[400px] w-full bg-slate-100 rounded-[40px] overflow-hidden group">
                <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" alt="Map Placeholder" fill className="object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="px-10 py-5 bg-white shadow-2xl rounded-2xl flex items-center gap-4 hover:scale-105 transition-transform duration-500">
                    <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-600/20">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-900">View Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            <div className="space-y-8 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Similar <span className="text-amber-600">to this home</span></h2>
                <Link href="/listings" className="text-xs font-black uppercase tracking-widest text-amber-600 hover:text-amber-700">See All Listings</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'The Glass Pavilion Mansion', location: '12 Peak View Rd, Toronto', price: '$12,500,000', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
                  { title: 'Skyline Penthouse Suites', location: '101 Bay St, Toronto', price: '$3,800,000', img: 'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=800' }
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900">Featured</div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">{item.location}</p>
                    <div className="text-lg font-black text-slate-900">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-20 pt-10 border-t border-slate-200">
              <div className="flex items-start gap-4 p-8 bg-white rounded-3xl border border-slate-100 italic">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-white text-xs">RE</div>
                <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest">
                  The listing data above is provided under copyright by the Canadian Real Estate Association. The listing data is deemed reliable but is not guaranteed accurate by the Canadian Real Estate Association nor by this platform.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Lead Capture */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Suspense fallback={<div className="h-[600px] bg-slate-200/50 animate-pulse rounded-[40px]" />}>
                <div className="bg-slate-900 rounded-[40px] p-2 overflow-hidden shadow-2xl border border-slate-800">
                  <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Available Now</span>
                    </div>
                    <h3 className="text-3xl font-black text-white italic mb-2">Private <span className="text-amber-600">Viewing</span></h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">Book a tailored walk-through of this architectural masterpiece with our elite concierge team.</p>
                  </div>
                  <LeadCaptureForm
                    listingId={listing.id}
                    mlsNumber={listing.mlsNumber}
                    listingTitle={listing.title}
                    websiteId={websiteId}
                  />
                  <div className="p-8 pt-0 mt-4 space-y-4">
                    <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 text-center group cursor-pointer hover:bg-slate-800 transition-colors">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Direct Concierge</p>
                      <p className="text-lg font-black text-white">+1 (888) 450-9284</p>
                    </div>
                  </div>
                </div>

                {/* Mini Calculator Sidebar */}
                <div className="p-8 bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/20">
                  <h4 className="text-lg font-black text-slate-900 italic mb-6">Quick <span className="text-amber-600">Calculator</span></h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-50">
                      <span>Monthly Payment</span>
                      <span className="text-slate-900">${monthlyPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-50">
                      <span>Down Payment</span>
                      <span className="text-slate-900">20% ($850,000)</span>
                    </div>
                    <button className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
                      Open Mortgage Center
                    </button>
                  </div>
                </div>
              </Suspense>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
