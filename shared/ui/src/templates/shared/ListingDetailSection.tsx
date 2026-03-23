'use client';

import React from 'react';
import { Listing } from '@repo/types';

export interface ListingDetailSectionProps {
    listing?: Listing;
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate' | 'agent';
}

export const ListingDetailSection: React.FC<ListingDetailSectionProps> = ({ listing, variant = 'default' }) => {
    if (!listing) return <div className="p-20 text-center text-slate-400">Loading property details...</div>;

    const isLuxury = variant === 'luxury';
    // const isMinimal = variant === 'minimal';
    const isCorporate = variant === 'corporate';
    const isAgent = variant === 'agent';

    const mainImage = listing.mainImage || (listing as any).image;
    const images = (listing.images && listing.images.length > 0) ? listing.images : [mainImage, mainImage, mainImage];

    // Design Tokens
    const accentColor = isLuxury || isAgent ? 'text-amber-400' : (isCorporate ? 'text-blue-700' : 'text-indigo-600');
    const borderColor = isLuxury ? 'border-white/10' : 'border-slate-100';

    return (
        <section className={`py-12 md:py-24 ${isLuxury ? 'bg-slate-950 text-white' : 'bg-white'}`}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                {/* Header Info (Mobile) */}
                <div className="lg:hidden mb-8">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${accentColor}`}>MLS# {listing.mlsNumber}</p>
                    <h1 className="text-4xl font-black tracking-tighter mb-4">{listing.title}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {listing.city}, Ontario
                    </div>
                </div>

                {/* --- PREMIUM GALLERY LAYOUT --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 aspect-[21/10] mb-12 md:mb-20">
                    <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl group">
                        <img src={images[0]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />
                        <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                            Main Residence
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-3xl group hidden md:block">
                        <img src={images[1]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="relative overflow-hidden rounded-3xl group hidden md:block">
                        <img src={images[2]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="md:col-span-2 relative overflow-hidden rounded-3xl group hidden md:block">
                        <img src={images[0]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm cursor-pointer">
                            <span className="text-white text-xs font-black uppercase tracking-[0.3em] border-2 border-white px-6 py-3 rounded-full">View All 24 Photos</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                    {/* LEFT CONTENT */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Summary Bar */}
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b ${borderColor}`}>
                            {[
                                { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Beds', value: listing.bedrooms },
                                { icon: 'M8 14v20c0 4.418 7.163 8 16 8 1.38 0 2.721-.087 4-.252V14C26.721 14.165 25.38 14.252 24 14.252c-8.837 0-16-3.582-16-8.252z', label: 'Baths', value: listing.bathrooms },
                                { icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4', label: 'Living Space', value: `${listing.squareFootage || 2850} sqft` },
                                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Year Built', value: listing.yearBuilt || 2022 }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLuxury ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-100'}`}>
                                        <svg className={`w-5 h-5 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        <p className="text-xl font-black tracking-tight">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Description Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <h2 className={`text-2xl font-black tracking-tight ${isLuxury ? 'text-amber-400 font-serif italic normal-case' : 'uppercase'}`}>Property Narrative</h2>
                                <div className={`h-px flex-1 ${borderColor}`}></div>
                            </div>
                            <p className={`text-xl leading-relaxed ${isLuxury ? 'text-slate-400 font-medium' : 'text-slate-600 font-normal'} max-w-4xl`}>
                                {listing.description || "Discover unparalleled luxury in this masterfully designed estate. Every detail has been curated to offer the ultimate in comfort and style, from the soaring ceilings and oversized windows to the bespoke finishes and state-of-the-art home automation. This is more than a residence; it is an experience of modern living at its finest."}
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className={`p-10 rounded-[3rem] ${isLuxury ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-100'}`}>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-8 text-slate-500">Estate Features & Amenities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                                {[
                                    'Smart Home Automation', 'Custom Wine Cellar', 'Heated Saltwater Pool',
                                    'Chef\'s Kitchen', 'Private Home Theatre', 'Spa-Inspired Ensuite',
                                    'Floor-to-Ceiling Windows', 'Landscaped Grounds', 'Triple Car Garage'
                                ].map(feature => (
                                    <div key={feature} className="flex items-center gap-4 group">
                                        <div className={`w-2 h-2 rounded-full transition-all group-hover:scale-150 ${accentColor.replace('text', 'bg')}`} />
                                        <span className="text-sm font-bold tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black tracking-tight">Prime Location</h3>
                            <div className="aspect-[21/9] rounded-[2rem] bg-slate-200 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-50 grayscale" alt="Map" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="px-8 py-4 bg-white shadow-2xl rounded-2xl border border-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-3 animate-bounce">
                                        <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                        Interactive Map Hidden
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 space-y-8">
                            {/* Pricing & Reservation Card */}
                            <div className={`p-10 rounded-[2.5rem] shadow-2xl border ${isLuxury ? 'bg-white text-slate-950 border-white' : 'bg-white border-slate-100'}`}>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-slate-400">Current Market Price</p>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-black tracking-tighter">${listing.price.toLocaleString()}</span>
                                    <span className="text-slate-400 font-bold text-sm lowercase tracking-tight">CAD</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                                        <span className="text-sm font-bold">Detached Estate</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</span>
                                        <span className="text-sm font-bold text-emerald-600">Active Listing</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lot Size</span>
                                        <span className="text-sm font-bold">120 x 240 FT</span>
                                    </div>
                                </div>

                                <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl hover:translate-y-[-2px] active:scale-95 mb-4 ${isLuxury ? 'bg-slate-950 text-white shadow-slate-900/20' : 'bg-indigo-600 text-white shadow-indigo-100 font-black'}`}>
                                    Schedule a Private Tour
                                </button>
                                <button className="w-full py-5 rounded-2xl border-2 border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] hover:border-slate-200 hover:text-slate-600 transition-all">
                                    Download Portfolio (PDF)
                                </button>
                            </div>

                            {/* Agent Card */}
                            <div className={`p-8 rounded-[2.5rem] border ${isLuxury ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Listing Representation</h4>
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white/20">
                                        <img src={listing.agentPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover" alt={listing.agentName} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black tracking-tight leading-none mb-1">{listing.agentName || "Maxwell Sterling"}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Executive Partner</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <a href={`tel:${listing.agentPhone}`} className="flex items-center gap-3 text-sm font-bold tracking-tight opacity-70 hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {listing.agentPhone || "(416) 555-0888"}
                                    </a>
                                    <a href={`mailto:${listing.agentEmail}`} className="flex items-center gap-3 text-sm font-bold tracking-tight opacity-70 hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {listing.agentEmail || "sterling@agency.com"}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
