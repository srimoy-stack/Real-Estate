import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTemplate } from '../TemplateContext';

export const Header: React.FC = () => {
    const { navigation, onNavigate, organizationName, currentPageSlug, isEditor } = useTemplate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (isEditor) return;
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [isEditor]);

    const handleClick = (e: React.MouseEvent, slug: string) => {
        if (onNavigate) {
            e.preventDefault();
            onNavigate(slug);
        }
        setMenuOpen(false);
    };

    return (
        <>
            <header
                className={`${isEditor ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50 transition-all duration-500 ${(scrolled || isEditor)
                    ? 'bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/10 shadow-2xl shadow-black/30'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-8 h-24 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" onClick={(e) => handleClick(e, '/')} className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-amber-500/60 rounded-sm flex items-center justify-center group-hover:border-amber-400 transition-colors">
                                <span className="text-amber-400 font-black text-xl tracking-tighter italic">LE</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-sm" />
                        </div>
                        <div>
                            <span className="text-white text-lg font-black tracking-[0.2em] uppercase block leading-tight">{organizationName?.split(' ')[0] || 'Luxury'}</span>
                            <span className="text-amber-400/70 text-[10px] font-bold tracking-[0.4em] uppercase">{organizationName?.split(' ')[1] || 'Estate'}</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navigation?.map((link: any, idx) => (
                            <Link
                                key={link.slug + idx}
                                href={link.slug}
                                onClick={(e) => handleClick(e, link.slug)}
                                className={`relative text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 group ${currentPageSlug === link.slug ? 'text-amber-400' : 'text-white/50 hover:text-amber-400'}`}
                            >
                                {link.label}
                                <span className={`absolute -bottom-1 left-0 h-px bg-amber-500 transition-all duration-300 ${currentPageSlug === link.slug ? 'w-full' : 'w-0 group-hover:w-full'}`} />
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
                            className="md:hidden p-2 text-white/60 hover:text-amber-400 transition-colors"
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
                        {navigation?.map((link: any, idx) => (
                            <Link
                                key={link.slug + idx}
                                href={link.slug}
                                onClick={(e) => handleClick(e, link.slug)}
                                className={`text-2xl font-black uppercase tracking-[0.15em] transition-colors ${currentPageSlug === link.slug ? 'text-amber-400' : 'text-white/70 hover:text-amber-400'}`}
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
