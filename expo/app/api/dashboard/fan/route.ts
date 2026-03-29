import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFanDashboard } from '@/lib/supabase-rpc'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { CACHE_TTL, getCacheHeaders } from '@/lib/cache'
import { logger, createPerformanceTracker } from '@/lib/logger'

/**
 * Fan Dashboard API
 * GET /api/dashboard/fan - Get fan's tickets, following, and activity
 *
 * ✅ OPTIMIZED: Uses RPC function (1 query instead of 5)
 * Rate limit: 100 requests per minute (authenticated API)
 *
 * Returns:
 * - Profile info
 * - Tickets (upcoming & past)
 * - Following artists
 * - Tips sent
 * - Total spending
 */
export async function GET(request: NextRequest) {
  try {
    const tracker = createPerformanceTracker('fan_dashboard')

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

    // ✅ OPTIMISATION: 1 RPC call instead of 5 separate queries
    const result = await getFanDashboard(user.id)

    const duration = tracker.end({ userId: user.id })

    if (!result.success) {
      logger.error('Failed to load fan dashboard', undefined, {
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

    logger.info('Fan dashboard loaded', {
      userId: user.id,
      duration,
      totalTickets: result.data?.tickets.stats.total,
      totalSpending: result.data?.spending.totalSpent,
    })

    // ✅ PERFORMANCE: Cache headers (30s - user-specific data changes often)
    const response = NextResponse.json(result.data, {
      headers: getCacheHeaders(CACHE_TTL.DASHBOARD_FAN),
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error in fan dashboard', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
