import Link from 'next/link'
import { Event } from '@/types/database'
import { getTicketPrice } from '@/lib/happy-hour'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const { price, isHappyHour } = getTicketPrice(event.ticket_price, event.happy_hour_price || undefined)
  const scheduledDate = new Date(event.scheduled_at)
  const isLive = event.status === 'live'

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl sm:text-6xl">
              🎵
            </div>
          )}

          {/* Live Badge */}
          {isLive && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              EN DIRECT
            </div>
          )}

          {/* Happy Hour Badge */}
          {isHappyHour && !isLive && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
              Happy Hour
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>

          {/* Artist */}
          {event.artist && (
            <p className="text-purple-600 font-semibold mb-3">
              {event.artist.stage_name || event.artist.full_name}
            </p>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
          )}

          {/* Date and Time */}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <svg
              className="w-5 h-5"
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
            <span className="text-sm">
              {format(scheduledDate, "EEEE d MMMM 'à' HH:mm", { locale: fr })}
            </span>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              {isHappyHour && event.ticket_price !== price && (
                <div className="text-gray-400 line-through text-sm">
                  {event.ticket_price.toFixed(2)}€
                </div>
              )}
              <div className="text-2xl font-bold text-gray-800">
                {price.toFixed(2)}€
              </div>
            </div>

            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              {isLive ? 'Rejoindre' : 'Acheter'}
            </button>
          </div>

          {/* Attendees */}
          {event.max_attendees && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Places disponibles</span>
                <span className="font-semibold text-gray-800">
                  {event.max_attendees - event.current_attendees} / {event.max_attendees}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${(event.current_attendees / event.max_attendees) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
