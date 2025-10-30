'use client'

import { useState } from 'react'

interface TipButtonProps {
  artistId: string
  eventId: string
}

const TIP_AMOUNTS = [2, 5, 10, 20, 50]

export default function TipButton({ artistId, eventId }: TipButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendTip = async () => {
    const amount = selectedAmount || parseFloat(customAmount)

    if (!amount || amount < 1) {
      setError('Le montant minimum est de 1€')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          eventId,
          amount,
          message: message || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du pourboire')
      }

      // Success
      setShowModal(false)
      setSelectedAmount(null)
      setCustomAmount('')
      setMessage('')
      alert('Pourboire envoyé avec succès! 🎉')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
      >
        <span>💝</span>
        Envoyer un pourboire
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Envoyer un pourboire</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            {/* Quick amounts */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant rapide
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TIP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                    className={`py-2 rounded-lg border-2 font-semibold transition ${
                      selectedAmount === amount
                        ? 'border-pink-600 bg-pink-50 text-pink-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {amount}€
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant personnalisé
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  placeholder="Autre montant"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (optionnel)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez un message pour l'artiste..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{message.length}/200</p>
            </div>

            {/* Send button */}
            <button
              onClick={handleSendTip}
              disabled={loading || (!selectedAmount && !customAmount)}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Envoi...'
                : `Envoyer ${(selectedAmount || parseFloat(customAmount) || 0).toFixed(2)}€`}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              L'artiste recevra 90% du montant (10% de frais de plateforme)
            </p>
          </div>
        </div>
      )}
    </>
  )
}
