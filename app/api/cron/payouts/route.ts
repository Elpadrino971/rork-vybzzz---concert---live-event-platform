import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe-mobile'

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
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

    console.log('Processing payouts for events ended on:', twentyOneDaysAgo.toISOString())

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
      return NextResponse.json({
        success: true,
        message: 'No events to process',
        processedCount: 0,
      })
    }

    console.log(`Found ${events.length} events to process`)

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const event of events) {
      try {
        // Check if payout already exists for this event
        const { data: existingPayout } = await supabase
          .from('payouts')
          .select('id')
          .eq('artist_id', event.artist_id)
          .eq('event_id', event.id)
          .maybeSingle()

        if (existingPayout) {
          console.log(`Payout already exists for event ${event.id}`)
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
          tickets?.reduce((sum, t) => sum + parseFloat(t.purchase_price.toString()), 0) || 0

        if (totalRevenue === 0) {
          console.log(`No revenue for event ${event.id}, skipping payout`)
          continue
        }

        // Get artist revenue share based on subscription tier
        const tierRevenueSplit = {
          starter: 0.5,  // Artist keeps 50%
          pro: 0.6,      // Artist keeps 60%
          elite: 0.7,    // Artist keeps 70%
        }

        const artistShare = tierRevenueSplit[event.artist.subscription_tier as keyof typeof tierRevenueSplit] || 0.5
        const artistRevenue = totalRevenue * artistShare

        // Get all commissions for this event's tickets
        const { data: commissions, error: commissionsError } = await supabase
          .from('commissions')
          .select('id, commission_amount')
          .in('ticket_id', tickets?.map((t) => t.id) || [])
          .eq('status', 'pending')

        if (commissionsError) {
          throw commissionsError
        }

        // Calculate total commissions to deduct
        const totalCommissions =
          commissions?.reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0

        // Final payout amount = artist revenue - commissions
        const payoutAmount = artistRevenue - totalCommissions

        if (payoutAmount <= 0) {
          console.log(`No payout amount for event ${event.id} after commissions`)
          continue
        }

        // Check if artist has Stripe Connect account
        if (!event.artist.stripe_account_id) {
          console.log(`Artist ${event.artist_id} has no Stripe Connect account`)
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
              stripeAccount: event.artist.stripe_account_id,
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
              .in('id', commissions.map((c) => c.id))
          }

          console.log(` Payout created for event ${event.id}: ${payoutAmount}¬`)
          successCount++
          results.push({
            eventId: event.id,
            artistId: event.artist_id,
            amount: payoutAmount,
            status: 'success',
          })
        } catch (stripeError: any) {
          console.error(`Stripe payout failed for event ${event.id}:`, stripeError)

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
        console.error(`Error processing payout for event ${event.id}:`, error)
        errorCount++
        results.push({
          eventId: event.id,
          artistId: event.artist_id,
          status: 'error',
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${events.length} events. ${successCount} successful, ${errorCount} failed.`,
      processedCount: events.length,
      successCount,
      errorCount,
      results,
    })
  } catch (error: any) {
    console.error('Error in payout cron job:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process payouts' },
      { status: 500 }
    )
  }
}
