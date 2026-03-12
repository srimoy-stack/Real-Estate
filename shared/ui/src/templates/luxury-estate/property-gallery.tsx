'use client';

import React, { useRef } from 'react';

const galleryItems = [
    { id: 1, title: 'Waterfront Penthouse', city: 'Toronto', price: '$4.2M' },
    { id: 2, title: 'Forest Hill Estate', city: 'Toronto', price: '$12.5M' },
    { id: 3, title: 'Muskoka Lakehouse', city: 'Muskoka', price: '$3.8M' },
    { id: 4, title: 'Yorkville Residence', city: 'Toronto', price: '$5.6M' },
    { id: 5, title: 'West Vancouver Villa', city: 'Vancouver', price: '$8.9M' },
    { id: 6, title: 'Montreal Heritage', city: 'Montreal', price: '$4.1M' },
    { id: 7, title: 'Whistler Chalet', city: 'Whistler', price: '$7.2M' },
];

export const PropertyGallery: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'left' ? -450 : 450, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-32 bg-slate-900 relative overflow-hidden">
            {/* Top border accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

            <div className="max-w-[1400px] mx-auto px-8 mb-16">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-16 bg-amber-500" />
                            <span className="text-amber-400/80 text-[11px] font-black uppercase tracking-[0.4em]">Showcase</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter">
                            Property <span className="text-amber-400 italic">Gallery</span>
                        </h2>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <button onClick={() => scroll('left')} className="w-12 h-12 border border-white/10 hover:border-amber-500/50 rounded-full flex items-center justify-center text-white/40 hover:text-amber-400 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={() => scroll('right')} className="w-12 h-12 border border-white/10 hover:border-amber-500/50 rounded-full flex items-center justify-center text-white/40 hover:text-amber-400 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrolling Gallery */}
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide px-8 snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'none' }}>
                {galleryItems.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-[400px] md:w-[500px] snap-start group cursor-pointer">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="w-10 h-10 text-white/10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Hover content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <p className="text-amber-400 text-2xl font-black">{item.price}</p>
                                <p className="text-white font-bold mt-1">{item.title}</p>
                                <p className="text-white/50 text-sm">{item.city}</p>
                            </div>

                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 z-20">
                                <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-amber-500/0 group-hover:border-amber-500/40 transition-all duration-500 rounded-sm" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
