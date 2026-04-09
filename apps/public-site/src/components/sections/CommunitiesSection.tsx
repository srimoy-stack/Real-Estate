import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';

const CITIES = [
    { name: 'Toronto', count: 432, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800' },
    { name: 'Ottawa', count: 72, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800' },
    { name: 'Mississauga', count: 54, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=800' },
    { name: 'Hamilton', count: 48, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800' },
    { name: 'Brampton', count: 41, image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800' },
    { name: 'London', count: 38, image: 'https://images.unsplash.com/photo-1585863810141-f628043c7df4?auto=format&fit=crop&q=80&w=800' },
];

export const CommunitiesSection = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
                    <div className="max-w-xl space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status: Optimal</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                            Explore <span className="text-[#4F46E5] italic">Communities</span>
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Discover the unique character, local amenities, and market trends of the most vibrant neighborhoods.
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
                            <div className="relative w-full aspect-square rounded-[24px] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                <SafeImage
                                    src={city.image}
                                    alt={city.name}
                                    fill
                                    className="object-cover group-hover:scale-125 transition-transform duration-1000"
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
