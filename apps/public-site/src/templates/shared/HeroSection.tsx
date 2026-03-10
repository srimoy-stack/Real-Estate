'use client';

import React from 'react';

interface HeroSectionProps {
    variant?: 'default' | 'luxury' | 'agent' | 'corporate' | 'minimal';
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
    agentName?: string;
    agentTitle?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    variant = 'default',
    title = 'Find Your Dream Home',
    subtitle = 'Discover exceptional properties in the most sought-after locations.',
    ctaText = 'Browse Listings',
    ctaHref = '/listings',
    agentName,
    agentTitle,
}) => {

    if (variant === 'luxury') {
        return (
            <section className="relative min-h-[90vh] flex items-center bg-slate-950 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/50 rounded-bl-[120px]" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-px w-12 bg-amber-500" />
                            <span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Luxury Collection</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                            {title.split(' ').map((w, i) => (
                                <span key={i} className={i % 2 === 0 ? 'block' : 'block text-amber-400 italic'}>{w} </span>
                            ))}
                        </h1>
                        <p className="text-white/50 text-lg mt-8 max-w-lg font-light leading-relaxed">{subtitle}</p>
                        <div className="flex gap-4 mt-12">
                            <a href={ctaHref} className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-full transition-all">{ctaText}</a>
                            <a href="#featured" className="px-10 py-4 border border-white/20 hover:border-white/50 text-white font-bold text-sm uppercase tracking-widest rounded-full transition-all">View Collection</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'agent') {
        return (
            <section className="relative min-h-[80vh] flex items-center bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Your Trusted Advisor</span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">{agentName || 'Sarah Mitchell'}</h1>
                        <p className="text-slate-400 text-lg mt-2 font-medium">{agentTitle || 'Senior Real Estate Agent'}</p>
                        <p className="text-slate-500 mt-6 leading-relaxed max-w-lg">{subtitle}</p>
                        <div className="flex gap-4 mt-10">
                            <a href={ctaHref} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-slate-200">{ctaText}</a>
                            <a href="/contact" className="px-8 py-4 border border-slate-200 hover:border-slate-400 text-slate-600 font-bold text-sm rounded-2xl transition-all">Contact Me</a>
                        </div>
                        <div className="flex gap-8 mt-12 pt-8 border-t border-slate-100">
                            <div><p className="text-3xl font-black text-slate-900">150+</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Properties Sold</p></div>
                            <div><p className="text-3xl font-black text-slate-900">12</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years Experience</p></div>
                            <div><p className="text-3xl font-black text-slate-900">$40M</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Volume</p></div>
                        </div>
                    </div>
                    <div className="aspect-[3/4] bg-slate-100 rounded-[60px] overflow-hidden flex items-center justify-center">
                        <span className="text-slate-400">Agent Portrait</span>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'corporate') {
        return (
            <section className="relative min-h-[70vh] flex items-center bg-gradient-to-b from-blue-950 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full mb-8">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Trusted Since 1995</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter max-w-4xl mx-auto leading-tight">{title}</h1>
                    <p className="text-blue-200/60 text-lg mt-6 max-w-2xl mx-auto">{subtitle}</p>
                    <div className="flex justify-center gap-4 mt-10">
                        <a href={ctaHref} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-2xl shadow-blue-600/30">{ctaText}</a>
                    </div>
                    <div className="grid grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto">
                        {[{ n: '500+', l: 'Active Listings' }, { n: '200+', l: 'Agents' }, { n: '50+', l: 'Offices' }, { n: '$2.5B', l: 'Annual Sales' }].map(s => (
                            <div key={s.l}><p className="text-3xl font-black text-white">{s.n}</p><p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-widest mt-1">{s.l}</p></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'minimal') {
        return (
            <section className="min-h-[65vh] flex items-end bg-white">
                <div className="max-w-5xl mx-auto px-6 pb-20 w-full">
                    <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tight leading-tight">{title}</h1>
                    <div className="h-px w-20 bg-slate-900 mt-8" />
                    <p className="text-slate-400 text-lg mt-6 max-w-lg">{subtitle}</p>
                    <a href={ctaHref} className="inline-block mt-10 text-sm font-medium text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-slate-600 hover:border-slate-600 transition-colors">{ctaText} →</a>
                </div>
            </section>
        );
    }

    // Default
    return (
        <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
                <div className="max-w-3xl">
                    <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">✦ Premium Real Estate</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95]">{title}</h1>
                    <p className="text-white/70 text-lg mt-6 max-w-xl">{subtitle}</p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <a href={ctaHref} className="px-10 py-4 bg-white hover:bg-white/90 text-indigo-700 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-black/20">{ctaText}</a>
                        <a href="#search" className="px-10 py-4 border-2 border-white/30 hover:border-white/60 text-white font-bold text-sm uppercase tracking-widest rounded-2xl transition-all">Advanced Search</a>
                    </div>
                </div>
            </div>
        </section>
    );
};
