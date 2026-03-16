import './globals.css';
import { getWebsiteFromHeaders } from '../lib/tenant/getWebsiteFromHeaders';
import { WebsiteProvider } from '../lib/tenant/website-context';
import { AuthProvider } from '@repo/auth';
import { getFontUrls, getBrandingCssVars } from '@repo/types';
import { Header } from '../components/sections/Header';
import { Footer } from '../components/sections/Footer';
import { LeadGate } from '../components/auth/LeadGate';

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
  const fontUrls = getFontUrls(branding);
  const cssVars = getBrandingCssVars(branding);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {fontUrls.map(url => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
      </head>
      <body
        className="min-h-screen bg-white antialiased selection:bg-indigo-100 selection:text-indigo-900"
        style={{
          fontFamily: `var(--brand-font-body)`,
          ...cssVars,
        } as React.CSSProperties}
      >
        <AuthProvider>
          <WebsiteProvider website={website}>
            <Header />
            <LeadGate />
            <main className="min-h-[70vh]">
              {children}
            </main>
            <Footer />
          </WebsiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
