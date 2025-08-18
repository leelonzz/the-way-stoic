import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blogData'
import { getAllPhilosophers } from '@/lib/philosopherData'
import { getAllEvents } from '@/lib/eventData'

export default function sitemap(): MetadataRoute.Sitemap {
  try {
    const baseUrl = 'https://thewaystoic.site'

    // Get posts with error handling
    let posts: any[] = []
    try {
      posts = getAllPosts()
    } catch (error) {
      console.warn('Failed to load posts for sitemap:', error)
      posts = []
    }

    // Get philosophers with error handling
    let philosophers: any[] = []
    try {
      philosophers = getAllPhilosophers()
    } catch (error) {
      console.warn('Failed to load philosophers for sitemap:', error)
      philosophers = []
    }

    // Get events with error handling
    let events: any[] = []
    try {
      events = getAllEvents()
    } catch (error) {
      console.warn('Failed to load events for sitemap:', error)
      events = []
    }

    const baseEntries: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
      { url: `${baseUrl}/blog`, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/events`, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${baseUrl}/quotes`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/mentors`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/journal`, changeFrequency: 'daily', priority: 0.7 },
      { url: `${baseUrl}/calendar`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/settings`, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/profile`, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    ]

    const postEntries: MetadataRoute.Sitemap = posts.map(p => ({
      url: `${baseUrl}/blog/${p.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      lastModified: p.publishedDate ? new Date(p.publishedDate) : undefined,
    }))

    const philosopherEntries: MetadataRoute.Sitemap = philosophers.map(p => ({
      url: `${baseUrl}/biography/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    const eventEntries: MetadataRoute.Sitemap = events.map(e => ({
      url: `${baseUrl}/events/${e.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    return [
      ...baseEntries,
      ...postEntries,
      ...philosopherEntries,
      ...eventEntries,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)

    // Return minimal sitemap as fallback
    const baseUrl = 'https://thewaystoic.site'
    const fallbackEntries: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
      { url: `${baseUrl}/blog`, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/events`, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${baseUrl}/quotes`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/mentors`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/journal`, changeFrequency: 'daily', priority: 0.7 },
    ]

    return fallbackEntries
  }
}
