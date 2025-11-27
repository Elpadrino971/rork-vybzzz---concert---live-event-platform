/**
 * API ROUTE: PURCHASE TICKET V1.0
 * Création d'une session Stripe Checkout pour acheter un billet
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server-v1'
import { stripe } from '@/lib/stripe-v1'

export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer l'utilisateur connecté
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 2. Récupérer l'ID de l'événement depuis le body
    const formData = await request.formData()
    const eventId = formData.get('eventId') as string

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID événement manquant' },
        { status: 400 }
      )
    }

    // 3. Vérifier que l'événement existe et est disponible
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // 4. Vérifications business
    if (event.status !== 'upcoming') {
      return NextResponse.json(
        { error: "L'événement n'est pas disponible à l'achat" },
        { status: 400 }
      )
    }

    if (event.tickets_sold >= event.capacity) {
      return NextResponse.json(
        { error: 'Événement complet' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a déjà un billet pour cet événement
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (existingTicket) {
      return NextResponse.json(
        { error: 'Vous avez déjà un billet pour cet événement' },
        { status: 400 }
      )
    }

    // 5. Récupérer ou créer le stripe_customer_id
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let stripeCustomerId = userData?.stripe_customer_id

    if (!stripeCustomerId) {
      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      stripeCustomerId = customer.id

      // Sauvegarder le stripe_customer_id
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    // 6. Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Billet - ${event.title}`,
              description: `Concert le ${new Date(event.event_date).toLocaleDateString('fr-FR')}`,
              images: event.image_url ? [event.image_url] : undefined,
            },
            unit_amount: Math.round(event.ticket_price * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/ticket/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/event/${eventId}`,
      metadata: {
        event_id: eventId,
        user_id: user.id,
        ticket_price: event.ticket_price.toString(),
      },
    })

    // 7. Retourner l'URL de la session Checkout
    return NextResponse.redirect(session.url!, 303)
  } catch (error: any) {
    console.error('Erreur lors de la création de la session Checkout:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
