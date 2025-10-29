import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CookieConsent } from '@/components/legal/cookie-consent'
import { I18nProvider } from '@/contexts/I18nContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VyBzzZ - Live Concert Platform',
  description: 'Experience live concerts from your favorite artists. Stream, tip, and connect.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <I18nProvider>
          {children}
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  )
}
