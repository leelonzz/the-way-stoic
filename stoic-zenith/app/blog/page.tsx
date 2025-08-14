import Link from 'next/link'
import { getAllPosts } from '@/lib/blogData'

export default function BlogIndexPage() {
  const posts = getAllPosts()
    .filter((p) => p.status.toLowerCase() !== 'draft')
    .filter((p) => !!p.slug)

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <p className="mt-2 text-gray-600">Programmatic SEO — generated from your content matrix.</p>

      <div className="mt-8 grid gap-6">
        {posts.map((p) => (
          <article key={p.slug} className="rounded-lg border p-4">
            <h2 className="text-xl font-medium">
              <Link href={`/blog/${p.slug}`} className="hover:underline">
                {p.pageTitle || p.slug}
              </Link>
            </h2>
            {p.metaDescription ? (
              <p className="mt-2 text-gray-700">{p.metaDescription}</p>
            ) : null}
            <p className="mt-2 text-sm text-gray-500">
              {p.modifier || 'daily'} • {p.lifeArea || ''} • {p.headTerm || ''}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

