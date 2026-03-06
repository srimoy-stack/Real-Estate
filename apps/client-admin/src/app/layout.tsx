import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Client Admin | Real Estate',
    template: '%s | Client Admin | Real Estate',
  },
  description: 'Client administration portal for Real Estate.',
  keywords: ['real estate', 'property', 'management', 'platform'],
  authors: [{ name: 'Real Estate Platform' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Client Admin | Real Estate',
    title: 'Client Admin | Real Estate',
    description: 'Client administration portal for Real Estate.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Client Admin | Real Estate',
    description: 'Client administration portal for Real Estate.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
};

import { AuthProvider } from '@repo/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
