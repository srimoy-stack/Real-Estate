'use client';

import React from 'react';
import Link from 'next/link';
import { useWebsite } from '../../lib/tenant/website-context';

export const Footer = () => {
    const website = useWebsite();
    const footerLinks = website.navigation.footerLinks || [];

    return (
        <footer className="pt-24 pb-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20">

                    {/* Column 1: About */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white font-black text-base italic leading-none">A</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                                {website.brandName || 'Antigravity'}
                            </span>
                        </Link>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Redefining the real estate experience through innovation, integrity, and unparalleled service across Canada&apos;s most desirable markets.
                        </p>
                        <div className="flex items-center gap-4">
                            {['fb', 'tw', 'ig', 'ln'].map(s => (
                                <a key={s} href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all">
                                    <span className="text-[10px] font-black uppercase">{s}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Communities */}
                    <div className="space-y-8">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Communities</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Toronto', slug: 'toronto' },
                                { name: 'Vancouver', slug: 'vancouver' },
                                { name: 'Mississauga', slug: 'mississauga' },
                                { name: 'Muskoka', slug: 'muskoka' }
                            ].map(item => (
                                <li key={item.slug}>
                                    <Link href={`/communities/${item.slug}`} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors uppercase text-xs tracking-wider">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Quick Links */}
                    <div className="space-y-8">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Quick Links</h4>
                        <ul className="space-y-4">
                            {footerLinks.filter(l => l.isVisible).sort((a, b) => a.order - b.order).map(item => (
                                <li key={item.id}>
                                    <Link href={item.href} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors uppercase text-xs tracking-wider">{item.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="space-y-8">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Get In Touch</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <p className="font-bold text-slate-700">1-800-555-0199</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <p className="font-bold text-slate-700">support@antigravity.realty</p>
                            </div>
                        </div>
                        <div className="pt-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subscribe to Insider</p>
                                <div className="flex gap-2">
                                    <input type="email" placeholder="Your Email" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all" />
                                    <button className="bg-slate-900 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-medium text-slate-400">
                        &copy; {new Date().getFullYear()} {website.brandName || 'Antigravity'} Realty Group. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status: Optimal</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
