import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';

const CATEGORIES = [
    { title: 'Commercial', count: '5,086', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', href: '/search?listingType=Commercial&province=Ontario' },
    { title: 'Lease', count: '2,840', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', href: '/search?listingType=Commercial&transaction=lease&province=Ontario' },
    { title: 'Office Space', count: '1,035', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800', href: '/search?listingType=Commercial&propertyType=Office&province=Ontario' },
    { title: 'Industrial', count: 917, image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=800', href: '/search?listingType=Commercial&propertyType=Industrial&province=Ontario' },
    { title: 'Retail', count: '1,444', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800', href: '/search?listingType=Commercial&propertyType=Retail&province=Ontario' },
    { title: 'Mixed Use', count: 591, image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800', href: '/search?listingType=Commercial&q=mixed&province=Ontario' },
];

export const PropertyCategories = () => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">Explore Options</span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                        Browse By <span className="text-brand-red italic">Category</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Discover premium commercial spaces and high-value lease opportunities across Ontario&apos;s most sought-after markets.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CATEGORIES.map((cat, i) => (
                        <Link
                            key={i}
                            href={cat.href}
                            className="group relative h-72 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <SafeImage
                                src={cat.image}
                                alt={cat.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white tracking-tight">{cat.title}</h3>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{cat.count} Listings</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-brand-red group-hover:text-white transition-all">
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
