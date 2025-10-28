import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function ArtistDashboard() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/artist/dashboard')
  }

  // Check if user is an artist
  const { data: artist } = await supabase
    .from('artists')
    .select('*, profile:profiles(*)')
    .eq('id', user.id)
    .single()

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Compte artiste requis
          </h2>
          <p className="text-gray-600 mb-6">
            Vous devez avoir un compte artiste pour accéder à cette page.
          </p>
          <Link
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  // Get artist's events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('artist_id', user.id)
    .order('scheduled_at', { ascending: false })

  // Get stats
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, event:events!inner(artist_id)')
    .eq('event.artist_id', user.id)
    .eq('status', 'confirmed')

  const totalRevenue = tickets?.reduce((sum, t) => sum + parseFloat(t.purchase_price.toString()), 0) || 0
  const totalTickets = tickets?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard Artiste</h1>
              <p className="text-purple-100 text-lg">
                Bienvenue, {artist.stage_name}
              </p>
            </div>
            <Link
              href="/artist/events/create"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              + Créer un événement
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Événements totaux</div>
            <div className="text-3xl font-bold text-gray-800">{events?.length || 0}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Billets vendus</div>
            <div className="text-3xl font-bold text-gray-800">{totalTickets}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Revenus totaux</div>
            <div className="text-3xl font-bold text-green-600">{totalRevenue.toFixed(2)}€</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Stripe Connect</div>
            {artist.stripe_connect_completed ? (
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Configuré
              </div>
            ) : (
              <Link
                href="/artist/stripe-connect"
                className="text-orange-600 font-semibold hover:text-orange-700"
              >
                À configurer →
              </Link>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Mes événements</h2>
            <Link
              href="/artist/events/create"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              + Nouveau
            </Link>
          </div>

          {!events || events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Aucun événement
              </h3>
              <p className="text-gray-600 mb-6">
                Créez votre premier concert en direct!
              </p>
              <Link
                href="/artist/events/create"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Créer un événement
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            event.status === 'live'
                              ? 'bg-red-100 text-red-700'
                              : event.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : event.status === 'draft'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {event.status === 'live'
                            ? 'EN DIRECT'
                            : event.status === 'scheduled'
                            ? 'PLANIFIÉ'
                            : event.status === 'draft'
                            ? 'BROUILLON'
                            : 'TERMINÉ'}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-2">
                        {format(new Date(event.scheduled_at), "d MMMM yyyy 'à' HH:mm", {
                          locale: fr,
                        })}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{event.ticket_price.toFixed(2)}€</span>
                        <span>•</span>
                        <span>{event.current_attendees} participants</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/artist/events/${event.id}/edit`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                      >
                        Modifier
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
