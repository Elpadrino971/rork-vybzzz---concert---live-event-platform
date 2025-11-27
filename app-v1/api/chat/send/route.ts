/**
 * API ROUTE: SEND CHAT MESSAGE V1.0
 * Envoi d'un message dans le chat d'un événement live
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

    // 2. Récupérer les données du message
    const body = await request.json()
    const { event_id, message } = body

    if (!event_id || !message) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier la longueur du message
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message trop long (max 500 caractères)' },
        { status: 400 }
      )
    }

    // 3. Vérifier que l'événement existe et est live
    const { data: event } = await supabase
      .from('events')
      .select('status')
      .eq('id', event_id)
      .single()

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    if (event.status !== 'live' && event.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Le chat n\'est pas disponible pour cet événement' },
        { status: 400 }
      )
    }

    // 4. Vérifier que l'utilisateur a un billet
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      return NextResponse.json(
        { error: 'Vous devez avoir un billet pour participer au chat' },
        { status: 403 }
      )
    }

    // 5. Récupérer le nom d'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const username = userData?.full_name || userData?.email?.split('@')[0] || 'Anonyme'

    // 6. Insérer le message
    const { data: chatMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        event_id,
        user_id: user.id,
        username,
        message: message.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting chat message:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      )
    }

    return NextResponse.json(chatMessage)
  } catch (error: any) {
    console.error('Error in send chat message route:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
