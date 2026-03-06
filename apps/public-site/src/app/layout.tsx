import type { Metadata } from 'next';
import './globals.css';

import { getWebsiteFromHeaders } from '../lib/tenant/getWebsiteFromHeaders';
import { WebsiteProvider } from '../lib/tenant/website-context';
import { AuthProvider } from '@repo/auth';
import { getHeaderLinks, getFontUrls, getBrandingCssVars } from '@repo/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const website = getWebsiteFromHeaders();
  if (!website) return { title: 'Not Found' };

  return {
    title: website.seo.defaultTitle || website.brandName,
    description: website.seo.defaultDescription || `Premium properties by ${website.brandName}`,
    themeColor: website.branding.primaryColor,
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
    return (
      <html lang="en">
        <body>
          <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <p>Website not found.</p>
          </div>
        </body>
      </html>
    );
  }

  const { branding } = website;
  const headerLinks = getHeaderLinks(website);
  const fontUrls = getFontUrls(branding);
  const cssVars = getBrandingCssVars(branding);

  return (
    <html lang="en">
      <head>
        {fontUrls.map(url => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
      </head>
      <body style={{
        fontFamily: `var(--brand-font-body)`,
        margin: 0,
        backgroundColor: '#fff',
        color: '#333',
        ...cssVars,
      } as React.CSSProperties}>
        <AuthProvider>
          <WebsiteProvider website={website}>
            <header style={{
              backgroundColor: branding.primaryColor,
              color: '#fff',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <img
                src={branding.logoUrl}
                alt={`${website.brandName} logo`}
                style={{ height: '40px' }}
              />
              <nav style={{ display: 'flex', gap: '1.5rem' }}>
                {headerLinks.map(link => (
                  <a
                    key={link.id}
                    href={link.href}
                    target={link.isExternal ? '_blank' : undefined}
                    rel={link.isExternal ? 'noopener noreferrer' : undefined}
                    style={{
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </header>
            <main style={{ minHeight: 'calc(100vh - 120px)' }}>{children}</main>
            <footer style={{
              backgroundColor: '#f4f4f4',
              padding: '2rem',
              textAlign: 'center',
              borderTop: `4px solid ${branding.primaryColor}`,
            }}>
              <p>&copy; {new Date().getFullYear()} {website.brandName}</p>
            </footer>
          </WebsiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
