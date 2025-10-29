'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches React errors and sends them to Sentry
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to our logger (which sends to Sentry)
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    })

    // Also send directly to Sentry with more context
    Sentry.withScope((scope) => {
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
      })
      Sentry.captureException(error)
    })

    this.setState({
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!)
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback UI
 */
function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '1rem',
      }}>
        ⚠️
      </div>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
      }}>
        Une erreur est survenue
      </h1>
      <p style={{
        color: '#666',
        marginBottom: '1.5rem',
        maxWidth: '500px',
      }}>
        Nous sommes désolés, quelque chose s'est mal passé. Notre équipe a été notifiée et travaille sur le problème.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <details style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          maxWidth: '600px',
          textAlign: 'left',
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Détails de l'erreur (développement uniquement)
          </summary>
          <pre style={{
            fontSize: '0.875rem',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Recharger la page
      </button>
    </div>
  )
}
