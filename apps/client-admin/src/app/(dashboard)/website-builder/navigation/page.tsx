'use client';

import React, { useState } from 'react';
import { NavLink } from '@repo/types';

const initialHeaderLinks: NavLink[] = [
    {
        id: 'nav-1', label: 'Home', href: '/', isExternal: false, order: 0,
        isVisible: false
    },
    {
        id: 'nav-2', label: 'Listings', href: '/search', isExternal: false, order: 1,
        isVisible: false
    },
    {
        id: 'nav-3', label: 'Market Blog', href: '/blog', isExternal: false, order: 2,
        isVisible: false
    },
    {
        id: 'nav-4', label: 'About Us', href: '/pages/about-us', isExternal: false, order: 3,
        isVisible: false
    },
];

const initialFooterLinks: NavLink[] = [
    {
        id: 'fnav-1', label: 'Privacy Policy', href: '/pages/privacy', isExternal: false, order: 0,
        isVisible: false
    },
    {
        id: 'fnav-2', label: 'Terms of Service', href: '/pages/terms', isExternal: false, order: 1,
        isVisible: false
    },
    {
        id: 'fnav-3', label: 'Contact', href: '/contact', isExternal: false, order: 2,
        isVisible: false
    },
    {
        id: 'fnav-4', label: 'Instagram', href: 'https://instagram.com', isExternal: true, order: 3,
        isVisible: false
    },
];

const SYSTEM_PAGES = [
    { label: 'Homepage', href: '/' },
    { label: 'Property Search', href: '/search' },
    { label: 'Market Insights (Blog)', href: '/blog' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Agent Directory', href: '/agents' },
];

const CUSTOM_PAGES = [
    { label: 'About Our Team', href: '/pages/about-us' },
    { label: 'Sustainable Housing', href: '/pages/sustainability' },
];

export default function NavigationManager() {
    const [headerLinks, setHeaderLinks] = useState<NavLink[]>(initialHeaderLinks);
    const [footerLinks, setFooterLinks] = useState<NavLink[]>(initialFooterLinks);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeLocation, setActiveLocation] = useState<'header' | 'footer'>('header');

    const toggleExternal = (id: string, location: 'header' | 'footer') => {
        const updateLinks = (links: NavLink[]) =>
            links.map(link => link.id === id ? { ...link, isExternal: !link.isExternal } : link);

        if (location === 'header') setHeaderLinks(updateLinks(headerLinks));
        else setFooterLinks(updateLinks(footerLinks));
    };

    const removeLink = (id: string, location: 'header' | 'footer') => {
        if (location === 'header') setHeaderLinks(headerLinks.filter(l => l.id !== id));
        else setFooterLinks(footerLinks.filter(l => l.id !== id));
    };

    const moveLink = (index: number, direction: 'up' | 'down', location: 'header' | 'footer') => {
        const links = location === 'header' ? [...headerLinks] : [...footerLinks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= links.length) return;
        [links[index], links[targetIndex]] = [links[targetIndex], links[index]];
        const finalLinks = links.map((l, i) => ({ ...l, order: i }));
        if (location === 'header') setHeaderLinks(finalLinks);
        else setFooterLinks(finalLinks);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Site Map</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        Navigation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic font-serif">Authority</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Define the journey through your digital ecosystem. Orchestrate menu hierarchies across headers and footers.
                    </p>
                </div>
                <button className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10">
                    Propagate Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Header Navigation */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Header Menu</h2>
                        <button
                            onClick={() => { setActiveLocation('header'); setIsAddModalOpen(true); }}
                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-4 space-y-3">
                        {headerLinks.map((link, index) => (
                            <div key={link.id} className="group flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button onClick={() => moveLink(index, 'up', 'header')} className="text-slate-300 hover:text-indigo-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg></button>
                                    <button onClick={() => moveLink(index, 'down', 'header')} className="text-slate-300 hover:text-indigo-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></button>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{link.label}</p>
                                    <p className="text-[10px] font-bold text-slate-400 italic font-inter">{link.href}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleExternal(link.id, 'header')}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${link.isExternal ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                    >
                                        {link.isExternal ? 'External' : 'Internal'}
                                    </button>
                                    <button onClick={() => removeLink(link.id, 'header')} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Footer Links</h2>
                        <button
                            onClick={() => { setActiveLocation('footer'); setIsAddModalOpen(true); }}
                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                            + Add Link
                        </button>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-4 space-y-3">
                        {footerLinks.map((link, index) => (
                            <div key={link.id} className="group flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button onClick={() => moveLink(index, 'up', 'footer')} className="text-slate-300 hover:text-indigo-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg></button>
                                    <button onClick={() => moveLink(index, 'down', 'footer')} className="text-slate-300 hover:text-indigo-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></button>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{link.label}</p>
                                    <p className="text-[10px] font-bold text-slate-400 italic font-inter">{link.href}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleExternal(link.id, 'footer')}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${link.isExternal ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                    >
                                        {link.isExternal ? 'External' : 'Internal'}
                                    </button>
                                    <button onClick={() => removeLink(link.id, 'footer')} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Simulation */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">Link <span className="text-indigo-600">Composer</span></h3>
                                <p className="text-slate-400 text-sm font-bold mt-1">Select a destination for your {activeLocation} menu.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Pages</h4>
                                    <div className="space-y-2">
                                        {SYSTEM_PAGES.map(page => (
                                            <button key={page.href} className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-sm font-bold text-slate-700 transition-all border border-transparent hover:border-indigo-100">
                                                {page.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Custom Pages</h4>
                                    <div className="space-y-2">
                                        {CUSTOM_PAGES.map(page => (
                                            <button key={page.href} className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-sm font-bold text-slate-700 transition-all border border-transparent hover:border-emerald-100">
                                                {page.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Manual / External Link</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Link Label" className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                                    <input type="text" placeholder="https://..." className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                                </div>
                            </div>
                        </div>
                        <div className="p-10 bg-slate-50/50 flex gap-4">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-5 rounded-[24px] bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest">Cancel</button>
                            <button className="flex-1 py-5 rounded-[24px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl">Append Selection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
