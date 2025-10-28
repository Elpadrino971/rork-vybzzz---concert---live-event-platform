import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AffiliateDashboard() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/affiliate/dashboard')
  }

  // Get affiliate info
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Compte affilié requis
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'êtes pas encore inscrit au programme d'affiliation.
          </p>
          <Link
            href="/affiliate/register"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Devenir affilié
          </Link>
        </div>
      </div>
    )
  }

  // Get referrals
  const { data: referrals } = await supabase
    .from('tickets')
    .select('*, event:events(title), user:profiles(full_name)')
    .eq('affiliate_id', user.id)
    .order('purchased_at', { ascending: false })
    .limit(20)

  // Get commissions
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', user.id)

  const totalEarnings = commissions?.reduce(
    (sum, c) => sum + parseFloat(c.commission_amount.toString()),
    0
  ) || 0

  const pendingEarnings = commissions
    ?.filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0

  const paidEarnings = commissions
    ?.filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Dashboard Affilié</h1>
          <p className="text-blue-100 text-lg">
            Programme d'affiliation à 3 niveaux
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Votre code de parrainage</h2>
          <div className="flex items-center gap-4">
            <div className="bg-white text-gray-800 px-6 py-4 rounded-lg font-mono text-2xl font-bold">
              {affiliate.referral_code}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(affiliate.referral_code)
                alert('Code copié!')
              }}
              className="bg-white/20 hover:bg-white/30 px-6 py-4 rounded-lg transition font-semibold"
            >
              📋 Copier
            </button>
          </div>
          <p className="mt-4 text-blue-100">
            Partagez ce code avec vos amis pour gagner des commissions sur leurs achats!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Niveau</div>
            <div className="text-3xl font-bold text-gray-800">Niveau {affiliate.level}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Parrainages</div>
            <div className="text-3xl font-bold text-gray-800">
              {referrals?.length || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Gains en attente</div>
            <div className="text-3xl font-bold text-orange-600">
              {pendingEarnings.toFixed(2)}€
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 mb-2">Gains payés</div>
            <div className="text-3xl font-bold text-green-600">
              {paidEarnings.toFixed(2)}€
            </div>
          </div>
        </div>

        {/* Commission Rates */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Taux de commission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <div className="text-blue-600 font-bold text-lg mb-2">Niveau 1</div>
              <div className="text-3xl font-bold text-gray-800 mb-2">2.5%</div>
              <p className="text-gray-600 text-sm">Référence directe</p>
            </div>

            <div className="border-2 border-purple-200 rounded-lg p-4">
              <div className="text-purple-600 font-bold text-lg mb-2">Niveau 2</div>
              <div className="text-3xl font-bold text-gray-800 mb-2">1.5%</div>
              <p className="text-gray-600 text-sm">Filleul de votre filleul</p>
            </div>

            <div className="border-2 border-pink-200 rounded-lg p-4">
              <div className="text-pink-600 font-bold text-lg mb-2">Niveau 3</div>
              <div className="text-3xl font-bold text-gray-800 mb-2">1%</div>
              <p className="text-gray-600 text-sm">Troisième niveau</p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Parrainages récents
          </h2>

          {!referrals || referrals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Aucun parrainage
              </h3>
              <p className="text-gray-600">
                Commencez à partager votre code de parrainage pour gagner des commissions!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Utilisateur
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Événement
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Montant
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        {referral.user?.full_name || 'Utilisateur'}
                      </td>
                      <td className="py-3 px-4">{referral.event?.title || 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {parseFloat(referral.purchase_price.toString()).toFixed(2)}€
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(referral.purchased_at), 'd MMM yyyy', {
                          locale: fr,
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
