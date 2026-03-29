import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerAffiliate } from '@/lib/affiliates'
import { rateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { z } from 'zod'

/**
 * POST /api/affiliates/register - Register as affiliate (AA)
 * Rate limit: 5 requests per minute (strict - financial operation)
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ SÉCURITÉ: Rate limiting strict (financial operation)
    const rateLimitResult = await rateLimit(request, 'strict')

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
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    const body = await request.json()

    // ✅ SÉCURITÉ: Validate input
    const RegisterAffiliateSchema = z.object({
      parentReferralCode: z.string().min(8).max(8).optional(),
    })

    const validation = RegisterAffiliateSchema.safeParse(body)
    if (!validation.success) {
      const response = NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    const { parentReferralCode } = validation.data

    // Check if user is already an affiliate
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingAffiliate) {
      const response = NextResponse.json(
        { error: 'User is already an affiliate' },
        { status: 400 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    // Register as affiliate
    const result = await registerAffiliate(user.id, parentReferralCode)

    if (!result.success) {
      logger.error('Failed to register affiliate', undefined, {
        userId: user.id,
        error: result.error,
      })
      const response = NextResponse.json({ error: result.error }, { status: 500 })
      return addRateLimitHeaders(response, rateLimitResult)
    }

    logger.info('Affiliate registered successfully', {
      userId: user.id,
      affiliateId: result.affiliate?.id,
      referralCode: result.affiliate?.referral_code,
      parentReferralCode,
    })

    const response = NextResponse.json({
      success: true,
      affiliate: result.affiliate,
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error: any) {
    logger.error('Unexpected error registering affiliate', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
