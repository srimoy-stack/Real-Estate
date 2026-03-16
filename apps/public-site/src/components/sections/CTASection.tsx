'use client';

import React from 'react';

export const CTASection = () => {
    return (
        <section className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="relative max-w-7xl mx-auto rounded-[40px] overflow-hidden bg-slate-900 px-8 py-20 md:px-20 md:py-24 group">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-colors" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Valuation Services</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                            Sell Your Home With <br className="hidden md:block" /> <span className="text-indigo-500 italic">Confidence.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-xl">
                            Our data-driven strategies and elite network of agents ensure your property gets the attention it deserves and the results you expect.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button className="w-full sm:w-auto h-16 px-10 bg-white hover:bg-indigo-50 text-slate-900 font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-black/20">
                            Book a Valuation
                        </button>
                        <button className="w-full sm:w-auto h-16 px-8 bg-transparent hover:bg-white/5 text-white border border-white/20 font-black uppercase tracking-widest rounded-2xl transition-all">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
