import type { Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity.fetch'
import { blogPostsQuery } from '@/lib/sanity.queries'
import { urlFor } from '@/lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'
import { calculateReadingTime } from '@/lib/readingTime'

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
  featured?: boolean
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog - The Stoic Way | Ancient Wisdom for Modern Living',
    description: 'Discover ancient Stoic wisdom for modern living through our comprehensive blog. Read articles on Stoic philosophy, practical exercises, mindfulness, and timeless insights from Marcus Aurelius, Epictetus, and Seneca.',
    keywords: 'stoic philosophy, stoicism blog, ancient wisdom, marcus aurelius, epictetus, seneca, mindfulness, philosophy articles, daily stoic, stoic practices',
    openGraph: {
      title: 'Blog - The Stoic Way | Ancient Wisdom for Modern Living',
      description: 'Discover ancient Stoic wisdom for modern living through our comprehensive blog. Read articles on Stoic philosophy, practical exercises, mindfulness, and timeless insights.',
      type: 'website',
      url: 'https://thewaystoic.site/blog',
      images: [
        {
          url: '/apple-touch-icon.png',
          width: 1200,
          height: 630,
          alt: 'The Stoic Way Blog - Ancient Wisdom for Modern Living',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog - The Stoic Way | Ancient Wisdom for Modern Living',
      description: 'Discover ancient Stoic wisdom for modern living through our comprehensive blog.',
      images: ['/apple-touch-icon.png'],
    },
    alternates: {
      canonical: 'https://thewaystoic.site/blog',
    },
  }
}

export default async function BlogPage() {
  const posts = await sanityFetch<BlogPost[]>({
    query: blogPostsQuery,
    tags: ['blogPost'],
  })

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover ancient wisdom for modern living through Stoic philosophy, practical exercises, and timeless insights.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Blog Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              Our blog content is being managed through Sanity CMS. Blog posts will appear here once they've been created in the studio.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                To add content, visit the Sanity Studio at: <br />
                <a href="/studio" className="text-blue-600 hover:underline font-mono">
                  /studio
                </a>
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Enhanced Blog Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Beautiful Inknut Antiqua typography</li>
                  <li>• Enhanced PortableText rendering</li>
                  <li>• Responsive design with proper spacing</li>
                  <li>• Rich blockquote and content styling</li>
                  <li>• SEO optimized metadata</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(600).height(400).url()
    : '/images/default-blog-cover.jpg'

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const readingTime = calculateReadingTime(post.body || [])

  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <Link href={`/blog/${post.slug.current}`} className="block">
        <div className="aspect-[3/2] relative overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={post.mainImage?.alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {post.featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {post.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{post.author}</span>
            </div>
            <span className="text-gray-400">•</span>
            <time className="text-sm text-gray-500">{publishedDate}</time>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{readingTime.text}</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
              {post.excerpt}
            </p>
          )}

          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.categories.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                >
                  {category}
                </span>
              ))}
              {post.categories.length > 2 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{post.categories.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}