'use client';

import React from 'react';

const communities = [
    {
        name: 'Forest Hill',
        description: 'Tree-lined streets and stately homes in one of Toronto\'s most prestigious neighborhoods.',
        properties: 45,
        avgPrice: '$3.2M',
    },
    {
        name: 'Yorkville',
        description: 'Luxury condos and boutique living in Toronto\'s premier shopping and dining destination.',
        properties: 32,
        avgPrice: '$4.5M',
    },
    {
        name: 'Rosedale',
        description: 'Grand heritage estates and winding roads in Toronto\'s oldest and most elegant neighborhood.',
        properties: 28,
        avgPrice: '$5.1M',
    },
    {
        name: 'The Annex',
        description: 'Victorian charm meets urban sophistication in this vibrant, culturally rich community.',
        properties: 38,
        avgPrice: '$2.8M',
    },
];

export const CommunitiesSection: React.FC = () => (
    <section id="communities" className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-50 rounded-full blur-[100px] opacity-50" />

        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-px w-10 bg-amber-400" />
                    <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Local Expert</span>
                    <div className="h-px w-10 bg-amber-400" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Neighborhoods <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">I Serve</span>
                </h2>
                <p className="text-slate-400 text-lg mt-3 max-w-lg mx-auto">Deep local knowledge across Toronto&apos;s most desirable communities.</p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {communities.map((community) => (
                    <a key={community.name} href="#" className="group block relative rounded-2xl overflow-hidden">
                        {/* Image */}
                        <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-100 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-white text-xl font-black group-hover:text-amber-400 transition-colors">{community.name}</h3>
                                <p className="text-white/40 text-sm mt-2 leading-relaxed line-clamp-2">{community.description}</p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                    <span className="text-amber-400/70 text-xs font-bold">{community.properties} Properties</span>
                                    <span className="text-white/50 text-xs font-bold">Avg. {community.avgPrice}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    </section>
);
