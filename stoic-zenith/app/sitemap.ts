import { MetadataRoute } from 'next'
import { getAllPosts, siteUrl } from '@/lib/blogData'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const baseEntries: MetadataRoute.Sitemap = [
    { url: siteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/blog'), changeFrequency: 'daily', priority: 0.9 },
  ]

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: siteUrl(`/blog/${p.slug}`),
    changeFrequency: 'weekly',
    priority: 0.8,
    lastModified: p.publishedDate ? new Date(p.publishedDate) : undefined,
  }))

  return [...baseEntries, ...postEntries]
}

