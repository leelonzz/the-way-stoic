import { sanityFetch } from '@/lib/sanity.fetch'
import { blogPostsQuery } from '@/lib/sanity.queries'
import { urlFor } from '@/lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'

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
  featured?: boolean
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
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