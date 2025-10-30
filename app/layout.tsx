import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CookieConsent } from '@/components/legal/cookie-consent'
import { I18nProvider } from '@/contexts/I18nContext'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import MobileNav from '@/components/MobileNav'
import ScrollToTop from '@/components/ScrollToTop'

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VyBzzZ" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <I18nProvider>
          <ServiceWorkerRegistration />
          <MobileNav />
          <ScrollToTop />
          <div className="lg:pt-0">
            {children}
          </div>
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  )
}
