import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * Artist Follow/Unfollow API
 * POST /api/artists/[id]/follow - Follow an artist
 * DELETE /api/artists/[id]/follow - Unfollow an artist
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id: artistId } = await params

    // Verify artist exists
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id, stage_name')
      .eq('id', artistId)
      .single()

    if (artistError || !artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('artist_followers')
      .select('id')
      .eq('fan_id', user.id)
      .eq('artist_id', artistId)
      .maybeSingle()

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this artist' },
        { status: 400 }
      )
    }

    // Create follow relationship
    const { error: followError } = await supabase
      .from('artist_followers')
      .insert({
        fan_id: user.id,
        artist_id: artistId,
      })

    if (followError) {
      throw followError
    }

    // Increment artist's follower count
    await supabase.rpc('increment_artist_followers', { artist_id: artistId })

    return NextResponse.json({
      success: true,
      message: `Now following ${artist.stage_name}`,
    })
  } catch (error: any) {
    logger.error('Error following artist', { error: error.message, stack: error.stack })
    return NextResponse.json(
      { error: error.message || 'Failed to follow artist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id: artistId } = await params

    // Check if following
    const { data: existingFollow } = await supabase
      .from('artist_followers')
      .select('id')
      .eq('fan_id', user.id)
      .eq('artist_id', artistId)
      .maybeSingle()

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Not following this artist' },
        { status: 400 }
      )
    }

    // Remove follow relationship
    const { error: unfollowError } = await supabase
      .from('artist_followers')
      .delete()
      .eq('fan_id', user.id)
      .eq('artist_id', artistId)

    if (unfollowError) {
      throw unfollowError
    }

    // Decrement artist's follower count
    await supabase.rpc('decrement_artist_followers', { artist_id: artistId })

    return NextResponse.json({
      success: true,
      message: 'Unfollowed artist',
    })
  } catch (error: any) {
    logger.error('Error unfollowing artist', { error: error.message, stack: error.stack })
    return NextResponse.json(
      { error: error.message || 'Failed to unfollow artist' },
      { status: 500 }
    )
  }
}
