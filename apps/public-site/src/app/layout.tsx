import type { Metadata } from 'next';
import './globals.css';

import { getWebsiteFromHeaders } from '../lib/tenant/getWebsiteFromHeaders';
import { WebsiteProvider } from '../lib/tenant/website-context';
import { AuthProvider } from '@repo/auth';
import { getHeaderLinks, getFontUrls, getBrandingCssVars } from '@repo/types';
import { Footer } from '@repo/ui';
import { NavbarAuthWrapper } from '../components/layout/NavbarAuthWrapper';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const website = getWebsiteFromHeaders();
  if (!website) return { title: 'Template Preview | Platform Engine' };

  return {
    title: website.seo.defaultTitle || website.brandName,
    description: website.seo.defaultDescription || `Premium properties by ${website.brandName}`,
    icons: {
      icon: website.branding.faviconUrl || website.branding.logoUrl,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const website = getWebsiteFromHeaders();

  if (!website) {
    // If it's a demo route, we still want to render children without the tenant wrapper
    return (
      <html lang="en">
        <body className="min-h-screen bg-white antialiased">
          {children}
        </body>
      </html>
    );
  }

  const { branding } = website;
  const headerLinks = getHeaderLinks(website);
  const fontUrls = getFontUrls(branding);
  const cssVars = getBrandingCssVars(branding);

  // Convert Website HeaderLinks to NavItems (Navbar expects {label, href})
  const navItems = headerLinks.map(link => ({
    label: link.label,
    href: link.href
  }));

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {fontUrls.map(url => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
      </head>
      <body
        className="min-h-screen bg-white antialiased selection:bg-emerald-100 selection:text-emerald-900"
        style={{
          fontFamily: `var(--brand-font-body)`,
          ...cssVars,
        } as React.CSSProperties}
      >
        <AuthProvider>
          <WebsiteProvider website={website}>
            <NavbarAuthWrapper
              brand={website.brandName}
              items={navItems}
            />
            {/* Added a subtle top accent bar that follows the user on scroll (optional, but premium) */}
            <main className="min-h-[70vh]">
              {children}
            </main>
            <Footer brand={website.brandName} />
          </WebsiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
