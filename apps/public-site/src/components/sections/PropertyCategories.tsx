'use client';

import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
    { title: 'Commercial', count: 124, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
    { title: 'Residential', count: 850, image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800' },
    { title: 'Single Family', count: 432, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
    { title: 'Apartment', count: 215, image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800' },
    { title: 'Condo', count: 328, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800' },
    { title: 'Multi Family', count: 96, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800' },
];

export const PropertyCategories = () => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Explore Options</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                        Browse By <span className="text-indigo-600 italic">Category</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Whether you're looking for a cozy studio or a sprawling commercial complex, we have the perfect space for your next move.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CATEGORIES.map((cat, i) => (
                        <Link
                            key={i}
                            href={`/listings?type=${cat.title}`}
                            className="group relative h-72 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white tracking-tight">{cat.title}</h3>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{cat.count} Listings</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-600 transition-all">
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
