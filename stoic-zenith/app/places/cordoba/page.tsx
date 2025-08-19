import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlaceBySlug } from '@/lib/placeData'
import { MapPin, Clock, Users, BookOpen } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const place = getPlaceBySlug('cordoba')

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
      url: 'https://thewaystoic.site/places/cordoba',
      siteName: 'The Stoic Way',
    },
    twitter: {
      card: 'summary_large_image',
      title: place.seo.metaTitle,
      description: place.seo.metaDescription,
      creator: '@thestoicway',
    },
    alternates: {
      canonical: 'https://thewaystoic.site/places/cordoba',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function CordobaPage() {
  const place = getPlaceBySlug('cordoba')

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
            Córdoba
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
            Córdoba: Seneca's Ancestral Home
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
            <h3 className="font-semibold text-gray-900 mb-2">Key Figures</h3>
            <p className="text-gray-600 text-sm">Seneca Family</p>
            <p className="text-gray-500 text-xs mt-1">
              Seneca the Younger, Lucan
            </p>
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
              Capital of Roman Hispania
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

          {/* Seneca Family */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              The Seneca Family Legacy
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              The Seneca family's roots in Córdoba profoundly influenced their
              approach to Stoic philosophy and Roman literature. Seneca the
              Elder (c. 54 BCE - 39 CE) was a renowned rhetorician who
              established the family's intellectual reputation. His son, Seneca
              the Younger (4 BCE - 65 CE), became one of Rome's most influential
              Stoic philosophers, while his grandson Lucan (39-65 CE) achieved
              fame as an epic poet.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.content.philosophicalLegacy} The family's provincial
              background gave them a unique perspective on Roman power and
              imperial politics, contributing to Seneca's nuanced understanding
              of how philosophical principles could be applied in complex
              political situations.
            </p>
          </section>

          {/* Provincial Roman Culture */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Provincial Roman Culture and Philosophy
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Córdoba's position as a major provincial city provided a unique
              perspective on Roman civilization that influenced the Seneca
              family's philosophical outlook. The blend of local Iberian
              traditions with Roman culture created an environment where
              practical wisdom was highly valued. This provincial perspective
              helped shape Seneca's accessible writing style and his focus on
              ethical guidance that could be applied by ordinary people facing
              everyday challenges.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              The city's wealth from agriculture and mining supported a
              sophisticated urban culture that attracted scholars and
              philosophers from across the empire. This intellectual environment
              fostered the development of the literary and philosophical talents
              that would make the Seneca family famous throughout the Roman
              world.
            </p>
          </section>

          {/* Seneca's Stoicism */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Seneca's Practical Stoicism
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Seneca's approach to Stoic philosophy reflected his Córdoban
              background in its emphasis on practical application and
              accessibility. His letters, essays, and tragedies made Stoic
              principles understandable to educated Romans who needed guidance
              for navigating the complexities of imperial society. Unlike more
              academic philosophers, Seneca focused on how Stoic teachings could
              help people deal with real-world challenges of wealth, power, and
              political responsibility.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              His provincial origins may have contributed to his understanding
              of the tensions between philosophical ideals and practical
              necessities, making his work particularly valuable for readers
              seeking to apply Stoic principles in their own complex
              circumstances.
            </p>
          </section>

          {/* Modern Córdoba */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Visiting Córdoba Today
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.modernRelevance} The city's Roman bridge, temple remains,
              and archaeological sites provide tangible connections to the world
              that shaped Seneca's philosophical outlook. The Archaeological
              Museum of Córdoba houses important artifacts from the Roman
              period, including inscriptions and sculptures that illuminate
              daily life in ancient Corduba.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Modern Córdoba celebrates its connection to Seneca and classical
              literature through various cultural programs and educational
              initiatives. Visitors can explore the historic center, which
              preserves the urban layout that would have been familiar to the
              Seneca family, while contemplating the enduring relevance of Stoic
              philosophy for contemporary life.
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
