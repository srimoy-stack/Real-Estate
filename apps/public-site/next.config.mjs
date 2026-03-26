/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  transpilePackages: ['@repo/ui', '@repo/types', '@repo/utils', '@repo/hooks', '@repo/services', '@repo/auth', '@repo/api-client', 'axios', 'zustand'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
