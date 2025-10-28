import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Artist Dashboard API
 * GET /api/dashboard/artist - Get artist analytics and stats
 *
 * Returns:
 * - Profile info
 * - Total events (by status)
 * - Total revenue
 * - Total tickets sold
 * - Recent events
 * - Recent tips
 * - Pending commissions (AA/RR)
 * - Next payout date and amount
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get artist profile
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('id', user.id)
      .single()

    if (artistError || !artist) {
      return NextResponse.json(
        { error: 'Artist account required' },
        { status: 403 }
      )
    }

    // Get all events with counts by status
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, status, scheduled_at, title, ticket_price, current_attendees')
      .eq('artist_id', user.id)
      .order('scheduled_at', { ascending: false })

    const eventsCount = {
      total: events?.length || 0,
      draft: events?.filter((e) => e.status === 'draft').length || 0,
      scheduled: events?.filter((e) => e.status === 'scheduled').length || 0,
      live: events?.filter((e) => e.status === 'live').length || 0,
      ended: events?.filter((e) => e.status === 'ended').length || 0,
      cancelled: events?.filter((e) => e.status === 'cancelled').length || 0,
    }

    // Get all tickets for artist's events
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, purchase_price, payment_status, event:events!inner(artist_id)')
      .eq('event.artist_id', user.id)

    const ticketsStats = {
      total: tickets?.length || 0,
      confirmed: tickets?.filter((t) => t.payment_status === 'completed').length || 0,
      pending: tickets?.filter((t) => t.payment_status === 'pending').length || 0,
      failed: tickets?.filter((t) => t.payment_status === 'failed').length || 0,
    }

    // Calculate total revenue from confirmed tickets
    const totalRevenue =
      tickets
        ?.filter((t) => t.payment_status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.purchase_price.toString()), 0) || 0

    // Get revenue breakdown by subscription tier
    const tierRevenueSplit = {
      starter: 0.5,  // Artist keeps 50%
      pro: 0.6,      // Artist keeps 60%
      elite: 0.7,    // Artist keeps 70%
    }

    const artistRevenue = totalRevenue * (tierRevenueSplit[artist.subscription_tier as keyof typeof tierRevenueSplit] || 0.5)
    const platformRevenue = totalRevenue - artistRevenue

    // Get recent tips
    const { data: tips, error: tipsError } = await supabase
      .from('tips')
      .select('id, amount, message, payment_status, created_at, fan:profiles!tips_fan_id_fkey(full_name, avatar_url)')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const tipsStats = {
      total: tips?.length || 0,
      totalAmount:
        tips
          ?.filter((t) => t.payment_status === 'completed')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0,
    }

    // Artist receives 90% of tips (10% platform fee)
    const tipsRevenue = tipsStats.totalAmount * 0.9

    // Get recent tips (last 5)
    const recentTips = tips?.slice(0, 5) || []

    // Get next payout (J+21 from last event)
    const { data: nextPayout, error: payoutError } = await supabase
      .from('payouts')
      .select('id, amount, scheduled_at, status')
      .eq('artist_id', user.id)
      .in('status', ['scheduled', 'processing'])
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    // Get recent payouts (last 5)
    const { data: recentPayouts, error: recentPayoutsError } = await supabase
      .from('payouts')
      .select('id, amount, scheduled_at, paid_at, status')
      .eq('artist_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(5)

    const payoutsStats = {
      totalPaid:
        recentPayouts
          ?.filter((p) => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0,
      nextPayout: nextPayout || null,
      recent: recentPayouts || [],
    }

    // Subscription status
    const now = new Date()
    const subscriptionEnds = artist.subscription_ends_at
      ? new Date(artist.subscription_ends_at)
      : null

    const subscriptionStatus = {
      tier: artist.subscription_tier,
      active: !subscriptionEnds || subscriptionEnds > now,
      endsAt: artist.subscription_ends_at,
      daysRemaining: subscriptionEnds
        ? Math.ceil((subscriptionEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      stripeConnectCompleted: artist.stripe_connect_completed,
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
      },
      subscription: subscriptionStatus,
      events: {
        counts: eventsCount,
        recent: events?.slice(0, 5) || [],
      },
      tickets: ticketsStats,
      revenue: {
        total: totalRevenue,
        artistShare: artistRevenue,
        platformShare: platformRevenue,
        fromTips: tipsRevenue,
        totalEarnings: artistRevenue + tipsRevenue,
      },
      tips: {
        stats: tipsStats,
        recent: recentTips,
      },
      payouts: payoutsStats,
    })
  } catch (error: any) {
    console.error('Error fetching artist dashboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard' },
      { status: 500 }
    )
  }
}
