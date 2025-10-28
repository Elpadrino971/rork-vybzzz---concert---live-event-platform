/**
 * Helper Utilities for VyBzzZ Platform
 *
 * Common functions used throughout the application.
 */

import { createHash, randomBytes } from 'crypto'

// ============================================
// CURRENCY & FORMATTING
// ============================================

/**
 * Convert euros to cents (for Stripe)
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

/**
 * Convert cents to euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100
}

/**
 * Format amount in euros with symbol
 */
export function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// ============================================
// DATE & TIME
// ============================================

/**
 * Format date in French locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format relative time (e.g., "il y a 2 heures")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'à l\'instant'
  if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  return formatDate(d)
}

/**
 * Get time until event starts
 */
export function getTimeUntilEvent(eventDate: Date | string): string {
  const d = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()

  if (diffMs < 0) return 'Événement passé'

  const diffMins = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  if (diffHours > 0) return `Dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  if (diffMins > 0) return `Dans ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  return 'Bientôt'
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() < Date.now()
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

// ============================================
// STRING MANIPULATION
// ============================================

/**
 * Generate slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Truncate string with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

// ============================================
// CODE GENERATION
// ============================================

/**
 * Generate referral code (8 characters, uppercase)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Generate QR code data for ticket
 */
export function generateTicketQRData(ticketId: string, eventId: string, userId: string): string {
  const data = `vybzzz://ticket/${ticketId}?event=${eventId}&user=${userId}`
  const hash = createHash('sha256').update(data).digest('hex').substring(0, 16)
  return `${data}&sig=${hash}`
}

/**
 * Verify QR code signature
 */
export function verifyQRSignature(qrData: string): boolean {
  try {
    const url = new URL(qrData)
    const signature = url.searchParams.get('sig')
    if (!signature) return false

    // Remove signature from URL
    url.searchParams.delete('sig')
    const dataWithoutSig = url.toString()

    // Recalculate hash
    const expectedHash = createHash('sha256')
      .update(dataWithoutSig)
      .digest('hex')
      .substring(0, 16)

    return signature === expectedHash
  } catch {
    return false
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (French format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone)
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ============================================
// ARRAY & OBJECT UTILITIES
// ============================================

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// ============================================
// WAIT & RETRY
// ============================================

/**
 * Wait for specified milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await wait(delay)
    }
  }
  throw new Error('Max retry attempts reached')
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Une erreur est survenue'
}

// ============================================
// STATISTICS
// ============================================

/**
 * Calculate average
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

/**
 * Calculate sum
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0)
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}
