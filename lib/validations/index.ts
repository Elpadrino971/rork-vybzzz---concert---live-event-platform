/**
 * Validation Schemas with Zod
 *
 * AMÉLIORATION CRITIQUE: Validation des données entrantes
 * Prévient: SQL injection, XSS, données invalides
 *
 * Usage dans API routes:
 * ```typescript
 * const validated = CreateEventSchema.parse(body)
 * ```
 */

import { z } from 'zod'
import { VALIDATION, SUBSCRIPTION_TIERS } from '@/constants/BusinessRules'

// ============================================
// COMMON SCHEMAS
// ============================================

export const UUIDSchema = z.string().uuid('Invalid UUID format')

export const EmailSchema = z.string().email('Invalid email address')

export const PhoneSchema = z.string().regex(
  /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  'Invalid French phone number'
)

export const UrlSchema = z.string().url('Invalid URL')

export const DateTimeSchema = z.string().datetime('Invalid ISO datetime')

// ============================================
// USER & PROFILE SCHEMAS
// ============================================

export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2).max(100),
  user_type: z.enum(['fan', 'artist', 'aa', 'rr', 'room_manager']),
})

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(VALIDATION.profile.bioMaxLength).optional(),
  avatar_url: UrlSchema.optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).optional(), // ISO code
  phone: PhoneSchema.optional(),
})

// ============================================
// ARTIST SCHEMAS
// ============================================

export const CreateArtistSchema = z.object({
  stage_name: z.string()
    .min(VALIDATION.profile.stageNameMinLength)
    .max(VALIDATION.profile.stageNameMaxLength),
  bio: z.string().max(VALIDATION.profile.bioMaxLength).optional(),
  genre: z.string().max(50).optional(),
  country: z.string().length(2).optional(),
  instagram_handle: z.string().max(50).optional(),
  tiktok_handle: z.string().max(50).optional(),
  youtube_channel: UrlSchema.optional(),
  subscription_tier: z.enum(['starter', 'pro', 'elite']),
})

// ============================================
// EVENT SCHEMAS
// ============================================

export const CreateEventSchema = z.object({
  title: z.string()
    .min(VALIDATION.event.titleMinLength)
    .max(VALIDATION.event.titleMaxLength),
  description: z.string()
    .max(VALIDATION.event.descriptionMaxLength)
    .optional(),
  event_type: z.enum(['live', 'replay', 'hybrid']).default('live'),
  scheduled_at: DateTimeSchema,
  duration_minutes: z.number().int().positive().max(480).optional(), // Max 8h
  ticket_price: z.number().min(0).max(1000),
  max_attendees: z.number().int().positive().optional(),
  thumbnail_url: UrlSchema.optional(),
  cover_image_url: UrlSchema.optional(),
  stream_url: UrlSchema.optional(),
  stream_platform: z.enum(['youtube', 'aws_ivs', '100ms']).default('youtube'),
  is_happy_hour: z.boolean().default(false),
})

// Validation custom pour ticket price selon tier
export const validateEventPrice = (data: {
  ticket_price: number
  subscription_tier: 'starter' | 'pro' | 'elite'
  is_happy_hour?: boolean
}) => {
  // Happy Hour override
  if (data.is_happy_hour && data.ticket_price === 4.99) {
    return true
  }

  const tier = SUBSCRIPTION_TIERS[data.subscription_tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS]
  return data.ticket_price >= tier.minTicketPrice && data.ticket_price <= tier.maxTicketPrice
}

export const UpdateEventSchema = CreateEventSchema.partial()

// ============================================
// TICKET SCHEMAS
// ============================================

export const PurchaseTicketSchema = z.object({
  event_id: UUIDSchema,
  referral_code: z.string().length(8).optional(), // AA referral
  payment_method_id: z.string().optional(), // Stripe payment method
})

// ============================================
// TIP SCHEMAS
// ============================================

export const CreateTipSchema = z.object({
  artist_id: UUIDSchema,
  amount: z.number().min(1).max(500), // 1¬ - 500¬
  message: z.string().max(VALIDATION.tip.messageMaxLength).optional(),
  payment_method_id: z.string().optional(),
})

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const CreatePaymentIntentSchema = z.object({
  type: z.enum(['ticket', 'tip', 'subscription']),
  amount: z.number().positive(),
  currency: z.string().length(3).default('eur'),
  metadata: z.record(z.string()).optional(),
})

// ============================================
// STRIPE WEBHOOK SCHEMAS
// ============================================

export const StripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
})

// ============================================
// APPORTEUR (AA) SCHEMAS
// ============================================

export const RegisterApporteurSchema = z.object({
  referral_code: z.string().length(8),
  parent_aa_code: z.string().length(8).optional(), // For hierarchy
  region: z.string().max(100).optional(),
})

// ============================================
// RESPONSABLE RÉGIONAL (RR) SCHEMAS
// ============================================

export const RegisterRRSchema = z.object({
  region: z.string().min(2).max(100),
  tier: z.enum(['basic', 'premium']),
  payment_proof: z.string().optional(), // Receipt URL
})

// ============================================
// CHAT SCHEMAS
// ============================================

export const SendMessageSchema = z.object({
  event_id: UUIDSchema,
  message: z.string().min(1).max(500),
})

// ============================================
// SHORTS SCHEMAS
// ============================================

export const CreateShortSchema = z.object({
  event_id: UUIDSchema,
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  video_url: UrlSchema,
  thumbnail_url: UrlSchema.optional(),
  duration_seconds: z.number().int().min(15).max(60),
  highlight_timestamp: z.number().int().positive().optional(),
})

// ============================================
// FOLLOW SCHEMAS
// ============================================

export const FollowArtistSchema = z.object({
  artist_id: UUIDSchema,
})

// ============================================
// PAGINATION & FILTERS
// ============================================

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const EventFiltersSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'live', 'ended', 'cancelled']).optional(),
  artist_id: UUIDSchema.optional(),
  upcoming: z.boolean().optional(),
}).merge(PaginationSchema)

export const ArtistFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  genre: z.string().max(50).optional(),
  country: z.string().length(2).optional(),
  sort: z.enum(['followers', 'events', 'name', 'recent']).default('followers'),
}).merge(PaginationSchema)

// ============================================
// HELPER: Validate and Return Errors
// ============================================

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// ============================================
// HELPER: Format Zod Errors for API Response
// ============================================

export function formatZodErrors(error: z.ZodError): {
  field: string
  message: string
}[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))
}

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>
export type PurchaseTicketInput = z.infer<typeof PurchaseTicketSchema>
export type CreateTipInput = z.infer<typeof CreateTipSchema>
export type EventFilters = z.infer<typeof EventFiltersSchema>
export type ArtistFilters = z.infer<typeof ArtistFiltersSchema>
