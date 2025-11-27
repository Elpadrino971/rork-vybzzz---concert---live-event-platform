/**
 * TYPES DATABASE V1.0 MVP
 * Types TypeScript pour la base de données Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'fan' | 'artist'
          full_name: string | null
          avatar_url: string | null
          stripe_customer_id: string | null
          stripe_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'fan' | 'artist'
          full_name?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'fan' | 'artist'
          full_name?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string | null
          event_date: string
          ticket_price: number
          capacity: number
          tickets_sold: number
          youtube_live_url: string | null
          status: 'upcoming' | 'live' | 'ended' | 'cancelled'
          image_url: string | null
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description?: string | null
          event_date: string
          ticket_price: number
          capacity: number
          tickets_sold?: number
          youtube_live_url?: string | null
          status?: 'upcoming' | 'live' | 'ended' | 'cancelled'
          image_url?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          description?: string | null
          event_date?: string
          ticket_price?: number
          capacity?: number
          tickets_sold?: number
          youtube_live_url?: string | null
          status?: 'upcoming' | 'live' | 'ended' | 'cancelled'
          image_url?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          email: string
          price_paid: number
          stripe_payment_intent_id: string
          stripe_charge_id: string | null
          qr_code: string
          status: 'valid' | 'used' | 'refunded' | 'cancelled'
          used_at: string | null
          purchased_at: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          email: string
          price_paid: number
          stripe_payment_intent_id: string
          stripe_charge_id?: string | null
          qr_code: string
          status?: 'valid' | 'used' | 'refunded' | 'cancelled'
          used_at?: string | null
          purchased_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          email?: string
          price_paid?: number
          stripe_payment_intent_id?: string
          stripe_charge_id?: string | null
          qr_code?: string
          status?: 'valid' | 'used' | 'refunded' | 'cancelled'
          used_at?: string | null
          purchased_at?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          username: string
          message: string
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          username: string
          message: string
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          username?: string
          message?: string
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          event_id: string
          artist_id: string
          gross_revenue: number
          artist_share: number
          platform_share: number
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
          status: 'pending' | 'processing' | 'paid' | 'failed'
          event_end_date: string
          payout_date: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          artist_id: string
          gross_revenue: number
          artist_share: number
          platform_share: number
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          event_end_date: string
          payout_date?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          artist_id?: string
          gross_revenue?: number
          artist_share?: number
          platform_share?: number
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          event_end_date?: string
          payout_date?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
