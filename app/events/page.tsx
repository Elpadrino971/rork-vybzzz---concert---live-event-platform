import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/events/EventCard'
import { isHappyHour, formatHappyHourTime } from '@/lib/happy-hour'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const supabase = await createClient()

  // Get all upcoming events
  const { data: events, error } = await supabase
    .from('events')
    .select('*, artist:artists(*, profile:profiles(*))')
    .in('status', ['scheduled', 'live'])
    .order('scheduled_at', { ascending: true })

  const isHappy = isHappyHour()
  const happyHourTime = formatHappyHourTime()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Concerts en Direct</h1>
          <p className="text-xl text-purple-100">
            Découvrez les meilleurs artistes en live streaming
          </p>

          {/* Happy Hour Banner */}
          {isHappy && (
            <div className="mt-6 bg-yellow-400 text-purple-900 px-6 py-3 rounded-lg inline-block font-bold text-lg animate-pulse">
              🎉 Happy Hour en cours! Billets à 4,99€
            </div>
          )}
          {!isHappy && (
            <div className="mt-6 bg-white/20 backdrop-blur px-6 py-3 rounded-lg inline-block">
              <p className="text-white">
                Prochain Happy Hour: <span className="font-bold">{happyHourTime}</span> - Billets à
                4,99€
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="mb-8 flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            ← Accueil
          </Link>
        </div>

        {/* Events Grid */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Erreur lors du chargement des événements
          </div>
        )}

        {!error && events && events.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Aucun événement disponible pour le moment
            </h2>
            <p className="text-gray-600">Revenez bientôt pour découvrir de nouveaux concerts!</p>
          </div>
        )}

        {!error && events && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
