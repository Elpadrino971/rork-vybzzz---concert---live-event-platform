/**
 * i18n Configuration for Web App
 * Simple translation system without external dependencies
 */

import frCommon from '@/locales/fr/common.json'
import enCommon from '@/locales/en/common.json'
import esCommon from '@/locales/es/common.json'

import frDashboard from '@/locales/fr/dashboard.json'
import enDashboard from '@/locales/en/dashboard.json'
import esDashboard from '@/locales/es/dashboard.json'

export type Locale = 'fr' | 'en' | 'es'

export const locales: Locale[] = ['fr', 'en', 'es']

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
}

// Translation resources
const translations = {
  fr: {
    common: frCommon,
    dashboard: frDashboard,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
  },
  es: {
    common: esCommon,
    dashboard: esDashboard,
  },
}

/**
 * Get nested value from object using dot notation
 * Example: get(obj, 'user.name')
 */
function get(obj: any, path: string): any {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return undefined
    }
  }

  return result
}

/**
 * Replace variables in translation string
 * Example: "Hello {{name}}" with { name: 'John' } => "Hello John"
 */
function interpolate(str: string, variables?: Record<string, any>): string {
  if (!variables) return str

  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}

/**
 * Translation function
 */
export function translate(
  locale: Locale,
  namespace: string,
  key: string,
  variables?: Record<string, any>
): string {
  const translation = get(translations[locale], `${namespace}.${key}`)

  if (translation === undefined) {
    console.warn(`Translation missing: ${locale}.${namespace}.${key}`)
    return key
  }

  if (typeof translation !== 'string') {
    console.warn(`Translation is not a string: ${locale}.${namespace}.${key}`)
    return key
  }

  return interpolate(translation, variables)
}

/**
 * Get default locale from browser
 */
export function getDefaultLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'

  const browserLang = navigator.language.split('-')[0] as Locale

  if (locales.includes(browserLang)) {
    return browserLang
  }

  return 'fr' // Default to French
}

/**
 * Store locale preference in localStorage
 */
export function setLocalePreference(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vybzzz_locale', locale)
  }
}

/**
 * Get stored locale preference
 */
export function getLocalePreference(): Locale | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('vybzzz_locale')
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale
  }

  return null
}
