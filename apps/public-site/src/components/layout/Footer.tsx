import Link from 'next/link';

import type { FooterColumn, SocialLinksConfig } from '@repo/types';
import { RealtorBadge } from '@/components/listings/RealtorBadge';

interface FooterProps {
  brandName: string;
  columns: FooterColumn[];
  socialLinks?: SocialLinksConfig;
  copyrightText?: string;
}

export function Footer({ brandName, columns, socialLinks, copyrightText }: FooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-red shadow-lg shadow-brand-red/20 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                  <span className="text-white text-[10px] font-black tracking-tighter uppercase italic">RE</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                    {brandName.split(' ')[0]} <span className="text-brand-red">{brandName.split(' ').slice(1).join(' ')}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Exclusive Real Estate</span>
                </div>
            </div>
            
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
              Discover a new standard of property exploration. We provide 
              unparalleled access to premium MLS® listings across Canada with real-time 
              market intelligence and expert architectural insights.
            </p>

            {socialLinks && (
              <div className="flex gap-4">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-red hover:text-white transition-all border border-slate-100 shadow-sm" aria-label="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-red hover:text-white transition-all border border-slate-100 shadow-sm" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Spacer for desktop */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Dynamic columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {columns.map((col) => (
                <div key={col.id}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-6">
                    {col.title}
                </h3>
                <ul className="space-y-4">
                    {col.links.map((link) => (
                    <li key={link.id}>
                        <Link
                        href={link.href}
                        className="text-xs font-bold text-slate-500 hover:text-brand-red transition-colors uppercase tracking-widest"
                        >
                        {link.label}
                        </Link>
                    </li>
                    ))}
                </ul>
                </div>
            ))}

            {/* Compliance Column */}
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-6 italic">Compliance</h3>
                <div className="space-y-4">
                    <RealtorBadge />
                </div>
            </div>
          </div>
        </div>

        {/* Mandatory DDF Attribution Removed */}

          
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red leading-none italic">Verified MLS® Partner</span>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-brand-red transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              Contact Specialist
            </Link>
          </div>
        </div>

      {/* Bottom Legal / Copyright */}
      <div className="bg-slate-50 py-10 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {copyrightText ?? `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-8">
                <Link href="/privacy" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-red transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-red transition-colors">Terms of Use</Link>
                <a href="https://www.crea.ca/accessibility" target="_blank" rel="noopener" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-red transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
