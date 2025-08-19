import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlaceBySlug } from '@/lib/placeData'
import { SmoothFAQ, type FAQItem } from '@/components/ui/smooth-faq'
import { getAllCitiumFAQ } from '@/lib/citiumFAQ'
import { StickyTableOfContents } from '@/components/places/StickyTableOfContents'
import { generateCitiumFAQStructuredData } from '@/lib/citiumFAQ'
import { MapPin, Clock, Users, BookOpen, ExternalLink } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const place = getPlaceBySlug('citium')

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
      url: 'https://thewaystoic.site/places/citium',
      siteName: 'The Stoic Way',
      images: [
        {
          url: 'https://thewaystoic.site/images/citium-og.jpg',
          width: 1200,
          height: 630,
          alt: 'Citium, Cyprus - Birthplace of Zeno and Stoic Philosophy',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: place.seo.metaTitle,
      description: place.seo.metaDescription,
      images: ['https://thewaystoic.site/images/citium-og.jpg'],
      creator: '@thestoicway',
    },
    alternates: {
      canonical: 'https://thewaystoic.site/places/citium',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default function CitiumPage() {
  const place = getPlaceBySlug('citium')
  const faqStructuredData = generateCitiumFAQStructuredData()

  // Transform FAQ data for SmoothFAQ component
  const faqItems: FAQItem[] = getAllCitiumFAQ().map(item => ({
    question: item.question,
    answer: item.answer,
    category: item.category,
    period: item.period,
    keyFigures: item.keyFigures,
    relatedEvents: item.relatedSites,
  }))

  if (!place) {
    return <div>Place not found</div>
  }

  // Table of Contents data
  const tocItems = [
    {
      id: 'introduction',
      title: "Zeno's Birthplace and Early Influences",
      level: 2 as const,
    },
    {
      id: 'phoenician-culture',
      title: 'Phoenician Trading Culture',
      level: 2 as const,
    },
    {
      id: 'multicultural-environment',
      title: 'Multicultural Philosophical Environment',
      level: 2 as const,
    },
    {
      id: 'cosmopolitan-origins',
      title: 'Origins of Stoic Cosmopolitanism',
      level: 2 as const,
    },
    { id: 'visiting', title: 'Visiting Citium Today', level: 2 as const },
    { id: 'faq', title: 'Frequently Asked Questions', level: 2 as const },
  ]

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: place.name,
    description: place.description,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.coordinates.lat,
      longitude: place.coordinates.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: place.city,
      addressCountry: place.country,
    },
    touristType: 'Educational Tourism',
    availableLanguage: ['en', 'el'],
    hasMap: 'https://maps.google.com/?q=Larnaca+Cyprus+Ancient+Citium',
    isAccessibleForFree: true,
    publicAccess: true,
    historicalSignificance: place.significance,
    educationalUse: place.philosophicalImportance,
    publisher: {
      '@type': 'Organization',
      name: 'The Stoic Way',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thewaystoic.site/apple-touch-icon.png',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      )}

      {/* Sticky Table of Contents */}
      <StickyTableOfContents items={tocItems} />

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
              Citium
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
              Citium: Birthplace of Stoic Philosophy
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
              <p className="text-gray-600 text-sm">Zeno of Citium</p>
              <p className="text-gray-500 text-xs mt-1">Founder of Stoicism</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <main className="prose prose-lg prose-gray max-w-none">
            {/* Introduction */}
            <section id="introduction" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Zeno's Birthplace and Early Influences
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
                Born around 334 BCE into a merchant family, Zeno grew up
                surrounded by the constant flow of goods, ideas, and people that
                characterized this bustling port city. The young Zeno would have
                witnessed daily interactions between Phoenicians, Greeks,
                Egyptians, and Persians, each bringing their own customs,
                beliefs, and ways of understanding the world. This early
                exposure to cultural diversity would prove foundational to his
                later philosophical development.
              </p>
            </section>

            {/* Phoenician Culture */}
            <section id="phoenician-culture" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Phoenician Trading Culture and Values
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Citium's Phoenician heritage provided Zeno with a practical,
                cosmopolitan worldview that would later distinguish Stoic
                philosophy from other Greek schools. Phoenician culture
                emphasized adaptability, resilience, and the ability to work
                with people from different backgrounds—qualities essential for
                successful trade across the Mediterranean. These values,
                absorbed in childhood, would later manifest in Stoic teachings
                about accepting what cannot be changed and finding common ground
                with all humanity.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Phoenician emphasis on practical wisdom over theoretical
                speculation also influenced Zeno's approach to philosophy.
                Unlike purely academic philosophical schools, Stoicism would
                always maintain a focus on how philosophical principles could be
                applied to real-world challenges, reflecting the pragmatic
                merchant culture of Citium.
              </p>
            </section>

            {/* Multicultural Environment */}
            <section id="multicultural-environment" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Multicultural Philosophical Environment
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The multicultural environment of Citium exposed young Zeno to
                diverse philosophical and religious traditions that would later
                influence Stoic thought. The city hosted temples to various
                deities, from Phoenician Astarte to Greek Aphrodite, while
                merchants brought stories and ideas from across the known world.
                This religious and intellectual diversity taught Zeno to look
                for universal truths that transcended cultural boundaries.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The constant interaction between different peoples in Citium's
                markets and harbors demonstrated that despite surface
                differences in language, customs, and beliefs, all humans shared
                common needs, emotions, and aspirations. This observation would
                become central to Stoic ethics, which emphasized the fundamental
                unity of humanity and the importance of treating all people with
                justice and compassion.
              </p>
            </section>

            {/* Cosmopolitan Origins */}
            <section id="cosmopolitan-origins" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Origins of Stoic Cosmopolitanism
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Zeno's famous declaration that he was a "citizen of the world"
                (kosmopolites) reflected his upbringing in Citium's
                international community. Unlike Greeks from more homogeneous
                city-states, Zeno grew up thinking of himself as part of a
                larger human community that transcended local loyalties. This
                cosmopolitan perspective became one of Stoicism's most
                distinctive and influential features.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Stoic concept of natural law—the idea that certain moral
                principles apply to all humans regardless of their cultural
                background—also originated in Zeno's experience of Citium's
                diverse but harmonious community. Watching people from different
                cultures successfully cooperate in trade and daily life
                convinced him that universal ethical principles must exist to
                make such cooperation possible.
              </p>
            </section>

            {/* Visiting Today */}
            <section id="visiting" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Visiting Citium Today
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Modern Larnaca preserves archaeological remains of ancient
                Citium that allow visitors to connect with Zeno's birthplace and
                the origins of Stoic philosophy. The Larnaca Archaeological
                Museum displays artifacts from the ancient city, including
                Phoenician inscriptions and Greek pottery that illustrate the
                multicultural environment where Zeno grew up. Excavations near
                the modern city center reveal foundations of ancient buildings
                and harbor installations.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Walking through modern Larnaca's harbor area, visitors can
                imagine the bustling ancient port where young Zeno first
                encountered the diversity of human cultures that would inspire
                his philosophical vision. The city's continued role as an
                international crossroads, with its modern airport and port
                facilities, echoes the cosmopolitan character that shaped the
                founder of Stoicism over two millennia ago.
              </p>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-8"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Frequently Asked Questions
              </h2>
              <SmoothFAQ items={faqItems} />
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
    </>
  )
}
