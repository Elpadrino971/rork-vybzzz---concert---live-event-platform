import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Security Headers Configuration
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', '),

  // HSTS (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

/**
 * Content Security Policy
 */
export function getCSP(nonce: string) {
  const csp = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for Next.js
      `'nonce-${nonce}'`,
      'https://js.stripe.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://*.supabase.co',
      'https://www.googletagmanager.com',
    ],
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.stripe.com',
      'https://api.vybzzz.com',
      'https://www.google-analytics.com',
      'https://vitals.vercel-insights.com',
    ],
    'frame-src': [
      'https://js.stripe.com',
      'https://hooks.stripe.com',
    ],
    'media-src': [
      "'self'",
      'https:',
      'https://*.supabase.co',
    ],
    'worker-src': [
      "'self'",
      'blob:',
    ],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'upgrade-insecure-requests': [],
  }

  return Object.entries(csp)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

/**
 * Generate CSP nonce
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

/**
 * Rate Limiting using simple in-memory store
 * For production, use Redis/Upstash
 */
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimit.get(identifier)

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimit.delete(identifier)
  }

  const current = rateLimit.get(identifier)

  if (!current) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  current.count++
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  }
}

/**
 * CSRF Token Generation and Validation
 */
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'

export function generateCSRFToken(sessionId: string): string {
  const timestamp = Date.now().toString()
  const token = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}:${timestamp}`)
    .digest('hex')

  return `${token}.${timestamp}`
}

export function validateCSRFToken(token: string, sessionId: string): boolean {
  try {
    const [tokenHash, timestamp] = token.split('.')

    // Token expires after 1 hour
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 3600000) {
      return false
    }

    const expectedToken = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(`${sessionId}:${timestamp}`)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(tokenHash),
      Buffer.from(expectedToken)
    )
  } catch {
    return false
  }
}

/**
 * Sanitize user input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate origin for CORS
 */
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false

  const allowedOrigins = [
    'https://vybzzz.com',
    'https://www.vybzzz.com',
    'https://vybzzz.app',
    'https://www.vybzzz.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ]

  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001')
  }

  return allowedOrigins.includes(origin)
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  nonce?: string
): NextResponse {
  // Apply basic security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Apply CSP if nonce is provided
  if (nonce) {
    response.headers.set('Content-Security-Policy', getCSP(nonce))
  }

  return response
}

/**
 * IP-based rate limiting helper
 */
export function getRateLimitIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (when behind proxy)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'

  return ip
}

/**
 * Secure cookie options
 */
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}
