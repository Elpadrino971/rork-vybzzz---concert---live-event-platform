/**
 * Test script for profiles view functionality
 *
 * This script validates that the profiles view works correctly
 * and all CRUD operations function as expected.
 *
 * Run with: npx tsx scripts/test-profiles-view.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface TestResult {
  test: string
  passed: boolean
  error?: string
  duration?: number
}

const results: TestResult[] = []

function logTest(test: string, passed: boolean, error?: string, duration?: number) {
  const emoji = passed ? '✅' : '❌'
  console.log(`${emoji} ${test}`)
  if (error) console.log(`   Error: ${error}`)
  if (duration) console.log(`   Duration: ${duration}ms`)
  results.push({ test, passed, error, duration })
}

async function runTests() {
  console.log('\n🧪 Testing Profiles View Functionality\n')
  console.log('=' .repeat(60))

  const testEmail = `test-${Date.now()}@vybzzz.test`
  let testUserId: string | null = null

  // ========================================
  // Test 1: View exists and is queryable
  // ========================================
  try {
    const start = Date.now()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(1)

    if (error) throw error
    const duration = Date.now() - start

    logTest('View exists and is queryable', true, undefined, duration)
  } catch (error: any) {
    logTest('View exists and is queryable', false, error.message)
  }

  // ========================================
  // Test 2: View has all required columns
  // ========================================
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, display_name, avatar_url, user_type, stripe_customer_id, stripe_account_id, bio')
      .limit(1)

    if (error) throw error

    const requiredColumns = [
      'id',
      'email',
      'full_name',
      'display_name',
      'avatar_url',
      'user_type',
      'stripe_customer_id',
      'stripe_account_id',
      'bio',
    ]

    const hasAllColumns = data && data.length > 0
      ? requiredColumns.every(col => col in data[0])
      : true // If no data, assume structure is correct

    if (!hasAllColumns) {
      throw new Error('Missing required columns')
    }

    logTest('View has all required columns', true)
  } catch (error: any) {
    logTest('View has all required columns', false, error.message)
  }

  // ========================================
  // Test 3: INSERT creates user in users table
  // ========================================
  try {
    const start = Date.now()

    // Insert via profiles view
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        email: testEmail,
        full_name: 'Test User',
        user_type: 'fan',
      })
      .select()
      .single()

    if (insertError) throw insertError
    if (!profile) throw new Error('No profile returned')

    testUserId = profile.id
    const duration = Date.now() - start

    // Verify user exists in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', profile.id)
      .single()

    if (userError) throw userError
    if (!user) throw new Error('User not found in users table')

    logTest('INSERT creates user in users table', true, undefined, duration)
  } catch (error: any) {
    logTest('INSERT creates user in users table', false, error.message)
  }

  // ========================================
  // Test 4: UPDATE modifies user data
  // ========================================
  if (testUserId) {
    try {
      const start = Date.now()

      const newAvatarUrl = 'https://example.com/test-avatar.jpg'

      // Update via profiles view
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', testUserId)

      if (updateError) throw updateError

      // Verify update in users table
      const { data: user, error: selectError } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', testUserId)
        .single()

      if (selectError) throw selectError
      if (user.avatar_url !== newAvatarUrl) {
        throw new Error(`Avatar URL mismatch: expected ${newAvatarUrl}, got ${user.avatar_url}`)
      }

      const duration = Date.now() - start
      logTest('UPDATE modifies user data', true, undefined, duration)
    } catch (error: any) {
      logTest('UPDATE modifies user data', false, error.message)
    }
  } else {
    logTest('UPDATE modifies user data', false, 'Skipped - no test user created')
  }

  // ========================================
  // Test 5: SELECT with display_name alias
  // ========================================
  if (testUserId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, display_name')
        .eq('id', testUserId)
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned')

      // display_name should equal full_name
      if (data.display_name !== data.full_name) {
        throw new Error(`display_name (${data.display_name}) !== full_name (${data.full_name})`)
      }

      logTest('SELECT with display_name alias', true)
    } catch (error: any) {
      logTest('SELECT with display_name alias', false, error.message)
    }
  } else {
    logTest('SELECT with display_name alias', false, 'Skipped - no test user created')
  }

  // ========================================
  // Test 6: Stripe customer ID from fans table
  // ========================================
  if (testUserId) {
    try {
      const testStripeCustomerId = `cus_test_${Date.now()}`

      // Update fan stripe_customer_id
      const { error: fanUpdateError } = await supabase
        .from('fans')
        .update({ stripe_customer_id: testStripeCustomerId })
        .eq('id', testUserId)

      if (fanUpdateError) throw fanUpdateError

      // Verify it appears in profiles view
      const { data, error: selectError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', testUserId)
        .single()

      if (selectError) throw selectError
      if (data.stripe_customer_id !== testStripeCustomerId) {
        throw new Error(`Stripe customer ID mismatch: expected ${testStripeCustomerId}, got ${data.stripe_customer_id}`)
      }

      logTest('Stripe customer ID from fans table', true)
    } catch (error: any) {
      logTest('Stripe customer ID from fans table', false, error.message)
    }
  } else {
    logTest('Stripe customer ID from fans table', false, 'Skipped - no test user created')
  }

  // ========================================
  // Test 7: DELETE removes user
  // ========================================
  if (testUserId) {
    try {
      const start = Date.now()

      // Delete via profiles view
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)

      if (deleteError) throw deleteError

      // Verify deletion from users table
      const { data: user, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', testUserId)
        .single()

      // Should return error (no rows)
      if (user || !selectError) {
        throw new Error('User still exists after delete')
      }

      const duration = Date.now() - start
      logTest('DELETE removes user', true, undefined, duration)
    } catch (error: any) {
      logTest('DELETE removes user', false, error.message)
    }
  } else {
    logTest('DELETE removes user', false, 'Skipped - no test user created')
  }

  // ========================================
  // Test 8: Performance check (query 100 profiles)
  // ========================================
  try {
    const start = Date.now()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, display_name, stripe_customer_id')
      .limit(100)

    if (error) throw error

    const duration = Date.now() - start

    // Performance threshold: should complete in < 500ms
    if (duration > 500) {
      throw new Error(`Query too slow: ${duration}ms (expected < 500ms)`)
    }

    logTest('Performance check (query 100 profiles)', true, undefined, duration)
  } catch (error: any) {
    logTest('Performance check (query 100 profiles)', false, error.message)
  }

  // ========================================
  // Print Summary
  // ========================================
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Test Summary\n')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n🔴 Failed Tests:\n')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  • ${r.test}`)
      if (r.error) console.log(`    ${r.error}`)
    })
  }

  console.log('\n' + '='.repeat(60))

  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check the migrations.')
    process.exit(1)
  } else {
    console.log('\n✅ All tests passed! Profiles view is working correctly.')
    process.exit(0)
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error running tests:', error)
  process.exit(1)
})
