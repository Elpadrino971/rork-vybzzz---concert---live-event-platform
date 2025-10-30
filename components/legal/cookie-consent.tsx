'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * GDPR/ePrivacy Compliant Cookie Consent Banner
 *
 * Features:
 * - Opt-in for non-essential cookies (GDPR requirement)
 * - Granular cookie categories (essential, analytics, marketing)
 * - Persistent storage of user preferences
 * - Cookie policy link
 * - Customizable before consent is given
 */

type CookiePreferences = {
  essential: boolean // Always true (required for functionality)
  analytics: boolean
  marketing: boolean
  timestamp: number
}

const COOKIE_CONSENT_KEY = 'vybzzz-cookie-consent'
const CONSENT_VERSION = '1.0'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  })

  useEffect(() => {
    // Check if user has already given consent
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)

    if (storedConsent) {
      try {
        const consent = JSON.parse(storedConsent)
        // Check if consent is recent (< 13 months old per GDPR)
        const thirteenMonthsAgo = Date.now() - 13 * 30 * 24 * 60 * 60 * 1000

        if (consent.timestamp > thirteenMonthsAgo && consent.version === CONSENT_VERSION) {
          // Valid consent exists, apply preferences
          applyPreferences(consent.preferences)
          return
        }
      } catch (e) {
        // Invalid stored consent, show banner
      }
    }

    // No valid consent, show banner
    setShowBanner(true)
  }, [])

  const applyPreferences = (prefs: CookiePreferences) => {
    // Apply analytics cookies
    if (prefs.analytics) {
      // Enable analytics (e.g., Google Analytics, Vercel Analytics)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
        })
      }
    } else {
      // Disable analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
        })
      }
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      // Enable marketing cookies
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        })
      }
    } else {
      // Disable marketing cookies
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        })
      }
    }
  }

  const saveConsent = (prefs: CookiePreferences) => {
    const consent = {
      version: CONSENT_VERSION,
      preferences: prefs,
      timestamp: Date.now(),
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
    applyPreferences(prefs)
    setShowBanner(false)
  }

  const acceptAll = () => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    }
    saveConsent(prefs)
  }

  const rejectAll = () => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    }
    saveConsent(prefs)
  }

  const savePreferences = () => {
    saveConsent(preferences)
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        style={{ backdropFilter: 'blur(2px)' }}
      />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6">
          {!showDetails ? (
            // Simple banner
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 Nous utilisons des cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Nous utilisons des cookies essentiels pour le fonctionnement du site, et des cookies
                  optionnels pour améliorer votre expérience. Vous pouvez choisir les cookies que vous
                  acceptez.{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    En savoir plus
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Personnaliser
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Refuser tout
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Accepter tout
                </button>
              </div>
            </div>
          ) : (
            // Detailed preferences
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Préférences de cookies
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Retour"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Cookies essentiels</h4>
                      <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                        Toujours actifs
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Nécessaires au fonctionnement du site (authentification, sécurité, panier).
                      Ces cookies ne peuvent pas être désactivés.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 h-5 w-5 text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Cookies analytiques</h4>
                    <p className="text-sm text-gray-600">
                      Nous aident à comprendre comment vous utilisez le site pour l'améliorer
                      (Google Analytics, Vercel Analytics).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Cookies marketing</h4>
                    <p className="text-sm text-gray-600">
                      Utilisés pour afficher des publicités pertinentes et mesurer l'efficacité
                      de nos campagnes marketing.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={savePreferences}
                  className="flex-1 px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Enregistrer mes préférences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Accepter tout
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Vous pouvez modifier vos préférences à tout moment dans les paramètres.{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Politique de confidentialité
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Hook to check if a specific cookie category is enabled
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null)

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent)
        setConsent(parsed.preferences)
      } catch (e) {
        setConsent(null)
      }
    }
  }, [])

  return {
    hasConsent: consent !== null,
    canUseAnalytics: consent?.analytics ?? false,
    canUseMarketing: consent?.marketing ?? false,
  }
}
