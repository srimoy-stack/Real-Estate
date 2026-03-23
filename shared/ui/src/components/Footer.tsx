export interface FooterProps {
  brand?: string;
  year?: number;
  className?: string;
}

export function Footer({ brand = 'Real Estate Platform', year = new Date().getFullYear(), className = '' }: FooterProps) {
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-bold text-white">
                RE
              </div>
              <span className="text-sm font-semibold text-gray-900">{brand}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Trusted real estate solutions across Canada.
            </p>
          </div>

          {/* Nearby Searches */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Nearby Searches</h3>
            <ul className="space-y-1.5">
              {['Toronto Townhouses', 'Mississauga Condos', 'Vancouver Homes', 'Kamloops Properties'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Cities</h3>
            <ul className="space-y-1.5">
              {['Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'].map((city) => (
                <li key={city}>
                  <a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">{city}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 text-emerald-600 ">Company</h3>
            <ul className="space-y-1.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Contact', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Listing Sitemap', href: '/sitemap.xml' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-500 font-medium hover:text-emerald-600 transition-colors uppercase tracking-widest text-[10px]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            &copy; {year} {brand}. All rights reserved.
          </p>
          <p className="text-[10px] text-gray-400 max-w-lg text-center sm:text-right">
            The REALTOR® trademark is controlled by the Canadian Real Estate Association (CREA) and identifies real estate professionals who are members of CREA.
          </p>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
    </footer>
  );
}
