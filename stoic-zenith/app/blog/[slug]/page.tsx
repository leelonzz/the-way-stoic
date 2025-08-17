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

        <p className="mt-2 text-sm text-gray-500" style={{ fontFamily: 'Inknut Antiqua, serif' }}>Published on {publishedDate}</p>

        {/* Featured image */}
        {imageUrl && (
          <div className="my-6 flex justify-center">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt || post.title}
              width={800}
              height={400}
              className="rounded-lg shadow-lg object-cover"
              priority
            />
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto">
        <main className="min-w-0 overflow-hidden">
          {post.body && post.body.length > 0 ? (
            <article>
              <PortableText value={post.body} />
            </article>
          ) : (
            <div className="prose prose-lg prose-gray max-w-none">
              <p className="text-gray-600">
                Content is being loaded or not yet available.
              </p>
            </div>
          )}

          <hr className="my-10" />

          <nav aria-label="Post navigation" className="flex items-center justify-between text-sm">
            <Link href="/blog" className="text-blue-600 hover:underline">← Back to Blog</Link>
          </nav>
        </main>
      </div>
    </div>
  )
}