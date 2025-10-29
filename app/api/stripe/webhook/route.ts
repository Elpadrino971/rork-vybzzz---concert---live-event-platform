import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-mobile'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

/**
 * Map Stripe price IDs to subscription tiers
 */
function getPriceIdToTierMap(): Record<string, 'starter' | 'pro' | 'elite'> {
  const map: Record<string, 'starter' | 'pro' | 'elite'> = {}

  if (process.env.STRIPE_PRICE_STARTER) {
    map[process.env.STRIPE_PRICE_STARTER] = 'starter'
  }
  if (process.env.STRIPE_PRICE_PRO) {
    map[process.env.STRIPE_PRICE_PRO] = 'pro'
  }
  if (process.env.STRIPE_PRICE_ELITE) {
    map[process.env.STRIPE_PRICE_ELITE] = 'elite'
  }

  return map
}

/**
 * Determine subscription tier from Stripe price ID
 */
function getTierFromPriceId(priceId: string, metadata?: Stripe.Metadata): 'starter' | 'pro' | 'elite' {
  // First, try to map from price ID
  const priceIdMap = getPriceIdToTierMap()
  const tierFromPriceId = priceIdMap[priceId]

  if (tierFromPriceId) {
    return tierFromPriceId
  }

  // Fallback to metadata if price ID mapping fails
  if (metadata?.tier && ['starter', 'pro', 'elite'].includes(metadata.tier)) {
    return metadata.tier as 'starter' | 'pro' | 'elite'
  }

  // Default to starter if no mapping found
  logger.warn('Unable to determine tier from price ID, defaulting to starter', { priceId, metadata })
  return 'starter'
}

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
    logger.error('Webhook signature verification failed', err instanceof Error ? err : new Error(String(err)))
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
            logger.error('Failed to update ticket status', undefined, {
              ticketId: ticket_id,
              paymentIntentId: paymentIntent.id,
              errorMessage: ticketError.message
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
            logger.error('Failed to increment event attendees', undefined, {
              eventId: event_id,
              ticketId: ticket_id,
              errorMessage: attendeeError.message
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
                  logger.error('Failed to create AA commission', undefined, {
                    ticketId: ticket_id,
                    aaId: aa_id,
                    errorMessage: commissionError.message
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
                  logger.error('Failed to fetch RR commission rate', undefined, {
                    rrId: rr_id,
                    errorMessage: rrError.message
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
                    logger.error('Failed to create RR commission', undefined, {
                      ticketId: ticket_id,
                      rrId: rr_id,
                      errorMessage: rrCommissionError.message
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
            logger.error('Failed to update tip status', undefined, {
              tipId: tip_id,
              paymentIntentId: paymentIntent.id,
              errorMessage: tipError.message
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
            logger.error('Failed to mark ticket as failed', undefined, {
              ticketId: metadata.ticket_id,
              paymentIntentId: paymentIntent.id,
              errorMessage: ticketError.message
            })
          }
        }

        if (metadata.type === 'tip') {
          const { error: tipError } = await supabase
            .from('tips')
            .update({ payment_status: 'failed' })
            .eq('id', metadata.tip_id)

          if (tipError) {
            logger.error('Failed to mark tip as failed', undefined, {
              tipId: metadata.tip_id,
              paymentIntentId: paymentIntent.id,
              errorMessage: tipError.message
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

          // Determine tier from price ID
          const priceId = subscription.items.data[0].price.id
          const tier = getTierFromPriceId(priceId, subscription.metadata)

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
            logger.error('Failed to update artist subscription', undefined, {
              artistId,
              subscriptionId: subscription.id,
              tier,
              errorMessage: artistError.message
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
            logger.error('Failed to downgrade artist subscription', undefined, {
              artistId,
              subscriptionId: subscription.id,
              errorMessage: artistError.message
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
            logger.error('Failed to update artist Stripe account status', undefined, {
              stripeAccountId: account.id,
              errorMessage: accountError.message
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
    logger.error('Error processing webhook', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ error: error.message || 'Failed to process webhook' }, { status: 500 })
  }
}
