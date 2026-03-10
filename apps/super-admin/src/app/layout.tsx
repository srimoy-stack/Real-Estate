import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@repo/auth';
import './globals.css';


export const metadata: Metadata = {
  title: {
    default: 'Super Admin | Real Estate',
    template: '%s | Super Admin | Real Estate',
  },
  description: 'Platform administration dashboard for Real Estate.',
  keywords: ['real estate', 'property', 'management', 'platform'],
  authors: [{ name: 'Real Estate Platform' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Super Admin | Real Estate',
    title: 'Super Admin | Real Estate',
    description: 'Platform administration dashboard for Real Estate.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Admin | Real Estate',
    description: 'Platform administration dashboard for Real Estate.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-slate-950 text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
