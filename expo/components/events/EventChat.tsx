'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import {
  useEventChat,
  useChatPresence,
  useTypingIndicator,
  checkRateLimit,
  isUserBanned,
  ChatMessage,
} from '@/lib/chat'

interface EventChatProps {
  eventId: string
  userId: string
  isArtist?: boolean
  onModeration?: () => void
}

export default function EventChat({ eventId, userId, isArtist = false, onModeration }: EventChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isBanned, setIsBanned] = useState(false)
  const [rateLimitError, setRateLimitError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Chat hooks
  const { messages, loading, sendMessage } = useEventChat(eventId, userId)
  const { onlineCount } = useChatPresence(eventId, userId)
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(eventId, userId)

  // Check if user is banned
  useEffect(() => {
    isUserBanned(eventId, userId).then(setIsBanned)
  }, [eventId, userId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (e.target.value.length > 0) {
      startTyping()
    } else {
      stopTyping()
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || loading || isBanned) return

    // Rate limit check
    if (!checkRateLimit(userId, 5, 10000)) {
      setRateLimitError(true)
      setTimeout(() => setRateLimitError(false), 3000)
      return
    }

    stopTyping()

    const result = await sendMessage(newMessage)

    if (result.success) {
      setNewMessage('')
    } else {
      alert(result.error || 'Erreur lors de l\'envoi du message')
    }
  }

  return (
    <div className="flex flex-col h-80 sm:h-96">
      {/* Header with online count */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-600 font-medium">
            {onlineCount} {onlineCount === 1 ? 'personne' : 'personnes'} en ligne
          </span>
        </div>
        {isArtist && onModeration && (
          <button
            onClick={onModeration}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
          >
            Modération
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-2 pr-2 overscroll-contain">
        {loading && messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">Chargement...</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">
            Soyez le premier à envoyer un message!
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            {msg.user?.avatar_url ? (
              <img
                src={msg.user.avatar_url}
                alt={msg.user.full_name || 'User'}
                className="w-8 h-8 rounded-full flex-shrink-0"
                loading="lazy"
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

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-2 items-center text-xs text-gray-500 italic">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0].full_name} est en train d'écrire...`
                : `${typingUsers.length} personnes écrivent...`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error messages */}
      {isBanned && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          Vous avez été banni du chat.
        </div>
      )}

      {rateLimitError && (
        <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
          Vous envoyez trop de messages. Veuillez patienter.
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder={isBanned ? 'Vous êtes banni' : 'Écrivez un message...'}
          maxLength={200}
          disabled={isBanned}
          className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim() || isBanned}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
