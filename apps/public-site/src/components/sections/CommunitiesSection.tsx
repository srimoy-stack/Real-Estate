'use client';

import React from 'react';
import Link from 'next/link';

const CITIES = [
    { name: 'Toronto', count: 432, image: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Vancouver', count: 215, image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Montreal', count: 184, image: 'https://images.unsplash.com/photo-1519177113768-4983045eaa5f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Calgary', count: 96, image: 'https://images.unsplash.com/photo-1549419163-9528d7120619?auto=format&fit=crop&q=80&w=800' },
    { name: 'Ottawa', count: 72, image: 'https://images.unsplash.com/photo-1551631484-93510e8f8102?auto=format&fit=crop&q=80&w=800' },
    { name: 'Mississauga', count: 54, image: 'https://images.unsplash.com/photo-1536746803623-cdf26444bc11?auto=format&fit=crop&q=80&w=800' },
];

export const CommunitiesSection = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
                    <div className="max-w-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Local Experts</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                            Explore <span className="text-indigo-600 italic">Communities</span>
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Discover the unique character, local amenities, and market trends of Canada's most vibrant neighborhoods.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {CITIES.map((city, i) => (
                        <Link
                            key={i}
                            href={`/communities/${city.name.toLowerCase()}`}
                            className="group flex flex-col items-center gap-4 p-4 rounded-[32px] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-500"
                        >
                            <div className="w-full aspect-square rounded-[24px] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                <img
                                    src={city.image}
                                    alt={city.name}
                                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="text-base font-black text-slate-900 leading-tight">{city.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{city.count} Properties</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
