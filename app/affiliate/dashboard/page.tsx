'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr, enUS, es, de, pt, zhCN } from 'date-fns/locale'
import { useI18n } from '@/contexts/I18nContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface AffiliateDashboardData {
  affiliate: {
    id: string
    referral_code: string
    level: number
  }
  referrals: Array<{
    id: string
    user: {
      full_name: string
    } | null
    event: {
      title: string
    } | null
    purchase_price: number
    purchased_at: string
  }>
  stats: {
    totalReferrals: number
    pendingEarnings: number
    paidEarnings: number
  }
}

export default function AffiliateDashboard() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [data, setData] = useState<AffiliateDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const dateLocales = { fr, en: enUS, es, de, pt, zh: zhCN }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/affiliate')

      if (response.status === 401) {
        router.push('/auth/login?redirect=/affiliate/dashboard')
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

  function copyReferralCode() {
    if (!data?.affiliate.referral_code) return

    navigator.clipboard.writeText(data.affiliate.referral_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {t('common', 'actions.back')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-4">{t('dashboard', 'affiliate.title')}</h1>
              <p className="text-blue-100 text-lg">
                {t('dashboard', 'affiliate.subtitle')}
              </p>
              <p className="text-blue-200 text-sm mt-2">
                {t('dashboard', 'affiliate.description')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            {t('dashboard', 'affiliate.referralCode.title')}
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white text-gray-800 px-6 py-4 rounded-lg font-mono text-2xl font-bold">
              {data.affiliate.referral_code}
            </div>
            <button
              onClick={copyReferralCode}
              className="bg-white/20 hover:bg-white/30 px-6 py-4 rounded-lg transition font-semibold"
            >
              📋 {copied ? t('dashboard', 'affiliate.referralCode.copied') : t('common', 'actions.copy')}
            </button>
          </div>
          <p className="mt-4 text-blue-100">
            {t('dashboard', 'affiliate.referralCode.share')}
          </p>
          <p className="mt-2 text-blue-50 font-semibold">
            {t('dashboard', 'affiliate.referralCode.motivation')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'affiliate.stats.level')}
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {t('dashboard', 'affiliate.stats.level')} {data.affiliate.level}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'affiliate.stats.totalReferrals')}
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {data.stats.totalReferrals}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'affiliate.stats.pendingEarnings')}
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {data.stats.pendingEarnings.toFixed(2)}€
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard', 'affiliate.stats.paidEarnings')}
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {data.stats.paidEarnings.toFixed(2)}€
            </div>
          </div>
        </div>

        {/* Commission Rates */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('dashboard', 'affiliate.commissionRates.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-2">
                {t('dashboard', 'affiliate.commissionRates.level1')}
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {t('dashboard', 'affiliate.commissionRates.rate', { rate: '2.5' })}
              </div>
            </div>

            <div className="border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <div className="text-purple-600 dark:text-purple-400 font-bold text-lg mb-2">
                {t('dashboard', 'affiliate.commissionRates.level2')}
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {t('dashboard', 'affiliate.commissionRates.rate', { rate: '1.5' })}
              </div>
            </div>

            <div className="border-2 border-pink-200 dark:border-pink-700 rounded-lg p-4">
              <div className="text-pink-600 dark:text-pink-400 font-bold text-lg mb-2">
                {t('dashboard', 'affiliate.commissionRates.level3')}
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {t('dashboard', 'affiliate.commissionRates.rate', { rate: '1' })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('dashboard', 'affiliate.recentReferrals.title')}
          </h2>

          {!data.referrals || data.referrals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {t('dashboard', 'affiliate.recentReferrals.noReferrals')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('dashboard', 'affiliate.referralCode.share')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      {t('dashboard', 'affiliate.recentReferrals.user')}
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      {t('dashboard', 'affiliate.recentReferrals.event')}
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      {t('dashboard', 'affiliate.recentReferrals.amount')}
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      {t('dashboard', 'affiliate.recentReferrals.date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                        {referral.user?.full_name || 'User'}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                        {referral.event?.title || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white">
                        {referral.purchase_price.toFixed(2)}€
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {format(new Date(referral.purchased_at), 'd MMM yyyy', {
                          locale: dateLocales[locale],
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
