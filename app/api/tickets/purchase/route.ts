import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTicketPaymentIntent } from '@/lib/stripe'
import { getTicketPrice } from '@/lib/happy-hour'
import { calculateAffiliateCommissions } from '@/lib/affiliates'
import { PurchaseTicketSchema, validateRequest, formatZodErrors } from '@/lib/validations'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * POST /api/tickets/purchase - Purchase a ticket for an event
 * Rate limit: 20 requests per minute (auth endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ AMÉLIORATION: Rate limiting
    const rateLimitResult = await rateLimit(request, 'auth')

    if (!rateLimitResult.success) {
      const response = new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    const body = await request.json()

    // ✅ AMÉLIORATION: Validation Zod
    const validationResult = validateRequest(PurchaseTicketSchema, {
      event_id: body.eventId || body.event_id,
      referral_code: body.affiliateReferralCode || body.referral_code,
    })

    if (!validationResult.success) {
      const response = NextResponse.json(
        {
          error: 'Validation failed',
          details: formatZodErrors(validationResult.errors),
        },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    const { event_id: eventId, referral_code: affiliateReferralCode } = validationResult.data

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, artist:artists(*, profile:profiles(*))')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      const response = NextResponse.json({ error: 'Event not found' }, { status: 404 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Check if event is available
    if (event.status !== 'scheduled' && event.status !== 'live') {
      const response = NextResponse.json({ error: 'Event is not available for ticket purchase' }, { status: 400 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Check if max attendees reached
    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      const response = NextResponse.json({ error: 'Event is sold out' }, { status: 400 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Check if user already has a ticket
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (existingTicket) {
      const response = NextResponse.json({ error: 'You already have a ticket for this event' }, { status: 400 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Calculate ticket price (Happy Hour check)
    const { price: ticketPrice, isHappyHour } = getTicketPrice(
      event.ticket_price,
      event.happy_hour_price
    )

    // Get user's profile with Stripe customer ID
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name, email')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      const response = NextResponse.json({ error: 'User profile not found' }, { status: 404 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Get artist's Stripe account
    const { data: artistProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', event.artist_id)
      .single()

    if (!artistProfile?.stripe_account_id) {
      const response = NextResponse.json(
        { error: 'Artist has not completed Stripe onboarding' },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Handle affiliate referral
    let affiliateId: string | null = null
    let affiliateCommissions: { affiliateId: string; amount: number }[] = []

    if (affiliateReferralCode) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, parent_affiliate_id, grandparent_affiliate_id')
        .eq('referral_code', affiliateReferralCode)
        .eq('is_active', true)
        .single()

      if (affiliate) {
        affiliateId = affiliate.id

        // Calculate commissions for all levels
        const commissions = calculateAffiliateCommissions(ticketPrice)

        // Level 1
        affiliateCommissions.push({
          affiliateId: affiliate.id,
          amount: Math.round(commissions.level1 * 100), // Convert to cents
        })

        // Level 2
        if (affiliate.parent_affiliate_id) {
          affiliateCommissions.push({
            affiliateId: affiliate.parent_affiliate_id,
            amount: Math.round(commissions.level2 * 100),
          })
        }

        // Level 3
        if (affiliate.grandparent_affiliate_id) {
          affiliateCommissions.push({
            affiliateId: affiliate.grandparent_affiliate_id,
            amount: Math.round(commissions.level3 * 100),
          })
        }
      }
    }

    // Create a temporary ticket ID
    const tempTicketId = crypto.randomUUID()

    // Create Stripe Payment Intent
    const paymentIntent = await createTicketPaymentIntent(
      Math.round(ticketPrice * 100), // Convert to cents
      userProfile.stripe_customer_id!,
      artistProfile.stripe_account_id,
      tempTicketId,
      affiliateCommissions
    )

    if (!paymentIntent.success) {
      const response = NextResponse.json({ error: paymentIntent.error }, { status: 500 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Create ticket record
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        id: tempTicketId,
        event_id: eventId,
        user_id: user.id,
        affiliate_id: affiliateId,
        purchase_price: ticketPrice,
        is_happy_hour: isHappyHour,
        payment_intent_id: paymentIntent.paymentIntentId,
        status: 'pending',
      })
      .select()
      .single()

    if (ticketError) {
      const response = NextResponse.json({ error: ticketError.message }, { status: 500 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Create affiliate commissions if applicable
    if (affiliateId) {
      const commissions = calculateAffiliateCommissions(ticketPrice)

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('parent_affiliate_id, grandparent_affiliate_id')
        .eq('id', affiliateId)
        .single()

      const commissionsToInsert: any[] = [
        {
          affiliate_id: affiliateId,
          ticket_id: ticket.id,
          commission_level: 1,
          commission_rate: 0.025,
          commission_amount: commissions.level1,
          status: 'pending',
        },
      ]

      if (affiliate?.parent_affiliate_id) {
        commissionsToInsert.push({
          affiliate_id: affiliate.parent_affiliate_id,
          ticket_id: ticket.id,
          commission_level: 2,
          commission_rate: 0.015,
          commission_amount: commissions.level2,
          status: 'pending',
        })
      }

      if (affiliate?.grandparent_affiliate_id) {
        commissionsToInsert.push({
          affiliate_id: affiliate.grandparent_affiliate_id,
          ticket_id: ticket.id,
          commission_level: 3,
          commission_rate: 0.01,
          commission_amount: commissions.level3,
          status: 'pending',
        })
      }

      await supabase.from('affiliate_commissions').insert(commissionsToInsert)
    }

    const response = NextResponse.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      ticketId: ticket.id,
      price: ticketPrice,
      isHappyHour,
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Error purchasing ticket', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ error: error.message || 'Failed to purchase ticket' }, { status: 500 })
  }
}
