import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPlaceBySlug } from '@/lib/placeData'
import { PlaceHero } from '@/components/places/PlaceHero'
import { MapPin, Clock, Users, BookOpen } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const place = getPlaceBySlug('hierapolis')

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
      url: 'https://thewaystoic.site/places/hierapolis',
      siteName: 'The Stoic Way',
      images: [
        {
          url: place.images.og.src,
          width: place.images.og.width,
          height: place.images.og.height,
          alt: place.images.og.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: place.seo.metaTitle,
      description: place.seo.metaDescription,
      images: [place.images.og.src],
      creator: '@thestoicway',
    },
    alternates: {
      canonical: 'https://thewaystoic.site/places/hierapolis',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function HierapolisPage() {
  const place = getPlaceBySlug('hierapolis')

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
            Hierapolis
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <PlaceHero
        title="Hierapolis: Birthplace of Epictetus"
        description={place.description}
        heroImage={place.images.hero}
      />

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
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
          <p className="text-gray-600 text-sm">Epictetus</p>
          <p className="text-gray-500 text-xs mt-1">Stoic Teacher</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <main className="prose prose-lg prose-gray max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Sacred City of Healing and Wisdom
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

          {/* Epictetus */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Epictetus: From Slavery to Philosophical Freedom
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Epictetus (c. 50-135 CE) was born into slavery in Hierapolis, yet
              became one of the most influential Stoic teachers in history. His
              early experiences of powerlessness and suffering in his birthplace
              profoundly shaped his philosophical outlook, particularly his
              emphasis on the distinction between what is "up to us" and what is
              not. The contrast between external circumstances and inner freedom
              became central to his teaching.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.content.philosophicalLegacy} His teachings, recorded by his
              student Arrian in the "Discourses" and "Enchiridion," continue to
              influence readers seeking practical wisdom for dealing with life's
              challenges.
            </p>
          </section>

          {/* Religious Environment */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Religious and Healing Traditions
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Hierapolis was famous throughout the ancient world for its healing
              hot springs and religious significance. The city hosted temples to
              various deities and attracted pilgrims seeking both physical and
              spiritual healing. This environment of spiritual seeking and
              diverse religious traditions may have influenced Epictetus's later
              emphasis on spiritual discipline and the cultivation of inner
              peace.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              The city's reputation as a place of healing and transformation
              provided a fitting backdrop for the birth of a philosopher who
              would teach that true healing comes from within, through the
              proper understanding of what we can and cannot control.
            </p>
          </section>

          {/* Modern Pamukkale */}
          <section className="mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Visiting Hierapolis Today
            </h2>
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.modernRelevance} The spectacular travertine terraces of
              Pamukkale, formed by the same hot springs that made ancient
              Hierapolis famous, continue to attract visitors from around the
              world. The well-preserved ruins include a magnificent Roman
              theater, extensive necropolis, and the remains of various temples
              and public buildings.
            </p>
            <p
              className="text-gray-700 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Walking through the ancient city where Epictetus was born,
              visitors can contemplate the contrast between the beauty of the
              natural setting and the harsh realities of ancient life that
              shaped one of Stoicism's most profound teachers. The site offers a
              unique opportunity to reflect on themes of freedom, acceptance,
              and inner strength that characterized Epictetus's philosophy.
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
