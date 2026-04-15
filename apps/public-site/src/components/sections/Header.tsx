'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@repo/auth';
import { useWebsite } from '../../lib/tenant/website-context';

/**
 * ┌──────────────────────────────────────────────────────────────────┐
 *  HEADER — Sticky, production-grade navigation header.
 *
 *  LAYOUT   3-column CSS Grid  [Logo · Nav · Actions]
 *           `1fr auto 1fr` keeps nav dead-centre.
 *
 *  LOGO     Source is 1024×1024. The brand banner sits at ~18 % from
 *           the top.  We use `object-fit:cover` + `object-position`
 *           to crop precisely to the banner — no overflow hacks.
 *
 *  MOBILE   Full-screen slide-over with accordion children.
 * └──────────────────────────────────────────────────────────────────┘
 */

const H = 'h-[76px]';

function HeaderInner() {
    const [scrolled, setScrolled]       = useState(false);
    const [menuOpen, setMenuOpen]       = useState(false);
    const [dropdown, setDropdown]       = useState<string | null>(null);
    const [expanded, setExpanded]       = useState<string[]>([]);
    const timer                         = useRef<ReturnType<typeof setTimeout> | null>(null);

    const router     = useRouter();
    const pathname   = usePathname();
    const params     = useSearchParams();
    const { user, logout, hasHydrated } = useAuth();
    const website    = useWebsite();

    /* scroll shadow */
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    /* close mobile on navigate */
    useEffect(() => { setMenuOpen(false); setExpanded([]); }, [pathname, params]);

    /* body lock */
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const links = (website.navigation.headerLinks ?? [])
        .filter(l => l.isVisible)
        .sort((a, b) => a.order - b.order);

    const active = (href: string) => {
        if (href === '/') return pathname === '/';
        const [p, q] = href.split('?');
        if (!pathname.startsWith(p)) return false;
        if (!q) return true;
        for (const [k, v] of new URLSearchParams(q)) if (params.get(k) !== v) return false;
        return true;
    };

    const ddOpen  = (id: string) => { if (timer.current) clearTimeout(timer.current); setDropdown(id); };
    const ddClose = () => { timer.current = setTimeout(() => setDropdown(null), 140); };

    /* ─── Logo element (reusable for desktop + mobile) ────────────── */
    const Logo = ({ size = 'desktop' }: { size?: 'desktop' | 'mobile' }) => {
        const logoUrl = (website as any).logoUrl;
        if (logoUrl) {
            return (
                <img src={logoUrl} alt={website.brandName}
                     className={size === 'desktop' ? 'h-15 w-auto max-w-[220px] object-contain' : 'h-8 w-auto max-w-[160px] object-contain'} />
            );
        }
        return (
            <img
                src="/logo.png"
                alt="SquareFT"
                className={size === 'desktop' ? 'h-10 w-auto object-contain translate-y-[2px]' : 'h-7 w-auto object-contain translate-y-[1px]'}
            />
        );
    };

    /* ━━━━━━━━━━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━━━━━━━━━━ */
    return (
        <header
            className={[
                'sticky top-0 z-[100] w-full border-b transition-all duration-300',
                scrolled
                    ? 'bg-white/[.97] backdrop-blur-xl border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
                    : 'bg-white border-slate-100',
            ].join(' ')}
        >
            <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
                <div className={`grid grid-cols-[1fr_auto_1fr] items-center ${H}`}>

                    {/* ═══ COL 1 — Logo ═══ */}
                    <div className="flex items-center">
                        <Link href="/" className="inline-flex items-center focus:outline-none">
                            <Logo size="desktop" />
                        </Link>
                    </div>

                    {/* ═══ COL 2 — Desktop Nav ═══ */}
                    <nav className="hidden lg:flex items-center justify-center" role="navigation">
                        <ul className="flex items-center gap-1 m-0 p-0 list-none">
                            {links.map(link => {
                                const on   = active(link.href);
                                const kids = link.children?.length ? link.children : null;
                                return (
                                    <li
                                        key={link.id}
                                        className="relative flex items-center"
                                        onMouseEnter={() => kids && ddOpen(link.id)}
                                        onMouseLeave={ddClose}
                                    >
                                        <Link
                                            href={link.href}
                                            className={[
                                                'inline-flex items-center gap-1.5 h-10 px-5 rounded-full',
                                                'text-[14px] font-semibold leading-none select-none transition-colors duration-200',
                                                on ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
                                            ].join(' ')}
                                        >
                                            {link.label}
                                            {kids && (
                                                <svg className={`w-3 h-3 opacity-40 transition-transform duration-200 ${dropdown === link.id ? 'rotate-180' : ''}`}
                                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </Link>

                                        {kids && (
                                            <div className={[
                                                'absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 transition-all duration-200 origin-top',
                                                dropdown === link.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
                                            ].join(' ')}>
                                                <div className="min-w-[230px] bg-white rounded-2xl border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.12)] p-1.5">
                                                    {kids.sort((a, b) => a.order - b.order).map(c => (
                                                        <Link key={c.id} href={c.href}
                                                              className="flex items-center px-4 py-3 rounded-xl text-[13.5px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
                                                            {c.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* ═══ COL 3 — Actions ═══ */}
                    <div className="flex items-center justify-end gap-2.5">

                        {!hasHydrated && (
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="h-10 w-20 rounded-full bg-slate-100 animate-pulse" />
                                <div className="h-10 w-28 rounded-full bg-slate-100 animate-pulse" />
                            </div>
                        )}

                        {hasHydrated && user && (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/saved-listings"
                                      className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                    Saved
                                </Link>
                                <Link href="/account/saved-listings" title="Account"
                                      className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-sm">
                                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </Link>
                                <button onClick={() => { logout(); router.push('/'); }}
                                        className="h-10 px-4 rounded-full text-[13px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    Log Out
                                </button>
                            </div>
                        )}

                        {hasHydrated && !user && (
                            <div className="hidden lg:flex items-center gap-2">
                                <Link href="/login"
                                      className="h-10 px-5 rounded-full inline-flex items-center text-[13.5px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/sell"
                                      className="h-10 px-6 rounded-full inline-flex items-center bg-slate-900 text-white text-[13.5px] font-semibold hover:bg-indigo-600 transition-all shadow-md shadow-slate-900/20 hover:-translate-y-px active:translate-y-0">
                                    List Property
                                </Link>
                            </div>
                        )}

                        <button onClick={() => setMenuOpen(v => !v)}
                                className="lg:hidden h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                                aria-label="Menu">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {menuOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════ MOBILE OVERLAY ═══════════ */}
            <div className={[
                'fixed inset-0 z-[200] bg-white lg:hidden transition-all duration-300 ease-in-out',
                menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none',
            ].join(' ')}>
                <div className="flex flex-col h-full">

                    <div className={`px-6 flex items-center justify-between ${H} border-b border-slate-100 shrink-0`}>
                        <Link href="/" onClick={() => setMenuOpen(false)}>
                            <Logo size="mobile" />
                        </Link>
                        <button onClick={() => setMenuOpen(false)}
                                className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center"
                                aria-label="Close">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <nav className="space-y-1">
                            {links.map(link => {
                                const kids = link.children?.length ? link.children : null;
                                const open = expanded.includes(link.id);
                                return (
                                    <div key={link.id}>
                                        <button
                                            onClick={() => kids ? setExpanded(p => open ? p.filter(x => x !== link.id) : [...p, link.id]) : (setMenuOpen(false), router.push(link.href))}
                                            className="flex items-center justify-between w-full px-4 py-4 rounded-2xl text-xl font-bold text-slate-900 hover:bg-slate-50 transition-colors">
                                            {link.label}
                                            {kids && (
                                                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </button>
                                        {kids && open && (
                                            <div className="ml-4 pl-4 border-l-2 border-indigo-500 space-y-1 mt-1 mb-3">
                                                {kids.sort((a, b) => a.order - b.order).map(c => (
                                                    <Link key={c.id} href={c.href} onClick={() => setMenuOpen(false)}
                                                          className="block px-3 py-2.5 text-base font-semibold text-slate-500 hover:text-indigo-600 rounded-xl transition-colors">
                                                        {c.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="px-6 py-5 space-y-3 border-t border-slate-100 shrink-0">
                        {user ? (
                            <button onClick={() => { logout(); setMenuOpen(false); router.push('/'); }}
                                    className="w-full py-3.5 rounded-2xl bg-red-50 text-red-600 font-bold text-base active:bg-red-100 transition-colors">
                                Sign Out
                            </button>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMenuOpen(false)}
                                      className="flex items-center justify-center w-full py-3.5 rounded-2xl bg-slate-50 text-slate-900 font-bold text-base border border-slate-200 active:bg-slate-100 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/sell" onClick={() => setMenuOpen(false)}
                                      className="flex items-center justify-center w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-base shadow-lg shadow-slate-900/20 active:translate-y-0.5 transition-all">
                                    List Your Property
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function HeaderSkeleton() {
    return <div className={`sticky top-0 z-[100] w-full ${H} bg-white border-b border-slate-100`} />;
}

export function Header() {
    return (
        <Suspense fallback={<HeaderSkeleton />}>
            <HeaderInner />
        </Suspense>
    );
}
