import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';

const CITIES = [
    { name: 'Toronto', count: 432, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800' },
    { name: 'Ottawa', count: 72, image: 'https://images.unsplash.com/photo-1569974498991-d3c12a504f95?auto=format&fit=crop&q=80&w=800' },
    { name: 'Mississauga', count: 54, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=800' },
    { name: 'Hamilton', count: 48, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800' },
    { name: 'Brampton', count: 41, image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800' },
    { name: 'London', count: 38, image: 'https://images.unsplash.com/photo-1585863810141-f628043c7df4?auto=format&fit=crop&q=80&w=800' },
];

export const CommunitiesSection = () => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">Neighbourhoods</span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                        Explore <span className="text-brand-red italic">Communities</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Discover the unique character, local amenities, and market trends of the most vibrant neighbourhoods.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CITIES.map((city, i) => (
                        <Link
                            key={i}
                            href={`/communities/${city.name.toLowerCase()}`}
                            className="group relative h-72 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <SafeImage
                                src={city.image}
                                alt={city.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white tracking-tight">{city.name}</h3>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{city.count} Properties</p>
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
