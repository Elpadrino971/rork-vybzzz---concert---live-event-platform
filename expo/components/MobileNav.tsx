'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-2xl font-bold text-purple-600" onClick={closeMenu}>
            VyBzzZ
          </Link>

          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 mt-[57px]"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className={`lg:hidden fixed top-[57px] right-0 h-[calc(100vh-57px)] w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-6 space-y-4">
            <Link
              href="/events"
              className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg font-medium transition"
              onClick={closeMenu}
            >
              🎫 Événements
            </Link>

            <Link
              href="/artist/dashboard"
              className="block px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg font-medium transition"
              onClick={closeMenu}
            >
              🎤 Artiste
            </Link>

            <Link
              href="/fan/dashboard"
              className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg font-medium transition"
              onClick={closeMenu}
            >
              👤 Mon profil
            </Link>

            <Link
              href="/affiliate/dashboard"
              className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition"
              onClick={closeMenu}
            >
              💼 Affiliation
            </Link>

            <div className="border-t border-gray-200 my-4"></div>

            <Link
              href="/auth/login"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
              onClick={closeMenu}
            >
              🔑 Connexion
            </Link>

            <Link
              href="/auth/signup"
              className="block px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-semibold transition text-center"
              onClick={closeMenu}
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}
