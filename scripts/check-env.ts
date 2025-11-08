#!/usr/bin/env ts-node

/**
 * Environment Variable Checker
 *
 * Validates that all required environment variables are set
 * Run before deployment to catch configuration issues early
 *
 * Usage:
 *   npm run check-env
 *   ts-node scripts/check-env.ts
 */

import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  const envContent = fs.readFileSync(filePath, 'utf-8')
  const env: Record<string, string> = {}

  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return env
}

// Required environment variables
const requiredVars = {
  critical: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CRON_SECRET',
  ],
  recommended: [
    'STRIPE_PRICE_STARTER',
    'STRIPE_PRICE_PRO',
    'STRIPE_PRICE_ELITE',
    'YOUTUBE_API_KEY',
  ],
  optional: [
    'NEXT_PUBLIC_SENTRY_DSN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'SENTRY_AUTH_TOKEN',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'HMS_APP_ACCESS_KEY',
    'HMS_APP_SECRET',
  ],
}

// Validation rules
const validators: Record<string, (value: string) => boolean> = {
  NEXT_PUBLIC_SUPABASE_URL: (v) => v.startsWith('https://') && v.includes('supabase'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: (v) => v.startsWith('eyJ'),
  SUPABASE_SERVICE_ROLE_KEY: (v) => v.startsWith('eyJ'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: (v) => v.startsWith('pk_'),
  STRIPE_SECRET_KEY: (v) => v.startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: (v) => v.startsWith('whsec_'),
  CRON_SECRET: (v) => v.length >= 32,
  NEXT_PUBLIC_SENTRY_DSN: (v) => v.startsWith('https://') && v.includes('sentry.io'),
}

async function main() {
  log('\n🔍 VyBzzZ Environment Variable Checker\n', 'bright')

  // Determine which env file to check
  const envFile = process.argv[2] || '.env.local'
  const envPath = path.join(process.cwd(), envFile)

  log(`📄 Checking: ${envFile}\n`, 'cyan')

  // Load environment variables
  let env = loadEnvFile(envPath)

  // If file doesn't exist or is empty, use process.env (for production/CI/Railway)
  if (Object.keys(env).length === 0) {
    // In production/CI/Railway, variables are set via environment, not .env files
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.RAILWAY_ENVIRONMENT || 
                        process.env.CI ||
                        process.env.RAILWAY_SERVICE_NAME ||
                        !fs.existsSync(envPath) // If file doesn't exist, assume production
    
    if (isProduction) {
      log(`⚠️  File not found: ${envFile}`, 'yellow')
      log(`   Using environment variables from system (production/CI mode)`, 'cyan')
      // Use process.env instead
      env = process.env as Record<string, string>
    } else {
      log(`❌ File not found or empty: ${envFile}`, 'red')
      log(`   Create it by copying: cp .env.example ${envFile}`, 'yellow')
      process.exit(1)
    }
  } else {
    // Merge with process.env (process.env takes precedence)
    env = { ...env, ...process.env }
  }

  let criticalMissing = 0
  let criticalInvalid = 0
  let recommendedMissing = 0
  let optionalMissing = 0

  // Check CRITICAL variables
  log('🔴 CRITICAL Variables (required for operation):', 'bright')
  for (const varName of requiredVars.critical) {
    const value = env[varName]

    if (!value) {
      log(`   ❌ ${varName} - MISSING`, 'red')
      criticalMissing++
    } else {
      const validator = validators[varName]
      if (validator && !validator(value)) {
        log(`   ⚠️  ${varName} - INVALID FORMAT`, 'yellow')
        criticalInvalid++
      } else {
        log(`   ✅ ${varName}`, 'green')
      }
    }
  }

  // Check RECOMMENDED variables
  log('\n🟡 RECOMMENDED Variables (important features):', 'bright')
  for (const varName of requiredVars.recommended) {
    const value = env[varName]

    if (!value) {
      log(`   ⚠️  ${varName} - MISSING`, 'yellow')
      recommendedMissing++
    } else {
      const validator = validators[varName]
      if (validator && !validator(value)) {
        log(`   ⚠️  ${varName} - INVALID FORMAT`, 'yellow')
      } else {
        log(`   ✅ ${varName}`, 'green')
      }
    }
  }

  // Check OPTIONAL variables
  log('\n🔵 OPTIONAL Variables (enhanced features):', 'bright')
  for (const varName of requiredVars.optional) {
    const value = env[varName]

    if (!value) {
      log(`   ○  ${varName} - not set`, 'blue')
      optionalMissing++
    } else {
      const validator = validators[varName]
      if (validator && !validator(value)) {
        log(`   ⚠️  ${varName} - INVALID FORMAT`, 'yellow')
      } else {
        log(`   ✅ ${varName}`, 'green')
      }
    }
  }

  // Summary
  log('\n📊 Summary:', 'bright')
  log(`   Total variables checked: ${Object.keys(env).length}`, 'cyan')

  if (criticalMissing > 0 || criticalInvalid > 0) {
    log(`   ❌ Critical missing: ${criticalMissing}`, 'red')
    log(`   ❌ Critical invalid: ${criticalInvalid}`, 'red')
  } else {
    log(`   ✅ All critical variables configured`, 'green')
  }

  if (recommendedMissing > 0) {
    log(`   ⚠️  Recommended missing: ${recommendedMissing}`, 'yellow')
  } else {
    log(`   ✅ All recommended variables configured`, 'green')
  }

  log(`   ○  Optional missing: ${optionalMissing}`, 'blue')

  // Exit code
  if (criticalMissing > 0 || criticalInvalid > 0) {
    log('\n❌ Environment check FAILED', 'red')
    log('   Fix critical issues before deployment\n', 'yellow')
    process.exit(1)
  } else if (recommendedMissing > 0) {
    log('\n⚠️  Environment check PASSED with warnings', 'yellow')
    log('   Consider setting recommended variables\n', 'yellow')
    process.exit(0)
  } else {
    log('\n✅ Environment check PASSED', 'green')
    log('   Ready for deployment!\n', 'green')
    process.exit(0)
  }
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red')
  process.exit(1)
})
