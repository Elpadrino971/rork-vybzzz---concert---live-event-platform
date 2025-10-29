'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { format } from 'date-fns'
import { fr, enUS, es, de, pt, zhCN } from 'date-fns/locale'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface FanDashboardData {
  profile: {
    id: string
    full_name: string
    username: string
  }
  ticketStats: {
    total: number
    upcoming: number
    past: number
  }
  upcomingTickets: Array<{
    id: string
    event: {
      id: string
      title: string
      start_time: string
      image_url: string
      artist: {
        stage_name: string
      }
    }
    purchase_price: number
  }>
  pastTickets: Array<{
    id: string
    event: {
      id: string
      title: string
      start_time: string
      image_url: string
    }
  }>
  followingArtists: Array<{
    id: string
    stage_name: string
    profile_image_url: string
    follower_count: number
  }>
  spending: {
    tickets: number
    tips: number
    total: number
  }
}

export default function FanDashboard() {
  const { t, locale } = useI18n()
  const [data, setData] = useState<FanDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dateLocales = { fr, en: enUS, es, de, pt, zh: zhCN }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/fan')

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || t('common', 'states.error')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('dashboard', 'fan.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard', 'fan.welcome', { name: data.profile.full_name || data.profile.username })}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('dashboard', 'fan.stats.upcomingEvents')}
            value={data.ticketStats.upcoming}
            icon="🎫"
          />
          <StatCard
            title={t('dashboard', 'fan.stats.pastEvents')}
            value={data.ticketStats.past}
            icon="✅"
          />
          <StatCard
            title={t('dashboard', 'fan.stats.followedArtists')}
            value={data.followingArtists.length}
            icon="⭐"
          />
          <StatCard
            title={t('dashboard', 'fan.stats.totalSpent')}
            value={`${data.spending.total.toFixed(2)} €`}
            icon="💰"
          />
        </div>

        {/* Upcoming Tickets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard', 'fan.upcomingTickets.title')}
            </h2>
          </div>
          <div className="p-6">
            {data.upcomingTickets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('dashboard', 'fan.upcomingTickets.noTickets')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.upcomingTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      {ticket.event.image_url && (
                        <img
                          src={ticket.event.image_url}
                          alt={ticket.event.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {ticket.event.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ticket.event.artist.stage_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {format(new Date(ticket.event.start_time), 'PPP à HH:mm', {
                            locale: dateLocales[locale],
                          })}
                        </p>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-2">
                          {ticket.purchase_price.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      {t('dashboard', 'fan.upcomingTickets.viewTicket')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Followed Artists */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard', 'fan.followedArtists.title')}
            </h2>
          </div>
          <div className="p-6">
            {data.followingArtists.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('dashboard', 'fan.followedArtists.noArtists')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.followingArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center"
                  >
                    {artist.profile_image_url && (
                      <img
                        src={artist.profile_image_url}
                        alt={artist.stage_name}
                        className="w-20 h-20 object-cover rounded-full mx-auto mb-3"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {artist.stage_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('dashboard', 'fan.followedArtists.followers', {
                        count: artist.follower_count || 0,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Spending Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard', 'fan.spending.title')}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('dashboard', 'fan.spending.tickets')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.spending.tickets.toFixed(2)} €
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('dashboard', 'fan.spending.tips')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.spending.tips.toFixed(2)} €
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('dashboard', 'fan.spending.total')}
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {data.spending.total.toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
