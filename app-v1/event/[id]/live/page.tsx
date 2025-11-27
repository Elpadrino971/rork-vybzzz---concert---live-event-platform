/**
 * PAGE EVENT LIVE V1.0
 * Streaming live YouTube + Chat en temps réel
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client-v1'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/constants-v1'

export default function EventLivePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [hasTicket, setHasTicket] = useState(false)
  const [loading, setLoading] = useState(true)

  // Chat state
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (event && hasTicket) {
      subscribeToChat()
    }
  }, [event, hasTicket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadData() {
    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/signin')
      return
    }

    setUser(user)

    // Charger l'événement
    const { data: eventData } = await supabase
      .from('events')
      .select(
        `
        *,
        users!events_artist_id_fkey(full_name)
      `
      )
      .eq('id', params.id)
      .single()

    if (!eventData) {
      router.push('/events')
      return
    }

    setEvent(eventData)

    // Vérifier que l'utilisateur a un billet
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('event_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      router.push(`/event/${params.id}`)
      return
    }

    setHasTicket(true)

    // Charger les messages existants
    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('event_id', params.id)
      .order('created_at', { ascending: true })
      .limit(100)

    setMessages(messagesData || [])
    setLoading(false)
  }

  function subscribeToChat() {
    const channel = supabase
      .channel(`chat:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `event_id=eq.${params.id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    setSending(true)

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: params.id,
          message: newMessage.trim(),
        }),
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function getYouTubeEmbedUrl(url: string) {
    // Extraire l'ID de la vidéo YouTube
    const videoIdMatch =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/) ||
      url.match(/youtube\.com\/live\/([^&\s]+)/)

    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`
    }

    return url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!event || !hasTicket) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black bg-opacity-90">
        <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              VyBzzZ
            </Link>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                EN DIRECT
              </span>
              <Link
                href={`/event/${params.id}`}
                className="text-gray-300 hover:text-white text-sm"
              >
                Retour
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Video player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {event.youtube_live_url ? (
            <iframe
              src={getYouTubeEmbedUrl(event.youtube_live_url)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-white text-xl mb-4">
                Le stream va bientôt commencer...
              </p>
              <div className="animate-pulse text-6xl">🎵</div>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        <div className="lg:w-96 bg-gray-800 flex flex-col h-96 lg:h-full">
          {/* Chat header */}
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
            <h2 className="text-white font-semibold">Chat en direct</h2>
            <p className="text-gray-400 text-sm">
              {event.title} • {event.users?.full_name}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message: any) => (
              <div key={message.id} className="text-sm">
                <span className="font-semibold text-orange-400">
                  {message.username}
                </span>
                <span className="text-gray-300 ml-2">{message.message}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSendMessage}
            className="bg-gray-900 p-4 border-t border-gray-700"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Envoyer un message..."
                disabled={sending}
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
