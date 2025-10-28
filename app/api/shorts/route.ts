import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Shorts Feed API (TikTok-style vertical video feed)
 * GET /api/shorts - Get shorts feed with infinite scroll
 *
 * Shorts are AI-generated highlight clips from concerts
 * Displayed in a vertical swipeable feed (TikTok/Reels style)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  // Pagination
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Filters
  const artistId = searchParams.get('artist_id')
  const eventId = searchParams.get('event_id')
  const sortBy = searchParams.get('sort') || 'recent' // recent, popular, trending

  try {
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

    if (error) throw error

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

    return NextResponse.json({
      shorts: shortsWithLikeStatus,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error: any) {
    console.error('Error fetching shorts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shorts' },
      { status: 500 }
    )
  }
}
