import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .select('*, artist:artists(*, profile:profiles(*))')
      .eq('id', id)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get ticket count
    const { count: ticketCount } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('status', 'confirmed')

    return NextResponse.json({
      event: {
        ...event,
        current_attendees: ticketCount || 0,
      },
    })
  } catch (error: any) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if event exists and belongs to user
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('artist_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existingEvent.artist_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own events' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Update event
    const { data: event, error: updateError } = await supabase
      .from('events')
      .update(body)
      .eq('id', id)
      .select('*, artist:artists(*, profile:profiles(*))')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, event })
  } catch (error: any) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if event exists and belongs to user
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('artist_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existingEvent.artist_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own events' },
        { status: 403 }
      )
    }

    // Don't allow deletion of live or ended events
    if (existingEvent.status === 'live' || existingEvent.status === 'ended') {
      return NextResponse.json(
        { error: 'Cannot delete live or ended events' },
        { status: 400 }
      )
    }

    // Check if there are any confirmed tickets
    const { count: ticketCount } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('status', 'confirmed')

    if (ticketCount && ticketCount > 0) {
      // Instead of deleting, mark as cancelled
      const { error: cancelError } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (cancelError) {
        return NextResponse.json({ error: cancelError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Event cancelled (has existing tickets)',
      })
    }

    // Delete event (no tickets)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Event deleted' })
  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
