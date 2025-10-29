import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateEventSchema, validateRequest, formatZodErrors } from '@/lib/validations'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { CACHE_TTL, getCacheHeaders, invalidateCache, CACHE_TAGS } from '@/lib/cache'

/**
 * Events API
 * GET /api/events - Get all events with filters
 * Supports: status, artist_id, upcoming, limit, offset
 * Rate limit: 60 requests per minute (public)
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ AMÉLIORATION: Rate limiting
    const rateLimitResult = await rateLimit(request, 'public')

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
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get('status')
    const artistId = searchParams.get('artistId') || searchParams.get('artist_id')
    const upcoming = searchParams.get('upcoming') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('events')
      .select(`
        *,
        artist:artists(
          id,
          stage_name,
          avatar_url,
          bio,
          subscription_tier,
          profile:profiles(full_name, avatar_url)
        )
      `, { count: 'exact' })
      .order('scheduled_at', { ascending: upcoming })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (artistId) {
      query = query.eq('artist_id', artistId)
    }

    if (upcoming) {
      query = query.gte('scheduled_at', new Date().toISOString())
    }

    const { data, error, count } = await query

    if (error) {
      const response = NextResponse.json({ error: error.message }, { status: 500 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // ✅ AMÉLIORATION: Cache headers for better performance
    const response = NextResponse.json(
      {
        events: data,
        total: count,
        limit,
        offset,
      },
      {
        headers: getCacheHeaders(CACHE_TTL.EVENTS_LIST),
      }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/events - Create a new event (artist only)
 * Validates:
 * - Artist subscription status and tier
 * - Stripe Connect completion
 * - Ticket price within tier limits (Starter: 5-12€, Pro: 8-18€, Elite: 12-25€)
 * - Happy Hour rules (Wednesday 20h, 4.99€)
 * Rate limit: 100 requests per minute (authenticated API)
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ AMÉLIORATION: Rate limiting
    const rateLimitResult = await rateLimit(request, 'api')

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

    // Check if user is an artist with full details
    const { data: artist } = await supabase
      .from('artists')
      .select('id, subscription_tier, subscription_ends_at, stripe_connect_completed')
      .eq('id', user.id)
      .single()

    if (!artist) {
      const response = NextResponse.json(
        { error: 'Artist account required' },
        { status: 403 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Check if Stripe Connect is completed
    if (!artist.stripe_connect_completed) {
      const response = NextResponse.json(
        { error: 'Please complete Stripe Connect setup first' },
        { status: 403 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Check if subscription is active (or in trial)
    const now = new Date()
    const subscriptionEnds = artist.subscription_ends_at
      ? new Date(artist.subscription_ends_at)
      : null

    if (subscriptionEnds && subscriptionEnds < now) {
      const response = NextResponse.json(
        { error: 'Subscription expired. Please renew to create events.' },
        { status: 403 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    const body = await request.json()

    // ✅ AMÉLIORATION: Validation Zod
    const validationResult = validateRequest(CreateEventSchema, body)
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

    const {
      title,
      description,
      event_type,
      scheduled_at,
      duration_minutes,
      ticket_price,
      max_attendees,
      cover_image_url,
      thumbnail_url,
      stream_url,
      stream_platform,
      is_happy_hour,
    } = validationResult.data

    // Validate ticket price based on subscription tier
    const tierConfig = {
      starter: { min: 5, max: 12 },
      pro: { min: 8, max: 18 },
      elite: { min: 12, max: 25 },
    }

    const tier = artist.subscription_tier as 'starter' | 'pro' | 'elite'
    const priceRange = tierConfig[tier]

    // Happy Hour override (Wednesday 20h, 4.99€)
    let finalPrice = ticket_price
    let finalIsHappyHour = is_happy_hour || false

    if (is_happy_hour) {
      const eventDate = new Date(scheduled_at)
      const isWednesday = eventDate.getDay() === 3
      const hour = eventDate.getHours()

      if (isWednesday && hour === 20) {
        finalPrice = 4.99
        finalIsHappyHour = true
      } else {
        const response = NextResponse.json(
          { error: 'Happy Hour is only available on Wednesdays at 20:00' },
          { status: 400 }
        )
        return addRateLimitHeaders(response, rateLimitResult)
      }
    } else {
      // Validate normal ticket price
      if (ticket_price < priceRange.min || ticket_price > priceRange.max) {
        const response = NextResponse.json(
          {
            error: `Ticket price must be between ${priceRange.min}€ and ${priceRange.max}€ for ${tier} tier`,
          },
          { status: 400 }
        )
        return addRateLimitHeaders(response, rateLimitResult)
      }
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
        ticket_price: finalPrice,
        max_attendees: max_attendees || null,
        cover_image_url: cover_image_url || thumbnail_url || null,
        thumbnail_url: thumbnail_url || cover_image_url || null,
        stream_url: stream_url || null,
        stream_platform: stream_platform || 'youtube',
        is_happy_hour: finalIsHappyHour,
        status: 'scheduled',
        current_attendees: 0,
      })
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

    if (eventError) {
      const response = NextResponse.json({ error: eventError.message }, { status: 500 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // ✅ AMÉLIORATION: Invalidate cache after creating event
    await invalidateCache([CACHE_TAGS.EVENTS])

    const response = NextResponse.json(
      { success: true, event, message: 'Event created successfully' },
      { status: 201 }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
