import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe-mobile'
import { logger, createPerformanceTracker } from '@/lib/logger'
import { env } from '@/lib/env'
import { emailHelpers } from '@/lib/email'

/**
 * Payout Cron Job - J+21
 * GET /api/cron/payouts
 *
 * This endpoint should be called daily by a cron job (e.g., Vercel Cron, GitHub Actions)
 * to process payouts to artists 21 days after their events ended.
 *
 * Process:
 * 1. Find all events that ended exactly 21 days ago
 * 2. Calculate artist revenue (based on subscription tier)
 * 3. Subtract pending commissions (AA/RR)
 * 4. Create payout record
 * 5. Initiate Stripe payout to artist's connected account
 *
 * Security: This endpoint should be protected with an API key or cron secret
 */

export async function GET(request: NextRequest) {
  const tracker = createPerformanceTracker('cron_payouts')

  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron access attempt', {
      hasAuthHeader: !!authHeader,
      hasCronSecret: !!cronSecret,
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // Calculate date 21 days ago
    const twentyOneDaysAgo = new Date()
    twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21)
    twentyOneDaysAgo.setHours(0, 0, 0, 0)

    const twentyOneDaysAgoEnd = new Date(twentyOneDaysAgo)
    twentyOneDaysAgoEnd.setHours(23, 59, 59, 999)

    logger.info('Starting payout cron job', {
      targetDate: twentyOneDaysAgo.toISOString(),
    })

    // Find all events that ended exactly 21 days ago
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        artist_id,
        title,
        ended_at,
        artist:artists(
          id,
          stage_name,
          stripe_account_id,
          subscription_tier
        )
      `)
      .eq('status', 'ended')
      .gte('ended_at', twentyOneDaysAgo.toISOString())
      .lte('ended_at', twentyOneDaysAgoEnd.toISOString())

    if (eventsError) {
      throw eventsError
    }

    if (!events || events.length === 0) {
      logger.info('No events to process for payouts', {
        targetDate: twentyOneDaysAgo.toISOString(),
      })
      return NextResponse.json({
        success: true,
        message: 'No events to process',
        processedCount: 0,
      })
    }

    logger.info('Found events to process for payouts', {
      eventCount: events.length,
      targetDate: twentyOneDaysAgo.toISOString(),
    })

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const event of events) {
      try {
        // Extract artist (Supabase returns it as array, but we know there's only one)
        const artist = Array.isArray(event.artist) ? event.artist[0] : event.artist as any

        // Check if payout already exists for this event
        const { data: existingPayout } = await supabase
          .from('payouts')
          .select('id')
          .eq('artist_id', event.artist_id)
          .eq('event_id', event.id)
          .maybeSingle()

        if (existingPayout) {
          logger.info('Payout already exists for event, skipping', {
            eventId: event.id,
            artistId: event.artist_id,
          })
          continue
        }

        // Get all confirmed tickets for this event
        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select('id, purchase_price')
          .eq('event_id', event.id)
          .eq('payment_status', 'completed')

        if (ticketsError) {
          throw ticketsError
        }

        // Calculate total revenue from tickets
        const totalRevenue =
          tickets?.reduce((sum: number, t: any) => sum + parseFloat(t.purchase_price.toString()), 0) || 0

        if (totalRevenue === 0) {
          logger.info('No revenue for event, skipping payout', {
            eventId: event.id,
            artistId: event.artist_id,
          })
          continue
        }

        // Get artist revenue share based on subscription tier
        const tierRevenueSplit = {
          starter: 0.5,  // Artist keeps 50%
          pro: 0.6,      // Artist keeps 60%
          elite: 0.7,    // Artist keeps 70%
        }

        const artistShare = tierRevenueSplit[artist.subscription_tier as keyof typeof tierRevenueSplit] || 0.5
        const artistRevenue = totalRevenue * artistShare

        // Get all commissions for this event's tickets
        const { data: commissions, error: commissionsError } = await supabase
          .from('commissions')
          .select('id, commission_amount')
          .in('ticket_id', tickets?.map((t: any) => t.id) || [])
          .eq('status', 'pending')

        if (commissionsError) {
          throw commissionsError
        }

        // Calculate total commissions to deduct
        const totalCommissions =
          commissions?.reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount.toString()), 0) || 0

        // Final payout amount = artist revenue - commissions
        const payoutAmount = artistRevenue - totalCommissions

        if (payoutAmount <= 0) {
          logger.info('No payout amount after commissions, skipping', {
            eventId: event.id,
            artistId: event.artist_id,
            artistRevenue,
            totalCommissions,
          })
          continue
        }

        // Check if artist has Stripe Connect account
        if (!artist.stripe_account_id) {
          logger.warn('Artist has no Stripe Connect account, skipping payout', {
            eventId: event.id,
            artistId: event.artist_id,
            payoutAmount,
          })
          continue
        }

        // Create payout record
        const { data: payout, error: payoutError } = await supabase
          .from('payouts')
          .insert({
            artist_id: event.artist_id,
            event_id: event.id,
            amount: payoutAmount,
            scheduled_at: new Date().toISOString(),
            status: 'processing',
          })
          .select()
          .single()

        if (payoutError) {
          throw payoutError
        }

        // Initiate Stripe payout
        try {
          const stripePayoutAmount = Math.round(payoutAmount * 100) // Convert to cents

          const stripePayout = await stripe.payouts.create(
            {
              amount: stripePayoutAmount,
              currency: 'eur',
              metadata: {
                payout_id: payout.id,
                event_id: event.id,
                artist_id: event.artist_id,
              },
            },
            {
              stripeAccount: artist.stripe_account_id,
            }
          )

          // Update payout record with Stripe payout ID
          await supabase
            .from('payouts')
            .update({
              stripe_payout_id: stripePayout.id,
              status: 'processing',
            })
            .eq('id', payout.id)

          // Mark commissions as paid
          if (commissions && commissions.length > 0) {
            await supabase
              .from('commissions')
              .update({ status: 'paid' })
              .in('id', commissions.map((c: any) => c.id))
          }

          // Send payout notification email to artist
          try {
            const { data: artistProfile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', event.artist_id)
              .single()

            if (artistProfile?.email) {
              // Calculate period (month/year from event date)
              const eventEndDate = new Date(event.ended_at)
              const period = eventEndDate.toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
              })

              await emailHelpers.sendPayoutNotification(artistProfile.email, {
                artistName: artistProfile.full_name || artist.stage_name || 'Artiste',
                amount: payoutAmount.toFixed(2),
                period: period,
                transferId: stripePayout.id,
              })

              logger.info('Payout notification email sent', {
                payoutId: payout.id,
                email: artistProfile.email,
              })
            }
          } catch (emailError) {
            logger.error('Failed to send payout notification email', emailError instanceof Error ? emailError : new Error(String(emailError)))
          }

          logger.payment('payout_created', payoutAmount, {
            eventId: event.id,
            artistId: event.artist_id,
            payoutId: payout.id,
            stripePayoutId: stripePayout.id,
            commissionsCount: commissions?.length || 0,
          })
          successCount++
          results.push({
            eventId: event.id,
            artistId: event.artist_id,
            amount: payoutAmount,
            status: 'success',
          })
        } catch (stripeError: any) {
          logger.error('Stripe payout failed', stripeError, {
            eventId: event.id,
            artistId: event.artist_id,
            payoutAmount,
          })

          // Update payout status to failed
          await supabase
            .from('payouts')
            .update({
              status: 'failed',
              error_message: stripeError.message,
            })
            .eq('id', payout.id)

          errorCount++
          results.push({
            eventId: event.id,
            artistId: event.artist_id,
            amount: payoutAmount,
            status: 'failed',
            error: stripeError.message,
          })
        }
      } catch (error: any) {
        logger.error('Error processing payout for event', error, {
          eventId: event.id,
          artistId: event.artist_id,
        })
        errorCount++
        results.push({
          eventId: event.id,
          artistId: event.artist_id,
          status: 'error',
          error: error.message,
        })
      }
    }

    const duration = tracker.end({ eventCount: events.length, successCount, errorCount })

    logger.info('Payout cron job completed', {
      totalEvents: events.length,
      successCount,
      errorCount,
      duration,
    })

    return NextResponse.json({
      success: true,
      message: `Processed ${events.length} events. ${successCount} successful, ${errorCount} failed.`,
      processedCount: events.length,
      successCount,
      errorCount,
      results,
    })
  } catch (error: any) {
    logger.error('Unexpected error in payout cron job', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process payouts' },
      { status: 500 }
    )
  }
}
