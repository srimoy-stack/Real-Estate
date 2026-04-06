'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { useWebsite } from '../../lib/tenant/website-context';

// useSearchParams() requires a Suspense boundary in Next.js App Router.
// HeaderInner holds all the logic; Header is the public exported wrapper.
function HeaderInner() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, logout, hasHydrated } = useAuth();
    const website = useWebsite();

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on any navigation (path OR query params)
    useEffect(() => {
        setIsMenuOpen(false);
        setExpandedItems([]);
    }, [pathname, searchParams]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const headerLinks = (website.navigation.headerLinks || [])
        .filter(l => l.isVisible)
        .sort((a, b) => a.order - b.order);

    const toggleExpanded = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleMouseEnter = (id: string, hasChildren: boolean) => {
        if (!hasChildren) return;
        if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
        setActiveDropdown(id);
    };

    const handleMouseLeave = () => {
        dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 120);
    };

    /**
     * Determine if a nav link is the currently active route.
     * For links with query params (e.g. /search?transaction=buy), ALL
     * params in the link href must be present in the current URL.
     * For plain path-only links, match by pathname prefix.
     */
    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';

        const [hrefPath, hrefQuery] = href.split('?');

        // Pathname must match first
        if (!pathname.startsWith(hrefPath)) return false;

        // If the link has no query params, pathname prefix match is enough
        if (!hrefQuery) return true;

        // All query params in the link href must exist with same value in current URL
        const linkParams = new URLSearchParams(hrefQuery);
        for (const [key, val] of linkParams.entries()) {
            if (searchParams.get(key) !== val) return false;
        }
        return true;
    };

    const brandName = website.brandName || 'SquareFT';
    const firstWord = brandName.split(' ')[0];
    const restWords = brandName.split(' ').slice(1).join(' ');

    return (
        <>
            <header
                className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/98 backdrop-blur-md shadow-[0_1px_24px_rgba(0,0,0,0.08)] border-b border-slate-100'
                        : 'bg-white border-b border-slate-100/60'
                }`}
            >
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[68px]">
                        {/* ── Logo ───────────────────────────────── */}
                        <Link href="/" className="flex items-center gap-1.5 group flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                                <div className="h-7 w-7 bg-[#4F46E5] flex-shrink-0 rounded-[2px]" />
                                <div className="flex items-baseline leading-none">
                                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{firstWord}</span>
                                    <span className="text-2xl font-black text-[#4F46E5] tracking-tighter uppercase ml-0.5">{restWords}</span>
                                </div>
                            </div>
                        </Link>

                        {/* ── Desktop Nav ────────────────────────── */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {headerLinks.map(link => {
                                const active = isActive(link.href);
                                const hasChildren = !!(link.children && link.children.length > 0);

                                return (
                                    <div
                                        key={link.id}
                                        className="relative h-[68px] flex items-center px-4"
                                        onMouseEnter={() => handleMouseEnter(link.id, hasChildren)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-1.5 text-[13.5px] font-semibold transition-all ${
                                                active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                        >
                                            {link.label}
                                            {hasChildren && (
                                                <svg
                                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                        activeDropdown === link.id ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </Link>

                                        {/* Active indicator underline */}
                                        {active && (
                                            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#4F46E5] rounded-full" />
                                        )}

                                        {/* Dropdown */}
                                        {hasChildren && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 min-w-[200px] bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-1.5 transition-all duration-200 origin-top ${
                                                    activeDropdown === link.id
                                                        ? 'opacity-100 visible translate-y-0'
                                                        : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                                                }`}
                                            >
                                                {link.children!.sort((a, b) => a.order - b.order).map(child => (
                                                    <Link
                                                        key={child.id}
                                                        href={child.href}
                                                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[13.5px] font-medium text-slate-600 hover:text-[#4F46E5] hover:bg-indigo-50 transition-all"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        {/* ── Actions ─────────────────────────────── */}
                        <div className="flex items-center gap-3 flex-shrink-0">

                            {/* Auth state */}
                            {!hasHydrated ? (
                                <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-lg hidden sm:block" />
                            ) : user ? (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link
                                        href="/saved-listings"
                                        className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-200"
                                    >
                                        <svg className="w-4 h-4 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                        Saved
                                    </Link>
                                    <Link
                                        href="/account/saved-listings"
                                        className="h-9 w-9 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-[#4F46E5] transition-all"
                                        title="Account"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={() => { logout(); router.push('/'); }}
                                        className="h-9 px-3.5 text-[13px] font-semibold text-slate-500 hover:text-red-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="hidden sm:inline-flex items-center h-9 px-4 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border border-slate-200"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/sell"
                                        className="hidden sm:inline-flex items-center h-9 px-5 bg-[#4F46E5] hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-lg transition-all shadow-sm shadow-indigo-100 hover:shadow-md hover:shadow-indigo-200/40 hover:-translate-y-px active:translate-y-0"
                                    >
                                        List Property
                                    </Link>
                                </>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setIsMenuOpen(v => !v)}
                                className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
                                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isMenuOpen}
                            >
                                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                                {isMenuOpen ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile Menu ─────────────────────────── */}
            <div
                className={`fixed inset-0 top-[68px] z-50 bg-white transition-all duration-300 lg:hidden ${
                    isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
                }`}
            >
                <div className="flex flex-col h-full bg-slate-50/30">
                    <div className="flex-1 overflow-y-auto px-4 py-8">
                        <nav className="space-y-6">
                            {headerLinks.map(link => {
                                const hasChildren = !!(link.children && link.children.length > 0);
                                const active = isActive(link.href);
                                const isExpanded = expandedItems.includes(link.id);

                                return (
                                    <div key={link.id} className="space-y-3">
                                        <button
                                            onClick={() => hasChildren ? toggleExpanded(link.id) : router.push(link.href)}
                                            className={`flex items-center justify-between w-full text-left text-lg font-bold tracking-tight ${
                                                active ? 'text-[#4F46E5]' : 'text-slate-800'
                                            }`}
                                        >
                                            {link.label}
                                            {hasChildren && (
                                                <svg
                                                    className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </button>

                                        {hasChildren && isExpanded && (
                                            <div className="ml-4 flex flex-col space-y-4 border-l-2 border-slate-100 pl-4 py-2">
                                                {link.children!.map(child => (
                                                    <Link
                                                        key={child.id}
                                                        href={child.href}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="text-[15px] font-semibold text-slate-500 hover:text-[#4F46E5]"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Mobile Auth/Actions */}
                    <div className="border-t border-slate-100 p-6 bg-white space-y-4">
                        {user ? (
                            <>
                                <Link
                                    href="/saved-listings"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-slate-50 text-slate-800 text-[14px] font-semibold border border-slate-200 hover:border-slate-300 transition-all"
                                >
                                    <svg className="w-4 h-4 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                    Saved Listings
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsMenuOpen(false); router.push('/'); }}
                                    className="flex items-center justify-center w-full h-12 rounded-xl bg-slate-900 text-white text-[14px] font-semibold hover:bg-indigo-700 transition-all"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center w-full h-12 rounded-xl bg-slate-50 text-slate-900 text-[14px] font-semibold border border-slate-200 hover:bg-slate-100 transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/sell"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center w-full h-12 rounded-xl bg-[#4F46E5] text-white text-[14px] font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                                >
                                    List Your Property
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Minimal header skeleton shown while Suspense resolves (prevents layout shift)
function HeaderSkeleton() {
    return (
        <div className="sticky top-0 z-[100] w-full h-[68px] bg-white border-b border-slate-100/60" />
    );
}

export function Header() {
    return (
        <Suspense fallback={<HeaderSkeleton />}>
            <HeaderInner />
        </Suspense>
    );
}
