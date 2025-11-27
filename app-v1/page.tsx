/**
 * HOMEPAGE V1.0
 * Page d'accueil avec prochains événements
 */

import { createClient } from '@/lib/supabase-server-v1'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/constants-v1'

export default async function HomePage() {
  const supabase = createClient()

  // Récupérer les 6 prochains événements
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      users!events_artist_id_fkey(full_name)
    `)
    .eq('status', 'upcoming')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(6)

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
                href="/auth/signin"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700"
              >
                Inscription
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            Concerts en Live
          </h1>
          <p className="text-xl mb-8">
            Assistez aux meilleurs concerts en direct depuis chez vous
          </p>
          <Link
            href="/events"
            className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Voir les événements
          </Link>
        </div>
      </div>

      {/* Prochains événements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Prochains événements
        </h2>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
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
                      {event.capacity - event.tickets_sold} places restantes
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">
            Aucun événement à venir pour le moment.
          </p>
        )}

        {events && events.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-block text-orange-600 font-semibold hover:text-orange-700"
            >
              Voir tous les événements →
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-400">
            © 2025 VyBzzZ. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
