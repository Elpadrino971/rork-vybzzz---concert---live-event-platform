'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Global Error Handler for Next.js App Router
 * This component catches errors in the root layout
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}>
            Une erreur critique est survenue
          </h1>
          <p style={{
            color: '#666',
            marginBottom: '1.5rem',
            maxWidth: '500px',
            fontSize: '1.125rem',
          }}>
            Nous sommes désolés, quelque chose s'est mal passé. Notre équipe a été notifiée.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 2rem',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Réessayer
          </button>
          <a
            href="/"
            style={{
              marginTop: '1rem',
              color: '#666',
              textDecoration: 'underline',
            }}
          >
            Retour à l'accueil
          </a>
        </div>
      </body>
    </html>
  )
}
