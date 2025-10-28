import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Artists API
 * GET /api/artists - Get all artists with search and filters
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  // Search and filters
  const search = searchParams.get('search')
  const genre = searchParams.get('genre')
  const country = searchParams.get('country')
  const sortBy = searchParams.get('sort') || 'followers'
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
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

    if (error) throw error

    return NextResponse.json({
      artists: artists || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error fetching artists:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}
