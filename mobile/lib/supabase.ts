import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage implementation using SecureStore for auth tokens
const SecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'vybzzz-mobile@1.0.0',
    },
  },
});

// Helper functions for auth
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'vybzzz://reset-password',
    });
    return { data, error };
  },
};

// Helper functions for profiles
export const profiles = {
  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  update: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },
};

// Helper functions for events
export const events = {
  list: async (limit = 20, offset = 0) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:artist_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1);
    return { data, error };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:artist_id (
          id,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  search: async (query: string) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:artist_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(10);
    return { data, error };
  },
};

// Helper functions for tickets
export const tickets = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events (
          id,
          title,
          event_date,
          image_url,
          stream_url
        )
      `)
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });
    return { data, error };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events (
          id,
          title,
          event_date,
          image_url,
          stream_url,
          status
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  hasTicket: async (userId: string, eventId: string) => {
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();
    return { hasTicket: !!data, error };
  },
};

// Helper functions for storage
export const storage = {
  uploadAvatar: async (userId: string, fileUri: string, fileType: string) => {
    try {
      const fileName = `${userId}-${Date.now()}.${fileType.split('/')[1]}`;
      const filePath = `avatars/${fileName}`;

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, blob, {
          contentType: fileType,
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      return { publicUrl, error: null };
    } catch (error) {
      return { publicUrl: null, error };
    }
  },

  deleteAvatar: async (filePath: string) => {
    const { error } = await supabase.storage
      .from('user-avatars')
      .remove([filePath]);
    return { error };
  },
};
