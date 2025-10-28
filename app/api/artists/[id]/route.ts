import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Artist Detail API
 * GET /api/artists/[id] - Get artist profile with stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  try {
    const { id: artistId } = await params

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
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
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

    return NextResponse.json({
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
    })
  } catch (error: any) {
    console.error('Error fetching artist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch artist' },
      { status: 500 }
    )
  }
}
