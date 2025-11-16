const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'fpdehejqrmkviaxhyrlz.supabase.co',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    instrumentationHook: true, // Enable instrumentation.ts
  },
  // Exclude mobile-specific pages from web build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@/contexts/I18nContext': 'commonjs @/contexts/I18nContext',
        '@/components/LanguageSwitcher': 'commonjs @/components/LanguageSwitcher',
      })
    }
    return config
  },
  // Ignore build errors for mobile-only pages
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}

// Only wrap with Sentry if DSN is configured
const hasSentry = !!process.env.NEXT_PUBLIC_SENTRY_DSN

module.exports = hasSentry
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
