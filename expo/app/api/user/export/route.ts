import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * RGPD Article 20: Right to Data Portability
 * GET /api/user/export
 *
 * Exports all user personal data in JSON format
 * User must be authenticated
 *
 * Includes:
 * - Profile information
 * - Artist profile (if applicable)
 * - Purchase history (tickets, tips)
 * - Event creation history
 * - Transaction history
 * - Affiliate data
 * - Payout history
 */
export async function GET(request: NextRequest) {
  try {
    // Strict rate limiting (prevent abuse)
    const rateLimitResult = await rateLimit(request, 'strict') // 5 req/min
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized data export attempt', {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('User data export started', {
      userId: user.id,
      email: user.email,
    })

    // Collect all user data
    const exportData: Record<string, any> = {
      export_date: new Date().toISOString(),
      export_version: '1.0',
      user_id: user.id,
      data: {},
    }

    // 1. Profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    exportData.data.profile = profile || null

    // 2. Artist profile (if exists)
    const { data: artist } = await supabase
      .from('artists')
      .select('*')
      .eq('id', user.id)
      .single()

    exportData.data.artist_profile = artist || null

    // 3. Tickets purchased
    const { data: tickets } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(
          title,
          scheduled_at,
          artist:artists(stage_name)
        )
      `)
      .eq('user_id', user.id)

    exportData.data.tickets_purchased = tickets || []

    // 4. Events created (if artist)
    if (artist) {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('artist_id', user.id)

      exportData.data.events_created = events || []
    }

    // 5. Tips sent
    const { data: tipsSent } = await supabase
      .from('tips')
      .select(`
        *,
        artist:artists(stage_name)
      `)
      .eq('from_user_id', user.id)

    exportData.data.tips_sent = tipsSent || []

    // 6. Tips received (if artist)
    if (artist) {
      const { data: tipsReceived } = await supabase
        .from('tips')
        .select(`
          *,
          fan:profiles!tips_from_user_id_fkey(full_name, email)
        `)
        .eq('to_artist_id', user.id)

      exportData.data.tips_received = tipsReceived || []
    }

    // 7. Transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)

    exportData.data.transactions = transactions || []

    // 8. Affiliate data
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .single()

    exportData.data.affiliate = affiliate || null

    if (affiliate) {
      // Affiliate commissions
      const { data: commissions } = await supabase
        .from('affiliate_commissions')
        .select(`
          *,
          ticket:tickets(
            event:events(title)
          )
        `)
        .eq('affiliate_id', affiliate.id)

      exportData.data.affiliate_commissions = commissions || []
    }

    // 9. Payouts (if artist)
    if (artist) {
      const { data: payouts } = await supabase
        .from('payouts')
        .select('*')
        .eq('artist_id', user.id)

      exportData.data.payouts = payouts || []
    }

    // 10. Artist followers (if artist)
    if (artist) {
      const { data: followers } = await supabase
        .from('artist_followers')
        .select(`
          followed_at,
          fan:profiles!artist_followers_fan_id_fkey(full_name, email)
        `)
        .eq('artist_id', user.id)

      exportData.data.followers = followers || []
    }

    // 11. Following (artists user follows)
    const { data: following } = await supabase
      .from('artist_followers')
      .select(`
        followed_at,
        artist:artists(stage_name, genre, country)
      `)
      .eq('fan_id', user.id)

    exportData.data.following = following || []

    // 12. Shorts (if artist)
    if (artist) {
      const { data: shorts } = await supabase
        .from('shorts')
        .select('*')
        .eq('artist_id', user.id)

      exportData.data.shorts = shorts || []
    }

    // 13. Authentication data (metadata only, not passwords)
    exportData.data.auth = {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at,
    }

    // Log successful export
    logger.info('User data export completed', {
      userId: user.id,
      email: user.email,
      dataSize: JSON.stringify(exportData).length,
      ticketsCount: tickets?.length || 0,
      eventsCount: artist ? exportData.data.events_created?.length || 0 : 0,
    })

    // Return as downloadable JSON
    const response = new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="vybzzz-data-export-${user.id}-${Date.now()}.json"`,
      },
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Failed to export user data', error, {
      userId: request.headers.get('x-user-id') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
