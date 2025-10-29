'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface Message {
  id: string
  user_id: string
  message: string
  created_at: string
  user?: {
    full_name: string
    avatar_url?: string
  }
}

interface EventChatProps {
  eventId: string
  userId: string
}

export default function EventChat({ eventId, userId }: EventChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load initial messages
    loadMessages()

    // Subscribe to new messages
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
          // Fetch user info for the new message
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
            } as Message,
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('event_messages')
      .select('*, user:profiles(full_name, avatar_url)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (!error && data) {
      setMessages(data as Message[])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || loading) return

    setLoading(true)

    try {
      const { error } = await supabase.from('event_messages').insert({
        event_id: eventId,
        user_id: userId,
        message: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Erreur lors de l\'envoi du message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">
            Soyez le premier à envoyer un message!
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            {msg.user?.avatar_url ? (
              <img
                src={msg.user.avatar_url}
                alt={msg.user.full_name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0 text-purple-600 font-semibold text-sm">
                {msg.user?.full_name?.charAt(0) || '?'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-gray-800">
                  {msg.user?.full_name || 'Utilisateur'}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(msg.created_at), 'HH:mm')}
                </span>
              </div>
              <p className="text-sm text-gray-700 break-words">{msg.message}</p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez un message..."
          maxLength={200}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
