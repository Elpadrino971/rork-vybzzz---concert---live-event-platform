/**
 * API ROUTE: CRON PAYOUTS V1.0
 * Paiements automatiques J+21 pour les artistes
 * Déclenché quotidiennement par Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server-v1'
import { stripe } from '@/lib/stripe-v1'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret du cron job
    const authHeader = headers().get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // 1. Trouver les événements terminés il y a exactement 21 jours
    const twentyOneDaysAgo = new Date()
    twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21)
    twentyOneDaysAgo.setHours(0, 0, 0, 0)

    const twentyOneDaysAgoEnd = new Date(twentyOneDaysAgo)
    twentyOneDaysAgoEnd.setHours(23, 59, 59, 999)

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'ended')
      .gte('event_date', twentyOneDaysAgo.toISOString())
      .lte('event_date', twentyOneDaysAgoEnd.toISOString())

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json(
        { error: 'Error fetching events' },
        { status: 500 }
      )
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        message: 'No events to process',
        date: twentyOneDaysAgo.toISOString(),
      })
    }

    const results = []

    // 2. Traiter chaque événement
    for (const event of events) {
      try {
        // Vérifier si le payout a déjà été effectué
        const { data: existingPayout } = await supabase
          .from('payouts')
          .select('id')
          .eq('event_id', event.id)
          .single()

        if (existingPayout) {
          results.push({
            event_id: event.id,
            status: 'skipped',
            reason: 'Payout already exists',
          })
          continue
        }

        // Calculer les revenus
        const grossRevenue = event.tickets_sold * event.ticket_price
        const artistShare = grossRevenue * 0.7 // 70% pour l'artiste
        const platformShare = grossRevenue * 0.3 // 30% pour la plateforme

        // Vérifier le montant minimum
        if (artistShare < 10) {
          results.push({
            event_id: event.id,
            status: 'skipped',
            reason: 'Amount below minimum (10€)',
            amount: artistShare,
          })
          continue
        }

        // Récupérer le stripe_account_id de l'artiste
        const { data: artist } = await supabase
          .from('users')
          .select('stripe_account_id, email, full_name')
          .eq('id', event.artist_id)
          .single()

        if (!artist?.stripe_account_id) {
          results.push({
            event_id: event.id,
            status: 'error',
            reason: 'Artist has no Stripe Connect account',
          })
          continue
        }

        // 3. Créer le payout Stripe
        const payout = await stripe.transfers.create({
          amount: Math.round(artistShare * 100), // Convertir en centimes
          currency: 'eur',
          destination: artist.stripe_account_id,
          description: `Payout for event: ${event.title}`,
          metadata: {
            event_id: event.id,
            artist_id: event.artist_id,
            gross_revenue: grossRevenue.toString(),
            artist_share: artistShare.toString(),
          },
        })

        // 4. Enregistrer le payout dans la base de données
        const { error: payoutError } = await supabase.from('payouts').insert({
          event_id: event.id,
          artist_id: event.artist_id,
          gross_revenue: grossRevenue,
          artist_share: artistShare,
          platform_share: platformShare,
          stripe_payout_id: payout.id,
          payout_date: new Date().toISOString(),
        })

        if (payoutError) {
          console.error('Error recording payout:', payoutError)
          results.push({
            event_id: event.id,
            status: 'error',
            reason: 'Failed to record payout in database',
            stripe_transfer_id: payout.id,
          })
          continue
        }

        results.push({
          event_id: event.id,
          status: 'success',
          amount: artistShare,
          stripe_transfer_id: payout.id,
        })

        // TODO: Envoyer un email de confirmation à l'artiste
      } catch (error: any) {
        console.error(`Error processing payout for event ${event.id}:`, error)
        results.push({
          event_id: event.id,
          status: 'error',
          reason: error.message,
        })
      }
    }

    return NextResponse.json({
      message: 'Payouts processed',
      date: twentyOneDaysAgo.toISOString(),
      total_events: events.length,
      results,
    })
  } catch (error: any) {
    console.error('Error in payouts cron:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
