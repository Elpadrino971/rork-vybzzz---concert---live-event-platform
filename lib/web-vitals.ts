import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals'
import { trackCustomEvent, trackTiming } from './analytics'

// Web Vitals thresholds
const VITALS_THRESHOLDS = {
  LCP: 2500,  // Largest Contentful Paint (good < 2.5s)
  FID: 100,   // First Input Delay (good < 100ms)
  CLS: 0.1,   // Cumulative Layout Shift (good < 0.1)
  FCP: 1800,  // First Contentful Paint (good < 1.8s)
  TTFB: 800,  // Time to First Byte (good < 800ms)
}

// Report to analytics
const sendToAnalytics = (metric: Metric) => {
  const { name, value, rating, id } = metric

  // Track in Google Analytics
  trackCustomEvent('web_vitals', {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_name: name,
    metric_value: value,
    metric_rating: rating,
  })

  // Track timing
  trackTiming('Web Vitals', name, Math.round(value), rating)

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(value),
      rating,
      threshold: VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS],
    })
  }
}

// Report to Vercel Analytics (if available)
const sendToVercel = (metric: Metric) => {
  const { name, value, id } = metric

  if (typeof window !== 'undefined' && 'vercelAnalytics' in window) {
    ;(window as any).vercelAnalytics?.track(name, {
      value,
      id,
    })
  }
}

// Report to Sentry (if available)
const sendToSentry = (metric: Metric) => {
  const { name, value, rating } = metric

  if (typeof window !== 'undefined' && 'Sentry' in window) {
    const Sentry = (window as any).Sentry

    // Only report poor metrics to Sentry
    if (rating === 'poor') {
      Sentry?.captureMessage(`Poor Web Vital: ${name}`, {
        level: 'warning',
        tags: {
          metric: name,
          rating,
        },
        extra: {
          value,
          threshold: VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS],
        },
      })
    }
  }
}

// Main reporter function
const reportWebVitals = (metric: Metric) => {
  sendToAnalytics(metric)
  sendToVercel(metric)
  sendToSentry(metric)
}

// Initialize Web Vitals tracking
export const initWebVitals = () => {
  if (typeof window !== 'undefined') {
    getCLS(reportWebVitals)
    getFID(reportWebVitals)
    getFCP(reportWebVitals)
    getLCP(reportWebVitals)
    getTTFB(reportWebVitals)
  }
}

// Get current vitals status
export const getVitalsStatus = async () => {
  return new Promise((resolve) => {
    const vitals: Record<string, any> = {}

    getCLS((metric) => {
      vitals.CLS = {
        value: metric.value,
        rating: metric.rating,
        isGood: metric.value < VITALS_THRESHOLDS.CLS,
      }
    })

    getFID((metric) => {
      vitals.FID = {
        value: metric.value,
        rating: metric.rating,
        isGood: metric.value < VITALS_THRESHOLDS.FID,
      }
    })

    getLCP((metric) => {
      vitals.LCP = {
        value: metric.value,
        rating: metric.rating,
        isGood: metric.value < VITALS_THRESHOLDS.LCP,
      }

      // Resolve after LCP (last metric)
      setTimeout(() => resolve(vitals), 100)
    })
  })
}

export { getCLS, getFID, getFCP, getLCP, getTTFB }
export type { Metric }
