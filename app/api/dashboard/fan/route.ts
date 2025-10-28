import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Fan Dashboard API
 * GET /api/dashboard/fan - Get fan's activity and stats
 *
 * Returns:
 * - Profile info
 * - Purchased tickets (upcoming, past, total spent)
 * - Followed artists
 * - Tips sent
 * - Badges earned
 * - Miles accumulated
 * - Watch party participation
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
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get all tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(
          id,
          title,
          scheduled_at,
          status,
          stream_url,
          thumbnail_url,
          artist:artists(
            id,
            stage_name,
            avatar_url
          )
        )
      `)
      .eq('fan_id', user.id)
      .order('created_at', { ascending: false })

    const now = new Date()
    const upcomingTickets = tickets?.filter(
      (t) => t.event && new Date(t.event.scheduled_at) > now
    ) || []
    const pastTickets = tickets?.filter(
      (t) => t.event && new Date(t.event.scheduled_at) <= now
    ) || []

    const ticketsStats = {
      total: tickets?.length || 0,
      upcoming: upcomingTickets.length,
      past: pastTickets.length,
      totalSpent:
        tickets
          ?.filter((t) => t.payment_status === 'completed')
          .reduce((sum, t) => sum + parseFloat(t.purchase_price.toString()), 0) || 0,
    }

    // Get followed artists
    const { data: followedArtists, error: followedError } = await supabase
      .from('artist_followers')
      .select(`
        artist_id,
        created_at,
        artist:artists(
          id,
          stage_name,
          avatar_url,
          bio,
          instagram_handle,
          tiktok_handle
        )
      `)
      .eq('fan_id', user.id)
      .order('created_at', { ascending: false })

    // Get tips sent
    const { data: tips, error: tipsError } = await supabase
      .from('tips')
      .select(`
        id,
        amount,
        message,
        payment_status,
        created_at,
        artist:artists(
          id,
          stage_name,
          avatar_url
        )
      `)
      .eq('fan_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const tipsStats = {
      total: tips?.length || 0,
      totalAmount:
        tips
          ?.filter((t) => t.payment_status === 'completed')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0,
      recent: tips?.slice(0, 5) || [],
    }

    // Get badges earned
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select(`
        earned_at,
        progress,
        badge:badges(
          id,
          name,
          description,
          icon_url,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })

    const badgesStats = {
      total: badges?.length || 0,
      recent: badges?.slice(0, 5) || [],
    }

    // Get miles accumulated
    const { data: milesTransactions, error: milesError } = await supabase
      .from('miles_transactions')
      .select('miles_earned, miles_spent, reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const totalMilesEarned =
      milesTransactions?.reduce((sum, t) => sum + (t.miles_earned || 0), 0) || 0
    const totalMilesSpent =
      milesTransactions?.reduce((sum, t) => sum + (t.miles_spent || 0), 0) || 0
    const currentMiles = totalMilesEarned - totalMilesSpent

    const milesStats = {
      current: currentMiles,
      earned: totalMilesEarned,
      spent: totalMilesSpent,
      recentTransactions: milesTransactions?.slice(0, 10) || [],
    }

    // Get active quests
    const { data: quests, error: questsError } = await supabase
      .from('user_quests')
      .select(`
        progress,
        completed,
        started_at,
        completed_at,
        quest:quests(
          id,
          title,
          description,
          reward_miles,
          target_count,
          quest_type
        )
      `)
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('started_at', { ascending: false })

    const questsStats = {
      active: quests?.length || 0,
      quests: quests || [],
    }

    // Get AA referrals if user is an AA
    const { data: aaAccount, error: aaError } = await supabase
      .from('apporteurs')
      .select('id, referral_code, total_commissions_earned')
      .eq('user_id', user.id)
      .maybeSingle()

    let aaStats = null
    if (aaAccount) {
      // Get referral count
      const { count: referralCount } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('aa_id', aaAccount.id)

      aaStats = {
        referralCode: aaAccount.referral_code,
        totalReferrals: referralCount || 0,
        totalCommissions: aaAccount.total_commissions_earned || 0,
      }
    }

    // Get RR info if user is an RR
    const { data: rrAccount, error: rrError } = await supabase
      .from('responsables_regionaux')
      .select('id, region, commission_rate, total_commissions_earned')
      .eq('user_id', user.id)
      .maybeSingle()

    let rrStats = null
    if (rrAccount) {
      rrStats = {
        region: rrAccount.region,
        commissionRate: rrAccount.commission_rate,
        totalCommissions: rrAccount.total_commissions_earned || 0,
      }
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        city: profile.city,
        country: profile.country,
      },
      tickets: {
        stats: ticketsStats,
        upcoming: upcomingTickets,
        past: pastTickets.slice(0, 5),
      },
      followedArtists: followedArtists || [],
      tips: tipsStats,
      badges: badgesStats,
      miles: milesStats,
      quests: questsStats,
      aa: aaStats,
      rr: rrStats,
    })
  } catch (error: any) {
    console.error('Error fetching fan dashboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard' },
      { status: 500 }
    )
  }
}
