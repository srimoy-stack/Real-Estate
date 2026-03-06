/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/types', '@repo/utils', '@repo/hooks', '@repo/services', '@repo/auth', '@repo/api-client'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
