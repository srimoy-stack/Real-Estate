'use client';

import React from 'react';

const testimonials = [
    {
        id: 1,
        name: 'Michael & Lisa Chen',
        location: 'Forest Hill',
        text: 'Sarah found us our dream home within two weeks of searching. Her knowledge of the Forest Hill market is unmatched. She negotiated $150K off the asking price and made the entire process feel effortless.',
        rating: 5,
        property: '5 BD Forest Hill Estate',
    },
    {
        id: 2,
        name: 'David Patterson',
        location: 'Yorkville',
        text: 'As a first-time luxury buyer, I was nervous about the process. Sarah walked me through every step with patience and professionalism. She truly goes above and beyond for her clients.',
        rating: 5,
        property: '2 BD Yorkville Condo',
    },
    {
        id: 3,
        name: 'Priya & Rajesh Sharma',
        location: 'Rosedale',
        text: 'We\'ve worked with several agents over the years, but Sarah is in a league of her own. Her market insights helped us sell our home 15% above asking price in just 5 days on the market.',
        rating: 5,
        property: 'Rosedale Heritage Home',
    },
];

export const Testimonials: React.FC = () => (
    <section className="py-28 bg-[#0a1628] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />

        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-px w-10 bg-amber-400" />
                    <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em]">Testimonials</span>
                    <div className="h-px w-10 bg-amber-400" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    What My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Clients Say</span>
                </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                    <div key={t.id} className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-amber-400/10 transition-all duration-500 group">
                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                            {Array.from({ length: t.rating }).map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>

                        {/* Quote */}
                        <p className="text-white/50 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>

                        {/* Divider */}
                        <div className="h-px bg-white/5 my-6" />

                        {/* Author */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-amber-400 font-black text-sm">
                                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{t.name}</p>
                                <p className="text-white/30 text-xs">{t.location}</p>
                            </div>
                        </div>

                        {/* Property tag */}
                        <div className="mt-4 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                            <span className="text-amber-400/60 text-[10px] font-bold uppercase tracking-widest">
                                Purchased: {t.property}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
