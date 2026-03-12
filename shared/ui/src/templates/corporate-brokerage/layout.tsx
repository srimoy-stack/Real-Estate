'use client';

import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center"><span className="text-white font-black text-sm">CB</span></div>
                <span className="text-lg font-bold text-slate-900">CorporateBrokerage</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
                {[{ l: 'Home', h: '/' }, { l: 'Properties', h: '/listings' }, { l: 'Offices', h: '#' }, { l: 'Agents', h: '#' }, { l: 'About', h: '#' }, { l: 'Contact', h: '#' }].map(n => (
                    <Link key={n.l} href={n.h} className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">{n.l}</Link>
                ))}
            </nav>
            <div className="flex items-center gap-3">
                <span className="hidden lg:block text-sm text-slate-500 font-medium">1-800-REALTY</span>
                <button className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-all">List With Us</button>
            </div>
        </div>
    </header>
);

export const Footer: React.FC = () => (
    <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"><span className="text-white font-black text-sm">CB</span></div>
                        <span className="text-lg font-bold">CorporateBrokerage</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">Canada's premier real estate brokerage with 50+ offices coast-to-coast. Trusted since 1995.</p>
                </div>
                {[
                    { title: 'Services', items: ['Residential', 'Commercial', 'Property Management', 'Consulting'] },
                    { title: 'Company', items: ['About', 'Careers', 'Press', 'Investor Relations'] },
                    { title: 'Support', items: ['Help Center', 'Contact', 'Agent Portal', 'Privacy Policy'] },
                ].map(c => (
                    <div key={c.title}>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{c.title}</h4>
                        <div className="space-y-2">{c.items.map(i => <a key={i} href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">{i}</a>)}</div>
                    </div>
                ))}
            </div>
            <div className="border-t border-slate-800 pt-8 flex justify-between items-center">
                <p className="text-slate-600 text-xs">© 2026 CorporateBrokerage Inc. All rights reserved.</p>
                <div className="flex gap-4">{['LinkedIn', 'Twitter', 'Instagram'].map(s => <a key={s} href="#" className="text-slate-600 hover:text-white text-xs transition-colors">{s}</a>)}</div>
            </div>
        </div>
    </footer>
);

export const TemplateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
);
