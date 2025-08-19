import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlaceBySlug } from '@/lib/placeData'
import { MapPin, Clock, Users, BookOpen } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const place = getPlaceBySlug('seleucia-on-tigris')

  if (!place) {
    return {
      title: 'Place Not Found | The Stoic Way',
      description: 'The requested philosophical place could not be found.',
    }
  }

  return {
    title: place.seo.metaTitle,
    description: place.seo.metaDescription,
    keywords: place.seo.keywords.join(', '),
    openGraph: {
      title: place.seo.metaTitle,
      description: place.seo.metaDescription,
      type: 'website',
      url: 'https://thewaystoic.site/places/seleucia-on-tigris',
      siteName: 'The Stoic Way',
    },
    twitter: {
      card: 'summary_large_image',
      title: place.seo.metaTitle,
      description: place.seo.metaDescription,
      creator: '@thestoicway',
    },
    alternates: {
      canonical: 'https://thewaystoic.site/places/seleucia-on-tigris',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function SeleuciaTigrisPage() {
  const place = getPlaceBySlug('seleucia-on-tigris')

  if (!place) {
    return <div>Place not found</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/places" className="hover:underline">
              Places
            </Link>
          </li>
          <li>/</li>
          <li aria-current="page" className="text-gray-700">
            Seleucia on Tigris
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <header className="mb-16">
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'Inknut Antiqua, serif' }}
          >
            Seleucia on Tigris: Cosmopolitan Birthplace of Diogenes of Babylon
          </h1>
          <p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {place.description}
          </p>
        </div>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
            <p className="text-gray-600 text-sm">
              {place.city}, {place.country}
            </p>
            <p className="text-gray-500 text-xs mt-1">{place.region}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Period</h3>
            <p className="text-gray-600 text-sm">{place.periodName}</p>
            <p className="text-gray-500 text-xs mt-1">{place.dateRange}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Key Figure</h3>
            <p className="text-gray-600 text-sm">Diogenes of Babylon</p>
            <p className="text-gray-500 text-xs mt-1">Stoic Philosopher</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <main className="prose prose-lg prose-gray max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              The Great Hellenistic Metropolis
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.content.introduction}
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.content.historicalContext}
            </p>
          </section>

          {/* Diogenes of Babylon */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Diogenes of Babylon and Stoic Development
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Diogenes of Babylon (c. 230-150 BCE) was one of the most important
              Stoic philosophers of the 2nd century BCE, serving as head of the
              Stoic school in Athens. Born in this cosmopolitan metropolis, he
              embodied the international character of Hellenistic philosophy.
              His background in Seleucia's multicultural environment contributed
              to his sophisticated understanding of rhetoric, logic, and ethics
              that would influence later Roman Stoicism.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.content.philosophicalLegacy}
            </p>
          </section>

          {/* Cultural Synthesis */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Cultural Synthesis in Mesopotamia
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Seleucia on Tigris represented the successful fusion of Greek,
              Mesopotamian, and Persian cultures that characterized the
              Hellenistic world. The city's libraries, schools, and intellectual
              institutions brought together scholars from across the known
              world, creating an environment where philosophical ideas could
              cross-pollinate and evolve. This cultural synthesis was crucial
              for the development of later Stoic thought.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              The city's position as a major center of learning in the eastern
              Hellenistic world meant that ideas developed here would spread
              throughout the Seleucid Empire and beyond, eventually reaching
              Rome and influencing the development of imperial Stoicism.
            </p>
          </section>

          {/* Modern Significance */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Archaeological Legacy
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.modernRelevance} The site of Tell Umar continues to yield
              important discoveries about Hellenistic urban planning,
              architecture, and daily life. While the city itself no longer
              exists, its influence on the development of Stoic philosophy and
              Hellenistic culture remains significant for understanding the
              international character of ancient philosophical movements.
            </p>
          </section>

          {/* Last Updated */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: December 19, 2024
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
