const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'fpdehejqrmkviaxhyrlz.supabase.co',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    instrumentationHook: true, // Enable instrumentation.ts
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
