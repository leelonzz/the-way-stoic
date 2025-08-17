import { NextResponse } from 'next/server'
import { sanityFetch } from '@/lib/sanity.fetch'
import { blogPostsQuery } from '@/lib/sanity.queries'
import { urlFor } from '@/lib/sanity.image'

interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  author: string
  excerpt?: string
  mainImage?: {
    asset: {
      _ref: string
    }
    alt?: string
  }
  categories?: string[]
  tags?: string[]
  publishedAt: string
  body?: any[]
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&#39;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  try {
    const posts = await sanityFetch<BlogPost[]>({
      query: blogPostsQuery,
      tags: ['blogPost'],
    })

    const baseUrl = 'https://thewaystoic.site'
    const now = new Date().toISOString()

    const rssItems = posts.map((post) => {
      const imageUrl = post.mainImage
        ? urlFor(post.mainImage).width(1200).height(630).url()
        : `${baseUrl}/apple-touch-icon.png`

      const description = post.excerpt || post.title
      const categories = post.categories?.map(cat => `<category>${escapeXml(cat)}</category>`).join('') || ''

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${baseUrl}/blog/${post.slug.current}</link>
          <guid isPermaLink="true">${baseUrl}/blog/${post.slug.current}</guid>
          <description>${escapeXml(description)}</description>
          <author>noreply@thewaystoic.site (${escapeXml(post.author)})</author>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
          ${categories}
          <enclosure url="${imageUrl}" type="image/jpeg" length="0"/>
        </item>
      `.trim()
    }).join('\n')

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Stoic Way - Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Discover ancient Stoic wisdom for modern living through our comprehensive blog. Read articles on Stoic philosophy, practical exercises, mindfulness, and timeless insights from Marcus Aurelius, Epictetus, and Seneca.</description>
    <language>en-US</language>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${now}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/apple-touch-icon.png</url>
      <title>The Stoic Way</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <managingEditor>noreply@thewaystoic.site (The Stoic Way)</managingEditor>
    <webMaster>noreply@thewaystoic.site (The Stoic Way)</webMaster>
    <category>Philosophy</category>
    <category>Stoicism</category>
    <category>Personal Development</category>
    <category>Mindfulness</category>
    ${rssItems}
  </channel>
</rss>`.trim()

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}