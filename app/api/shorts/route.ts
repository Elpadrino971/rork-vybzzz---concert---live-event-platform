import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { CACHE_TTL, getCacheHeaders } from '@/lib/cache'
import { logger, createPerformanceTracker } from '@/lib/logger'

/**
 * Shorts Feed API (TikTok-style vertical video feed)
 * GET /api/shorts - Get shorts feed with infinite scroll
 *
 * Shorts are AI-generated highlight clips from concerts
 * Displayed in a vertical swipeable feed (TikTok/Reels style)
 */
export async function GET(request: NextRequest) {
  try {
    const tracker = createPerformanceTracker('shorts_feed')

    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'public')
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Input validation - Pagination
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 50) // Max 50
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Input validation - Filters
    const artistId = searchParams.get('artist_id')
    const eventId = searchParams.get('event_id')
    const sortBy = searchParams.get('sort') || 'recent'

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (artistId && !uuidRegex.test(artistId)) {
      return NextResponse.json({ error: 'Invalid artist ID format' }, { status: 400 })
    }
    if (eventId && !uuidRegex.test(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 })
    }

    // Whitelist validation for sortBy
    const validSortOptions = ['recent', 'popular', 'trending']
    if (!validSortOptions.includes(sortBy)) {
      return NextResponse.json({ error: 'Invalid sort parameter' }, { status: 400 })
    }

    let query = supabase
      .from('shorts')
      .select(`
        id,
        title,
        description,
        video_url,
        thumbnail_url,
        duration_seconds,
        view_count,
        like_count,
        share_count,
        created_at,
        artist:artists(
          id,
          stage_name,
          avatar_url,
          instagram_handle,
          tiktok_handle
        ),
        event:events(
          id,
          title,
          scheduled_at
        )
      `, { count: 'exact' })

    // Filter by artist
    if (artistId) {
      query = query.eq('artist_id', artistId)
    }

    // Filter by event
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    // Sorting
    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'popular') {
      query = query.order('view_count', { ascending: false })
    } else if (sortBy === 'trending') {
      // Trending = high engagement in last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      query = query
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('like_count', { ascending: false })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: shorts, error, count } = await query

    if (error) {
      logger.error('Failed to fetch shorts', error, { artistId, eventId, sortBy })
      throw error
    }

    // Check if user has liked each short (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let shortsWithLikeStatus = shorts || []

    if (user && shorts && shorts.length > 0) {
      const shortIds = shorts.map((s) => s.id)

      const { data: likes } = await supabase
        .from('short_likes')
        .select('short_id')
        .eq('user_id', user.id)
        .in('short_id', shortIds)

      const likedShortIds = new Set(likes?.map((l) => l.short_id) || [])

      shortsWithLikeStatus = shorts.map((short) => ({
        ...short,
        isLiked: likedShortIds.has(short.id),
      }))
    }

    const duration = tracker.end({ artistId, eventId, sortBy, count: count || 0 })

    logger.info('Shorts feed loaded', {
      artistId,
      eventId,
      sortBy,
      count: count || 0,
      limit,
      offset,
      duration,
    })

    const response = NextResponse.json(
      {
        shorts: shortsWithLikeStatus,
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      {
        headers: getCacheHeaders(CACHE_TTL.EVENTS_LIST), // 60 seconds
      }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error fetching shorts', error, { artistId, eventId, sortBy })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shorts' },
      { status: 500 }
    )
  }
}
