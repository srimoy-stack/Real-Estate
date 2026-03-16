'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@repo/auth';
import { useWebsite } from '../../lib/tenant/website-context';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const { user } = useAuth();
    const website = useWebsite();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const headerLinks = website.navigation.headerLinks || [];

    const toggleExpanded = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4'}`}>
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10">
                <div className="flex items-center justify-between">

                    {/* Logo Section */}
                    <div className="flex-shrink-0 min-w-max mr-12">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white font-black text-xl italic leading-none">A</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-slate-900 hidden sm:block">
                                {website.brandName || 'Skyline'}<span className="text-indigo-600">Realty</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Section */}
                    <nav className="hidden xl:flex items-center gap-8">
                        {headerLinks.filter(l => l.isVisible).sort((a, b) => a.order - b.order).map((link) => (
                            <div
                                key={link.id}
                                className="relative group"
                                onMouseEnter={() => link.children?.length ? setActiveDropdown(link.id) : null}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    href={link.href}
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-1 py-4 ${link.href === '/map-search' ? 'text-slate-900 border-b-2 border-indigo-600/30' : 'text-slate-400 hover:text-indigo-600'
                                        }`}
                                >
                                    {link.href === '/map-search' && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    )}
                                    {link.label}
                                    {link.children && link.children.length > 0 && (
                                        <svg className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === link.id ? 'rotate-180 text-indigo-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {link.children && link.children.length > 0 && (
                                    <div className={`absolute top-full left-1/2 -translate-x-1/2 min-w-[240px] bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 p-2 transition-all duration-300 origin-top transform-gpu ${activeDropdown === link.id ? 'opacity-100 visible translate-y-2' : 'opacity-0 invisible -translate-y-2 scale-95'
                                        }`}>
                                        <div className="space-y-1">
                                            {link.children.sort((a, b) => a.order - b.order).map(child => (
                                                <Link
                                                    key={child.id}
                                                    href={child.href}
                                                    className="block px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100/50"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Action Side */}
                    <div className="flex items-center gap-6 flex-shrink-0 ml-12">
                        <a href="tel:+18005550199" className="hidden lg:flex items-center gap-3 text-xs font-black text-slate-900 group">
                            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors border border-slate-100">
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <span className="hidden xxl:inline">1-800-555-0199</span>
                        </a>

                        {user ? (
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                                <Link href="/saved-listings" className="h-9 px-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center transition-all shadow-sm hover:shadow-md border border-slate-50 group">
                                    <svg className="w-3.5 h-3.5 mr-2 text-indigo-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                    Saved
                                </Link>
                                <Link href="/account/saved-listings" className="h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </Link>
                            </div>
                        ) : (
                            <Link href="/login" className="h-11 px-8 bg-indigo-600 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center transition-all shadow-xl shadow-indigo-100">
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="xl:hidden p-2 text-slate-900 transition-transform active:scale-95"
                        >
                            {isMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div className={`fixed inset-0 top-[80px] bg-white z-40 xl:hidden transition-all duration-500 origin-top transform-gpu ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
                }`}>
                <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto space-y-4">
                    {headerLinks.filter(l => l.isVisible).sort((a, b) => a.order - b.order).map(link => (
                        <div key={link.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Link
                                    href={link.href}
                                    onClick={() => !link.children?.length && setIsMenuOpen(false)}
                                    className={`flex-1 text-xl font-black uppercase tracking-tight py-4 ${link.href === '/map-search' ? 'text-indigo-600' : 'text-slate-900'}`}
                                >
                                    {link.label}
                                </Link>
                                {link.children && link.children.length > 0 && (
                                    <button
                                        onClick={() => toggleExpanded(link.id)}
                                        className={`p-4 text-slate-400 transition-transform ${expandedItems.includes(link.id) ? 'rotate-180 text-indigo-600' : ''}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {link.children && expandedItems.includes(link.id) && (
                                <div className="pl-6 space-y-2 border-l-2 border-slate-100 animate-in slide-in-from-left duration-300">
                                    {link.children.map(child => (
                                        <Link
                                            key={child.id}
                                            href={child.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block py-3 text-sm font-black uppercase tracking-widest text-slate-500"
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="pt-10 space-y-4">
                        {!user && (
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black uppercase tracking-widest shadow-xl"
                            >
                                Sign In
                            </Link>
                        )}
                        <a href="tel:+18005550199" className="w-full h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-black text-sm border border-slate-100">
                            1-800-555-0199
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};
