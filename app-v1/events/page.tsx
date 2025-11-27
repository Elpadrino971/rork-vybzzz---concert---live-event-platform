/**
 * PAGE EVENTS V1.0
 * Liste complète de tous les événements
 */

import { createClient } from '@/lib/supabase-server-v1'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/constants-v1'

export default async function EventsPage() {
  const supabase = createClient()

  // Récupérer tous les événements à venir
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      users!events_artist_id_fkey(full_name)
    `)
    .eq('status', 'upcoming')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

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
                className="text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Événements
              </Link>
              <Link
                href="/artist/dashboard"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard Artiste
              </Link>
              <Link
                href="/fan/tickets"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mes Billets
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Tous les événements
        </h1>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-white text-4xl">🎵</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Par {event.users?.full_name || 'Artiste'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {formatDate(event.event_date)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPrice(event.ticket_price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {event.capacity - event.tickets_sold} places
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Aucun événement à venir pour le moment.
            </p>
            <Link
              href="/artist/dashboard"
              className="text-orange-600 font-semibold hover:text-orange-700"
            >
              Vous êtes artiste ? Créez votre premier événement →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
