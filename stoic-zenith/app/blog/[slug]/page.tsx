import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity.fetch'
import { blogPostQuery, relatedBlogPostsQuery } from '@/lib/sanity.queries'
import { urlFor } from '@/lib/sanity.image'
import { PortableText } from '@/components/PortableText'
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
    alternates: {
      canonical: `https://thewaystoic.site/blog/${resolvedParams.slug}`,
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

  // Fetch related posts
  const relatedPosts = await sanityFetch<BlogPost[]>({
    query: relatedBlogPostsQuery,
    params: { 
      currentId: post._id,
      categories: post.categories || [],
      tags: post.tags || []
    },
    tags: ['blogPost'],
  })

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const readingTime = calculateReadingTime(post.body || [])

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1400).height(800).url()
    : null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || post.title,
    "image": imageUrl || "https://thewaystoic.site/apple-touch-icon.png",
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Stoic Way",
      "logo": {
        "@type": "ImageObject",
        "url": "https://thewaystoic.site/apple-touch-icon.png"
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://thewaystoic.site/blog/${resolvedParams.slug}`
    },
    "keywords": post.tags?.join(", ") || "stoic philosophy, wisdom, mindfulness",
    "articleSection": post.categories?.join(", ") || "Philosophy"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="mx-auto max-w-4xl px-6 py-10" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li>/</li>
          <li><Link href="/blog" className="hover:underline">Blog</Link></li>
          <li>/</li>
          <li aria-current="page" className="text-gray-700 truncate">{post.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8 text-center">
        {post.categories && post.categories.length > 0 && (
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
            {post.categories.join(' • ')}
          </p>
        )}

        <h1 className="mt-2 text-4xl md:text-5xl font-bold leading-relaxed text-gray-900 mb-6" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-3 text-lg text-gray-700 mb-6" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
            {post.excerpt}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
          <time dateTime={post.publishedAt}>Published on {publishedDate}</time>
          <span>•</span>
          <span>{readingTime.text}</span>
        </div>

        {/* Featured image */}
        {imageUrl && (
          <div className="my-8 flex justify-center">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt || post.title}
              width={1200}
              height={700}
              className="rounded-lg shadow-lg object-cover w-full max-w-5xl"
              priority
            />
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto">
        <main className="min-w-0 overflow-hidden">
          {post.body && post.body.length > 0 ? (
            <article>
              <PortableText 
                value={post.body} 
                enableInternalLinking={true}
                linkingContext={{
                  type: 'blog-to-biography',
                  maxLinksPerPage: 10,
                  topics: ['emotions', 'leadership', 'adversity', 'mindfulness']
                }}
                pageId={resolvedParams.slug}
              />
            </article>
          ) : (
            <div className="prose prose-lg prose-gray max-w-none">
              <p className="text-gray-600">
                Content is being loaded or not yet available.
              </p>
            </div>
          )}

          <hr className="my-10" />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <RelatedPostCard key={relatedPost._id} post={relatedPost} />
                ))}
              </div>
            </section>
          )}

          <nav aria-label="Post navigation" className="flex items-center justify-between text-sm">
            <Link href="/blog" className="text-blue-600 hover:underline">← Back to Blog</Link>
          </nav>
        </main>
      </div>
    </div>
    </>
  )
}

function RelatedPostCard({ post }: { post: BlogPost }) {
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(400).height(200).url()
    : '/apple-touch-icon.png'

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <article className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <Link href={`/blog/${post.slug.current}`} className="block">
        <div className="aspect-[2/1] relative overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={post.mainImage?.alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{post.author}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>{publishedDate}</time>
          </div>
        </div>
      </Link>
    </article>
  )
}