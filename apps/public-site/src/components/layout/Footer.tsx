import Link from 'next/link';
import type { FooterColumn, SocialLinksConfig, NavLink } from '@repo/types';

interface FooterProps {
  brandName: string;
  columns: FooterColumn[];
  footerLinks: NavLink[];
  socialLinks?: SocialLinksConfig;
  copyrightText?: string;
}

export function Footer({ brandName, columns, footerLinks, socialLinks, copyrightText }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">RE</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{brandName}</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-6">
              Connecting buyers with their dream properties. Trusted by thousands of
              families across Canada for reliable real estate solutions.
            </p>
            {socialLinks && (
              <div className="flex gap-3">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" aria-label="Facebook">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" aria-label="Instagram">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" aria-label="Twitter">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" aria-label="LinkedIn">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" /></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic columns */}
          {columns.map((col) => (
            <div key={col.id}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Footer links row */}
          {footerLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2.5">
                {footerLinks.filter(l => l.isVisible).map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.isExternal ? '_blank' : undefined}
                      className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Are You a REALTOR? CTA Section — Zolo-inspired */}
        <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {brandName}, Brokerage &bull;{' '}
              <Link href="/contact" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Contact</Link>
              {' '}&bull;{' '}
              <Link href="/privacy" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Privacy & Terms</Link>
              {' '}&bull;{' '}
              <Link href="/sitemap" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Sitemap</Link>
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-lg font-bold text-gray-900 mb-2">Are You a REALTOR®?</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              Join Today!
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              {copyrightText ?? `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}
            </p>
            <p className="text-[10px] text-gray-400 leading-relaxed max-w-2xl text-center sm:text-right">
              The REALTOR® trademark is controlled by the Canadian Real Estate Association (CREA) and identifies
              real estate professionals who are members of CREA.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
    </footer>
  );
}
