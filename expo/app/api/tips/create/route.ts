import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTipPaymentIntent } from '@/lib/stripe'
import { CreateTipSchema, validateRequest, formatZodErrors } from '@/lib/validations'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * POST /api/tips/create - Create a tip for an artist
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
    const validationResult = validateRequest(CreateTipSchema, {
      artist_id: body.artistId || body.artist_id,
      amount: body.amount,
      message: body.message,
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

    const { artist_id: artistId, amount, message } = validationResult.data
    const eventId = body.eventId || body.event_id

    // Get user's profile with Stripe customer ID
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single()

    if (!userProfile?.stripe_customer_id) {
      const response = NextResponse.json(
        { error: 'User has no Stripe account' },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Get artist's profile and verify they exist
    const { data: artistProfile } = await supabase
      .from('artists')
      .select('id, profile:profiles(stripe_account_id, full_name)')
      .eq('id', artistId)
      .single()

    if (!artistProfile) {
      const response = NextResponse.json({ error: 'Artist not found' }, { status: 404 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Extract profile (Supabase returns it as array, but we know there's only one)
    const profile = Array.isArray(artistProfile.profile) ? artistProfile.profile[0] : artistProfile.profile as any

    if (!profile?.stripe_account_id) {
      const response = NextResponse.json(
        { error: 'Artist has not completed Stripe onboarding' },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Create temporary tip ID
    const tempTipId = crypto.randomUUID()

    // Create Stripe Payment Intent for tip
    const paymentIntent = await createTipPaymentIntent(
      Math.round(amount * 100), // Convert to cents
      userProfile.stripe_customer_id,
      profile.stripe_account_id,
      tempTipId,
      eventId
    )

    if (!paymentIntent.success) {
      const response = NextResponse.json({ error: paymentIntent.error }, { status: 500 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Create tip record
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .insert({
        id: tempTipId,
        from_user_id: user.id,
        to_artist_id: artistId,
        event_id: eventId || null,
        amount,
        message: message || null,
        payment_intent_id: paymentIntent.paymentIntentId,
        status: 'pending',
      })
      .select()
      .single()

    if (tipError) {
      const response = NextResponse.json({ error: tipError.message }, { status: 500 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      artist_id: artistId,
      transaction_type: 'tip',
      amount,
      currency: 'EUR',
      stripe_payment_id: paymentIntent.paymentIntentId,
      status: 'pending',
      metadata: {
        tip_id: tip.id,
        event_id: eventId,
      },
    })

    const response = NextResponse.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      tipId: tip.id,
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Error creating tip', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ error: error.message || 'Failed to create tip' }, { status: 500 })
  }
}
