/**
 * Next.js Middleware
 *
 * SÉCURITÉ:
 * - Supabase Auth (cookie management)
 * - Security Headers (XSS, Clickjacking, MIME sniffing protection)
 * - CORS (Cross-Origin Resource Sharing)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ============================================
  // SUPABASE AUTH
  // ============================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  // ============================================
  // SECURITY HEADERS
  // ============================================

  // 1. Content Security Policy (CSP) - Prevents XSS attacks
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.youtube.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https: http:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self' https://js.stripe.com https://www.youtube.com https://player.vimeo.com",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' blob: https: http:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
  response.headers.set('Content-Security-Policy', cspHeader)

  // 2. X-Frame-Options - Prevents clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // 3. X-Content-Type-Options - Prevents MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // 4. Referrer-Policy - Controls referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 5. Permissions-Policy - Controls browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // 6. X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // 7. Strict-Transport-Security (HSTS) - Forces HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  // 8. X-XSS-Protection (legacy, but still good to have)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // ============================================
  // CORS HEADERS (for API routes)
  // ============================================
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ]

  const origin = request.headers.get('origin')
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    )
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
    return new NextResponse(null, { status: 204, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
