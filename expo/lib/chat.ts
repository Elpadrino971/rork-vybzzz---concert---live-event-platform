import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

// =====================================================
// TYPES
// =====================================================

export interface ChatMessage {
  id: string
  event_id: string
  user_id: string
  message: string
  created_at: string
  is_deleted: boolean
  user?: {
    full_name: string
    avatar_url?: string
  }
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  reaction: string
  created_at: string
}

export interface OnlineUser {
  user_id: string
  full_name: string
  avatar_url?: string
  last_seen_at: string
}

export interface TypingUser {
  user_id: string
  full_name: string
}

export interface BannedUser {
  id: string
  event_id: string
  user_id: string
  banned_by: string
  banned_at: string
  reason?: string
  expires_at?: string
}

// =====================================================
// HOOK: useEventChat
// =====================================================

export function useEventChat(eventId: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('event_messages')
        .select('*, user:profiles(full_name, avatar_url)')
        .eq('event_id', eventId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      setMessages((data as ChatMessage[]) || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Send message
  const sendMessage = useCallback(
    async (message: string) => {
      try {
        const { error } = await supabase.from('event_messages').insert({
          event_id: eventId,
          user_id: userId,
          message: message.trim(),
        })

        if (error) throw error
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },
    [eventId, userId]
  )

  // Delete message (moderation)
  const deleteMessage = useCallback(
    async (messageId: string, reason: string) => {
      try {
        const { data, error } = await supabase.rpc('delete_chat_message', {
          p_message_id: messageId,
          p_deleted_by: userId,
          p_reason: reason,
        })

        if (error) throw error
        return data as { success: boolean; error?: string }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },
    [userId]
  )

  // Subscribe to new messages
  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel(`event-chat-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload: any) => {
          // Fetch user info
          const { data: user } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              user,
            } as ChatMessage,
          ])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${eventId}`,
        },
        (payload: any) => {
          // Handle message deletion
          if (payload.new.is_deleted) {
            setMessages((prev) => prev.filter((m) => m.id !== payload.new.id))
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, loadMessages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    refreshMessages: loadMessages,
  }
}

// =====================================================
// HOOK: useChatPresence
// =====================================================

export function useChatPresence(eventId: string, userId: string) {
  const [onlineCount, setOnlineCount] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Update presence
  const updatePresence = useCallback(async () => {
    try {
      await supabase.rpc('update_chat_presence', {
        p_event_id: eventId,
        p_user_id: userId,
      })
    } catch (err) {
      console.error('Error updating presence:', err)
    }
  }, [eventId, userId])

  // Get online users
  const getOnlineUsers = useCallback(async () => {
    try {
      const { data: count } = await supabase.rpc('get_online_users_count', {
        p_event_id: eventId,
      })

      setOnlineCount(count || 0)

      // Get detailed list
      const { data: presence } = await supabase
        .from('chat_presence')
        .select('user_id, last_seen_at, user:profiles(full_name, avatar_url)')
        .eq('event_id', eventId)
        .gt('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

      if (presence) {
        setOnlineUsers(
          presence.map((p: any) => ({
            user_id: p.user_id,
            full_name: p.user?.full_name || 'User',
            avatar_url: p.user?.avatar_url,
            last_seen_at: p.last_seen_at,
          }))
        )
      }
    } catch (err) {
      console.error('Error getting online users:', err)
    }
  }, [eventId])

  useEffect(() => {
    // Initial presence update
    updatePresence()
    getOnlineUsers()

    // Update presence every 30 seconds
    intervalRef.current = setInterval(() => {
      updatePresence()
    }, 30000)

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_presence',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          getOnlineUsers()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      supabase.removeChannel(channel)
    }
  }, [eventId, updatePresence, getOnlineUsers])

  return {
    onlineCount,
    onlineUsers,
  }
}

// =====================================================
// HOOK: useTypingIndicator
// =====================================================

export function useTypingIndicator(eventId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Set typing status
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      try {
        await supabase.rpc('set_typing_indicator', {
          p_event_id: eventId,
          p_user_id: userId,
          p_is_typing: isTyping,
        })
      } catch (err) {
        console.error('Error setting typing:', err)
      }
    },
    [eventId, userId]
  )

  // Start typing (auto-stops after 3s)
  const startTyping = useCallback(() => {
    setTyping(true)

    // Clear existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // Auto-stop after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setTyping(false)
    }, 3000)
  }, [setTyping])

  // Stop typing
  const stopTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setTyping(false)
  }, [setTyping])

  // Load typing users
  const loadTypingUsers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('chat_typing_indicators')
        .select('user_id, user:profiles(full_name)')
        .eq('event_id', eventId)
        .neq('user_id', userId)
        .gt('started_at', new Date(Date.now() - 10000).toISOString())

      if (data) {
        setTypingUsers(
          data.map((t: any) => ({
            user_id: t.user_id,
            full_name: t.user?.full_name || 'Someone',
          }))
        )
      }
    } catch (err) {
      console.error('Error loading typing users:', err)
    }
  }, [eventId, userId])

  useEffect(() => {
    // Subscribe to typing indicators
    const channel = supabase
      .channel(`typing-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          loadTypingUsers()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      stopTyping()
      supabase.removeChannel(channel)
    }
  }, [eventId, loadTypingUsers, stopTyping])

  return {
    typingUsers,
    startTyping,
    stopTyping,
  }
}

// =====================================================
// HOOK: useChatModeration
// =====================================================

export function useChatModeration(eventId: string, userId: string) {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([])

  // Ban user
  const banUser = useCallback(
    async (targetUserId: string, reason: string, durationMinutes?: number) => {
      try {
        const { data, error } = await supabase.rpc('ban_chat_user', {
          p_event_id: eventId,
          p_user_id: targetUserId,
          p_banned_by: userId,
          p_reason: reason,
          p_duration_minutes: durationMinutes,
        })

        if (error) throw error
        return data as { success: boolean; error?: string }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },
    [eventId, userId]
  )

  // Unban user
  const unbanUser = useCallback(
    async (targetUserId: string) => {
      try {
        const { error } = await supabase
          .from('chat_banned_users')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', targetUserId)

        if (error) throw error
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },
    [eventId]
  )

  // Load banned users
  const loadBannedUsers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('chat_banned_users')
        .select('*')
        .eq('event_id', eventId)

      if (data) {
        setBannedUsers(data as BannedUser[])
      }
    } catch (err) {
      console.error('Error loading banned users:', err)
    }
  }, [eventId])

  useEffect(() => {
    loadBannedUsers()
  }, [loadBannedUsers])

  return {
    bannedUsers,
    banUser,
    unbanUser,
    refreshBannedUsers: loadBannedUsers,
  }
}

// =====================================================
// HOOK: useMessageReactions
// =====================================================

export function useMessageReactions(messageId: string, userId: string) {
  const [reactions, setReactions] = useState<MessageReaction[]>([])

  // Load reactions
  const loadReactions = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)

      if (data) {
        setReactions(data as MessageReaction[])
      }
    } catch (err) {
      console.error('Error loading reactions:', err)
    }
  }, [messageId])

  // Add reaction
  const addReaction = useCallback(
    async (reaction: string) => {
      try {
        const { error } = await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: userId,
          reaction,
        })

        if (error) throw error
        loadReactions()
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },
    [messageId, userId, loadReactions]
  )

  // Remove reaction
  const removeReaction = useCallback(
    async (reaction: string) => {
      try {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', userId)
          .eq('reaction', reaction)

        if (error) throw error
        loadReactions()
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },
    [messageId, userId, loadReactions]
  )

  useEffect(() => {
    loadReactions()

    // Subscribe to reactions
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          loadReactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageId, loadReactions])

  return {
    reactions,
    addReaction,
    removeReaction,
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Check if user is banned
export async function isUserBanned(eventId: string, userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('chat_banned_users')
      .select('id, expires_at')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (!data) return false

    // Check if ban is still active
    if (data.expires_at) {
      return new Date(data.expires_at) > new Date()
    }

    return true
  } catch {
    return false
  }
}

// Rate limit check (client-side)
const messageTimestamps: Record<string, number[]> = {}

export function checkRateLimit(userId: string, maxMessages = 5, windowMs = 10000): boolean {
  const now = Date.now()
  const userTimestamps = messageTimestamps[userId] || []

  // Remove timestamps outside window
  const validTimestamps = userTimestamps.filter((ts) => now - ts < windowMs)

  if (validTimestamps.length >= maxMessages) {
    return false // Rate limit exceeded
  }

  // Add current timestamp
  validTimestamps.push(now)
  messageTimestamps[userId] = validTimestamps

  return true // OK to send
}
