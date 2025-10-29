/**
 * VyBzzZ API Client for React Native
 *
 * Usage in React Native:
 * import { api } from '@/lib/api-client'
 * const events = await api.events.getAll()
 */

import { createClient } from '@supabase/supabase-js'
import type {
  Event,
  Ticket,
  Tip,
  Short,
  Artist,
  User,
  PurchaseTicketRequest,
  PurchaseTicketResponse,
  SendTipRequest,
  SendTipResponse,
  CreateEventRequest,
  UpdateEventRequest,
  GetShortsResponse,
  FanDashboard,
  ArtistDashboard,
  ApporteurDashboard,
  RRDashboard,
  ArtistAnalytics,
} from '@/types/database-complete'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vybzzz.com/api'

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      Authorization: `Bearer ${session.access_token}`,
    }),
    ...options?.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || error.message || 'API Error')
  }

  return response.json()
}

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Sign up a new user
   */
  async signup(email: string, password: string, fullName: string, userType: 'fan' | 'artist' | 'aa' | 'rr') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    })

    if (error) throw error

    // Create profile in database
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        user_type: userType,
      })

      if (profileError) throw profileError

      // Create type-specific record
      if (userType === 'artist') {
        await supabase.from('artists').insert({
          id: data.user.id,
          stage_name: fullName,
          subscription_tier: 'starter',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        })
      } else if (userType === 'fan') {
        // Generate referral code
        const { data: referralCodeData } = await supabase.rpc('generate_referral_code')
        await supabase.from('fans').insert({
          id: data.user.id,
          referral_code: referralCodeData || `FAN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        })
      }
    }

    return data
  },

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Update last login
    if (data.user) {
      await supabase.from('users').update({
        last_login_at: new Date().toISOString(),
      }).eq('id', data.user.id)
    }

    return data
  },

  /**
   * Sign out
   */
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  /**
   * Get current user profile with type-specific data
   */
  async getCurrentProfile() {
    const user = await this.getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return data as User
  },
}

// ============================================
// EVENTS API
// ============================================

export const eventsAPI = {
  /**
   * Get all events (with filters)
   */
  async getAll(filters?: {
    status?: string
    artistId?: string
    limit?: number
    offset?: number
  }): Promise<Event[]> {
    let query = supabase
      .from('events')
      .select('*, artist:artists(*, user:users(*))')
      .order('scheduled_at', { ascending: true })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.artistId) query = query.eq('artist_id', filters.artistId)
    if (filters?.limit) query = query.limit(filters.limit)
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)

    const { data, error } = await query
    if (error) throw error

    return data as Event[]
  },

  /**
   * Get a single event by ID
   */
  async getById(id: string): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .select('*, artist:artists(*, user:users(*))')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Event
  },

  /**
   * Create a new event (artists only)
   */
  async create(eventData: CreateEventRequest): Promise<Event> {
    return fetchAPI<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  },

  /**
   * Update an event (artists only)
   */
  async update(id: string, eventData: UpdateEventRequest): Promise<Event> {
    return fetchAPI<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    })
  },

  /**
   * Delete an event (artists only)
   */
  async delete(id: string): Promise<void> {
    return fetchAPI<void>(`/events/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get events by artist
   */
  async getByArtist(artistId: string): Promise<Event[]> {
    return this.getAll({ artistId })
  },

  /**
   * Get upcoming events
   */
  async getUpcoming(limit: number = 20): Promise<Event[]> {
    return this.getAll({ status: 'scheduled', limit })
  },

  /**
   * Get live events
   */
  async getLive(): Promise<Event[]> {
    return this.getAll({ status: 'live' })
  },
}

// ============================================
// TICKETS API
// ============================================

export const ticketsAPI = {
  /**
   * Purchase a ticket
   */
  async purchase(request: PurchaseTicketRequest): Promise<PurchaseTicketResponse> {
    return fetchAPI<PurchaseTicketResponse>('/tickets/purchase', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  /**
   * Get user's tickets
   */
  async getMyTickets(): Promise<Ticket[]> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tickets')
      .select('*, event:events(*, artist:artists(*, user:users(*)))')
      .eq('user_id', user.id)
      .eq('payment_status', 'completed')
      .order('purchased_at', { ascending: false })

    if (error) throw error
    return data as Ticket[]
  },

  /**
   * Check if user has access to event
   */
  async hasAccess(eventId: string): Promise<boolean> {
    const user = await authAPI.getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('payment_status', 'completed')
      .single()

    return !error && !!data
  },

  /**
   * Get ticket by ID
   */
  async getById(id: string): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, event:events(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Ticket
  },
}

// ============================================
// TIPS API
// ============================================

export const tipsAPI = {
  /**
   * Send a tip to an artist
   */
  async send(request: SendTipRequest): Promise<SendTipResponse> {
    return fetchAPI<SendTipResponse>('/tips/send', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  /**
   * Get tips sent by user
   */
  async getMySentTips(): Promise<Tip[]> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tips')
      .select('*, to_artist:artists(*, user:users(*)), event:events(*)')
      .eq('from_user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Tip[]
  },

  /**
   * Get tips received by artist
   */
  async getReceivedTips(): Promise<Tip[]> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tips')
      .select('*, from_user:users(*), event:events(*)')
      .eq('to_artist_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Tip[]
  },
}

// ============================================
// SHORTS API
// ============================================

export const shortsAPI = {
  /**
   * Get shorts feed (discovery)
   */
  async getFeed(limit: number = 20, offset: number = 0): Promise<GetShortsResponse> {
    const { data, error, count } = await supabase
      .from('shorts')
      .select('*, event:events(*), artist:artists(*, user:users(*))', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      shorts: data as Short[],
      total: count || 0,
      has_more: (count || 0) > offset + limit,
    }
  },

  /**
   * Like a short
   */
  async like(shortId: string): Promise<void> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('short_interactions').insert({
      short_id: shortId,
      user_id: user.id,
      interaction_type: 'like',
    })

    if (error) throw error

    // Increment like count
    await supabase.rpc('increment_short_likes', { short_id: shortId })
  },

  /**
   * Unlike a short
   */
  async unlike(shortId: string): Promise<void> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('short_interactions')
      .delete()
      .eq('short_id', shortId)
      .eq('user_id', user.id)
      .eq('interaction_type', 'like')

    if (error) throw error

    // Decrement like count
    await supabase.rpc('decrement_short_likes', { short_id: shortId })
  },

  /**
   * Track short view
   */
  async trackView(shortId: string): Promise<void> {
    const user = await authAPI.getCurrentUser()
    if (!user) return

    await supabase.from('short_interactions').insert({
      short_id: shortId,
      user_id: user.id,
      interaction_type: 'view',
    })

    // Increment view count
    await supabase.rpc('increment_short_views', { short_id: shortId })
  },
}

// ============================================
// ARTISTS API
// ============================================

export const artistsAPI = {
  /**
   * Get all artists
   */
  async getAll(limit: number = 20, offset: number = 0): Promise<Artist[]> {
    const { data, error } = await supabase
      .from('artists')
      .select('*, user:users(*)')
      .order('total_followers', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data as Artist[]
  },

  /**
   * Get artist by ID
   */
  async getById(id: string): Promise<Artist> {
    const { data, error } = await supabase
      .from('artists')
      .select('*, user:users(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Artist
  },

  /**
   * Follow an artist
   */
  async follow(artistId: string): Promise<void> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('follows').insert({
      fan_id: user.id,
      artist_id: artistId,
    })

    if (error) throw error

    // Increment follower count
    await supabase.rpc('increment_artist_followers', { artist_id: artistId })
  },

  /**
   * Unfollow an artist
   */
  async unfollow(artistId: string): Promise<void> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('fan_id', user.id)
      .eq('artist_id', artistId)

    if (error) throw error

    // Decrement follower count
    await supabase.rpc('decrement_artist_followers', { artist_id: artistId })
  },

  /**
   * Check if following an artist
   */
  async isFollowing(artistId: string): Promise<boolean> {
    const user = await authAPI.getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('fan_id', user.id)
      .eq('artist_id', artistId)
      .single()

    return !error && !!data
  },

  /**
   * Get followed artists
   */
  async getFollowing(): Promise<Artist[]> {
    const user = await authAPI.getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('follows')
      .select('artist:artists(*, user:users(*))')
      .eq('fan_id', user.id)

    if (error) throw error
    return (data?.map((f: any) => f.artist) || []) as unknown as Artist[]
  },
}

// ============================================
// CHAT API
// ============================================

export const chatAPI = {
  /**
   * Send a message in event chat
   */
  async sendMessage(eventId: string, message: string): Promise<void> {
    const user = await authAPI.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('event_messages').insert({
      event_id: eventId,
      user_id: user.id,
      message,
    })

    if (error) throw error
  },

  /**
   * Subscribe to event chat messages (Realtime)
   */
  subscribeToEvent(eventId: string, callback: (message: any) => void) {
    return supabase
      .channel(`event-chat-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${eventId}`,
        },
        callback
      )
      .subscribe()
  },
}

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  /**
   * Get fan dashboard
   */
  async getFanDashboard(): Promise<FanDashboard> {
    return fetchAPI<FanDashboard>('/dashboard/fan')
  },

  /**
   * Get artist dashboard
   */
  async getArtistDashboard(): Promise<ArtistDashboard> {
    return fetchAPI<ArtistDashboard>('/dashboard/artist')
  },

  /**
   * Get apporteur dashboard
   */
  async getApporteurDashboard(): Promise<ApporteurDashboard> {
    return fetchAPI<ApporteurDashboard>('/dashboard/apporteur')
  },

  /**
   * Get RR dashboard
   */
  async getRRDashboard(): Promise<RRDashboard> {
    return fetchAPI<RRDashboard>('/dashboard/rr')
  },
}

// ============================================
// MAIN API EXPORT
// ============================================

export const api = {
  auth: authAPI,
  events: eventsAPI,
  tickets: ticketsAPI,
  tips: tipsAPI,
  shorts: shortsAPI,
  artists: artistsAPI,
  chat: chatAPI,
  dashboard: dashboardAPI,
}

export default api
