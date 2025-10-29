'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  Locale,
  translate,
  getDefaultLocale,
  getLocalePreference,
  setLocalePreference,
} from '@/lib/i18n'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (namespace: string, key: string, variables?: Record<string, any>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize locale from localStorage or browser
  useEffect(() => {
    const storedLocale = getLocalePreference()
    const defaultLocale = storedLocale || getDefaultLocale()
    setLocaleState(defaultLocale)
    setIsInitialized(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setLocalePreference(newLocale)
  }, [])

  const t = useCallback(
    (namespace: string, key: string, variables?: Record<string, any>) => {
      return translate(locale, namespace, key, variables)
    },
    [locale]
  )

  // Don't render children until locale is initialized (prevents flash of wrong language)
  if (!isInitialized) {
    return null
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
