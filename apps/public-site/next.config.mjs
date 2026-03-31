/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/types', '@repo/utils', '@repo/hooks', '@repo/services', '@repo/auth', '@repo/api-client', 'axios', 'zustand'],
  images: {
    // ── CRITICAL: Disable ALL image optimization for external images ──
    // External CDN URLs (ddfcdn.realtor.ca) are unreliable and cause
    // timeouts when Next.js tries to proxy/optimize them.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
