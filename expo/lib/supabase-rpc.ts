/**
 * Supabase RPC Functions
 *
 * AMÉLIORATION: Atomic Transactions + Dashboard Optimization
 * Ces fonctions appellent des procédures stockées Supabase (RPC)
 * qui garantissent la cohérence des données avec des transactions atomiques
 * et optimisent les performances en éliminant les N+1 queries
 */

import { createClient } from '@/lib/supabase/server'

// ============================================
// TYPE DEFINITIONS
// ============================================

type RPCResult<T> = {
  success: boolean
  data?: T
  error?: string
}

type ConfirmTicketResult = {
  ticket_id: string
  event_id: string
}

type ProcessPayoutResult = {
  payout_id: string
  artist_id: string
  amount: number
}

type CompleteTipResult = {
  tip_id: string
  artist_id: string
}

type ArtistDashboardData = {
  artist: {
    id: string
    stageName: string
    bio: string
    avatarUrl: string
    bannerUrl: string
    instagramHandle: string
    tiktokHandle: string
    youtubeChannel: string
    totalFollowers: number
    totalEvents: number
  }
  subscription: {
    tier: string
    active: boolean
    endsAt: string | null
    daysRemaining: number | null
    stripeConnectCompleted: boolean
  }
  events: {
    counts: {
      total: number
      draft: number
      scheduled: number
      live: number
      ended: number
      cancelled: number
    }
    recent: any[]
  }
  tickets: {
    total: number
    confirmed: number
    pending: number
    failed: number
  }
  revenue: {
    total: number
    artistShare: number
    platformShare: number
    fromTips: number
    totalEarnings: number
  }
  tips: {
    stats: {
      total: number
      totalAmount: number
    }
    recent: any[]
  }
  payouts: {
    totalPaid: number
    nextPayout: any
    recent: any[]
  }
}

type FanDashboardData = {
  profile: any
  tickets: {
    stats: {
      total: number
      upcoming: number
      past: number
    }
    upcoming: any[]
    past: any[]
  }
  following: {
    total: number
    artists: any[]
  }
  tips: {
    total: number
    totalAmount: number
    recent: any[]
  }
  spending: {
    totalTickets: number
    totalTips: number
    totalSpent: number
  }
}

// ============================================
// TICKET PURCHASE CONFIRMATION
// ============================================

/**
 * Atomically confirms a ticket purchase after successful payment
 *
 * This function:
 * - Updates ticket status to 'confirmed'
 * - Increments event attendee count
 * - Confirms affiliate commissions
 *
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Result with ticket and event IDs
 */
export async function confirmTicketPurchase(
  paymentIntentId: string
): Promise<RPCResult<ConfirmTicketResult>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('confirm_ticket_purchase', {
      p_payment_intent_id: paymentIntentId,
    })

    if (error) {
      console.error('RPC confirm_ticket_purchase error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // RPC returns an array with one row
    const result = Array.isArray(data) ? data[0] : data

    if (!result?.success) {
      return {
        success: false,
        error: result?.error_message || 'Failed to confirm ticket',
      }
    }

    return {
      success: true,
      data: {
        ticket_id: result.ticket_id,
        event_id: result.event_id,
      },
    }
  } catch (error: any) {
    console.error('Error calling confirm_ticket_purchase:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

// ============================================
// EVENT PAYOUT PROCESSING
// ============================================

/**
 * Atomically processes J+21 payout for an event
 *
 * This function:
 * - Calculates artist payout based on subscription tier
 * - Creates payout record
 * - Updates event status
 *
 * @param eventId - Event UUID
 * @returns Result with payout details
 */
export async function processEventPayout(
  eventId: string
): Promise<RPCResult<ProcessPayoutResult>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('process_event_payout', {
      p_event_id: eventId,
    })

    if (error) {
      console.error('RPC process_event_payout error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // RPC returns an array with one row
    const result = Array.isArray(data) ? data[0] : data

    if (!result?.success) {
      return {
        success: false,
        error: result?.error_message || 'Failed to process payout',
      }
    }

    return {
      success: true,
      data: {
        payout_id: result.payout_id,
        artist_id: result.artist_id,
        amount: result.amount,
      },
    }
  } catch (error: any) {
    console.error('Error calling process_event_payout:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

// ============================================
// TICKET CANCELLATION
// ============================================

/**
 * Atomically cancels a ticket with refund
 *
 * This function:
 * - Updates ticket status to 'refunded'
 * - Decrements event attendee count
 * - Cancels affiliate commissions
 *
 * @param ticketId - Ticket UUID
 * @returns Result with success status
 */
export async function cancelTicket(
  ticketId: string
): Promise<RPCResult<void>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('cancel_ticket', {
      p_ticket_id: ticketId,
    })

    if (error) {
      console.error('RPC cancel_ticket error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // RPC returns an array with one row
    const result = Array.isArray(data) ? data[0] : data

    if (!result?.success) {
      return {
        success: false,
        error: result?.error_message || 'Failed to cancel ticket',
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('Error calling cancel_ticket:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

// ============================================
// TIP COMPLETION
// ============================================

/**
 * Atomically completes a tip payment
 *
 * This function:
 * - Updates tip status to 'completed'
 * - Updates artist total tips received
 *
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Result with tip and artist IDs
 */
export async function completeTipPayment(
  paymentIntentId: string
): Promise<RPCResult<CompleteTipResult>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('complete_tip_payment', {
      p_payment_intent_id: paymentIntentId,
    })

    if (error) {
      console.error('RPC complete_tip_payment error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // RPC returns an array with one row
    const result = Array.isArray(data) ? data[0] : data

    if (!result?.success) {
      return {
        success: false,
        error: result?.error_message || 'Failed to complete tip',
      }
    }

    return {
      success: true,
      data: {
        tip_id: result.tip_id,
        artist_id: result.artist_id,
      },
    }
  } catch (error: any) {
    console.error('Error calling complete_tip_payment:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

// ============================================
// ARTIST DASHBOARD (OPTIMIZED)
// ============================================

/**
 * Get artist dashboard data (optimized)
 *
 * Replaces 6 separate queries with 1 RPC call
 * Eliminates N+1 query problem
 *
 * @param artistId - Artist UUID
 * @returns Complete dashboard data
 */
export async function getArtistDashboard(
  artistId: string
): Promise<RPCResult<ArtistDashboardData>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_artist_dashboard', {
      p_artist_id: artistId,
    })

    if (error) {
      console.error('RPC get_artist_dashboard error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    if (data?.error) {
      return {
        success: false,
        error: data.error,
      }
    }

    return {
      success: true,
      data: data as ArtistDashboardData,
    }
  } catch (error: any) {
    console.error('Error calling get_artist_dashboard:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

// ============================================
// FAN DASHBOARD (OPTIMIZED)
// ============================================

/**
 * Get fan dashboard data (optimized)
 *
 * Replaces 5 separate queries with 1 RPC call
 * Eliminates N+1 query problem
 *
 * @param userId - User UUID
 * @returns Complete dashboard data
 */
export async function getFanDashboard(
  userId: string
): Promise<RPCResult<FanDashboardData>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_fan_dashboard', {
      p_user_id: userId,
    })

    if (error) {
      console.error('RPC get_fan_dashboard error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    if (data?.error) {
      return {
        success: false,
        error: data.error,
      }
    }

    return {
      success: true,
      data: data as FanDashboardData,
    }
  } catch (error: any) {
    console.error('Error calling get_fan_dashboard:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}
