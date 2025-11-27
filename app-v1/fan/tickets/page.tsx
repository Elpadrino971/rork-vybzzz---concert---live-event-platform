/**
 * PAGE FAN TICKETS V1.0
 * Liste des billets achetés par l'utilisateur avec QR codes
 */

import { createClient } from '@/lib/supabase-server-v1'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/constants-v1'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'

export default async function FanTicketsPage() {
  const supabase = createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Récupérer tous les billets de l'utilisateur
  const { data: tickets } = await supabase
    .from('tickets')
    .select(
      `
      *,
      events(
        id,
        title,
        event_date,
        status,
        image_url,
        users!events_artist_id_fkey(full_name)
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Générer les QR codes
  const ticketsWithQR = await Promise.all(
    (tickets || []).map(async (ticket: any) => {
      const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code, {
        width: 300,
        margin: 2,
      })
      return {
        ...ticket,
        qrCodeDataUrl,
      }
    })
  )

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
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard Artiste
              </Link>
              <Link
                href="/fan/tickets"
                className="text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mes Billets
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mes Billets</h1>

        {ticketsWithQR && ticketsWithQR.length > 0 ? (
          <div className="space-y-6">
            {ticketsWithQR.map((ticket: any) => {
              const event = ticket.events
              const isUpcoming = event.status === 'upcoming'
              const isLive = event.status === 'live'
              const isEnded = event.status === 'ended'

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="md:flex">
                    {/* Event image */}
                    <div className="md:flex-shrink-0 md:w-64">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="h-48 w-full object-cover md:h-full md:w-64"
                        />
                      ) : (
                        <div className="h-48 w-full md:h-full md:w-64 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-4xl">🎵</span>
                        </div>
                      )}
                    </div>

                    {/* Ticket details */}
                    <div className="p-6 flex-1">
                      {/* Status badge */}
                      <div className="mb-3">
                        {isLive && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                            EN DIRECT MAINTENANT
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            À VENIR
                          </span>
                        )}
                        {isEnded && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            TERMINÉ
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h2>

                      <p className="text-sm text-gray-600 mb-4">
                        Par {event.users?.full_name || 'Artiste'}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-gray-900 font-medium">
                            {formatDate(event.event_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Prix payé</p>
                          <p className="text-gray-900 font-medium">
                            {formatPrice(ticket.price_paid)}
                          </p>
                        </div>
                      </div>

                      {/* Action button */}
                      {isLive && (
                        <Link
                          href={`/event/${event.id}/live`}
                          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          🔴 Rejoindre le concert
                        </Link>
                      )}

                      {isUpcoming && (
                        <Link
                          href={`/event/${event.id}`}
                          className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                        >
                          Voir les détails
                        </Link>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="p-6 bg-gray-50 md:w-64 flex flex-col items-center justify-center border-l border-gray-200">
                      <p className="text-sm text-gray-600 mb-3 text-center">
                        QR Code d'entrée
                      </p>
                      <img
                        src={ticket.qrCodeDataUrl}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                      <p className="text-xs text-gray-400 mt-3 text-center">
                        #{ticket.qr_code.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6">
              <span className="text-6xl">🎫</span>
            </div>
            <p className="text-gray-500 mb-6 text-lg">
              Vous n'avez pas encore de billets.
            </p>
            <Link
              href="/events"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Découvrir les événements
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
