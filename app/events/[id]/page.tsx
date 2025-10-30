import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getTicketPrice } from '@/lib/happy-hour'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import VideoPlayer from '@/components/events/VideoPlayer'
import EventChat from '@/components/events/EventChat'
import PurchaseTicketButton from '@/components/events/PurchaseTicketButton'
import TipButton from '@/components/events/TipButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*, artist:artists(*, profile:profiles(*))')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user has a ticket
  let hasTicket = false
  if (user) {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single()

    hasTicket = !!ticket
  }

  const { price, isHappyHour } = getTicketPrice(event.ticket_price, event.happy_hour_price || undefined)
  const scheduledDate = new Date(event.scheduled_at)
  const isLive = event.status === 'live'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/events" className="text-purple-600 hover:text-purple-700 font-semibold">
            ← Retour aux événements
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {isLive && hasTicket && event.stream_url && (
              <VideoPlayer streamUrl={event.stream_url} isLive={isLive} />
            )}

            {isLive && !hasTicket && (
              <div className="bg-gray-900 aspect-video rounded-xl flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <div className="text-4xl sm:text-6xl mb-4">🔒</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Achetez un billet pour regarder</h3>
                  <p className="text-gray-300">Ce concert est en direct maintenant!</p>
                </div>
              </div>
            )}

            {!isLive && event.cover_image_url && (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={event.cover_image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {event.status === 'scheduled' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <div className="text-4xl sm:text-6xl mb-4">⏰</div>
                      <p className="text-lg sm:text-xl">
                        Commence le{' '}
                        {format(scheduledDate, "d MMMM 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Event Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Status Badge */}
              {isLive && (
                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full mb-4 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  EN DIRECT
                </div>
              )}

              {isHappyHour && (
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-purple-900 px-4 py-2 rounded-full mb-4 ml-2">
                  🎉 Happy Hour
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">{event.title}</h1>

              {/* Artist Info */}
              {event.artist && (
                <div className="flex items-center gap-4 mb-6">
                  {event.artist.profile?.avatar_url && (
                    <img
                      src={event.artist.profile.avatar_url}
                      alt={event.artist.stage_name}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-xl font-semibold text-purple-600">
                      {event.artist.stage_name}
                    </p>
                    {event.artist.genre && event.artist.genre.length > 0 && (
                      <p className="text-gray-600">{event.artist.genre.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Date and Time */}
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-lg">
                  {format(scheduledDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>

              {/* Duration */}
              {event.duration_minutes && (
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-lg">{event.duration_minutes} minutes</span>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Purchase Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="mb-4">
                {isHappyHour && event.ticket_price !== price && (
                  <div className="text-gray-400 line-through text-lg mb-1">
                    {event.ticket_price.toFixed(2)}€
                  </div>
                )}
                <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                  {price.toFixed(2)}€
                </div>
                <p className="text-gray-600">Par personne</p>
              </div>

              {/* Attendees Info */}
              {event.max_attendees && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Places disponibles</span>
                    <span className="font-semibold text-gray-800">
                      {event.max_attendees - event.current_attendees} / {event.max_attendees}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(event.current_attendees / event.max_attendees) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              {!hasTicket && (
                <PurchaseTicketButton
                  eventId={event.id}
                  price={price}
                  isHappyHour={isHappyHour}
                  isSoldOut={
                    event.max_attendees ? event.current_attendees >= event.max_attendees : false
                  }
                />
              )}

              {hasTicket && (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                  <div className="text-green-600 text-4xl mb-2">✓</div>
                  <p className="font-semibold text-green-800">Vous avez un billet!</p>
                  {isLive && <p className="text-green-700 mt-2">Profitez du concert 🎵</p>}
                </div>
              )}

              {/* Tip Button */}
              {event.artist && user && (
                <div className="mt-4 pt-4 border-t">
                  <TipButton artistId={event.artist.id} eventId={event.id} />
                </div>
              )}
            </div>

            {/* Chat (only if user has ticket and event is live) */}
            {isLive && hasTicket && user && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Chat en direct</h3>
                <EventChat eventId={event.id} userId={user.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
