import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@repo/auth';
import { AuthModal } from '../../components/AuthModal';
import { useTemplate } from '../TemplateContext';

export const Header: React.FC = () => {
    const { navigation, onNavigate, organizationName, currentPageSlug, isEditor } = useTemplate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    useEffect(() => {
        if (isEditor) return; // Don't track scroll in editor
        const onScroll = () => setScrolled(window.scrollY > 50);
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
                    ? 'bg-[#0a1628]/95 backdrop-blur-xl shadow-2xl shadow-black/20'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="h-20 flex items-center justify-between">
                        {/* Logo / Agent Name */}
                        <Link href="/" onClick={(e) => handleClick(e, '/')} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <span className="text-white font-black text-lg">{organizationName?.charAt(0) || 'S'}</span>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-white font-bold text-lg tracking-tight block leading-tight">{organizationName || 'Sarah Mitchell'}</span>
                                <span className="text-amber-400/60 text-[9px] font-bold uppercase tracking-[0.3em]">Real Estate</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navigation?.map((link: any, idx) => (
                                <Link
                                    key={link.slug + idx}
                                    href={link.slug}
                                    onClick={(e) => handleClick(e, link.slug)}
                                    className={`text-[13px] font-semibold transition-colors duration-300 relative group ${currentPageSlug === link.slug ? 'text-amber-400' : 'text-white/60 hover:text-amber-400'}`}
                                >
                                    {link.label}
                                    <span className={`absolute left-0 -bottom-1 h-0.5 bg-amber-400 transition-all duration-300 rounded-full ${currentPageSlug === link.slug ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                </Link>
                            ))}
                        </nav>

                        {/* CTA + Mobile Toggle */}
                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="hidden md:flex items-center gap-4 mr-2">
                                    <span className="text-white/60 text-xs font-bold">Hi, {user?.name.split(' ')[0]}</span>
                                    <button
                                        onClick={() => logout()}
                                        className="text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="hidden md:block text-white/80 hover:text-amber-400 text-sm font-bold transition-colors mr-2"
                                >
                                    Login
                                </button>
                            )}

                            <a
                                href="#contact"
                                className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-sm rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Book Consultation
                            </a>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden p-2 text-white/60 hover:text-amber-400 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {menuOpen
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    }
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-[#0a1628]/98 backdrop-blur-xl flex flex-col items-center justify-center lg:hidden">
                    <nav className="flex flex-col items-center gap-6">
                        {navigation?.map((link: any, idx) => (
                            <Link
                                key={link.slug + idx}
                                href={link.slug}
                                onClick={(e) => handleClick(e, link.slug)}
                                className={`text-xl font-bold transition-colors ${currentPageSlug === link.slug ? 'text-amber-400' : 'text-white/80 hover:text-amber-400'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a href="#contact" onClick={() => setMenuOpen(false)} className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold rounded-lg">
                            Book Consultation
                        </a>
                        {!isAuthenticated && (
                            <button
                                onClick={() => { setMenuOpen(false); setIsAuthModalOpen(true); }}
                                className="mt-4 text-white/60 font-bold hover:text-amber-400"
                            >
                                Member Login
                            </button>
                        )}
                    </nav>
                </div>
            )}

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
};
