import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CookieConsent } from '@/components/legal/cookie-consent'
import { I18nProvider } from '@/contexts/I18nContext'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import MobileNav from '@/components/MobileNav'
import ScrollToTop from '@/components/ScrollToTop'
import { OrganizationSchema, WebSiteSchema } from '@/components/seo/StructuredData'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true })

export const metadata: Metadata = {
  metadataBase: new URL('https://vybzzz.com'),
  title: {
    default: 'VyBzzZ - Live Concert Streaming Platform | Watch Artists Perform Live',
    template: '%s | VyBzzZ',
  },
  description:
    'Stream live concerts from top artists worldwide. Buy tickets, send tips, and connect with fans. Experience David Guetta and more on VyBzzZ - the ultimate live music platform.',
  keywords: [
    'live concert',
    'streaming',
    'music',
    'artists',
    'David Guetta',
    'concert tickets',
    'live performance',
    'music streaming',
    'virtual concert',
    'fan engagement',
    'artist tips',
  ],
  authors: [{ name: 'VyBzzZ', url: 'https://vybzzz.com' }],
  creator: 'VyBzzZ',
  publisher: 'VyBzzZ',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'es_ES', 'pt_BR', 'de_DE', 'zh_CN'],
    url: 'https://vybzzz.com',
    siteName: 'VyBzzZ',
    title: 'VyBzzZ - Live Concert Streaming Platform',
    description: 'Stream live concerts from top artists worldwide. Buy tickets, send tips, connect with fans.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VyBzzZ - Live Concert Streaming Platform',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VyBzzZ - Live Concert Streaming Platform',
    description: 'Experience live music like never before. Stream concerts, connect with artists.',
    images: ['/twitter-card.jpg'],
    creator: '@vybzzz',
    site: '@vybzzz',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://vybzzz.com',
    languages: {
      'fr': 'https://vybzzz.com/fr',
      'en': 'https://vybzzz.com/en',
      'es': 'https://vybzzz.com/es',
      'pt': 'https://vybzzz.com/pt',
      'de': 'https://vybzzz.com/de',
      'zh': 'https://vybzzz.com/zh',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  category: 'entertainment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* Performance: Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.vybzzz.com" />
        <link rel="dns-prefetch" href="https://fpdehejqrmkviaxhyrlz.supabase.co" />

        {/* PWA & Mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#9333ea" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VyBzzZ" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Structured Data */}
        <OrganizationSchema />
        <WebSiteSchema />
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

        {/* Analytics: Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `}
            </Script>
          </>
        )}

        {/* Web Vitals Tracking */}
        <Script id="web-vitals" strategy="afterInteractive">
          {`
            if ('PerformanceObserver' in window) {
              import('/lib/web-vitals').then(({ initWebVitals }) => {
                initWebVitals();
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
