import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPhilosophers, getPhilosopherBiography, generatePhilosopherStructuredData } from '@/lib/philosopherData'

export async function generateStaticParams() {
  const philosophers = getAllPhilosophers()
  return philosophers.map((philosopher) => ({
    'mentor-slug': philosopher.slug,
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ 'mentor-slug': string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams['mentor-slug']
  const philosopher = getPhilosopherBiography(slug)
  
  if (!philosopher) {
    return {
      title: 'Philosopher Not Found',
      description: 'The requested philosopher biography could not be found.'
    }
  }

  const url = `https://thewaystoic.com/biography/${philosopher.slug}`
  
  return {
    title: philosopher.metaTitle,
    description: philosopher.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      title: philosopher.metaTitle,
      description: philosopher.metaDescription,
      url,
      siteName: 'The Way Stoic',
    },
    twitter: { 
      card: 'summary_large_image', 
      title: philosopher.metaTitle, 
      description: philosopher.metaDescription 
    },
    other: {
      'article:author': philosopher.fullName,
      'article:section': 'Biography',
      'article:tag': philosopher.popularTags,
    }
  }
}

export default async function BiographyPage({ 
  params 
}: { 
  params: Promise<{ 'mentor-slug': string }> 
}) {
  const resolvedParams = await params
  const slug = resolvedParams['mentor-slug']
  const biography = getPhilosopherBiography(slug)
  
  if (!biography) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Philosopher not found</h1>
        <p className="mt-4">
          <Link href="/biography" className="text-blue-600 underline">
            Browse all philosophers
          </Link>
        </p>
      </div>
    )
  }

  const structuredData = generatePhilosopherStructuredData(biography)

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.startsWith('0000') || dateStr.startsWith('1950')) return dateStr
    try {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const isBC = year < 0
      return isBC ? `${Math.abs(year)} BCE` : `${year} CE`
    } catch {
      return dateStr
    }
  }

  const bornYear = formatDate(biography.birthDate)
  const diedYear = formatDate(biography.deathDate)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link href="/mentors" className="hover:underline">Mentors</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-gray-700">Biography</li>
            <li>/</li>
            <li aria-current="page" className="text-gray-700">{biography.name}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column - Text */}
            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full">
                  Biography
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {biography.h1 || biography.fullName}
              </h1>
              
              <div className="space-y-4 text-lg">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">Name:</span>
                  <span className="text-gray-700">{biography.fullName}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">Born:</span>
                  <span className="text-gray-700">
                    {bornYear} in {biography.birthPlace}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">Died:</span>
                  <span className="text-gray-700">{diedYear}</span>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-gray-900">Role:</span>
                  <span className="text-gray-700">{biography.role}</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Image */}
            <div className="flex justify-center md:justify-end">
              <div className="w-80 h-96 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-lg flex items-center justify-center">
                {biography.slug === 'marcus-aurelius' ? (
                  <div className="text-center p-6">
                    <div className="w-24 h-24 bg-amber-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-800">MA</span>
                    </div>
                    <p className="text-sm text-gray-600">Portrait of Marcus Aurelius</p>
                    <p className="text-xs text-gray-500 mt-1">Roman Emperor & Philosopher</p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">
                        {biography.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Portrait of {biography.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mt-8">
            <p className="text-xl text-gray-700 leading-relaxed">
              {biography.description}
            </p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Content */}
          <main className="prose prose-lg prose-gray max-w-none">
            {/* Life Story Sections */}
            {biography.lifeStory.length > 0 && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Life Story</h2>
                
                {biography.lifeStory.map((section, index) => (
                  <div key={index} className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      {section.title}
                    </h3>
                    <div className="text-gray-700 leading-relaxed space-y-4">
                      {section.content.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Philosophy & Quotes */}
            {biography.quotes.length > 0 && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Quotes & Philosophy</h2>
                
                <div className="space-y-8">
                  {biography.quotes.map((quote, index) => (
                    <div key={index} className="border-l-4 border-amber-500 pl-6">
                      <blockquote className="text-xl font-medium text-gray-800 mb-4 italic">
                        "{quote.text}"
                      </blockquote>
                      <p className="text-gray-600 leading-relaxed">
                        {quote.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Works & Influence */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Works & Influence</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Notable Works</h3>
                  <p className="text-gray-700">{biography.notableWorks}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Influences</h3>
                  <p className="text-gray-700">{biography.influences}</p>
                </div>
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Facts */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">School:</span>
                  <span className="ml-2 text-gray-800">{biography.school}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Active Period:</span>
                  <span className="ml-2 text-gray-800">{biography.activePeriod}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Language:</span>
                  <span className="ml-2 text-gray-800">{biography.primaryLanguage}</span>
                </div>
              </div>
            </div>

            {/* Related Philosophers */}
            {biography.relatedAuthors && (
              <div className="bg-amber-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Philosophers</h3>
                
                <div className="space-y-2 text-sm">
                  {biography.relatedAuthors.split(';').map((author, index) => (
                    <div key={index} className="text-amber-800">
                      {author.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {biography.popularTags && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
                
                <div className="flex flex-wrap gap-2">
                  {biography.popularTags.split(';').map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Navigation */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link 
              href="/mentors" 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to All Mentors
            </Link>
            
            {biography.link && (
              <a 
                href={biography.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                Learn More →
              </a>
            )}
          </div>
        </footer>
      </div>
    </>
  )
}