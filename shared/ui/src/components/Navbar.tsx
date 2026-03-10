'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  brand?: string;
  items?: NavItem[];
  className?: string;
  rightContent?: React.ReactNode;
}

export function Navbar({ brand = 'Real Estate', items = [], className = '', rightContent }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Top Accent Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300" />

      <header className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white ${className}`}>
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-bold text-white shadow-sm">
              RE
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">{brand}</span>
          </Link>

          {/* Center (Desktop Nav) */}
          <ul className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Content */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {rightContent}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-gray-200 bg-white md:hidden">
            <ul className="space-y-1 px-4 py-3">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {rightContent && (
                <li className="pt-2">
                  {rightContent}
                </li>
              )}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
