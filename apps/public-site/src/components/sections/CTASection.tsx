'use client';

import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';

const SERVICES = [
    { title: 'Buy a Home', description: 'Browse verified listings across Canada', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', href: '/listings' },
    { title: 'Sell Your Property', description: 'Get a free home valuation today', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800', href: '/sell' },
    { title: 'Find an Agent', description: 'Connect with licensed local experts', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800', href: '/agents' },
    { title: 'Lease a Space', description: 'Commercial and residential leases', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', href: '/search?transaction=lease' },
    { title: 'Explore Communities', description: 'Discover vibrant neighbourhoods', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800', href: '/communities' },
    { title: 'Map Search', description: 'Search properties on an interactive map', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800', href: '/map-search' },
];

export const CTASection = () => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">How Can We Help</span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                        Our <span className="text-brand-red italic">Services</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Whether you&apos;re buying, selling, or leasing — we have the tools and expertise to guide you every step of the way.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SERVICES.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="group relative h-72 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <SafeImage
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white tracking-tight">{item.title}</h3>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{item.description}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-brand-red group-hover:text-white transition-all flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
