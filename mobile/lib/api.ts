import Constants from 'expo-constants';
import { supabase } from './supabase';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Centralized API service for making HTTP requests to the backend
 */
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get auth headers with Supabase token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const { requiresAuth = false, ...fetchOptions } = options;

      const headers: HeadersInit = requiresAuth
        ? await this.getAuthHeaders()
        : { 'Content-Type': 'application/json' };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, requiresAuth = false): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    requiresAuth = false
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    requiresAuth = false
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, requiresAuth = false): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }

  // ============================================================
  // TICKET OPERATIONS
  // ============================================================

  /**
   * Purchase a ticket for an event
   * Returns Stripe Payment Intent client secret
   */
  async purchaseTicket(eventId: string): Promise<{
    clientSecret: string | null;
    error: Error | null;
  }> {
    const { data, error } = await this.post<{ clientSecret: string }>(
      '/api/tickets/purchase',
      { event_id: eventId },
      true
    );

    return {
      clientSecret: data?.clientSecret || null,
      error,
    };
  }

  /**
   * Verify ticket ownership
   */
  async verifyTicket(ticketId: string): Promise<{
    isValid: boolean;
    error: Error | null;
  }> {
    const { data, error } = await this.get<{ valid: boolean }>(
      `/api/tickets/${ticketId}/verify`,
      true
    );

    return {
      isValid: data?.valid || false,
      error,
    };
  }

  // ============================================================
  // TIP OPERATIONS
  // ============================================================

  /**
   * Send a tip to an artist
   */
  async sendTip(artistId: string, amount: number): Promise<{
    clientSecret: string | null;
    error: Error | null;
  }> {
    const { data, error } = await this.post<{ clientSecret: string }>(
      '/api/tips/send',
      { artist_id: artistId, amount },
      true
    );

    return {
      clientSecret: data?.clientSecret || null,
      error,
    };
  }

  // ============================================================
  // CHAT OPERATIONS
  // ============================================================

  /**
   * Get chat messages for an event
   */
  async getChatMessages(eventId: string, limit = 50): Promise<{
    messages: any[] | null;
    error: Error | null;
  }> {
    const { data, error } = await this.get<{ messages: any[] }>(
      `/api/chat/${eventId}?limit=${limit}`,
      true
    );

    return {
      messages: data?.messages || null,
      error,
    };
  }

  /**
   * Send a chat message
   */
  async sendChatMessage(eventId: string, message: string): Promise<{
    success: boolean;
    error: Error | null;
  }> {
    const { data, error } = await this.post<{ success: boolean }>(
      `/api/chat/${eventId}`,
      { message },
      true
    );

    return {
      success: data?.success || false,
      error,
    };
  }

  // ============================================================
  // DASHBOARD OPERATIONS
  // ============================================================

  /**
   * Get fan dashboard data
   */
  async getFanDashboard(): Promise<{
    data: any | null;
    error: Error | null;
  }> {
    return this.get('/api/dashboard/fan', true);
  }

  /**
   * Get artist dashboard data
   */
  async getArtistDashboard(): Promise<{
    data: any | null;
    error: Error | null;
  }> {
    return this.get('/api/dashboard/artist', true);
  }

  // ============================================================
  // NOTIFICATION OPERATIONS
  // ============================================================

  /**
   * Register push notification token
   */
  async registerPushToken(token: string): Promise<{
    success: boolean;
    error: Error | null;
  }> {
    const { data, error } = await this.post<{ success: boolean }>(
      '/api/notifications/register',
      { push_token: token },
      true
    );

    return {
      success: data?.success || false,
      error,
    };
  }

  /**
   * Unregister push notification token
   */
  async unregisterPushToken(): Promise<{
    success: boolean;
    error: Error | null;
  }> {
    const { data, error } = await this.post<{ success: boolean }>(
      '/api/notifications/unregister',
      {},
      true
    );

    return {
      success: data?.success || false,
      error,
    };
  }

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  /**
   * Check API health
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    error: Error | null;
  }> {
    const { data, error } = await this.get<{ status: string }>('/api/health', false);

    return {
      healthy: data?.status === 'ok',
      error,
    };
  }
}

// Export singleton instance
export const api = new ApiService(API_URL);
export default api;
