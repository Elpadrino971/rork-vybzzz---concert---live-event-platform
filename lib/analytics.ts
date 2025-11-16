import ReactGA from 'react-ga4'

// Initialize Google Analytics 4
export const initGA = () => {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (measurementId && typeof window !== 'undefined') {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        anonymizeIp: true, // GDPR compliance
        cookieFlags: 'SameSite=None;Secure',
      },
    })
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined') {
    ReactGA.send({ hitType: 'pageview', page: url })
  }
}

// Track events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined') {
    ReactGA.event({
      category,
      action,
      label,
      value,
    })
  }
}

// Track custom events
export const trackCustomEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    ReactGA.event(eventName, eventParams)
  }
}

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  if (typeof window !== 'undefined') {
    ReactGA.event('purchase', {
      transaction_id: transactionId,
      value,
      currency: 'EUR',
      items,
    })
  }
}

// Track user timing
export const trackTiming = (category: string, variable: string, value: number, label?: string) => {
  if (typeof window !== 'undefined') {
    ReactGA.event('timing_complete', {
      name: variable,
      value,
      event_category: category,
      event_label: label,
    })
  }
}

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    ReactGA.set(properties)
  }
}

// Track exceptions
export const trackException = (description: string, fatal = false) => {
  if (typeof window !== 'undefined') {
    ReactGA.event('exception', {
      description,
      fatal,
    })
  }
}
