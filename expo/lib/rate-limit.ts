/**
 * Rate Limiting Middleware
 *
 * AMÉLIORATION CRITIQUE: Protection contre DDoS et abus
 *
 * Options:
 * 1. Production: Upstash Redis (@upstash/ratelimit)
 * 2. Development: In-memory cache (simple, no dependencies)
 *
 * Usage:
 * ```typescript
 * const { success, limit, remaining } = await rateLimit(request)
 * if (!success) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 * }
 * ```
 */

import { NextRequest } from 'next/server'

// ============================================
// CONFIGURATION
// ============================================

const RATE_LIMIT_CONFIG = {
  // Limites par endpoint type
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 req/min
  },
  auth: {
    windowMs: 60 * 1000,
    maxRequests: 20, // 20 req/min (login, register)
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100, // 100 req/min
  },
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 5, // 5 req/min (sensitive endpoints)
  },
}

// ============================================
// IN-MEMORY RATE LIMITER (Development/Fallback)
// ============================================

interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Cleanup old records every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

function inMemoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // No record or expired: create new
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: now + windowMs,
    }
  }

  // Increment count
  record.count++

  // Check if over limit
  if (record.count > maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: record.resetAt,
    }
  }

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: record.resetAt,
  }
}

// ============================================
// UPSTASH REDIS RATE LIMITER (Production)
// ============================================

// Uncomment and use when you have Upstash Redis setup
/*
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const rateLimiters = {
  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  }),
}

async function upstashRateLimit(
  identifier: string,
  type: keyof typeof rateLimiters
) {
  const { success, limit, remaining, reset } = await rateLimiters[type].limit(
    identifier
  )
  return { success, limit, remaining, reset }
}
*/

// ============================================
// MAIN RATE LIMIT FUNCTION
// ============================================

export type RateLimitType = 'public' | 'auth' | 'api' | 'strict'

export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'api'
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  // Get identifier (IP or user ID)
  const identifier = getIdentifier(request)

  // Use Upstash if available, otherwise in-memory
  const useUpstash = !!process.env.UPSTASH_REDIS_REST_URL

  if (useUpstash) {
    // TODO: Uncomment when Upstash is setup
    // return await upstashRateLimit(identifier, type)
    console.warn('Upstash Redis not configured, using in-memory rate limit')
  }

  // Fallback to in-memory
  const config = RATE_LIMIT_CONFIG[type]
  return inMemoryRateLimit(identifier, config.maxRequests, config.windowMs)
}

// ============================================
// HELPERS
// ============================================

function getIdentifier(request: NextRequest): string {
  // Try to get user ID from token (if authenticated)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // Extract user ID from JWT (simplified, you'd decode the token)
    const token = authHeader.substring(7)
    // For now, use token as identifier
    return `token:${token.substring(0, 16)}`
  }

  // Fallback to IP address
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'anonymous'

  return `ip:${ip}`
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  result: { limit: number; remaining: number; reset: number }
): Response {
  const headers = new Headers(response.headers)

  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', result.reset.toString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Create rate-limited API route wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<Response>,
  type: RateLimitType = 'api'
) {
  return async (request: NextRequest, ...args: any[]) => {
    const rateLimitResult = await rateLimit(request, type)

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

    const response = await handler(request, ...args)
    return addRateLimitHeaders(response, rateLimitResult)
  }
}
