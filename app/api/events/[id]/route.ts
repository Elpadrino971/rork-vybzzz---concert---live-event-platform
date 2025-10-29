import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { CACHE_TTL, getCacheHeaders, invalidateCache, CACHE_TAGS } from '@/lib/cache'
import { logger, createPerformanceTracker } from '@/lib/logger'
import { z } from 'zod'

// GET - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const tracker = createPerformanceTracker('get_event_detail')

    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'public')
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .select('*, artist:artists(*, profile:profiles(*))')
      .eq('id', id)
      .single()

    if (error || !event) {
      logger.warn('Event not found', { eventId: id })
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get ticket count
    const { count: ticketCount } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('status', 'confirmed')

    const duration = tracker.end({ eventId: id, ticketCount: ticketCount || 0 })

    logger.info('Event detail loaded', {
      eventId: id,
      artistId: event.artist_id,
      ticketCount: ticketCount || 0,
      duration,
    })

    const response = NextResponse.json(
      {
        event: {
          ...event,
          current_attendees: ticketCount || 0,
        },
      },
      {
        headers: getCacheHeaders(CACHE_TTL.EVENT_DETAIL), // 300 seconds
      }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error fetching event', error, { eventId: id })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/events/[id] - Update an event
 * Validates ticket price changes based on artist subscription tier
 * Only allows updates to own events
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'api')
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 })
    }

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
      .select('artist_id, status, scheduled_at')
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

    // Don't allow updates to live or ended events
    if (existingEvent.status === 'live' || existingEvent.status === 'ended') {
      return NextResponse.json(
        { error: 'Cannot update live or ended events' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // If ticket price is being updated, validate it
    if (body.ticket_price !== undefined) {
      const { data: artist } = await supabase
        .from('artists')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (artist) {
        const tierConfig = {
          starter: { min: 5, max: 12 },
          pro: { min: 8, max: 18 },
          elite: { min: 12, max: 25 },
        }

        const tier = artist.subscription_tier as 'starter' | 'pro' | 'elite'
        const priceRange = tierConfig[tier]

        // Allow Happy Hour price (4.99€) if scheduled on Wednesday 20h
        const eventDate = new Date(body.scheduled_at || existingEvent.scheduled_at)
        const isWednesday = eventDate.getDay() === 3
        const hour = eventDate.getHours()
        const isHappyHour = isWednesday && hour === 20 && body.ticket_price === 4.99

        if (!isHappyHour && (body.ticket_price < priceRange.min || body.ticket_price > priceRange.max)) {
          return NextResponse.json(
            {
              error: `Ticket price must be between ${priceRange.min}€ and ${priceRange.max}€ for ${tier} tier`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Update event
    const { data: event, error: updateError } = await supabase
      .from('events')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        artist:artists(
          id,
          stage_name,
          avatar_url,
          bio,
          subscription_tier
        )
      `)
      .single()

    if (updateError) {
      logger.error('Failed to update event', updateError, { eventId: id, userId: user.id })
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Invalidate cache
    await invalidateCache([CACHE_TAGS.EVENTS, CACHE_TAGS.EVENT(id)])

    logger.info('Event updated successfully', {
      eventId: id,
      userId: user.id,
      artistId: event.artist_id,
    })

    const response = NextResponse.json({ success: true, event, message: 'Event updated successfully' })
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error updating event', error, { eventId: id })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'api')
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 })
    }

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
        logger.error('Failed to cancel event', cancelError, { eventId: id, userId: user.id })
        return NextResponse.json({ error: cancelError.message }, { status: 500 })
      }

      // Invalidate cache
      await invalidateCache([CACHE_TAGS.EVENTS, CACHE_TAGS.EVENT(id)])

      logger.info('Event cancelled (has existing tickets)', {
        eventId: id,
        userId: user.id,
        ticketCount,
      })

      const response = NextResponse.json({
        success: true,
        message: 'Event cancelled (has existing tickets)',
      })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Delete event (no tickets)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (deleteError) {
      logger.error('Failed to delete event', deleteError, { eventId: id, userId: user.id })
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Invalidate cache
    await invalidateCache([CACHE_TAGS.EVENTS, CACHE_TAGS.EVENT(id)])

    logger.info('Event deleted successfully', {
      eventId: id,
      userId: user.id,
    })

    const response = NextResponse.json({ success: true, message: 'Event deleted' })
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error deleting event', error, { eventId: id })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
