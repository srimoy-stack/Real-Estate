'use client';

import React from 'react';

const testimonials = [
    {
        id: 1,
        name: 'Jonathan & Rebecca Sterling',
        location: 'Forest Hill, Toronto',
        text: 'The team at Luxury Estate understood exactly what we were looking for. They found us a magnificent Forest Hill property that exceeded all our expectations. Their attention to detail and market knowledge is second to none.',
        property: 'Forest Hill Grand Mansion',
        price: '$12.5M',
        rating: 5,
    },
    {
        id: 2,
        name: 'Dr. Wei Zhang',
        location: 'Yorkville, Toronto',
        text: 'As an international buyer, I needed an advisor who understood both the Canadian market and my specific needs. The concierge service was exceptional — from property tours to legal coordination, everything was seamless.',
        property: 'Yorkville Luxury Condo',
        price: '$5.6M',
        rating: 5,
    },
    {
        id: 3,
        name: 'The Kapoor Family',
        location: 'Muskoka, Ontario',
        text: 'Our Muskoka lakefront retreat is everything we dreamed of. The team negotiated brilliantly and handled the entire process with grace and professionalism. We feel like family, not clients.',
        property: 'Lakeside Heritage Cottage',
        price: '$1.75M',
        rating: 5,
    },
];

export const Testimonials: React.FC = () => (
    <section className="py-32 bg-slate-900 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(180,130,50,0.03),transparent_70%)]" />

        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-20">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-px w-12 bg-amber-500" />
                    <span className="text-amber-400/80 text-[11px] font-black uppercase tracking-[0.4em]">Testimonials</span>
                    <div className="h-px w-12 bg-amber-500" />
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                    Client <span className="text-amber-400 italic">Stories</span>
                </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                    <div key={t.id} className="relative bg-slate-950/50 border border-white/5 rounded-sm p-10 group hover:border-amber-500/10 transition-all duration-500">
                        {/* Gold corner */}
                        <div className="absolute top-0 left-0 w-12 h-12">
                            <div className="absolute top-0 left-0 w-full h-full border-t border-l border-amber-500/30 rounded-sm" />
                        </div>

                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                            {Array.from({ length: t.rating }).map((_, i) => (
                                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>

                        {/* Quote */}
                        <p className="text-white/50 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>

                        {/* Divider */}
                        <div className="h-px w-full bg-white/5 my-8" />

                        {/* Author */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-amber-400 font-black text-sm">{t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{t.name}</p>
                                <p className="text-white/30 text-xs">{t.location}</p>
                            </div>
                        </div>

                        {/* Property tag */}
                        <div className="mt-6 p-3 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between">
                            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{t.property}</span>
                            <span className="text-amber-400 text-sm font-black">{t.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
