import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-mobile'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 *
 * Handles:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - account.updated (Stripe Connect)
 */
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
    logger.error('Webhook signature verification failed', { error: err.message })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      // ============================================
      // PAYMENT INTENTS
      // ============================================

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata

        logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id, metadata })

        // TICKET PURCHASE
        if (metadata.type === 'ticket_purchase') {
          const { ticket_id, event_id, user_id, artist_id, aa_id, rr_id } = metadata

          // Update ticket status
          const { error: ticketError } = await supabase
            .from('tickets')
            .update({
              payment_status: 'completed',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', ticket_id)

          if (ticketError) {
            logger.error('Failed to update ticket status', {
              ticketId: ticket_id,
              paymentIntentId: paymentIntent.id,
              error: ticketError
            })
            // Don't return - continue processing to increment attendees
          }

          // Increment event attendees
          const { error: attendeeError } = await supabase
            .from('events')
            .update({
              current_attendees: supabase.raw('current_attendees + 1'),
            })
            .eq('id', event_id)

          if (attendeeError) {
            logger.error('Failed to increment event attendees', {
              eventId: event_id,
              ticketId: ticket_id,
              error: attendeeError
            })
          }

          // TODO: Create commissions for AA/RR if present
          if (aa_id || rr_id) {
            // Get ticket price
            const { data: ticket } = await supabase
              .from('tickets')
              .select('purchase_price')
              .eq('id', ticket_id)
              .single()

            if (ticket) {
              const ticketPrice = parseFloat(ticket.purchase_price.toString())

              // AA Commission (if exists)
              if (aa_id) {
                // Level 1: 2.5%
                const { error: commissionError } = await supabase.from('commissions').insert({
                  ticket_id,
                  recipient_id: aa_id,
                  recipient_type: 'aa',
                  commission_level: 1,
                  commission_rate: 0.025,
                  commission_amount: ticketPrice * 0.025,
                  status: 'pending',
                })

                if (commissionError) {
                  logger.error('Failed to create AA commission', {
                    ticketId: ticket_id,
                    aaId: aa_id,
                    error: commissionError
                  })
                }

                // TODO: Get parent and grandparent AA for levels 2 & 3
              }

              // RR Commission (if exists)
              if (rr_id) {
                const { data: rr, error: rrError } = await supabase
                  .from('responsables_regionaux')
                  .select('commission_rate')
                  .eq('id', rr_id)
                  .single()

                if (rrError) {
                  logger.error('Failed to fetch RR commission rate', {
                    rrId: rr_id,
                    error: rrError
                  })
                } else if (rr) {
                  const { error: rrCommissionError } = await supabase.from('commissions').insert({
                    ticket_id,
                    recipient_id: rr_id,
                    recipient_type: 'rr',
                    commission_level: null,
                    commission_rate: rr.commission_rate,
                    commission_amount: ticketPrice * parseFloat(rr.commission_rate.toString()),
                    status: 'pending',
                  })

                  if (rrCommissionError) {
                    logger.error('Failed to create RR commission', {
                      ticketId: ticket_id,
                      rrId: rr_id,
                      error: rrCommissionError
                    })
                  }
                }
              }
            }
          }
        }

        // TIP
        if (metadata.type === 'tip') {
          const { tip_id } = metadata

          // Update tip status
          const { error: tipError } = await supabase
            .from('tips')
            .update({
              payment_status: 'completed',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', tip_id)

          if (tipError) {
            logger.error('Failed to update tip status', {
              tipId: tip_id,
              paymentIntentId: paymentIntent.id,
              error: tipError
            })
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata

        logger.warn('Payment failed', { paymentIntentId: paymentIntent.id, metadata })

        if (metadata.type === 'ticket_purchase') {
          const { error: ticketError } = await supabase
            .from('tickets')
            .update({ payment_status: 'failed' })
            .eq('id', metadata.ticket_id)

          if (ticketError) {
            logger.error('Failed to mark ticket as failed', {
              ticketId: metadata.ticket_id,
              paymentIntentId: paymentIntent.id,
              error: ticketError
            })
          }
        }

        if (metadata.type === 'tip') {
          const { error: tipError } = await supabase
            .from('tips')
            .update({ payment_status: 'failed' })
            .eq('id', metadata.tip_id)

          if (tipError) {
            logger.error('Failed to mark tip as failed', {
              tipId: metadata.tip_id,
              paymentIntentId: paymentIntent.id,
              error: tipError
            })
          }
        }

        break
      }

      // ============================================
      // SUBSCRIPTIONS (Artist tiers)
      // ============================================

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const artistId = subscription.metadata.artist_id

        if (artistId) {
          const status = subscription.status
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

          // Determine tier from price
          const priceId = subscription.items.data[0].price.id
          let tier: 'starter' | 'pro' | 'elite' = 'starter'

          // TODO: Map price IDs to tiers
          // For now, check metadata
          if (subscription.metadata.tier) {
            tier = subscription.metadata.tier as any
          }

          const { error: artistError } = await supabase
            .from('artists')
            .update({
              subscription_tier: tier,
              subscription_ends_at: currentPeriodEnd,
              subscription_starts_at:
                event.type === 'customer.subscription.created'
                  ? new Date(subscription.created * 1000).toISOString()
                  : undefined,
            })
            .eq('id', artistId)

          if (artistError) {
            logger.error('Failed to update artist subscription', {
              artistId,
              subscriptionId: subscription.id,
              tier,
              error: artistError
            })
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const artistId = subscription.metadata.artist_id

        if (artistId) {
          // Downgrade to starter (or disable?)
          const { error: artistError } = await supabase
            .from('artists')
            .update({
              subscription_tier: 'starter',
              subscription_ends_at: null,
            })
            .eq('id', artistId)

          if (artistError) {
            logger.error('Failed to downgrade artist subscription', {
              artistId,
              subscriptionId: subscription.id,
              error: artistError
            })
          }
        }

        break
      }

      // ============================================
      // STRIPE CONNECT
      // ============================================

      case 'account.updated': {
        const account = event.data.object as Stripe.Account

        // Check if account is fully onboarded
        if (account.details_submitted && account.charges_enabled) {
          const { error: accountError } = await supabase
            .from('artists')
            .update({
              stripe_account_completed: true,
            })
            .eq('stripe_account_id', account.id)

          if (accountError) {
            logger.error('Failed to update artist Stripe account status', {
              stripeAccountId: account.id,
              error: accountError
            })
          }
        }

        break
      }

      default:
        logger.warn('Unhandled webhook event type', { eventType: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Error processing webhook', { error: error.message, stack: error.stack })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
