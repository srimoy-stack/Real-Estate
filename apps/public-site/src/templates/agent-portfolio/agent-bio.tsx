'use client';

import React from 'react';

const stats = [
    { value: '12+', label: 'Years Experience', icon: '📅' },
    { value: '150+', label: 'Homes Sold', icon: '🏠' },
    { value: '$40M+', label: 'Sales Volume', icon: '💰' },
    { value: '98%', label: 'Client Satisfaction', icon: '⭐' },
];

export const AgentBio: React.FC = () => (
    <section id="about" className="py-28 bg-white relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[120px] opacity-60" />

        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                {/* Photo */}
                <div className="relative">
                    <div className="relative w-full max-w-[480px] mx-auto">
                        {/* Decorative frame */}
                        <div className="absolute -top-4 -left-4 w-full h-full border-2 border-amber-400/20 rounded-3xl" />
                        <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-28 h-28 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-4">
                                    <svg className="w-14 h-14 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <span className="text-slate-300 text-sm">Agent Photo</span>
                            </div>
                        </div>
                        {/* Experience badge */}
                        <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 shadow-2xl shadow-amber-200/50">
                            <p className="text-slate-900 text-3xl font-black">12+</p>
                            <p className="text-slate-900/60 text-[10px] font-bold uppercase tracking-widest">Years</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-10 bg-amber-400" />
                        <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">About Me</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Sarah Mitchell</span>
                    </h2>

                    <div className="space-y-4 mt-8">
                        <p className="text-slate-500 text-lg leading-relaxed">
                            With over 12 years of experience in Toronto&apos;s luxury real estate market, I have built my career on one simple principle: <strong className="text-slate-700">putting clients first</strong>.
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            I specialize in helping families find their dream homes in Toronto&apos;s most prestigious neighborhoods — Forest Hill, Yorkville, Rosedale, and The Annex. My deep understanding of the local market, combined with my dedication to personalized service, ensures every client receives an exceptional experience.
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            Whether you&apos;re buying your first home, upgrading to your forever home, or selling your property for top dollar, I bring the expertise, negotiation skills, and passion needed to deliver outstanding results.
                        </p>
                    </div>

                    {/* Certification badges */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        {['Certified Luxury Home Specialist', 'Top 1% Agent in GTA', 'CREA Award Winner'].map((badge) => (
                            <span key={badge} className="px-4 py-2 bg-amber-50 border border-amber-200/50 text-amber-700 text-xs font-bold rounded-lg">
                                ✦ {badge}
                            </span>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-10 border-t border-slate-100">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <span className="text-2xl mb-2 block">{stat.icon}</span>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);
