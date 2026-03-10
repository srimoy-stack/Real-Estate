'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    { label: 'Luxury Properties', href: '/listings?type=luxury' },
    { label: 'Agents', href: '/agents' },
    { label: 'Communities', href: '/communities' },
    { label: 'Contact', href: '/contact' },
];

export const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                        ? 'bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/10 shadow-2xl shadow-black/30'
                        : 'bg-transparent'
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-8 h-24 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-amber-500/60 rounded-sm flex items-center justify-center group-hover:border-amber-400 transition-colors">
                                <span className="text-amber-400 font-black text-xl tracking-tighter italic">LE</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-sm" />
                        </div>
                        <div>
                            <span className="text-white text-lg font-black tracking-[0.2em] uppercase block leading-tight">Luxury</span>
                            <span className="text-amber-400/70 text-[10px] font-bold tracking-[0.4em] uppercase">Estate</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative text-[11px] font-bold text-white/50 hover:text-amber-400 uppercase tracking-[0.2em] transition-colors duration-300 group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}
                    </nav>

                    {/* CTA + Mobile */}
                    <div className="flex items-center gap-6">
                        <a
                            href="/contact"
                            className="hidden md:inline-flex items-center gap-2 px-7 py-3 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 text-amber-400 font-bold text-[10px] uppercase tracking-[0.25em] rounded-sm transition-all duration-300"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Book Private Viewing
                        </a>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="lg:hidden p-2 text-white/60 hover:text-amber-400 transition-colors"
                        >
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h12M4 18h8" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center lg:hidden animate-in fade-in duration-300">
                    <nav className="flex flex-col items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="text-2xl font-black text-white/70 hover:text-amber-400 uppercase tracking-[0.15em] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a href="/contact" className="mt-8 px-10 py-4 bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest rounded-sm">
                            Book Private Viewing
                        </a>
                    </nav>
                </div>
            )}
        </>
    );
};
