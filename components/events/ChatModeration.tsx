'use client'

import { useState } from 'react'
import { useEventChat, useChatModeration } from '@/lib/chat'

interface ChatModerationProps {
  eventId: string
  userId: string
  onClose: () => void
}

export default function ChatModeration({ eventId, userId, onClose }: ChatModerationProps) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState<number | undefined>(undefined)
  const [deleteReason, setDeleteReason] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)

  const { messages, deleteMessage } = useEventChat(eventId, userId)
  const { bannedUsers, banUser, unbanUser, refreshBannedUsers } = useChatModeration(eventId, userId)

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) {
      alert('Veuillez sélectionner un utilisateur et fournir une raison')
      return
    }

    const result = await banUser(selectedUser, banReason, banDuration)

    if (result.success) {
      alert('Utilisateur banni avec succès')
      setSelectedUser('')
      setBanReason('')
      setBanDuration(undefined)
      refreshBannedUsers()
    } else {
      alert(result.error || 'Erreur lors du bannissement')
    }
  }

  const handleUnbanUser = async (targetUserId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir débannir cet utilisateur ?')) return

    const result = await unbanUser(targetUserId)

    if (result.success) {
      alert('Utilisateur débanni avec succès')
      refreshBannedUsers()
    } else {
      alert(result.error || 'Erreur lors du débannissement')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!deleteReason) {
      alert('Veuillez fournir une raison pour la suppression')
      return
    }

    const result = await deleteMessage(messageId, deleteReason)

    if (result.success) {
      alert('Message supprimé avec succès')
      setSelectedMessage(null)
      setDeleteReason('')
    } else {
      alert(result.error || 'Erreur lors de la suppression')
    }
  }

  // Get unique users from messages
  const uniqueUsers = Array.from(
    new Map(
      messages
        .filter((m) => m.user_id !== userId)
        .map((m) => [m.user_id, { id: m.user_id, name: m.user?.full_name || 'Utilisateur' }])
    ).values()
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Modération du Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section: Ban User */}
          <section className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bannir un utilisateur</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisateur
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {uniqueUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison
                </label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Spam, langage inapproprié, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (minutes) - Laisser vide pour permanent
                </label>
                <input
                  type="number"
                  value={banDuration || ''}
                  onChange={(e) => setBanDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Permanent"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={handleBanUser}
                disabled={!selectedUser || !banReason}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Bannir
              </button>
            </div>
          </section>

          {/* Section: Delete Message */}
          <section className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Supprimer un message</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner un message
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2">
                  {messages.filter((m) => m.user_id !== userId).map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg.id)}
                      className={`w-full text-left p-2 rounded text-sm transition ${
                        selectedMessage === msg.id
                          ? 'bg-purple-50 border border-purple-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{msg.user?.full_name || 'Utilisateur'}</div>
                      <div className="text-gray-600 truncate">{msg.message}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMessage && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Raison de suppression
                    </label>
                    <input
                      type="text"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Contenu inapproprié, spam, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteMessage(selectedMessage)}
                    disabled={!deleteReason}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Supprimer le message
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Section: Banned Users */}
          <section className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Utilisateurs bannis ({bannedUsers.length})
            </h3>

            {bannedUsers.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun utilisateur banni</p>
            ) : (
              <div className="space-y-2">
                {bannedUsers.map((ban) => (
                  <div
                    key={ban.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-800">User ID: {ban.user_id}</div>
                      {ban.reason && <div className="text-xs text-gray-600">Raison: {ban.reason}</div>}
                      <div className="text-xs text-gray-500">
                        {ban.expires_at
                          ? `Expire: ${new Date(ban.expires_at).toLocaleString('fr-FR')}`
                          : 'Permanent'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnbanUser(ban.user_id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-semibold transition"
                    >
                      Débannir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Info Section */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Informations</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Les bannissements temporaires expirent automatiquement</li>
              <li>• Les messages supprimés sont masqués mais conservés en base de données</li>
              <li>• Les utilisateurs bannis ne peuvent plus envoyer de messages</li>
              <li>• Toutes les actions de modération sont enregistrées</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
