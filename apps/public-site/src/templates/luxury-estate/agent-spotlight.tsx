'use client';

import React from 'react';

const agents = [
    {
        id: '1',
        name: 'Victoria Harrington',
        title: 'Principal Broker & Founder',
        bio: 'With over 20 years of experience in luxury real estate, Victoria has facilitated over $500M in transactions across Canada\'s most prestigious addresses.',
        specialties: ['Waterfront Estates', 'Penthouses', 'Off-Market Deals'],
        sales: '$500M+',
        deals: '200+',
    },
    {
        id: '2',
        name: 'Alexander Chen',
        title: 'Director of Luxury Sales',
        bio: 'A former architect turned real estate advisor, Alexander brings a unique eye for design and an unrivaled understanding of property value.',
        specialties: ['Modern Architecture', 'Investment Properties', 'International Buyers'],
        sales: '$320M+',
        deals: '150+',
    },
    {
        id: '3',
        name: 'Sophia Laurent',
        title: 'Senior Luxury Advisor',
        bio: 'Sophia\'s multilingual capabilities and global network make her the go-to advisor for discerning international clients seeking Canadian luxury properties.',
        specialties: ['International Clients', 'New Developments', 'Yorkville'],
        sales: '$280M+',
        deals: '130+',
    },
];

export const AgentSpotlight: React.FC = () => (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-amber-500/[0.02] to-transparent" />

        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
            {/* Section header */}
            <div className="text-center mb-20">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-px w-12 bg-amber-500" />
                    <span className="text-amber-400/80 text-[11px] font-black uppercase tracking-[0.4em]">Our Advisors</span>
                    <div className="h-px w-12 bg-amber-500" />
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                    Agent <span className="text-amber-400 italic">Spotlight</span>
                </h2>
                <p className="text-white/30 text-lg mt-4 max-w-xl mx-auto font-light">
                    Our advisors are the finest in luxury real estate, handpicked for their expertise and dedication.
                </p>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {agents.map((agent) => (
                    <div key={agent.id} className="group">
                        {/* Photo */}
                        <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-8">
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 border border-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-white/15 text-xs">Agent Portrait</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />

                            {/* Stats overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-amber-400 text-xl font-black">{agent.sales}</p>
                                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Sales Volume</p>
                                    </div>
                                    <div>
                                        <p className="text-white text-xl font-black">{agent.deals}</p>
                                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Deals Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <h3 className="text-white text-xl font-black tracking-tight group-hover:text-amber-400 transition-colors">{agent.name}</h3>
                        <p className="text-amber-400/60 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">{agent.title}</p>
                        <p className="text-white/30 text-sm mt-4 leading-relaxed">{agent.bio}</p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {agent.specialties.map((s) => (
                                <span key={s} className="px-3 py-1 border border-white/5 bg-white/[0.02] text-white/40 text-[9px] font-bold uppercase tracking-widest rounded-sm">
                                    {s}
                                </span>
                            ))}
                        </div>

                        {/* Contact */}
                        <a href="#" className="inline-flex items-center gap-2 mt-6 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-amber-300 transition-colors group/link">
                            Contact Agent
                            <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
