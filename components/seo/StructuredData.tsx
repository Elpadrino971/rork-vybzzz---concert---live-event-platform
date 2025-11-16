import { Organization, Event as SchemaEvent, WebSite, WithContext } from 'schema-dts'

/**
 * Organization Schema for VyBzzZ
 */
export function OrganizationSchema() {
  const schema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VyBzzZ',
    url: 'https://vybzzz.com',
    logo: 'https://vybzzz.com/logo.svg',
    description: 'Live concert streaming platform connecting artists with fans worldwide',
    foundingDate: '2025',
    sameAs: [
      'https://twitter.com/vybzzz',
      'https://facebook.com/vybzzz',
      'https://instagram.com/vybzzz',
      'https://linkedin.com/company/vybzzz',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@vybzzz.com',
      availableLanguage: ['French', 'English', 'Spanish', 'Portuguese', 'German', 'Chinese'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * WebSite Schema with SearchAction
 */
export function WebSiteSchema() {
  const schema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VyBzzZ',
    url: 'https://vybzzz.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://vybzzz.com/events?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Event Schema for concerts
 */
export function EventSchema({ event }: { event: any }) {
  const schema: WithContext<SchemaEvent> = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    description: event.description,
    image: event.cover_image_url || 'https://vybzzz.com/og-image.jpg',
    startDate: event.start_date,
    endDate: event.end_date,
    eventStatus:
      event.status === 'live' ? 'https://schema.org/EventScheduled' :
      event.status === 'ended' ? 'https://schema.org/EventPostponed' :
      event.status === 'cancelled' ? 'https://schema.org/EventCancelled' :
      'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `https://vybzzz.com/events/${event.id}`,
    },
    organizer: {
      '@type': 'Organization',
      name: 'VyBzzZ',
      url: 'https://vybzzz.com',
    },
    performer: {
      '@type': 'MusicGroup',
      name: event.artist?.full_name || 'Artist',
      image: event.artist?.avatar_url,
    },
    offers: {
      '@type': 'Offer',
      price: event.ticket_price,
      priceCurrency: 'EUR',
      availability:
        event.current_attendees >= event.max_attendees
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      url: `https://vybzzz.com/events/${event.id}`,
      validFrom: new Date().toISOString(),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * BreadcrumbList Schema
 */
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
