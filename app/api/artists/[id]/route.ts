import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { CACHE_TTL, getCacheHeaders, CACHE_TAGS } from '@/lib/cache'
import { logger } from '@/lib/logger'

/**
 * Artist Detail API
 * GET /api/artists/[id] - Get artist profile with stats
 * Rate limit: 60 requests per minute (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ SÉCURITÉ: Rate limiting
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
    const { id: artistId } = await params

    // ✅ SÉCURITÉ: Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(artistId)) {
      const response = NextResponse.json(
        { error: 'Invalid artist ID format' },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Get artist profile
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select(`
        *,
        profile:profiles(
          full_name,
          email,
          avatar_url,
          bio,
          city,
          country
        )
      `)
      .eq('id', artistId)
      .single()

    if (artistError || !artist) {
      if (artistError) {
        logger.error('Error fetching artist', artistError, { artistId })
      }
      const response = NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Get upcoming events
    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('id, title, scheduled_at, ticket_price, thumbnail_url, current_attendees, max_attendees')
      .eq('artist_id', artistId)
      .gte('scheduled_at', new Date().toISOString())
      .in('status', ['scheduled', 'live'])
      .order('scheduled_at', { ascending: true })
      .limit(5)

    // Get past events count
    const { count: pastEventsCount } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', artistId)
      .eq('status', 'ended')

    // Get recent shorts (highlights)
    const { data: shorts } = await supabase
      .from('shorts')
      .select('id, title, video_url, thumbnail_url, view_count, like_count, created_at')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Check if current user is following this artist
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let isFollowing = false
    if (user) {
      const { data: followData } = await supabase
        .from('artist_followers')
        .select('id')
        .eq('fan_id', user.id)
        .eq('artist_id', artistId)
        .maybeSingle()

      isFollowing = !!followData
    }

    // ✅ PERFORMANCE: Cache headers (5 minutes)
    // NOTE: N+1 query problem here (4 separate queries)
    // TODO: Create RPC function to optimize this
    const response = NextResponse.json(
      {
        artist: {
          id: artist.id,
          stageName: artist.stage_name,
          bio: artist.bio,
          avatarUrl: artist.avatar_url,
          bannerUrl: artist.banner_url,
          instagramHandle: artist.instagram_handle,
          tiktokHandle: artist.tiktok_handle,
          youtubeChannel: artist.youtube_channel,
          genre: artist.genre,
          country: artist.country,
          totalFollowers: artist.total_followers || 0,
          totalEvents: artist.total_events || 0,
          subscriptionTier: artist.subscription_tier,
          isFollowing,
        },
        upcomingEvents: upcomingEvents || [],
        pastEventsCount: pastEventsCount || 0,
        shorts: shorts || [],
      },
      {
        headers: getCacheHeaders(CACHE_TTL.ARTIST_DETAIL),
      }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error in artist detail API', error, { artistId: (await params).id })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
