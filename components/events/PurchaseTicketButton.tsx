'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PurchaseTicketButtonProps {
  eventId: string
  price: number
  isHappyHour: boolean
  isSoldOut: boolean
}

export default function PurchaseTicketButton({
  eventId,
  price,
  isHappyHour,
  isSoldOut,
}: PurchaseTicketButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [affiliateCode, setAffiliateCode] = useState('')
  const [showAffiliateInput, setShowAffiliateInput] = useState(false)
  const router = useRouter()

  const handlePurchase = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          affiliateReferralCode: affiliateCode || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // User not logged in
          router.push(`/auth/login?redirect=/events/${eventId}`)
          return
        }
        throw new Error(data.error || 'Erreur lors de l\'achat')
      }

      // Redirect to payment page or show success
      if (data.clientSecret) {
        // TODO: Integrate Stripe Payment Element
        // For now, we'll just refresh the page
        router.refresh()
        alert('Paiement réussi! Profitez du concert 🎵')
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (isSoldOut) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
      >
        Complet
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Affiliate Code */}
      <div>
        {!showAffiliateInput ? (
          <button
            onClick={() => setShowAffiliateInput(true)}
            className="text-sm text-purple-600 hover:text-purple-700 underline"
          >
            J'ai un code parrain
          </button>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code parrain (optionnel)
            </label>
            <input
              type="text"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
            />
          </div>
        )}
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Traitement...' : `Acheter pour ${price.toFixed(2)}€`}
      </button>

      {isHappyHour && (
        <p className="text-center text-sm text-green-600 font-semibold">
          🎉 Prix Happy Hour appliqué!
        </p>
      )}

      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Paiement sécurisé par Stripe</p>
        <p>Accès immédiat après paiement</p>
      </div>
    </div>
  )
}
