'use client';

import React from 'react';
import { mockAgents } from './mock-data';
import { AgentCard } from './AgentCard';

export interface Agent {
    id: string;
    name: string;
    title: string;
    phone: string;
    email: string;
    image: string;
    listings: number;
}

export interface AgentSectionProps {
    agents?: Agent[];
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate';
    title?: string;
    subtitle?: string;
}

export const AgentSection: React.FC<AgentSectionProps & { id?: string }> = ({
    agents,
    id,
    variant = 'default',
    title = 'Our Team',
    subtitle = 'Meet our experienced real estate professionals.',
}) => {
    const displayAgents = (agents && agents.length > 0) ? agents : (mockAgents as Agent[]);

    if (variant === 'luxury') {
        return (
            <section id={id || 'about'} className="py-24 bg-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-amber-500" />
                        <span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Our Advisors</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic mb-4">{title}</h2>
                    {subtitle && <p className="text-white/40 mb-16 text-lg">{subtitle}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {displayAgents.map(a => (
                            <AgentCard key={a.id} agent={a} variant="luxury" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'corporate') {
        return (
            <section id={id || 'about'} className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                        {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayAgents.map(a => (
                            <AgentCard key={a.id} agent={a} variant="corporate" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'minimal') {
        return (
            <section id={id || 'about'} className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-light text-slate-900">{title}</h2>
                    {subtitle && <p className="text-slate-400 mt-2">{subtitle}</p>}
                    <div className="h-px w-16 bg-slate-300 mt-6 mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {displayAgents.map(a => (
                            <AgentCard key={a.id} agent={a} variant="minimal" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Default
    return (
        <section id={id || 'about'} className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.3em]">Experts</span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-3">{title}</h2>
                    {subtitle && <p className="text-slate-400 mt-3 max-w-lg mx-auto">{subtitle}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayAgents.map(a => (
                        <AgentCard key={a.id} agent={a} variant="default" />
                    ))}
                </div>
            </div>
        </section>
    );
};
