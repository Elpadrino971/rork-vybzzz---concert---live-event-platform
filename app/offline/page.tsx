export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl sm:text-7xl mb-6">📡</div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Vous êtes hors ligne
        </h1>

        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Oups ! Il semble que vous n'ayez pas de connexion internet.
          Vérifiez votre connexion et réessayez.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition"
          >
            Réessayer
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-lg font-semibold transition"
          >
            Retour
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Conseil : Téléchargez l'application VyBzzZ pour une meilleure expérience hors ligne
          </p>
        </div>
      </div>
    </div>
  )
}
