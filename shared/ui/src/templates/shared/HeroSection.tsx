'use client';

import React from 'react';

import { useTemplate } from '../TemplateContext';

export interface HeroSectionProps {
    variant?: 'default' | 'luxury' | 'agent' | 'corporate' | 'minimal' | 'agent-spotlight' | 'property-search' | 'property-search-v2' | 'sidebar-profile' | 'split-agent' | 'nature-immersive';
    headline?: string;
    subheadline?: string;
    buttonText?: string;
    buttonHref?: string;
    // Aliases for consistency with other components
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
    agentName?: string;
    agentTitle?: string;
    agentDre?: string;
    agentImage?: string;
    bgImage?: string;
    content?: {
        headline?: string;
        subheadline?: string;
        buttonText?: string;
        buttonHref?: string;
    };
    [key: string]: any;
}

export const HeroSection: React.FC<HeroSectionProps & { id?: string }> = ({
    variant = 'default',
    id,
    headline,
    subheadline,
    buttonText,
    buttonHref,
    title: titleProp,
    subtitle: subtitleProp,
    ctaText: ctaTextProp,
    ctaHref: ctaHrefProp,
    agentName,
    agentTitle,
    agentDre,
    agentImage,
    bgImage,
    content, // Support both flat props and content prop
}) => {
    const { onNavigate } = useTemplate();
    const title = content?.headline || headline || titleProp || 'Find Your Dream Home';
    const subtitle = content?.subheadline || subheadline || subtitleProp || 'Discover exceptional properties in the most sought-after locations.';
    const ctaText = content?.buttonText || buttonText || ctaTextProp || 'Browse Listings';
    const ctaHref = content?.buttonHref || buttonHref || ctaHrefProp || '/listings';

    // Variant-specific default backgrounds matching WP Residence designs
    const variantBgDefaults: Record<string, string> = {
        'default': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600',
        'agent-spotlight': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1600', // city skyline
        'property-search': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600', // couple/people with home
        'sidebar-profile': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600', // luxury mansion
        'nature-immersive': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1600', // forest & river nature
    };
    const heroBg = bgImage || variantBgDefaults[variant] || variantBgDefaults['default'];

    const handleCtaClick = (e: React.MouseEvent, href: string) => {
        if (onNavigate && href && !href.startsWith('#')) {
            e.preventDefault();
            onNavigate(href);
        }
    };

    // ═══════════════════════════════════════════════
    //  DESIGN 1 — Agent Spotlight (Sam Davis style)
    //  Full-width city backdrop, large agent photo left, contact form right, name watermark
    // ═══════════════════════════════════════════════
    if (variant === 'agent-spotlight') {
        return (
            <section id={id || 'home'} className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* City background */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />

                {/* Social icons bar */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
                    {['M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'].map((d, i) => (
                        <a key={i} href="#" className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>
                        </a>
                    ))}
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                    {/* Left: Agent name watermark + photo area */}
                    <div className="relative">
                        <div className="absolute bottom-0 left-0 text-[120px] md:text-[180px] font-black text-white/[0.07] leading-none tracking-tighter uppercase select-none pointer-events-none">
                            {(agentName || 'SAM DAVIS').split(' ').map((w, i) => <span key={i} className="block">{w}</span>)}
                        </div>
                        <div className="relative h-[500px] w-[380px] rounded-t-[60px] overflow-hidden bg-gradient-to-t from-slate-900/50 to-transparent mx-auto lg:mx-0 flex items-end justify-center">
                            {agentImage ? (
                                <img src={agentImage} alt={agentName || 'Agent'} className="absolute inset-0 w-full h-full object-cover object-top" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Add Agent Image URL</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Contact form */}
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md ml-auto">
                        <h3 className="text-lg font-black text-slate-900 text-center mb-1">Arrange a meeting with {agentName || 'Your Agent'}</h3>
                        <p className="text-sm text-slate-400 text-center mb-6">to buy, sell or rent your home.</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input placeholder="Name" className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                            <input placeholder="Last Name" className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input placeholder="City" className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                            <input placeholder="State" className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input placeholder="Email" className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                            <input placeholder="Mobile" className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                        </div>
                        <textarea placeholder="Message" rows={3} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm mb-4 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none" />
                        <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-emerald-600/20">Send Email</button>
                    </div>
                </div>
            </section>
        );
    }

    // ═══════════════════════════════════════════════
    //  DESIGN 2 — Property Search (Toronto style)
    //  Centered headline with category tabs + multi-field search bar
    // ═══════════════════════════════════════════════
    if (variant === 'property-search') {
        return (
            <section id={id || 'home'} className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background with Dark Overlay */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full text-center">
                    {/* Centered Typography */}
                    <div className="max-w-4xl mx-auto mb-16">
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl uppercase">
                            {title}
                        </h1>
                        <p className="text-white/80 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium">
                            {subtitle}
                        </p>
                    </div>

                    {/* Search Component Container */}
                    <div className="max-w-5xl mx-auto mt-12">
                        {/* Overlapping Tabs */}
                        <div className="flex justify-center -mb-px relative z-20">
                            <div className="flex bg-slate-900/40 backdrop-blur-md p-1.5 rounded-t-2xl border-x border-t border-white/10">
                                {[
                                    { id: 'sales', label: 'Sales' },
                                    { id: 'rentals', label: 'Rentals' },
                                    { id: 'invest', label: 'Invest' }
                                ].map((tab, i) => (
                                    <button
                                        key={tab.id}
                                        className={`px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${i === 0 ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <div className="text-left space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Categories</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                            <option>Property Category</option>
                                            <option>Residential</option>
                                            <option>Commercial</option>
                                            <option>Land</option>
                                            <option>Luxury</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">City</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                            <option>Property City</option>
                                            <option>Toronto</option>
                                            <option>Vancouver</option>
                                            <option>Montreal</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Beds & Baths</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                            <option>Beds | Baths</option>
                                            <option>1+ Beds</option>
                                            <option>2+ Beds</option>
                                            <option>3+ Beds</option>
                                            <option>4+ Beds</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Price</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                                <option>Sale Price</option>
                                                <option>$100k - $500k</option>
                                                <option>$500k - $1M</option>
                                                <option>$1M - $5M</option>
                                                <option>$5M+</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        <button className="h-[52px] px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 group active:scale-95">
                                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <span className="hidden lg:inline">SEARCH</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'property-search-v2') {
        return (
            <section id={id || 'home'} className="relative min-h-screen flex items-center overflow-hidden">
                {/* Visual Background with Motion Overlay */}
                <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-105" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full flex flex-col items-center">
                    {/* Header Group */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <span className="inline-block px-4 py-1.5 bg-indigo-600/20 backdrop-blur-md rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Premium Search Portal</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight max-w-4xl mx-auto uppercase">
                            {title}
                        </h1>
                        <p className="text-white/70 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    {/* Main Search Interface */}
                    <div className="w-full max-w-5xl bg-white/10 backdrop-blur-3xl rounded-[3rem] p-2 border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-500 delay-200">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
                            {/* Inner Tabs Style */}
                            <div className="flex gap-4 mb-10 border-b border-slate-100 pb-6">
                                {[
                                    { id: 'all', label: 'All Properties' },
                                    { id: 'residential', label: 'Residential' },
                                    { id: 'commercial', label: 'Commercial' },
                                    { id: 'luxury', label: 'Luxury Estates' }
                                ].map((tab, i) => (
                                    <button
                                        key={tab.id}
                                        className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Location</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="City, Zip or Address"
                                            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Property Type</label>
                                    <div className="relative group">
                                        <select className="w-full appearance-none px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                            <option>All Types</option>
                                            <option>Single Family</option>
                                            <option>Apartment</option>
                                            <option>Condo</option>
                                            <option>Townhouse</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Price Range</label>
                                    <div className="relative group">
                                        <select className="w-full appearance-none px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                            <option>No Max Price</option>
                                            <option>$500k+</option>
                                            <option>$1M+</option>
                                            <option>$2M+</option>
                                            <option>$5M+</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        Search Properties
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ═══════════════════════════════════════════════
    //  DESIGN 3 — Sidebar Profile (Seattle style)
    //  Full background image, centered text + search (sidebar nav goes in header variant)
    // ═══════════════════════════════════════════════
    if (variant === 'sidebar-profile') {
        return (
            <section id={id || 'home'} className="relative min-h-[90vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 flex flex-col items-center justify-center w-full px-8 py-32 text-center">
                    <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-4 italic">Exclusive</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight max-w-3xl">
                        {title}
                    </h1>
                    <p className="text-white/60 text-sm mt-4 font-medium">
                        {agentName || 'Simone Harrisson'} | {agentDre || 'SE DRE# 12567807'}
                    </p>

                    {/* Tabs + Search */}
                    <div className="mt-10 w-full max-w-2xl">
                        <div className="flex justify-center gap-6 mb-4">
                            {['Rentals', 'Sales'].map((tab, i) => (
                                <button key={tab} className={`text-sm font-bold pb-2 transition-all ${i === 0 ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/50 hover:text-white border-b-2 border-transparent'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="bg-white rounded-xl p-4 flex gap-3 shadow-2xl">
                            <select className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-400 outline-none">
                                <option>Categories</option>
                            </select>
                            <input placeholder="Enter an address, state, city, area or zip code" className="flex-[2] rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none" />
                            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors whitespace-nowrap">Search Listings</button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }


    // ═══════════════════════════════════════════════
    //  DESIGN 4 — Split Agent (Baltimore / Isabella style)
    //  Clean white left side with bold agent name, photo on right
    // ═══════════════════════════════════════════════
    if (variant === 'split-agent') {
        return (
            <section id={id || 'home'} className="relative min-h-[80vh] flex items-center bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text content */}
                    <div>
                        <span className="text-rose-400 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Luxury Real Estate</span>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
                            {(agentName || 'ISABELLA EMERALD').split(' ').map((w, i) => <span key={i} className="block">{w}</span>)}
                        </h1>
                        <p className="text-slate-500 mt-8 leading-relaxed max-w-md text-[15px]">
                            {subtitle}
                        </p>

                        {/* Search bar */}
                        <div className="mt-8 flex gap-3 max-w-lg">
                            <input
                                placeholder="Enter an address, state, city, area or zip code"
                                className="flex-1 rounded-lg border border-slate-200 px-4 py-3.5 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                            />
                            <button className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Right: Agent photo */}
                    <div className="relative">
                        <div className="aspect-[3/4] bg-gradient-to-b from-rose-50 to-rose-100 rounded-t-full overflow-hidden flex items-end justify-center max-w-md mx-auto relative">
                            {agentImage ? (
                                <img src={agentImage} alt={agentName || 'Agent'} className="absolute inset-0 w-full h-full object-cover object-top" />
                            ) : (
                                <div className="text-center py-20 flex flex-col items-center gap-2">
                                    <svg className="w-12 h-12 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span className="text-rose-300 text-[10px] font-bold uppercase tracking-widest">Add Agent Image URL</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom banner */}
                <div className="absolute bottom-0 left-0 right-0 bg-teal-700 py-6 px-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p className="text-white font-bold text-lg leading-snug">Let&apos;s go on a voyage to discover<br />your perfect home</p>
                        <p className="text-teal-200/80 text-sm leading-relaxed">Our belief in the transformative power of real estate motivates us to ultimately redefine the very essence of what it means.</p>
                    </div>
                </div>
            </section>
        );
    }

    // ═══════════════════════════════════════════════
    //  DESIGN 5 — Nature Immersive (Montana style)
    //  Full-width nature photo, centered headline + search bar, green theme
    // ═══════════════════════════════════════════════
    if (variant === 'nature-immersive') {
        return (
            <section id={id || 'home'} className="relative min-h-[90vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 w-full text-center">
                    <span className="text-emerald-300 text-xs font-black uppercase tracking-[0.35em] mb-6 block drop-shadow-lg">
                        {agentTitle || 'LAND REAL ESTATE DEMO'}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
                        {title}
                    </h1>
                    <p className="text-white/70 text-lg mt-6 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                        {subtitle}
                    </p>

                    {/* Search bar */}
                    <div className="mt-10 bg-white rounded-2xl p-5 shadow-2xl max-w-3xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                            <input
                                placeholder="Search by location"
                                className="rounded-lg border border-slate-200 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <select className="rounded-lg border border-slate-200 px-4 py-3.5 text-sm text-slate-400 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option>All Land</option>
                                <option>Farm</option>
                                <option>Ranch</option>
                            </select>
                            <select className="rounded-lg border border-slate-200 px-4 py-3.5 text-sm text-slate-400 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option>Sell or Lease</option>
                                <option>For Sale</option>
                                <option>For Lease</option>
                            </select>
                            <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'luxury') {
        return (
            <section id={id || 'home'} className="relative min-h-[90vh] flex items-center bg-slate-950 overflow-hidden">
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
                            <a href={ctaHref} onClick={(e) => handleCtaClick(e, ctaHref)} className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-full transition-all">{ctaText}</a>
                            <a href="#featured" onClick={(e) => handleCtaClick(e, '#featured')} className="px-10 py-4 border border-white/20 hover:border-white/50 text-white font-bold text-sm uppercase tracking-widest rounded-full transition-all">View Collection</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'agent') {
        return (
            <section id={id || 'home'} className="relative min-h-[80vh] flex items-center bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Your Trusted Advisor</span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">{agentName || 'Sarah Mitchell'}</h1>
                        <p className="text-slate-400 text-lg mt-2 font-medium">{agentTitle || 'Senior Real Estate Agent'}</p>
                        <p className="text-slate-500 mt-6 leading-relaxed max-w-lg">{subtitle}</p>
                        <div className="flex gap-4 mt-10">
                            <a href={ctaHref} onClick={(e) => handleCtaClick(e, ctaHref)} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-slate-200">{ctaText}</a>
                            <a href="/contact" onClick={(e) => handleCtaClick(e, '/contact')} className="px-8 py-4 border border-slate-200 hover:border-slate-400 text-slate-600 font-bold text-sm rounded-2xl transition-all">Contact Me</a>
                        </div>
                        <div className="flex gap-8 mt-12 pt-8 border-t border-slate-100">
                            <div><p className="text-3xl font-black text-slate-900">150+</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Properties Sold</p></div>
                            <div><p className="text-3xl font-black text-slate-900">12</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years Experience</p></div>
                            <div><p className="text-3xl font-black text-slate-900">$40M</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Volume</p></div>
                        </div>
                    </div>
                    <div className="aspect-[3/4] bg-slate-100 rounded-[60px] overflow-hidden flex items-center justify-center relative">
                        {agentImage ? (
                            <img src={agentImage} alt={agentName || 'Agent'} className="absolute inset-0 w-full h-full object-cover object-top" />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Add Agent Image URL</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'corporate') {
        return (
            <section id={id || 'home'} className="relative min-h-[70vh] flex items-center bg-gradient-to-b from-blue-950 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full mb-8">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Trusted Since 1995</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter max-w-4xl mx-auto leading-tight">{title}</h1>
                    <p className="text-blue-200/60 text-lg mt-6 max-w-2xl mx-auto">{subtitle}</p>
                    <div className="flex justify-center gap-4 mt-10">
                        <a href={ctaHref} onClick={(e) => handleCtaClick(e, ctaHref)} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-2xl shadow-blue-600/30">{ctaText}</a>
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
            <section id={id || 'home'} className="min-h-[65vh] flex items-end bg-white">
                <div className="max-w-5xl mx-auto px-6 pb-20 w-full">
                    <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tight leading-tight">{title}</h1>
                    <div className="h-px w-20 bg-slate-900 mt-8" />
                    <p className="text-slate-400 text-lg mt-6 max-w-lg">{subtitle}</p>
                    <a href={ctaHref} onClick={(e) => handleCtaClick(e, ctaHref)} className="inline-block mt-10 text-sm font-medium text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-slate-600 hover:border-slate-600 transition-colors">{ctaText} →</a>
                </div>
            </section>
        );
    }

    // Default
    return (
        <section id={id || 'home'} className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
                <div className="max-w-3xl">
                    <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">✦ Premium Real Estate</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95]">{title}</h1>
                    <p className="text-white/70 text-lg mt-6 max-w-xl">{subtitle}</p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <a href={ctaHref} onClick={(e) => handleCtaClick(e, ctaHref)} className="px-10 py-4 bg-white hover:bg-white/90 text-indigo-700 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-black/20">{ctaText}</a>
                        <a href="#search" onClick={(e) => handleCtaClick(e, '#search')} className="px-10 py-4 border-2 border-white/30 hover:border-white/60 text-white font-bold text-sm uppercase tracking-widest rounded-2xl transition-all">Advanced Search</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

HeroSection.displayName = 'HeroSection';

