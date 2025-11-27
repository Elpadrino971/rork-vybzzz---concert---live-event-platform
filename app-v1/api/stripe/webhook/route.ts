/**
 * API ROUTE: STRIPE WEBHOOK V1.0
 * Traitement des événements Stripe (paiements réussis)
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-v1'
import { createClient } from '@/lib/supabase-server-v1'
import Stripe from 'stripe'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Traiter l'événement
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Traiter une session Checkout complétée avec succès
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const supabase = createClient()

  const eventId = session.metadata?.event_id
  const userId = session.metadata?.user_id
  const ticketPrice = parseFloat(session.metadata?.ticket_price || '0')

  if (!eventId || !userId) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  // 1. Vérifier que l'événement existe
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    console.error('Event not found:', eventId)
    return
  }

  // 2. Vérifier qu'il reste de la capacité
  if (event.tickets_sold >= event.capacity) {
    console.error('Event is sold out:', eventId)
    // TODO: Rembourser le client
    return
  }

  // 3. Vérifier qu'il n'y a pas déjà un billet pour cet utilisateur
  const { data: existingTicket } = await supabase
    .from('tickets')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (existingTicket) {
    console.error('User already has a ticket:', userId, eventId)
    return
  }

  // 4. Récupérer l'email de l'utilisateur
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  // 5. Créer le billet
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      event_id: eventId,
      user_id: userId,
      email: user?.email || session.customer_email || '',
      price_paid: ticketPrice,
      stripe_payment_intent_id: session.payment_intent as string,
      qr_code: `TICKET-${eventId}-${userId}-${Date.now()}`, // QR code simple
    })
    .select()
    .single()

  if (ticketError) {
    console.error('Error creating ticket:', ticketError)
    return
  }

  // 6. Incrémenter tickets_sold
  const { error: updateError } = await supabase
    .from('events')
    .update({
      tickets_sold: event.tickets_sold + 1,
    })
    .eq('id', eventId)

  if (updateError) {
    console.error('Error updating tickets_sold:', updateError)
  }

  console.log('Ticket created successfully:', ticket.id)
}

/**
 * Traiter un paiement échoué
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message)
  // TODO: Envoyer un email à l'utilisateur
}
