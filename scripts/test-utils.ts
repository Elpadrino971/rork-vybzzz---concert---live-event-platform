#!/usr/bin/env tsx

/**
 * Test Utilities for VyBzzZ Platform
 *
 * Shared helpers and utilities for integration and E2E tests
 * Run with: tsx scripts/test-*.ts
 */

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Color codes for terminal output
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

export function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

export function logSection(title: string) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.bright}${colors.blue}${title}${colors.reset}`)
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`)
}

export function logTest(testName: string, status: 'running' | 'passed' | 'failed', details?: string) {
  if (status === 'running') {
    log(`▶ ${testName}...`, 'cyan')
  } else if (status === 'passed') {
    log(`✅ ${testName}`, 'green')
    if (details) log(`   ${details}`, 'dim')
  } else {
    log(`❌ ${testName}`, 'red')
    if (details) log(`   ${details}`, 'red')
  }
}

// Load environment variables
export function loadEnv() {
  require('dotenv').config({ path: '.env.local' })

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, 'red')
    log('   Create .env.local from .env.example', 'yellow')
    process.exit(1)
  }
}

// Create Supabase admin client
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create Stripe client
export function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
  })
}

// Generate random email for testing
export function generateTestEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@vybzzz.test`
}

// Generate random username
export function generateTestUsername() {
  return `test_user_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

// Wait helper
export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Test result tracker
export class TestRunner {
  private tests: Array<{
    name: string
    passed: boolean
    duration: number
    error?: string
  }> = []

  async run(testName: string, testFn: () => Promise<void>): Promise<void> {
    logTest(testName, 'running')
    const startTime = Date.now()

    try {
      await testFn()
      const duration = Date.now() - startTime
      this.tests.push({ name: testName, passed: true, duration })
      logTest(testName, 'passed', `(${duration}ms)`)
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.tests.push({ name: testName, passed: false, duration, error: errorMessage })
      logTest(testName, 'failed', errorMessage)
    }
  }

  summary() {
    const passed = this.tests.filter(t => t.passed).length
    const failed = this.tests.filter(t => !t.passed).length
    const total = this.tests.length
    const totalDuration = this.tests.reduce((sum, t) => sum + t.duration, 0)

    logSection('Test Summary')

    log(`Total tests: ${total}`, 'cyan')
    log(`Passed: ${passed}`, passed === total ? 'green' : 'yellow')
    if (failed > 0) {
      log(`Failed: ${failed}`, 'red')
    }
    log(`Total duration: ${totalDuration}ms`, 'dim')

    if (failed > 0) {
      console.log('')
      log('Failed tests:', 'red')
      this.tests
        .filter(t => !t.passed)
        .forEach(t => {
          log(`  • ${t.name}`, 'red')
          if (t.error) log(`    ${t.error}`, 'dim')
        })
    }

    return { passed, failed, total }
  }

  exit() {
    const { failed } = this.summary()
    process.exit(failed > 0 ? 1 : 0)
  }
}

// Assert helpers
export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    )
  }
}

export function assertNotNull<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || `Expected value to be non-null, got ${value}`)
  }
}

export function assertGreaterThan(actual: number, expected: number, message?: string) {
  if (actual <= expected) {
    throw new Error(
      message || `Expected ${actual} to be greater than ${expected}`
    )
  }
}

export function assertLessThan(actual: number, expected: number, message?: string) {
  if (actual >= expected) {
    throw new Error(
      message || `Expected ${actual} to be less than ${expected}`
    )
  }
}

export function assertIncludes<T>(array: T[], value: T, message?: string) {
  if (!array.includes(value)) {
    throw new Error(
      message || `Expected array to include ${JSON.stringify(value)}`
    )
  }
}

export function assertMatches(value: string, pattern: RegExp, message?: string) {
  if (!pattern.test(value)) {
    throw new Error(
      message || `Expected "${value}" to match ${pattern}`
    )
  }
}

// Cleanup helper for test data
export async function cleanupTestUser(supabase: ReturnType<typeof createSupabaseAdmin>, email: string) {
  try {
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (user) {
      await supabase.auth.admin.deleteUser(user.id)
      log(`Cleaned up test user: ${email}`, 'dim')
    }
  } catch (error) {
    // User might not exist, ignore
  }
}

export async function cleanupTestEvent(supabase: ReturnType<typeof createSupabaseAdmin>, eventId: string) {
  try {
    await supabase.from('events').delete().eq('id', eventId)
    log(`Cleaned up test event: ${eventId}`, 'dim')
  } catch (error) {
    // Event might not exist, ignore
  }
}
