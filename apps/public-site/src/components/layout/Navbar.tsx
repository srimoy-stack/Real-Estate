'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';
import { useRouter } from 'next/navigation';
import type { NavLink } from '@/types/website';

interface NavbarProps {
  brandName: string;
  logoUrl: string | null;
  links: NavLink[];
}

export function Navbar({ brandName, logoUrl, links }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-white/10 bg-white/70 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-500">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            {logoUrl ? (
              <div className="relative h-10 w-36">
                <SafeImage src={logoUrl} alt={brandName} fill className="object-contain" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                    <div className="h-7 w-7 bg-[#4F46E5] flex-shrink-0 rounded-[2px]" />
                    <div className="flex items-baseline leading-none">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Square</span>
                        <span className="text-2xl font-black text-[#4F46E5] tracking-tighter uppercase ml-0.5">FT</span>
                    </div>
                </div>
              </div>
            )}
          </Link>
          {/* Search Bar — Professional & Integrated */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-12">
            <div className="relative w-full group/search">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-brand-red transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by city, address, or MLS®..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-100/60 border border-transparent focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-brand-red/5 outline-none transition-all text-[13px] font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-semibold"
                />
            </div>
          </form>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            <ul className="flex items-center gap-1.5">
                {links.map((link) => (
                <li key={link.href}>
                    <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-all hover:bg-slate-50 hover:text-brand-red"
                    >
                    {link.label}
                    </Link>
                </li>
                ))}
            </ul>
            
            <div className="h-4 w-px bg-slate-200" />
            
            <Link
                href="/contact"
                className="rounded-xl bg-brand-red h-10 px-6 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-900 hover:scale-105 active:scale-95 shadow-lg shadow-brand-red/10"
            >
                Inquire
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-red hover:text-white transition-all md:hidden"
            aria-label="Toggle navigation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-4 py-6 space-y-6">
                {/* Mobile search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by city, address, or MLS®..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-100 border-none outline-none font-bold text-slate-900 placeholder:text-slate-400"
                    />
                </form>

                <ul className="space-y-2">
                {links.map((link) => (
                    <li key={link.href}>
                    <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center h-14 px-5 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                        {link.label}
                    </Link>
                    </li>
                ))}
                    <li>
                        <Link
                            href="/contact"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-center h-14 rounded-2xl bg-brand-red text-white font-black uppercase tracking-widest shadow-xl shadow-brand-red/20"
                        >
                            Contact Agent
                        </Link>
                    </li>
                </ul>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
