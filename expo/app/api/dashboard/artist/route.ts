import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getArtistDashboard } from '@/lib/supabase-rpc'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { CACHE_TTL, getCacheHeaders } from '@/lib/cache'
import { logger, createPerformanceTracker } from '@/lib/logger'

/**
 * Artist Dashboard API
 * GET /api/dashboard/artist - Get artist analytics and stats
 *
 * ✅ OPTIMIZED: Uses RPC function (1 query instead of 6)
 * Rate limit: 100 requests per minute (authenticated API)
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
  try {
    const tracker = createPerformanceTracker('artist_dashboard')

    // ✅ SÉCURITÉ: Rate limiting
    const rateLimitResult = await rateLimit(request, 'api')

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

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // ✅ OPTIMISATION: 1 RPC call instead of 6 separate queries
    const result = await getArtistDashboard(user.id)

    const duration = tracker.end({ userId: user.id })

    if (!result.success) {
      logger.error('Failed to load artist dashboard', undefined, {
        userId: user.id,
        error: result.error,
        duration,
      })
      const response = NextResponse.json(
        { error: result.error || 'Failed to load dashboard' },
        { status: 500 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    logger.info('Artist dashboard loaded', {
      userId: user.id,
      duration,
      totalEvents: result.data?.events.counts.total,
      totalRevenue: result.data?.revenue.totalEarnings,
    })

    // ✅ PERFORMANCE: Cache headers (60s)
    const response = NextResponse.json(result.data, {
      headers: getCacheHeaders(CACHE_TTL.DASHBOARD_ARTIST),
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error in artist dashboard', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
