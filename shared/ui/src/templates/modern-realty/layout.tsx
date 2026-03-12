'use client';

import React from 'react';
import Link from 'next/link';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export const Header: React.FC = () => (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-black text-lg">M</span>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter">Modern<span className="text-indigo-600">Realty</span></span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
                {navLinks.map(l => (
                    <Link key={l.href} href={l.href} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">{l.label}</Link>
                ))}
            </nav>
            <div className="flex items-center gap-4">
                <button className="hidden md:block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200">Get Started</button>
                <button className="md:hidden p-2 text-slate-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
        </div>
    </header>
);

export const Footer: React.FC = () => (
    <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div>
                    <span className="text-2xl font-black tracking-tighter">Modern<span className="text-indigo-400">Realty</span></span>
                    <p className="text-slate-400 text-sm mt-4 leading-relaxed">Transforming the way you discover and experience real estate.</p>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Company</h4>
                    <div className="space-y-3">{['About Us', 'Careers', 'Press'].map(i => <a key={i} href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">{i}</a>)}</div>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Properties</h4>
                    <div className="space-y-3">{['Buy', 'Sell', 'Rent', 'New Developments'].map(i => <a key={i} href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">{i}</a>)}</div>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Contact</h4>
                    <p className="text-sm text-slate-400">100 King St W, Toronto</p>
                    <p className="text-sm text-slate-400 mt-2">(416) 555-0100</p>
                    <p className="text-sm text-slate-400 mt-2">hello@modernrealty.ca</p>
                </div>
            </div>
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-xs">© 2026 ModernRealty. All rights reserved.</p>
                <div className="flex gap-6">{['Privacy', 'Terms', 'Cookies'].map(i => <a key={i} href="#" className="text-slate-500 hover:text-white text-xs transition-colors">{i}</a>)}</div>
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
