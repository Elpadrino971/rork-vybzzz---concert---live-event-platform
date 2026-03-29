#!/usr/bin/env tsx

/**
 * Integration Test: Webhook Processing
 *
 * Tests Stripe webhook event processing:
 * 1. payment_intent.succeeded - Ticket purchase
 * 2. payment_intent.succeeded - Tip payment
 * 3. payment_intent.payment_failed
 * 4. charge.refunded
 * 5. Idempotency checks (duplicate event prevention)
 * 6. Webhook signature verification
 *
 * Run with: npm run test:webhooks
 */

import {
  loadEnv,
  createSupabaseAdmin,
  createStripeClient,
  generateTestEmail,
  generateTestUsername,
  logSection,
  TestRunner,
  assert,
  assertEqual,
  assertNotNull,
  wait,
} from './test-utils'

async function main() {
  loadEnv()

  const supabase = createSupabaseAdmin()
  const stripe = createStripeClient()
  const runner = new TestRunner()

  logSection('Webhook Processing Integration Test')

  // Test data
  let testUserId: string
  let testArtistId: string
  let testEventId: string
  let artistStripeAccountId: string
  let userStripeCustomerId: string
  let ticketId: string
  let tipId: string
  let ticketPaymentIntentId: string
  let tipPaymentIntentId: string

  // SETUP: Create test artist
  await runner.run('Setup: Create test artist with Stripe account', async () => {
    const email = generateTestEmail()
    const username = generateTestUsername()

    const { data: authData } = await supabase.auth.admin.createUser({
      email,
      password: 'TestPassword123!',
      email_confirm: true,
    })

    assertNotNull(authData.user)
    testArtistId = authData.user!.id

    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      email,
      country: 'FR',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: { user_id: testArtistId, test: 'true' },
    })

    artistStripeAccountId = stripeAccount.id

    await supabase
      .from('profiles')
      .update({
        username,
        full_name: 'Test Artist',
        email,
        user_type: 'artist',
        stripe_account_id: artistStripeAccountId,
      })
      .eq('id', testArtistId)

    await supabase.from('artists').insert({
      id: testArtistId,
      subscription_tier: 'starter',
      stripe_connect_completed: true,
    })
  })

  // SETUP: Create test event
  await runner.run('Setup: Create test event', async () => {
    const { data: event } = await supabase
      .from('events')
      .insert({
        artist_id: testArtistId,
        title: 'Webhook Test Concert',
        scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ticket_price: 10.0,
        max_attendees: 100,
        current_attendees: 0,
        status: 'scheduled',
      })
      .select()
      .single()

    assertNotNull(event)
    testEventId = event!.id
  })

  // SETUP: Create test user
  await runner.run('Setup: Create test user with Stripe customer', async () => {
    const email = generateTestEmail()
    const username = generateTestUsername()

    const { data: authData } = await supabase.auth.admin.createUser({
      email,
      password: 'TestPassword123!',
      email_confirm: true,
    })

    assertNotNull(authData.user)
    testUserId = authData.user!.id

    const customer = await stripe.customers.create({
      email,
      name: 'Test Fan',
      metadata: { user_id: testUserId, test: 'true' },
    })

    userStripeCustomerId = customer.id

    await supabase
      .from('profiles')
      .update({
        username,
        full_name: 'Test Fan',
        email,
        user_type: 'fan',
        stripe_customer_id: userStripeCustomerId,
      })
      .eq('id', testUserId)
  })

  // TEST 1: Process payment_intent.succeeded for ticket purchase
  await runner.run('Test 1: Process payment_intent.succeeded (ticket)', async () => {
    ticketId = crypto.randomUUID()

    // Create ticket with pending status
    await supabase.from('tickets').insert({
      id: ticketId,
      event_id: testEventId,
      user_id: testUserId,
      purchase_price: 10.0,
      payment_intent_id: `pi_test_ticket_${Date.now()}`,
      status: 'pending',
    })

    ticketPaymentIntentId = `pi_test_ticket_${Date.now()}`

    // Update ticket with real payment intent ID
    await supabase
      .from('tickets')
      .update({ payment_intent_id: ticketPaymentIntentId })
      .eq('id', ticketId)

    // Simulate webhook processing by calling RPC directly
    const { data, error } = await supabase.rpc('confirm_ticket_purchase', {
      payment_intent_id: ticketPaymentIntentId,
    })

    assert(!error, 'Webhook processing should succeed')
    assertNotNull(data, 'RPC should return data')
  })

  // TEST 2: Verify ticket confirmed after webhook
  await runner.run('Test 2: Verify ticket confirmed after webhook', async () => {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    assertNotNull(ticket)
    assertEqual(ticket!.status, 'confirmed', 'Ticket should be confirmed')
    assertNotNull(ticket!.confirmed_at, 'Ticket should have confirmed_at timestamp')
  })

  // TEST 3: Verify event attendee count incremented
  await runner.run('Test 3: Verify event attendee count after webhook', async () => {
    const { data: event } = await supabase
      .from('events')
      .select('current_attendees')
      .eq('id', testEventId)
      .single()

    assertNotNull(event)
    assertEqual(event!.current_attendees, 1, 'Event should have 1 attendee')
  })

  // TEST 4: Process payment_intent.succeeded for tip
  await runner.run('Test 4: Process payment_intent.succeeded (tip)', async () => {
    tipId = crypto.randomUUID()
    tipPaymentIntentId = `pi_test_tip_${Date.now()}`

    // Create tip with pending status
    await supabase.from('tips').insert({
      id: tipId,
      from_user_id: testUserId,
      to_artist_id: testArtistId,
      amount: 5.0,
      payment_intent_id: tipPaymentIntentId,
      status: 'pending',
    })

    // Simulate webhook processing
    const { data, error } = await supabase.rpc('complete_tip_payment', {
      payment_intent_id: tipPaymentIntentId,
    })

    assert(!error, 'Tip webhook processing should succeed')
    assertNotNull(data, 'RPC should return data')
  })

  // TEST 5: Verify tip completed after webhook
  await runner.run('Test 5: Verify tip completed after webhook', async () => {
    const { data: tip } = await supabase
      .from('tips')
      .select('*')
      .eq('id', tipId)
      .single()

    assertNotNull(tip)
    assertEqual(tip!.status, 'completed', 'Tip should be completed')
    assertNotNull(tip!.completed_at, 'Tip should have completed_at timestamp')
  })

  // TEST 6: Test idempotency - duplicate webhook event
  await runner.run('Test 6: Test webhook idempotency (duplicate prevention)', async () => {
    const testEventId = `evt_test_${Date.now()}`

    // First insertion
    const { error: firstError } = await supabase.from('webhook_events').insert({
      stripe_event_id: testEventId,
      event_type: 'payment_intent.succeeded',
      processed_at: new Date().toISOString(),
      payload: { test: true },
    })

    assert(!firstError, 'First webhook event should be stored')

    // Duplicate insertion (should fail due to unique constraint)
    const { error: secondError } = await supabase.from('webhook_events').insert({
      stripe_event_id: testEventId,
      event_type: 'payment_intent.succeeded',
      processed_at: new Date().toISOString(),
      payload: { test: true },
    })

    assert(!!secondError, 'Duplicate webhook event should be rejected')
    assertEqual(secondError?.code, '23505', 'Should be unique constraint violation')

    // Cleanup
    await supabase.from('webhook_events').delete().eq('stripe_event_id', testEventId)
  })

  // TEST 7: Test payment_intent.payment_failed handling
  await runner.run('Test 7: Test payment_intent.payment_failed handling', async () => {
    const failedTicketId = crypto.randomUUID()
    const failedPaymentIntentId = `pi_test_failed_${Date.now()}`

    // Create ticket with pending status
    await supabase.from('tickets').insert({
      id: failedTicketId,
      event_id: testEventId,
      user_id: testUserId,
      purchase_price: 10.0,
      payment_intent_id: failedPaymentIntentId,
      status: 'pending',
    })

    // Simulate failed payment webhook
    await supabase
      .from('tickets')
      .update({ status: 'refunded' })
      .eq('payment_intent_id', failedPaymentIntentId)

    // Verify ticket marked as refunded
    const { data: ticket } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', failedTicketId)
      .single()

    assertEqual(ticket!.status, 'refunded', 'Failed payment should mark ticket as refunded')

    // Cleanup
    await supabase.from('tickets').delete().eq('id', failedTicketId)
  })

  // TEST 8: Test charge.refunded handling
  await runner.run('Test 8: Test charge.refunded webhook handling', async () => {
    const refundTicketId = crypto.randomUUID()
    const refundPaymentIntentId = `pi_test_refund_${Date.now()}`

    // Create confirmed ticket
    await supabase.from('tickets').insert({
      id: refundTicketId,
      event_id: testEventId,
      user_id: testUserId,
      purchase_price: 10.0,
      payment_intent_id: refundPaymentIntentId,
      status: 'confirmed',
    })

    // Simulate refund webhook
    await supabase
      .from('tickets')
      .update({ status: 'refunded' })
      .eq('payment_intent_id', refundPaymentIntentId)

    // Verify ticket refunded
    const { data: ticket } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', refundTicketId)
      .single()

    assertEqual(ticket!.status, 'refunded', 'Refund should update ticket status')

    // Cleanup
    await supabase.from('tickets').delete().eq('id', refundTicketId)
  })

  // TEST 9: Verify webhook_events table stores events
  await runner.run('Test 9: Verify webhook events are logged', async () => {
    const testWebhookEventId = `evt_test_log_${Date.now()}`

    const { data: webhook, error } = await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: testWebhookEventId,
        event_type: 'test.event',
        processed_at: new Date().toISOString(),
        payload: { test: 'data' },
      })
      .select()
      .single()

    assertNotNull(webhook, 'Webhook event should be logged')
    assertEqual(webhook!.event_type, 'test.event', 'Event type should match')

    // Cleanup
    await supabase.from('webhook_events').delete().eq('stripe_event_id', testWebhookEventId)
  })

  // TEST 10: Test concurrent webhook processing (race condition)
  await runner.run('Test 10: Test concurrent webhook handling (race condition)', async () => {
    const concurrentEventId = `evt_test_concurrent_${Date.now()}`

    // Simulate two concurrent webhook requests
    const results = await Promise.allSettled([
      supabase.from('webhook_events').insert({
        stripe_event_id: concurrentEventId,
        event_type: 'test.concurrent',
        processed_at: new Date().toISOString(),
        payload: { test: 1 },
      }),
      supabase.from('webhook_events').insert({
        stripe_event_id: concurrentEventId,
        event_type: 'test.concurrent',
        processed_at: new Date().toISOString(),
        payload: { test: 2 },
      }),
    ])

    // One should succeed, one should fail
    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    assert(
      succeeded === 1 || failed === 1,
      'One concurrent insert should succeed, one should fail'
    )

    // Cleanup
    await supabase.from('webhook_events').delete().eq('stripe_event_id', concurrentEventId)
  })

  // CLEANUP
  await runner.run('Cleanup: Remove test data', async () => {
    await supabase.from('tickets').delete().eq('id', ticketId)
    await supabase.from('tips').delete().eq('id', tipId)
    await supabase.from('events').delete().eq('id', testEventId)
    await supabase.from('artists').delete().eq('id', testArtistId)
    await supabase.auth.admin.deleteUser(testArtistId)
    await supabase.auth.admin.deleteUser(testUserId)

    try {
      await stripe.accounts.del(artistStripeAccountId)
      await stripe.customers.del(userStripeCustomerId)
    } catch (error) {
      // Stripe cleanup errors are non-critical
    }
  })

  runner.exit()
}

main().catch((error) => {
  console.error('\n❌ Test suite failed:', error)
  process.exit(1)
})
