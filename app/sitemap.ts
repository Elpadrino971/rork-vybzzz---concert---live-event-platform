import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vybzzz.com'
  const supabase = createClient()

  // Get all live and scheduled events
  const { data: events } = await supabase
    .from('events')
    .select('id, updated_at, status')
    .in('status', ['live', 'scheduled'])
    .order('updated_at', { ascending: false })
    .limit(1000)

  const eventUrls: MetadataRoute.Sitemap = (events || []).map((event) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: new Date(event.updated_at),
    changeFrequency: event.status === 'live' ? 'hourly' : 'daily',
    priority: event.status === 'live' ? 0.9 : 0.7,
  }))

  // Get all artists
  const { data: artists } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .eq('user_type', 'artist')
    .limit(500)

  const artistUrls: MetadataRoute.Sitemap = (artists || []).map((artist) => ({
    url: `${baseUrl}/artist/${artist.id}`,
    lastModified: new Date(artist.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Events page
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    // Individual events
    ...eventUrls,
    // Artists
    ...artistUrls,
    // Legal pages
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date('2025-11-15'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2025-11-15'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2025-11-15'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    // Language versions
    {
      url: `${baseUrl}/fr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/es`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pt`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/de`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/zh`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]
}
