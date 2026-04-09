'use client';

import React from 'react';
import Link from 'next/link';
import { useWebsite } from '../../lib/tenant/website-context';

export const Footer = () => {
    const website = useWebsite();
    const footerLinks = website.navigation.footerLinks || [];
    const brandName = website.brandName || 'SquareFT';

    return (
        <footer className="pt-24 pb-12 bg-[#fafafa] border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
                    {/* Column 1: Brand & About */}
                    <div className="space-y-8">
                        <Link href="/" className="inline-block group">
                            <div className="h-[48px] overflow-hidden flex items-start">
                                <img
                                    src="/logo.png"
                                    alt={brandName}
                                    className="h-[140px] w-auto object-contain object-top transition-transform duration-500 group-hover:scale-105 origin-left"
                                />
                            </div>
                        </Link>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                            Luxury commercial and residential real estate across Canada. Exceptional service driven by data and local expertise.
                        </p>
                        <div className="flex items-center gap-3">
                            {['fb', 'tw', 'ig', 'ln'].map(s => (
                                <a key={s} href="#" className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#4F46E5] hover:border-[#4F46E5]/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-[10px] font-bold uppercase">{s}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Search */}
                    <div className="space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 border-l-2 border-[#4F46E5] pl-4">Communities</h4>
                        <ul className="space-y-4 pl-4">
                            {[
                                { name: 'Toronto, ON', slug: 'toronto' },
                                { name: 'Vancouver, BC', slug: 'vancouver' },
                                { name: 'Montreal, QC', slug: 'montreal' },
                                { name: 'Calgary, AB', slug: 'calgary' }
                            ].map(item => (
                                <li key={item.slug}>
                                    <Link href={`/communities/${item.slug}`} className="text-slate-500 hover:text-[#4F46E5] text-xs font-bold transition-colors uppercase tracking-wider">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Navigation */}
                    <div className="space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 border-l-2 border-[#4F46E5] pl-4">Corporate</h4>
                        <ul className="space-y-4 pl-4">
                            {footerLinks.filter(l => l.isVisible).sort((a, b) => a.order - b.order).map(item => (
                                <li key={item.id}>
                                    <Link href={item.href} className="text-slate-500 hover:text-[#4F46E5] text-xs font-bold transition-colors uppercase tracking-wider">{item.label}</Link>
                                </li>
                            ))}
                            <li><Link href="/about" className="text-slate-500 hover:text-[#4F46E5] text-xs font-bold transition-colors uppercase tracking-wider">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Subscribe */}
                    <div className="space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 border-l-2 border-[#4F46E5] pl-4">Concierge</h4>
                        <div className="space-y-6 pl-4">
                            <div className="group">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#4F46E5]/60 mb-1">Direct Line</p>
                                <p className="text-slate-900 font-bold text-sm group-hover:text-[#4F46E5] transition-colors cursor-pointer">1-800-555-0199</p>
                            </div>
                            <div className="group">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#4F46E5]/60 mb-1">Support Email</p>
                                <p className="text-slate-900 font-bold text-sm group-hover:text-[#4F46E5] transition-colors cursor-pointer">support@squareft.com</p>
                            </div>
                        </div>
                        <div className="pt-2 pl-4">
                            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">Newsletter</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="email" 
                                        placeholder="Email" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/10 transition-all" 
                                    />
                                    <button className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-[#4F46E5] transition-all duration-300 shadow-lg shadow-slate-200">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} {brandName} Realty Group.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Privacy</Link>
                            <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Terms</Link>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full">
                        <div className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">System Ready</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
