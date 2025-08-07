import type { NextConfig } from 'next'

// Conditional bundle analyzer import to avoid TypeScript issues
let withBundleAnalyzer: any = (config: NextConfig) => config;
if (process.env.ANALYZE === 'true') {
  try {
    withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
  } catch (e) {
    console.warn('Bundle analyzer not available:', e);
  }
}

const nextConfig: NextConfig = {
  // Experimental features for better navigation performance
  experimental: {
    // Configure router cache behavior for Next.js 15
    staleTimes: {
      dynamic: 30, // Cache dynamic pages for 30 seconds (good for navigation)
      static: 300, // Cache static pages for 5 minutes
    },
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Performance optimizations
  compiler: {
    removeConsole: true, // Remove all console statements
  },
  // Bundle optimization
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separate journal-specific chunks
          journal: {
            test: /[\\/]src[\\/](components[\\/]journal|pages[\\/]Journal|lib[\\/]journal)/,
            name: 'journal',
            chunks: 'all',
            priority: 20,
          },
          // Common UI components
          common: {
            test: /[\\/]src[\\/]components[\\/](ui|layout)/,
            name: 'common',
            chunks: 'all',
            priority: 15,
          },
        },
      };
    }
    return config;
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' data: https: *.googleusercontent.com *.supabase.co; font-src 'self' data: https://accounts.google.com; connect-src 'self' https://*.supabase.co https://accounts.google.com https://oauth2.googleapis.com; frame-src https://accounts.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)