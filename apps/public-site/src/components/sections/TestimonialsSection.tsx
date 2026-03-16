'use client';

import React from 'react';

const TESTIMONIALS = [
    {
        name: 'Robert Fox',
        role: 'Homeowner',
        photo: 'https://i.pravatar.cc/150?u=robert',
        review: 'The attention to detail and market insight provided by the team was unparalleled. They didn\'t just sell my house; they curated an experience that exceeded all expectations.',
        rating: 5
    },
    {
        name: 'Jane Cooper',
        role: 'Investor',
        photo: 'https://i.pravatar.cc/150?u=jane',
        review: 'Searching for a property in such a competitive market was daunting, but their team made it seamless. Their local knowledge helped us find a hidden gem we would have otherwise missed.',
        rating: 5
    },
    {
        name: 'Guy Hawkins',
        role: 'First-time Buyer',
        photo: 'https://i.pravatar.cc/150?u=guy',
        review: 'As first-time buyers, we had a lot of questions. The guidance we received was patient, expert, and ultimately led us to our dream home. Highly recommend their services!',
        rating: 5
    }
];

export const TestimonialsSection = () => {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Client Stories</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                        What Our <span className="text-indigo-600 italic">Clients Say</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Our reputation is built on the success of our clients and the enduring relationships we foster within our communities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="flex flex-col p-8 sm:p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="flex items-center gap-1 mb-6 text-amber-500">
                                {[...Array(t.rating)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>

                            <p className="text-lg text-slate-700 font-medium leading-relaxed italic mb-8">
                                "{t.review}"
                            </p>

                            <div className="mt-auto flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500">
                                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-900 leading-none">{t.name}</h4>
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mt-1">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
