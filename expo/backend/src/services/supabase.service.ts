import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialise et retourne le client Supabase
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key must be set in environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Pas de session côté serveur
      },
    });
  }

  return supabaseClient;
}

/**
 * Service Supabase pour les opérations de base de données
 */
export const supabaseService = {
  /**
   * Récupère le client Supabase
   */
  getClient() {
    return getSupabaseClient();
  },

  /**
   * Exemple : Récupère tous les événements
   */
  async getEvents() {
    const { data, error } = await getSupabaseClient()
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Exemple : Récupère un événement par ID
   */
  async getEventById(id: string) {
    const { data, error } = await getSupabaseClient()
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Exemple : Crée un nouvel événement
   */
  async createEvent(eventData: any) {
    const { data, error } = await getSupabaseClient()
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Exemple : Met à jour un événement
   */
  async updateEvent(id: string, updates: any) {
    const { data, error } = await getSupabaseClient()
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Exemple : Supprime un événement
   */
  async deleteEvent(id: string) {
    const { data, error } = await getSupabaseClient()
      .from('events')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Exemple : Récupère les utilisateurs
   */
  async getUsers() {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*');

    if (error) throw error;
    return data;
  },

  /**
   * Exemple : Récupère un utilisateur par ID
   */
  async getUserById(id: string) {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

