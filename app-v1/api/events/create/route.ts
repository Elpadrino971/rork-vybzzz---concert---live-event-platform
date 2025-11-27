/**
 * API ROUTE: CREATE EVENT V1.0
 * Création d'un nouvel événement par un artiste
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server-v1'

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

    // 2. Vérifier que l'utilisateur est un artiste
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'artist') {
      return NextResponse.json(
        { error: 'Accès réservé aux artistes' },
        { status: 403 }
      )
    }

    // 3. Récupérer les données de l'événement
    const body = await request.json()
    const { title, description, event_date, ticket_price, capacity, image_url } = body

    // 4. Validations
    if (!title || !event_date || !ticket_price || !capacity) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    if (ticket_price < 1) {
      return NextResponse.json(
        { error: 'Le prix minimum est de 1€' },
        { status: 400 }
      )
    }

    if (capacity < 1) {
      return NextResponse.json(
        { error: 'La capacité doit être au moins de 1' },
        { status: 400 }
      )
    }

    // Vérifier que la date est dans le futur
    const eventDateTime = new Date(event_date)
    if (eventDateTime < new Date()) {
      return NextResponse.json(
        { error: 'La date de l\'événement doit être dans le futur' },
        { status: 400 }
      )
    }

    // 5. Créer l'événement
    const { data: event, error: createError } = await supabase
      .from('events')
      .insert({
        artist_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        event_date: eventDateTime.toISOString(),
        ticket_price: parseFloat(ticket_price),
        capacity: parseInt(capacity),
        image_url: image_url?.trim() || null,
        status: 'upcoming',
        tickets_sold: 0,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating event:', createError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'événement' },
        { status: 500 }
      )
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error('Error in create event route:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
