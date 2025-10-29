import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { confirmTicketPurchase, completeTipPayment, cancelTicket } from '@/lib/supabase-rpc'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    logger.error('Webhook signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  // ✅ AMÉLIORATION: Idempotency check
  // Check if this webhook event has already been processed
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    logger.info('Webhook event already processed, skipping', {
      eventId: event.id,
      eventType: event.type,
    })
    return NextResponse.json({ received: true, skipped: true })
  }

  // Store the event to prevent duplicate processing
  const { error: eventInsertError } = await supabase
    .from('webhook_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
      payload: event,
    })

  if (eventInsertError) {
    // If insert fails due to unique constraint, event was already processed by another request
    if (eventInsertError.code === '23505') {
      logger.info('Webhook event already processed (race condition), skipping', {
        eventId: event.id,
        eventType: event.type,
      })
      return NextResponse.json({ received: true, skipped: true })
    }
    logger.error('Error storing webhook event', eventInsertError, {
      eventId: event.id,
      eventType: event.type,
    })
    // Continue processing even if storing fails (better than missing the event)
  }

  // Log webhook received
  logger.webhook('stripe', event.type, event.id)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata

        if (metadata.type === 'ticket_purchase') {
          // ✅ AMÉLIORATION: Atomic transaction via RPC
          const result = await confirmTicketPurchase(paymentIntent.id)

          if (!result.success) {
            logger.error('Failed to confirm ticket purchase', undefined, {
              paymentIntentId: paymentIntent.id,
              error: result.error,
            })
            // Still return 200 to Stripe to avoid retries
          } else {
            logger.payment('ticket_confirmed', paymentIntent.amount / 100, {
              ticketId: result.data?.ticket_id,
              eventId: result.data?.event_id,
              paymentIntentId: paymentIntent.id,
            })

            // Create transaction record for accounting
            await supabase.from('transactions').insert({
              transaction_type: 'ticket_purchase',
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              stripe_payment_id: paymentIntent.id,
              status: 'completed',
              metadata: {
                ticket_id: result.data?.ticket_id,
                event_id: result.data?.event_id,
              },
            })
          }
        } else if (metadata.type === 'tip') {
          // ✅ AMÉLIORATION: Atomic transaction via RPC
          const result = await completeTipPayment(paymentIntent.id)

          if (!result.success) {
            logger.error('Failed to complete tip payment', undefined, {
              paymentIntentId: paymentIntent.id,
              error: result.error,
            })
          } else {
            logger.payment('tip_completed', paymentIntent.amount / 100, {
              tipId: result.data?.tip_id,
              artistId: result.data?.artist_id,
              paymentIntentId: paymentIntent.id,
            })

            // Update transaction record
            await supabase
              .from('transactions')
              .update({ status: 'completed' })
              .eq('stripe_payment_id', paymentIntent.id)
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata

        if (metadata.type === 'ticket_purchase') {
          // Mark ticket as refunded
          await supabase
            .from('tickets')
            .update({ status: 'refunded' })
            .eq('payment_intent_id', paymentIntent.id)
        } else if (metadata.type === 'tip') {
          // Mark tip as failed
          await supabase
            .from('tips')
            .update({ status: 'failed' })
            .eq('payment_intent_id', paymentIntent.id)
        }

        // Update transaction record
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('stripe_payment_id', paymentIntent.id)

        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account

        // Update artist's Stripe Connect status
        if (account.details_submitted && account.charges_enabled) {
          await supabase
            .from('artists')
            .update({ stripe_connect_completed: true })
            .eq('stripe_account_id', account.id)
        }

        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        const metadata = transfer.metadata

        if (metadata.type === 'affiliate_commission') {
          // Record transfer for commission payout
          await supabase
            .from('affiliate_commissions')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
            })
            .eq('id', metadata.commission_id)
        }

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        // Update ticket status
        await supabase
          .from('tickets')
          .update({ status: 'refunded' })
          .eq('payment_intent_id', paymentIntentId)

        // Update tip status
        await supabase
          .from('tips')
          .update({ status: 'refunded' })
          .eq('payment_intent_id', paymentIntentId)

        // Update transaction
        await supabase
          .from('transactions')
          .update({ status: 'refunded' })
          .eq('stripe_payment_id', paymentIntentId)

        break
      }

      default:
        logger.info('Unhandled webhook event type', {
          eventType: event.type,
          eventId: event.id,
        })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Error processing webhook', error, {
      eventType: event.type,
      eventId: event.id,
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
