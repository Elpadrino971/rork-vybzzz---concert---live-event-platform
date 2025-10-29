import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { CACHE_TTL, getCacheHeaders } from '@/lib/cache'
import { logger } from '@/lib/logger'

/**
 * Artists API
 * GET /api/artists - Get all artists with search and filters
 * Rate limit: 60 requests per minute (public)
 */
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)

    // Search and filters with validation
    const search = searchParams.get('search')?.slice(0, 100) // Max 100 chars
    const genre = searchParams.get('genre')?.slice(0, 50)
    const country = searchParams.get('country')?.slice(0, 2) // ISO country code
    const sortBy = searchParams.get('sort') || 'followers'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0) // Min 0

    // ✅ SÉCURITÉ: Validate sortBy to prevent injection
    const validSortOptions = ['followers', 'events', 'name', 'recent']
    if (!validSortOptions.includes(sortBy)) {
      const response = NextResponse.json(
        { error: 'Invalid sort parameter' },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    let query = supabase
      .from('artists')
      .select(`
        id,
        stage_name,
        bio,
        avatar_url,
        banner_url,
        instagram_handle,
        tiktok_handle,
        youtube_channel,
        genre,
        country,
        total_followers,
        total_events,
        subscription_tier,
        stripe_connect_completed,
        profile:profiles(
          full_name,
          city,
          country
        )
      `, { count: 'exact' })

    // Search by stage name
    if (search) {
      query = query.ilike('stage_name', `%${search}%`)
    }

    // Filter by genre
    if (genre) {
      query = query.eq('genre', genre)
    }

    // Filter by country
    if (country) {
      query = query.eq('country', country)
    }

    // Sort
    if (sortBy === 'followers') {
      query = query.order('total_followers', { ascending: false })
    } else if (sortBy === 'events') {
      query = query.order('total_events', { ascending: false })
    } else if (sortBy === 'name') {
      query = query.order('stage_name', { ascending: true })
    } else if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: artists, error, count } = await query

    if (error) {
      logger.error('Error fetching artists from database', error)
      const response = NextResponse.json(
        { error: 'Failed to fetch artists' },
        { status: 500 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // ✅ PERFORMANCE: Cache headers
    const response = NextResponse.json(
      {
        artists: artists || [],
        total: count || 0,
        limit,
        offset,
      },
      {
        headers: getCacheHeaders(CACHE_TTL.ARTISTS_LIST),
      }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error in artists API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
