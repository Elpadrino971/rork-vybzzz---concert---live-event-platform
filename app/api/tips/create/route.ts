import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTipPaymentIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { artistId, amount, message, eventId } = await request.json()

    // Validate input
    if (!artistId || !amount) {
      return NextResponse.json(
        { error: 'Artist ID and amount are required' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum tip amount is €1' },
        { status: 400 }
      )
    }

    // Get user's profile with Stripe customer ID
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single()

    if (!userProfile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User has no Stripe account' },
        { status: 400 }
      )
    }

    // Get artist's profile and verify they exist
    const { data: artistProfile } = await supabase
      .from('artists')
      .select('id, profile:profiles(stripe_account_id, full_name)')
      .eq('id', artistId)
      .single()

    if (!artistProfile) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    if (!artistProfile.profile?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Artist has not completed Stripe onboarding' },
        { status: 400 }
      )
    }

    // Create temporary tip ID
    const tempTipId = crypto.randomUUID()

    // Create Stripe Payment Intent for tip
    const paymentIntent = await createTipPaymentIntent(
      Math.round(amount * 100), // Convert to cents
      userProfile.stripe_customer_id,
      artistProfile.profile.stripe_account_id,
      tempTipId,
      eventId
    )

    if (!paymentIntent.success) {
      return NextResponse.json({ error: paymentIntent.error }, { status: 500 })
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
      return NextResponse.json({ error: tipError.message }, { status: 500 })
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

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      tipId: tip.id,
    })
  } catch (error: any) {
    console.error('Error creating tip:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
