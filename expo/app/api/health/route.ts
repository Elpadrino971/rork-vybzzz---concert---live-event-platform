import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFeatureEnabled } from '@/lib/env'

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Provides system health status for monitoring tools (Datadog, New Relic, etc.)
 *
 * Checks:
 * - API server status
 * - Database connectivity
 * - External service status (Stripe, Supabase)
 * - Feature flags
 *
 * Returns:
 * - 200: All systems operational
 * - 503: Service unavailable (database or critical service down)
 */

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

type HealthCheck = {
  status: HealthStatus
  timestamp: string
  uptime: number
  version: string
  services: {
    database: {
      status: HealthStatus
      latency?: number
      error?: string
    }
    stripe: {
      status: HealthStatus
      configured: boolean
    }
    sentry: {
      status: HealthStatus
      enabled: boolean
    }
    redis: {
      status: HealthStatus
      enabled: boolean
    }
  }
  features: {
    youtube: boolean
    aws_ivs: boolean
    '100ms': boolean
    redis: boolean
    sentry: boolean
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
      services: {
        database: {
          status: 'healthy',
        },
        stripe: {
          status: 'healthy',
          configured: !!process.env.STRIPE_SECRET_KEY,
        },
        sentry: {
          status: 'healthy',
          enabled: isFeatureEnabled('sentry'),
        },
        redis: {
          status: 'healthy',
          enabled: isFeatureEnabled('redis'),
        },
      },
      features: {
        youtube: isFeatureEnabled('youtube'),
        aws_ivs: isFeatureEnabled('aws_ivs'),
        '100ms': isFeatureEnabled('100ms'),
        redis: isFeatureEnabled('redis'),
        sentry: isFeatureEnabled('sentry'),
      },
    }

    // Check database connectivity
    try {
      const supabase = await createClient()
      const dbStart = Date.now()

      // Simple query to test connection
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single()

      const dbLatency = Date.now() - dbStart

      if (dbError && dbError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is OK for health check
        healthCheck.services.database.status = 'unhealthy'
        healthCheck.services.database.error = dbError.message
        healthCheck.status = 'degraded'
      } else {
        healthCheck.services.database.latency = dbLatency

        // Warn if latency is high
        if (dbLatency > 1000) {
          healthCheck.services.database.status = 'degraded'
          healthCheck.status = 'degraded'
        }
      }
    } catch (dbError: any) {
      healthCheck.services.database.status = 'unhealthy'
      healthCheck.services.database.error = dbError.message
      healthCheck.status = 'unhealthy'
    }

    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      healthCheck.services.stripe.status = 'degraded'
      healthCheck.status = 'degraded'
    }

    // Determine HTTP status code
    const statusCode = healthCheck.status === 'unhealthy' ? 503 : 200

    // Add response time header
    const responseTime = Date.now() - startTime

    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
      },
    })
  } catch (error: any) {
    // Critical error in health check itself
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
