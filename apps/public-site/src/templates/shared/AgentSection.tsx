'use client';

import React from 'react';

interface Agent {
    id: string;
    name: string;
    title: string;
    phone: string;
    email: string;
    image: string;
    listings: number;
}

interface AgentSectionProps {
    agents: Agent[];
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate';
    title?: string;
}

export const AgentSection: React.FC<AgentSectionProps> = ({
    agents,
    variant = 'default',
    title = 'Our Team',
}) => {

    if (variant === 'luxury') {
        return (
            <section className="py-24 bg-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-amber-500" />
                        <span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Our Advisors</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic mb-16">{title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {agents.map(a => (
                            <div key={a.id} className="group">
                                <div className="aspect-[3/4] bg-slate-800 rounded-3xl mb-4 overflow-hidden flex items-center justify-center">
                                    <span className="text-slate-600 text-sm">Photo</span>
                                </div>
                                <h3 className="text-white font-bold text-lg">{a.name}</h3>
                                <p className="text-amber-400/70 text-sm font-medium">{a.title}</p>
                                <p className="text-white/30 text-xs mt-2">{a.listings} Active Listings</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'corporate') {
        return (
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                        <p className="text-slate-500 mt-2">Meet our experienced real estate professionals.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {agents.map(a => (
                            <div key={a.id} className="text-center border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all">
                                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-slate-400 text-xs">Photo</span>
                                </div>
                                <h3 className="text-slate-900 font-bold">{a.name}</h3>
                                <p className="text-blue-700 text-sm font-medium">{a.title}</p>
                                <p className="text-slate-400 text-xs mt-2">{a.phone}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'minimal') {
        return (
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-light text-slate-900">{title}</h2>
                    <div className="h-px w-16 bg-slate-300 mt-6 mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {agents.map(a => (
                            <div key={a.id} className="flex gap-6 items-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center">
                                    <span className="text-slate-400 text-xs">Photo</span>
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-medium">{a.name}</h3>
                                    <p className="text-slate-400 text-sm">{a.title}</p>
                                    <p className="text-slate-500 text-sm mt-1">{a.phone}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Default
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.3em]">Experts</span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-3">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {agents.map(a => (
                        <div key={a.id} className="group text-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden group-hover:shadow-xl transition-all">
                                <span className="text-indigo-400 text-sm">Photo</span>
                            </div>
                            <h3 className="text-slate-900 font-bold text-lg">{a.name}</h3>
                            <p className="text-indigo-600 text-sm font-medium">{a.title}</p>
                            <p className="text-slate-400 text-xs mt-2">{a.listings} Active Listings</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
