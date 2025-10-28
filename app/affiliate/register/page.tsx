'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AffiliateRegisterPage() {
  const [parentReferralCode, setParentReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/affiliates/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentReferralCode: parentReferralCode || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login?redirect=/affiliate/register')
          return
        }
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      router.push('/affiliate/dashboard')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Programme d'Affiliation VyBzzZ
          </h1>
          <p className="text-gray-600">
            Gagnez des commissions en parrainant des fans!
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Système de commission à 3 niveaux
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-gray-800">Niveau 1 - 2.5%</div>
                <p className="text-gray-600 text-sm">
                  Gagnez 2.5% sur tous les achats de vos filleuls directs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold text-gray-800">Niveau 2 - 1.5%</div>
                <p className="text-gray-600 text-sm">
                  Gagnez 1.5% sur les achats des filleuls de vos filleuls
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-semibold text-gray-800">Niveau 3 - 1%</div>
                <p className="text-gray-600 text-sm">
                  Gagnez 1% sur le troisième niveau de votre réseau
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💰</div>
            <div>
              <div className="font-semibold text-gray-800">Revenus passifs</div>
              <p className="text-gray-600 text-sm">
                Gagnez de l'argent automatiquement
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <div className="font-semibold text-gray-800">Tableau de bord</div>
              <p className="text-gray-600 text-sm">
                Suivez vos performances en temps réel
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">🔗</div>
            <div>
              <div className="font-semibold text-gray-800">Code unique</div>
              <p className="text-gray-600 text-sm">
                Obtenez votre code de parrainage personnel
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <div className="font-semibold text-gray-800">Paiements rapides</div>
              <p className="text-gray-600 text-sm">
                Retirez vos gains facilement
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="parentCode" className="block text-sm font-medium text-gray-700 mb-1">
              Code de parrainage (optionnel)
            </label>
            <input
              id="parentCode"
              type="text"
              value={parentReferralCode}
              onChange={(e) => setParentReferralCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si quelqu'un vous a parrainé, entrez son code ici
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inscription...' : 'Devenir affilié'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          En vous inscrivant, vous acceptez les conditions du programme d'affiliation VyBzzZ
        </p>
      </div>
    </div>
  )
}
