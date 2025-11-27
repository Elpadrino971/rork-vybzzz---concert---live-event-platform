/**
 * PAGE TICKET SUCCESS V1.0
 * Confirmation d'achat de billet réussi
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TicketSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      router.push('/events')
    } else {
      // Simuler un petit délai pour permettre au webhook de traiter
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    }
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Traitement de votre paiement...</p>
        </div>
      </div>
    )
  }

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
                href="/fan/tickets"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mes Billets
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Success Message */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi !
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Votre billet a été acheté avec succès. Vous allez recevoir un email
            de confirmation avec tous les détails.
          </p>

          {/* Info boxes */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">
              Prochaines étapes :
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>
                  Un email de confirmation a été envoyé à votre adresse
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>
                  Votre billet avec QR code est disponible dans "Mes Billets"
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>
                  Vous recevrez une notification le jour du concert pour
                  rejoindre le live
                </span>
              </li>
            </ul>
          </div>

          {/* Session ID (for debugging) */}
          {sessionId && (
            <p className="text-xs text-gray-400 mb-6">
              Session ID: {sessionId}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fan/tickets"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Voir mes billets
            </Link>
            <Link
              href="/events"
              className="inline-block bg-white text-orange-600 border-2 border-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
            >
              Découvrir d'autres concerts
            </Link>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Besoin d'aide ?{' '}
            <a
              href="mailto:support@vybzzz.com"
              className="text-orange-600 hover:text-orange-700"
            >
              Contactez notre support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
