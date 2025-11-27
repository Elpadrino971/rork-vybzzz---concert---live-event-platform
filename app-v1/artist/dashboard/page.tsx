/**
 * PAGE ARTIST DASHBOARD V1.0
 * Tableau de bord artiste avec création d'événements
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client-v1'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/constants-v1'
import { useRouter } from 'next/navigation'

export default function ArtistDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [capacity, setCapacity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Vérifier que l'utilisateur est un artiste
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'artist') {
      router.push('/events')
      return
    }

    setUser(user)
    loadEvents(user.id)
  }

  async function loadEvents(artistId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('artist_id', artistId)
      .order('event_date', { ascending: false })

    setEvents(data || [])
    setLoading(false)
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)

    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          event_date: new Date(eventDate).toISOString(),
          ticket_price: parseFloat(ticketPrice),
          capacity: parseInt(capacity),
          image_url: imageUrl || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      // Reset form
      setTitle('')
      setDescription('')
      setEventDate('')
      setTicketPrice('')
      setCapacity('')
      setImageUrl('')
      setShowCreateForm(false)

      // Reload events
      if (user) {
        loadEvents(user.id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              VyBzzZ
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/events"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Événements
              </Link>
              <Link
                href="/artist/dashboard"
                className="text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard Artiste
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with create button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Dashboard Artiste
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            {showCreateForm ? 'Annuler' : '+ Créer un événement'}
          </button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nouvel événement
            </h2>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Concert de Jazz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Décrivez votre événement..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix du billet (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="9.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité (nombre de billets) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Création...' : 'Créer l\'événement'}
              </button>
            </form>
          </div>
        )}

        {/* Events list */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Mes événements
            </h2>
          </div>

          {events.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {events.map((event: any) => {
                const revenue = event.tickets_sold * event.ticket_price
                const artistRevenue = revenue * 0.7 // 70%

                return (
                  <div key={event.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {event.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.status === 'upcoming'
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'live'
                                ? 'bg-red-100 text-red-800'
                                : event.status === 'ended'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {event.status === 'upcoming'
                              ? 'À venir'
                              : event.status === 'live'
                              ? 'En direct'
                              : event.status === 'ended'
                              ? 'Terminé'
                              : 'Annulé'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">
                          {formatDate(event.event_date)}
                        </p>

                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Prix</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(event.ticket_price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Vendus</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {event.tickets_sold} / {event.capacity}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Revenu total
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(revenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Votre part (70%)
                            </p>
                            <p className="text-lg font-semibold text-orange-600">
                              {formatPrice(artistRevenue)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6">
                        <Link
                          href={`/event/${event.id}`}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Voir →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore créé d'événements.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-orange-600 font-semibold hover:text-orange-700"
              >
                Créer votre premier événement →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
