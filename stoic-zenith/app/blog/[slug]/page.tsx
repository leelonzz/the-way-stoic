import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity.fetch'
import { blogPostQuery, blogPostsQuery } from '@/lib/sanity.queries'
import { urlFor } from '@/lib/sanity.image'
import { PortableText } from '@/components/PortableText'

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
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

export async function generateStaticParams() {
  const posts = await sanityFetch<Pick<BlogPost, 'slug'>[]>({
    query: `*[_type == "blogPost"]{slug}`,
    tags: ['blogPost'],
  })
  
  return posts.map((post) => ({
    slug: post.slug.current,
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const post = await sanityFetch<BlogPost>({
    query: blogPostQuery,
    params: { slug: resolvedParams.slug },
    tags: ['blogPost'],
  })

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  const title = post.seo?.metaTitle || post.title
  const description = post.seo?.metaDescription || post.excerpt || ''
  const imageUrl = post.mainImage 
    ? urlFor(post.mainImage).width(1200).height(630).url()
    : '/images/default-og-image.jpg'

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.mainImage?.alt || post.title,
        },
      ],
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params
  const post = await sanityFetch<BlogPost>({
    query: blogPostQuery,
    params: { slug: resolvedParams.slug },
    tags: ['blogPost'],
  })

  if (!post) {
    notFound()
  }

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(600).url()
    : null

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li>/</li>
          <li><Link href="/blog" className="hover:underline">Blog</Link></li>
          <li>/</li>
          <li className="text-gray-700 truncate">{post.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            {post.excerpt}
          </p>
        )}

        {/* Author info */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-semibold">
              {post.author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author}</p>
            <p className="text-gray-600">Published on {publishedDate}</p>
          </div>
        </div>

        {/* Featured image */}
        {imageUrl && (
          <div className="mb-12">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt || post.title}
              width={1200}
              height={600}
              className="rounded-xl shadow-lg w-full"
              priority
            />
            {post.mainImage?.alt && (
              <p className="text-sm text-gray-600 mt-3 text-center italic">
                {post.mainImage.alt}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <main>
          {post.body && post.body.length > 0 ? (
            <PortableText value={post.body} />
          ) : (
            <div className="prose prose-lg prose-gray max-w-none">
              <p className="text-gray-600">
                Content is being loaded or not yet available.
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Blog
            </Link>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">More Articles</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Discover more insights on Stoic philosophy and practical wisdom.
              </p>
              <Link 
                href="/blog"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse All Posts
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </article>
  )
}