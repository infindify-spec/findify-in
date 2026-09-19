import type { NextConfig } from "next";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const nextConfig: NextConfig = {
  // Turbopack is already enabled via `next dev --turbo` (default in Next 16)
  // Optimize images from external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
    ],
    minimumCacheTTL: 86400, // Cache images for 24h
  },
  // Compress responses
  compress: true,
  // Power HTTP cache headers for static assets
  poweredByHeader: false,
};

export default nextConfig;
