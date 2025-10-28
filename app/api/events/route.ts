import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all events (with filters)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get('status')
    const artistId = searchParams.get('artistId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('events')
      .select('*, artist:artists(*, profile:profiles(*))', { count: 'exact' })
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (artistId) {
      query = query.eq('artist_id', artistId)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      events: data,
      total: count,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new event
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

    // Check if user is an artist
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!artist) {
      return NextResponse.json(
        { error: 'Only artists can create events' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      title,
      description,
      event_type,
      scheduled_at,
      duration_minutes,
      ticket_price,
      happy_hour_price,
      max_attendees,
      cover_image_url,
    } = body

    // Validate required fields
    if (!title || !scheduled_at || !ticket_price) {
      return NextResponse.json(
        { error: 'Title, scheduled time, and ticket price are required' },
        { status: 400 }
      )
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        artist_id: user.id,
        title,
        description: description || null,
        event_type: event_type || 'live',
        scheduled_at,
        duration_minutes: duration_minutes || null,
        ticket_price,
        happy_hour_price: happy_hour_price || null,
        max_attendees: max_attendees || null,
        cover_image_url: cover_image_url || null,
        status: 'draft',
      })
      .select('*, artist:artists(*, profile:profiles(*))')
      .single()

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }

    // Update artist's total events count
    await supabase.rpc('increment_artist_events', { artist_id: user.id })

    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
