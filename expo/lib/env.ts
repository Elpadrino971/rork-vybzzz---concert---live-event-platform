/**
 * Environment Variables Validation
 *
 * AMÉLIORATION CRITIQUE: Validation des variables d'environnement
 * Prévient les crashes en production dus à des configs manquantes
 *
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env'
 * const stripe = new Stripe(env.STRIPE_SECRET_KEY)
 * ```
 */

import { z } from 'zod'

// ============================================
// ENVIRONMENT SCHEMA
// ============================================

const envSchema = z.object({
  // ============================================
  // Supabase Configuration
  // ============================================
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .refine(
      (url) => url.includes('supabase.co') || url.includes('localhost'),
      'NEXT_PUBLIC_SUPABASE_URL must be a Supabase URL'
    ),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
    .refine(
      (key) => key.startsWith('eyJ'),
      'NEXT_PUBLIC_SUPABASE_ANON_KEY must be a valid JWT'
    ),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required')
    .refine(
      (key) => key.startsWith('eyJ'),
      'SUPABASE_SERVICE_ROLE_KEY must be a valid JWT'
    ),

  // ============================================
  // Stripe Configuration
  // ============================================
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, 'STRIPE_SECRET_KEY is required')
    .refine(
      (key) => key.startsWith('sk_'),
      'STRIPE_SECRET_KEY must start with sk_'
    ),

  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'STRIPE_WEBHOOK_SECRET is required')
    .refine(
      (secret) => secret.startsWith('whsec_'),
      'STRIPE_WEBHOOK_SECRET must start with whsec_'
    ),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required')
    .refine(
      (key) => key.startsWith('pk_'),
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'
    ),

  // ============================================
  // YouTube Live Configuration (Optional)
  // ============================================
  YOUTUBE_API_KEY: z.string().optional(),

  // ============================================
  // AWS IVS Configuration (Optional)
  // ============================================
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_IVS_CHANNEL_ARN: z.string().optional(),

  // ============================================
  // 100ms Configuration (Optional)
  // ============================================
  HMS_APP_ACCESS_KEY: z.string().optional(),
  HMS_APP_SECRET: z.string().optional(),

  // ============================================
  // Cron Job Security
  // ============================================
  CRON_SECRET: z
    .string()
    .min(32, 'CRON_SECRET must be at least 32 characters for security')
    .describe('Secret token for cron job authentication'),

  // ============================================
  // Optional: Upstash Redis (Rate Limiting)
  // ============================================
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ============================================
  // Optional: Monitoring (Sentry)
  // ============================================
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // ============================================
  // Node Environment
  // ============================================
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

// ============================================
// VALIDATE AND EXPORT
// ============================================

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      console.error('')

      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`)
      })

      console.error('')
      console.error('💡 Check your .env.local file and ensure all required variables are set.')
      console.error('📖 See .env.example for reference.')
      console.error('')

      // In production, crash immediately
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment configuration')
      }

      // In development, show warning but continue
      console.warn('⚠️  Continuing in development mode with invalid config...')
      console.warn('⚠️  Some features may not work correctly.')
      console.warn('')
    }

    throw error
  }
}

// Validate on import (app startup)
export const env = validateEnv()

// ============================================
// TYPE EXPORTS
// ============================================

export type Env = z.infer<typeof envSchema>

// ============================================
// HELPER: Check if feature is enabled
// ============================================

export function isFeatureEnabled(feature: 'youtube' | 'aws_ivs' | '100ms' | 'redis' | 'sentry'): boolean {
  switch (feature) {
    case 'youtube':
      return !!env.YOUTUBE_API_KEY
    case 'aws_ivs':
      return !!(
        env.AWS_ACCESS_KEY_ID &&
        env.AWS_SECRET_ACCESS_KEY &&
        env.AWS_IVS_CHANNEL_ARN
      )
    case '100ms':
      return !!(env.HMS_APP_ACCESS_KEY && env.HMS_APP_SECRET)
    case 'redis':
      return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
    case 'sentry':
      return !!env.NEXT_PUBLIC_SENTRY_DSN
    default:
      return false
  }
}

// ============================================
// HELPER: Get app URL (for webhooks, emails, etc.)
// ============================================

export function getAppUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (env.NODE_ENV === 'production') {
    // Replace with your actual production domain
    return 'https://vybzzz.com'
  }

  return 'http://localhost:3000'
}

// ============================================
// HELPER: Is production environment
// ============================================

export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test'
}
