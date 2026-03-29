import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          VyBzzZ
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8">
          La plateforme de concerts en direct
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Fan Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white hover:bg-white/20 transition">
            <h2 className="text-2xl font-bold mb-4">Fan</h2>
            <p className="mb-4">
              Regardez des concerts en direct, envoyez des pourboires à vos artistes préférés
            </p>
            <Link
              href="/events"
              className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Voir les événements
            </Link>
          </div>

          {/* Artist Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white hover:bg-white/20 transition">
            <h2 className="text-2xl font-bold mb-4">Artiste</h2>
            <p className="mb-4">
              Créez vos concerts en direct et connectez avec votre audience
            </p>
            <Link
              href="/artist/dashboard"
              className="inline-block bg-white text-pink-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Dashboard artiste
            </Link>
          </div>

          {/* Affiliate Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white hover:bg-white/20 transition">
            <h2 className="text-2xl font-bold mb-4">Affilié</h2>
            <p className="mb-4">
              Gagnez des commissions en référant des fans (jusqu'à 5% par vente)
            </p>
            <Link
              href="/affiliate/register"
              className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Devenir affilié
            </Link>
          </div>
        </div>

        <div className="mt-12 text-white/80">
          <p className="text-lg mb-2">Happy Hour tous les mercredis à 20h</p>
          <p className="text-3xl font-bold">Billets à 4,99€</p>
        </div>
      </div>
    </div>
  )
}
