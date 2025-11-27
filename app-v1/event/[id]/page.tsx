/**
 * PAGE EVENT DETAIL V1.0
 * Détail d'un événement avec bouton d'achat
 */

import { createClient } from '@/lib/supabase-server-v1'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/constants-v1'
import { notFound } from 'next/navigation'

export default async function EventDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Récupérer l'événement avec les infos de l'artiste
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      users!events_artist_id_fkey(id, full_name, email)
    `)
    .eq('id', params.id)
    .single()

  if (!event) {
    notFound()
  }

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isSoldOut = event.tickets_sold >= event.capacity
  const availableTickets = event.capacity - event.tickets_sold
  const isUpcoming = event.status === 'upcoming'
  const isLive = event.status === 'live'

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
              {user ? (
                <>
                  <Link
                    href="/artist/dashboard"
                    className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/fan/tickets"
                    className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Mes Billets
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/events"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
        >
          ← Retour aux événements
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:flex-shrink-0 md:w-1/2">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-full w-full object-cover md:h-full"
                />
              ) : (
                <div className="h-96 md:h-full w-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-6xl">🎵</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 md:w-1/2">
              {/* Status badge */}
              {isLive && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                    EN DIRECT
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {/* Artist */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xl font-semibold mr-3">
                  {event.users?.full_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Artiste</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.users?.full_name || 'Artiste'}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Date et heure</p>
                <p className="text-lg text-gray-900">
                  {formatDate(event.event_date)}
                </p>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Price and capacity */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Prix du billet</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {formatPrice(event.ticket_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Places</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {availableTickets} / {event.capacity}
                    </p>
                    {availableTickets < 10 && availableTickets > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Plus que {availableTickets} places !
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {/* Live button if event is live */}
                {isLive && (
                  <Link
                    href={`/event/${event.id}/live`}
                    className="block w-full bg-red-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    🔴 Rejoindre le concert en direct
                  </Link>
                )}

                {/* Purchase button */}
                {isUpcoming && !isSoldOut && user && (
                  <form action={`/api/tickets/purchase`} method="POST">
                    <input type="hidden" name="eventId" value={event.id} />
                    <button
                      type="submit"
                      className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                    >
                      Acheter un billet
                    </button>
                  </form>
                )}

                {/* Sign in prompt if not logged in */}
                {isUpcoming && !isSoldOut && !user && (
                  <Link
                    href="/auth/signin"
                    className="block w-full bg-orange-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                  >
                    Connectez-vous pour acheter
                  </Link>
                )}

                {/* Sold out message */}
                {isSoldOut && (
                  <div className="w-full bg-gray-100 text-gray-700 text-center px-6 py-3 rounded-lg font-semibold">
                    Complet
                  </div>
                )}

                {/* Event ended message */}
                {event.status === 'ended' && (
                  <div className="w-full bg-gray-100 text-gray-700 text-center px-6 py-3 rounded-lg font-semibold">
                    Événement terminé
                  </div>
                )}

                {/* Cancelled message */}
                {event.status === 'cancelled' && (
                  <div className="w-full bg-red-100 text-red-700 text-center px-6 py-3 rounded-lg font-semibold">
                    Événement annulé
                  </div>
                )}
              </div>

              {/* Additional info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  💳 Paiement sécurisé avec Stripe
                  <br />
                  📧 Billet envoyé par email
                  <br />
                  📱 QR Code pour l'entrée
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
