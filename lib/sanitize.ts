/**
 * Input Sanitization
 *
 * SÉCURITÉ: Protection contre XSS et injection HTML
 * Nettoie le contenu généré par les utilisateurs avant de le stocker en base
 */

// ============================================
// HTML ENTITY ENCODING
// ============================================

/**
 * Encode HTML special characters to prevent XSS
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Decode HTML entities back to normal characters
 */
export function unescapeHtml(safe: string): string {
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

// ============================================
// STRING SANITIZATION
// ============================================

/**
 * Remove null bytes from string (prevents SQL injection)
 */
export function removeNullBytes(str: string): string {
  return str.replace(/\0/g, '')
}

/**
 * Normalize whitespace (removes excessive spaces, tabs, newlines)
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim()
}

/**
 * Remove zero-width characters (often used in phishing)
 */
export function removeZeroWidthChars(str: string): string {
  return str.replace(/[\u200B-\u200D\uFEFF]/g, '')
}

/**
 * Limit string length safely
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength)
}

// ============================================
// USER CONTENT SANITIZATION
// ============================================

/**
 * Sanitize user display name
 * - Escapes HTML
 * - Removes null bytes
 * - Removes zero-width chars
 * - Normalizes whitespace
 * - Limits length
 */
export function sanitizeDisplayName(name: string): string {
  if (!name) return ''

  let sanitized = name
  sanitized = removeNullBytes(sanitized)
  sanitized = removeZeroWidthChars(sanitized)
  sanitized = normalizeWhitespace(sanitized)
  sanitized = truncate(sanitized, 100)
  sanitized = escapeHtml(sanitized)

  return sanitized
}

/**
 * Sanitize bio/description text
 * - Escapes HTML
 * - Removes null bytes
 * - Removes zero-width chars
 * - Preserves paragraphs but limits length
 */
export function sanitizeBio(bio: string): string {
  if (!bio) return ''

  let sanitized = bio
  sanitized = removeNullBytes(sanitized)
  sanitized = removeZeroWidthChars(sanitized)
  // Keep line breaks but remove excessive whitespace
  sanitized = sanitized.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
  sanitized = truncate(sanitized, 5000)
  sanitized = escapeHtml(sanitized)

  return sanitized.trim()
}

/**
 * Sanitize message (tips, comments)
 * - Escapes HTML
 * - Removes null bytes
 * - Removes zero-width chars
 * - Normalizes whitespace
 * - Limits length
 */
export function sanitizeMessage(message: string): string {
  if (!message) return ''

  let sanitized = message
  sanitized = removeNullBytes(sanitized)
  sanitized = removeZeroWidthChars(sanitized)
  sanitized = normalizeWhitespace(sanitized)
  sanitized = truncate(sanitized, 500)
  sanitized = escapeHtml(sanitized)

  return sanitized
}

// ============================================
// URL SANITIZATION
// ============================================

/**
 * Validate and sanitize URL
 * - Checks for valid protocol (http/https)
 * - Prevents javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    // Prevent javascript: and data: URLs
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize social media handle
 * - Removes @ if present
 * - Removes spaces
 * - Lowercase
 * - Alphanumeric + underscore only
 */
export function sanitizeSocialHandle(handle: string): string {
  if (!handle) return ''

  let sanitized = handle.trim()
  sanitized = sanitized.replace(/^@+/, '') // Remove leading @
  sanitized = sanitized.toLowerCase()
  sanitized = sanitized.replace(/[^a-z0-9_]/g, '') // Only alphanumeric + underscore
  sanitized = truncate(sanitized, 30)

  return sanitized
}

// ============================================
// EMAIL SANITIZATION
// ============================================

/**
 * Sanitize email address
 * - Trims whitespace
 * - Lowercase
 * - Basic format validation
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null

  const sanitized = email.trim().toLowerCase()

  // Basic email regex (not perfect but good enough for sanitization)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return null
  }

  return sanitized
}

// ============================================
// FILENAME SANITIZATION
// ============================================

/**
 * Sanitize filename for uploads
 * - Removes path traversal attempts (../)
 * - Removes null bytes
 * - Allows only safe characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed'

  let sanitized = filename

  // Remove path traversal
  sanitized = sanitized.replace(/\.\./g, '')
  sanitized = sanitized.replace(/\//g, '')
  sanitized = sanitized.replace(/\\/g, '')

  // Remove null bytes
  sanitized = removeNullBytes(sanitized)

  // Keep only alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Prevent hidden files
  if (sanitized.startsWith('.')) {
    sanitized = sanitized.substring(1)
  }

  // Ensure not empty
  if (!sanitized) {
    sanitized = 'unnamed'
  }

  return truncate(sanitized, 255)
}

// ============================================
// REFERRAL CODE SANITIZATION
// ============================================

/**
 * Sanitize referral code
 * - Uppercase
 * - Alphanumeric only
 * - Fixed length (8 chars)
 */
export function sanitizeReferralCode(code: string): string | null {
  if (!code) return null

  let sanitized = code.trim().toUpperCase()
  sanitized = sanitized.replace(/[^A-Z0-9]/g, '')

  if (sanitized.length !== 8) {
    return null
  }

  return sanitized
}

// ============================================
// SQL INJECTION PROTECTION
// ============================================

/**
 * Check for common SQL injection patterns
 * NOTE: This is a defense-in-depth measure
 * Primary protection comes from parameterized queries (Supabase does this)
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b\s+1\s*=\s*1)/i,
    /(\bAND\b\s+1\s*=\s*1)/i,
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

// ============================================
// COMPREHENSIVE SANITIZATION
// ============================================

/**
 * Sanitize an object with user input
 * Applies appropriate sanitization based on field names
 */
export function sanitizeUserInput(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value
      continue
    }

    if (typeof value !== 'string') {
      sanitized[key] = value
      continue
    }

    // Apply sanitization based on field name
    if (key.includes('name') || key.includes('title')) {
      sanitized[key] = sanitizeDisplayName(value)
    } else if (key.includes('bio') || key.includes('description')) {
      sanitized[key] = sanitizeBio(value)
    } else if (key.includes('message') || key.includes('comment')) {
      sanitized[key] = sanitizeMessage(value)
    } else if (key.includes('email')) {
      sanitized[key] = sanitizeEmail(value)
    } else if (key.includes('url') || key.includes('link')) {
      sanitized[key] = sanitizeUrl(value)
    } else if (key.includes('handle')) {
      sanitized[key] = sanitizeSocialHandle(value)
    } else if (key.includes('filename') || key.includes('file')) {
      sanitized[key] = sanitizeFilename(value)
    } else {
      // Default: escape HTML
      sanitized[key] = escapeHtml(value)
    }
  }

  return sanitized
}
