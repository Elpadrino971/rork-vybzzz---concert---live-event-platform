import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTicketPaymentIntent, createTipPaymentIntent, eurosToCents } from '@/lib/stripe-mobile'
import { logger } from '@/lib/logger'

/**
 * Create Stripe Payment Intent (for tickets or tips)
 * POST /api/stripe/create-payment-intent
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...data } = body

    // Get user's Stripe customer ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('*, fan:fans(*)')
      .eq('id', user.id)
      .single()

    if (!userProfile || !userProfile.fan?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User has no Stripe customer ID' },
        { status: 400 }
      )
    }

    const customerId = userProfile.fan.stripe_customer_id

    // TICKET PURCHASE
    if (type === 'ticket') {
      const { event_id, referral_code } = data

      // Get event details
      const { data: event } = await supabase
        .from('events')
        .select('*, artist:artists(*)')
        .eq('id', event_id)
        .single()

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      if (!event.artist.stripe_account_id) {
        return NextResponse.json(
          { error: 'Artist has no Stripe account' },
          { status: 400 }
        )
      }

      // Check for AA/RR attribution
      let aa_id = null
      let rr_id = null

      if (referral_code) {
        const { data: affiliate } = await supabase
          .from('fans')
          .select('id')
          .eq('referral_code', referral_code)
          .single()

        if (affiliate) {
          aa_id = affiliate.id
        }
      }

      // Create temporary ticket
      const ticketId = crypto.randomUUID()
      const { error: ticketError } = await supabase.from('tickets').insert({
        id: ticketId,
        event_id,
        user_id: user.id,
        purchase_price: event.ticket_price,
        payment_status: 'pending',
        qr_code: `VYB-${Date.now()}-${ticketId.substring(0, 8)}`,
        aa_id,
        rr_id,
      })

      if (ticketError) {
        return NextResponse.json({ error: ticketError.message }, { status: 500 })
      }

      // Create payment intent
      const result = await createTicketPaymentIntent(
        eurosToCents(event.ticket_price),
        customerId,
        event.artist.stripe_account_id,
        ticketId,
        {
          event_id,
          user_id: user.id,
          artist_id: event.artist_id,
          aa_id: aa_id || undefined,
          rr_id: rr_id || undefined,
        }
      )

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json({
        clientSecret: result.clientSecret,
        ticketId,
        amount: eurosToCents(event.ticket_price),
      })
    }

    // TIP
    if (type === 'tip') {
      const { artist_id, amount, message, event_id } = data

      if (!amount || amount < 1) {
        return NextResponse.json(
          { error: 'Minimum tip is 1€' },
          { status: 400 }
        )
      }

      // Get artist
      const { data: artist } = await supabase
        .from('artists')
        .select('stripe_account_id')
        .eq('id', artist_id)
        .single()

      if (!artist || !artist.stripe_account_id) {
        return NextResponse.json(
          { error: 'Artist has no Stripe account' },
          { status: 400 }
        )
      }

      // Create temporary tip
      const tipId = crypto.randomUUID()
      const { error: tipError } = await supabase.from('tips').insert({
        id: tipId,
        from_user_id: user.id,
        to_artist_id: artist_id,
        event_id: event_id || null,
        amount,
        message: message || null,
        payment_status: 'pending',
      })

      if (tipError) {
        return NextResponse.json({ error: tipError.message }, { status: 500 })
      }

      // Create payment intent
      const result = await createTipPaymentIntent(
        eurosToCents(amount),
        customerId,
        artist.stripe_account_id,
        tipId,
        {
          from_user_id: user.id,
          to_artist_id: artist_id,
          event_id: event_id || undefined,
        }
      )

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json({
        clientSecret: result.clientSecret,
        tipId,
        amount: eurosToCents(amount),
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error: any) {
    logger.error('Error creating payment intent', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ error: error.message || 'Failed to create payment intent' }, { status: 500 })
  }
}
