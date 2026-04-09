'use client';

import React, { useState, useCallback } from 'react';
import { SafeImage } from '@/components/ui';

const TESTIMONIALS = [
    {
        name: 'Robert Fox',
        role: 'Homeowner',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
        review: 'The attention to detail and market insight provided by the team was unparalleled. They didn\'t just sell my house; they curated an experience that exceeded all expectations.',
        rating: 5
    },
    {
        name: 'Jane Cooper',
        role: 'Investor',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
        review: 'Searching for a property in such a competitive market was daunting, but their team made it seamless. Their local knowledge helped us find a hidden gem we would have otherwise missed.',
        rating: 5
    },
    {
        name: 'Guy Hawkins',
        role: 'First-time Buyer',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
        review: 'As first-time buyers, we had a lot of questions. The guidance we received was patient, expert, and ultimately led us to our dream home. Highly recommend their services!',
        rating: 5
    },
    {
        name: 'Eleanor Pena',
        role: 'Developer',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
        review: 'Working with SquareFT on our commercial development project was a game changer. Their data-driven approach generated results in record time.',
        rating: 5
    },
    {
        name: 'Jerome Bell',
        role: 'Architect',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
        review: 'The design-forward marketing used by this platform is exactly what the luxury market deserves. Every listing feels like a work of art.',
        rating: 5
    }
];

export const TestimonialsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const visibleCount = 3;
    const maxIndex = TESTIMONIALS.length - visibleCount; 

    const next = useCallback(() => {
        setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, [maxIndex]);

    const prev = useCallback(() => {
        setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    }, [maxIndex]);

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="max-w-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="h-0.5 w-8 bg-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Client Stories</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            What Our <span className="text-indigo-600 italic">Clients Say</span>
                        </h2>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button 
                            onClick={prev}
                            className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button 
                            onClick={next}
                            className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="relative overflow-hidden -mx-3 px-3">
                    <div 
                        className="flex transition-transform duration-700 cubic-bezier(0.23, 1, 0.32, 1)"
                        style={{ transform: `translateX(-${activeIndex * (100 / visibleCount)}%)` }}
                    >
                        {TESTIMONIALS.map((t, i) => (
                            <div 
                                key={i} 
                                className="w-full md:w-[calc(100%/3)] shrink-0 px-3"
                            >
                                <div className="h-full flex flex-col p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex items-center gap-1 mb-6 text-amber-500">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>

                                    <p className="text-base text-slate-600 font-medium leading-relaxed italic mb-8 min-h-[100px]">
                                        &quot;{t.review}&quot;
                                    </p>

                                    <div className="mt-auto flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                                            <SafeImage src={t.photo} alt={t.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-none text-sm">{t.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/80 mt-1">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex justify-center items-center gap-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-10 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
