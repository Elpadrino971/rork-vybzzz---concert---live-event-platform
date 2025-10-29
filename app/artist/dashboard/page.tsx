'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr, enUS, es } from 'date-fns/locale'
import { useI18n } from '@/contexts/I18nContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface ArtistDashboardData {
  artist: {
    id: string
    stage_name: string
    stripe_connect_completed: boolean
  }
  events: Array<{
    id: string
    title: string
    status: string
    scheduled_at: string
    ticket_price: number
    current_attendees: number
  }>
  stats: {
    totalEvents: number
    ticketsSold: number
    totalRevenue: number
  }
}

export default function ArtistDashboard() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [data, setData] = useState<ArtistDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dateLocales = { fr, en: enUS, es }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/artist')

      if (response.status === 401) {
        router.push('/auth/login?redirect=/artist/dashboard')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common', 'states.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('common', 'states.error')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            {t('common', 'actions.back')}
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
      case 'ended':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{t('dashboard', 'artist.title')}</h1>
              <p className="text-purple-100 text-lg">
                {t('dashboard', 'artist.welcome', { name: data.artist.stage_name })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/artist/events/create"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                + {t('dashboard', 'artist.createEvent')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'artist.stats.totalEvents')}
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {data.stats.totalEvents}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'artist.stats.ticketsSold')}
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {data.stats.ticketsSold}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'artist.stats.totalRevenue')}
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {data.stats.totalRevenue.toFixed(2)}€
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'artist.stats.stripeStatus')}
            </div>
            {data.artist.stripe_connect_completed ? (
              <div className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t('dashboard', 'artist.stripeConnect.complete')}
              </div>
            ) : (
              <Link
                href="/artist/stripe-connect"
                className="text-orange-600 dark:text-orange-400 font-semibold hover:text-orange-700 dark:hover:text-orange-500"
              >
                {t('dashboard', 'artist.stripeConnect.setup')} →
              </Link>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('dashboard', 'artist.events.title')}
            </h2>
            <Link
              href="/artist/events/create"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
            >
              + {t('common', 'actions.create')}
            </Link>
          </div>

          {!data.events || data.events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {t('dashboard', 'artist.events.noEvents')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('dashboard', 'artist.createEvent')}
              </p>
              <Link
                href="/artist/events/create"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                {t('dashboard', 'artist.createEvent')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-600 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          {event.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(event.status)}`}>
                          {t('dashboard', `artist.events.status.${event.status}`)}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {format(new Date(event.scheduled_at), 'PPP à HH:mm', {
                          locale: dateLocales[locale],
                        })}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{event.ticket_price.toFixed(2)}€</span>
                        <span>•</span>
                        <span>
                          {t('dashboard', 'artist.events.attendees', { count: event.current_attendees })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition"
                      >
                        {t('common', 'actions.view')}
                      </Link>
                      <Link
                        href={`/artist/events/${event.id}/edit`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                      >
                        {t('common', 'actions.edit')}
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
