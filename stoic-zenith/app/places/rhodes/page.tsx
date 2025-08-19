import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlaceBySlug } from '@/lib/placeData'
import { SmoothFAQ, type FAQItem } from '@/components/ui/smooth-faq'
import { getAllRhodesFAQ } from '@/lib/rhodesFAQ'
import { StickyTableOfContents } from '@/components/places/StickyTableOfContents'
import { generateRhodesFAQStructuredData } from '@/lib/rhodesFAQ'
import { MapPin, Clock, Users, BookOpen, ExternalLink } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const place = getPlaceBySlug('rhodes')

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
      url: 'https://thewaystoic.site/places/rhodes',
      siteName: 'The Stoic Way',
      images: [
        {
          url: 'https://thewaystoic.site/images/rhodes-og.jpg',
          width: 1200,
          height: 630,
          alt: 'Rhodes - Island of Philosophers and Ancient Learning',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: place.seo.metaTitle,
      description: place.seo.metaDescription,
      images: ['https://thewaystoic.site/images/rhodes-og.jpg'],
      creator: '@thestoicway',
    },
    alternates: {
      canonical: 'https://thewaystoic.site/places/rhodes',
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

export default function RhodesPage() {
  const place = getPlaceBySlug('rhodes')
  const faqStructuredData = generateRhodesFAQStructuredData()

  // Transform FAQ data for SmoothFAQ component
  const faqItems: FAQItem[] = getAllRhodesFAQ().map(item => ({
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
      title: 'Strategic Location and Cultural Synthesis',
      level: 2 as const,
    },
    {
      id: 'independence',
      title: 'Political Independence and Prosperity',
      level: 2 as const,
    },
    {
      id: 'rhetoric-schools',
      title: 'Schools of Rhetoric and Philosophy',
      level: 2 as const,
    },
    {
      id: 'colossus',
      title: 'The Colossus - Symbol of Cultural Significance',
      level: 2 as const,
    },
    {
      id: 'roman-students',
      title: 'Training Ground for Roman Elites',
      level: 2 as const,
    },
    { id: 'visiting', title: 'Visiting Rhodes Today', level: 2 as const },
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
    hasMap: 'https://maps.google.com/?q=Rhodes+Greece',
    isAccessibleForFree: false,
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
              Rhodes
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
              Rhodes: Island of Philosophers
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
              <p className="text-gray-600 text-sm">
                {place.keyFigures.slice(0, 2).join(', ')}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                +{place.keyFigures.length - 2} more
              </p>
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
                Strategic Location and Cultural Synthesis
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
                Rhodes occupied a unique position in the ancient Mediterranean,
                serving as a natural bridge between the Greek mainland and the
                eastern territories conquered by Alexander the Great. This
                strategic location made it an ideal meeting point for diverse
                philosophical traditions, where Greek rationalism encountered
                Eastern wisdom, and theoretical philosophy met practical
                governance. The island's position at the crossroads of major
                trade routes ensured a constant flow of ideas, scholars, and
                students from across the known world.
              </p>
            </section>

            {/* Political Independence */}
            <section id="independence" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Political Independence and Commercial Prosperity
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Unlike many Greek cities that fell under the direct control of
                Hellenistic kingdoms, Rhodes maintained its independence through
                skillful diplomacy and naval power. This political autonomy was
                crucial for intellectual freedom, allowing philosophers and
                teachers to pursue their work without the constraints of royal
                patronage or political interference. The island's democratic
                institutions, inherited from classical Greek traditions,
                provided a model of governance that attracted political
                theorists and practical philosophers.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The commercial prosperity that resulted from Rhodes' position as
                a major trading hub provided the economic foundation necessary
                for sustained intellectual activity. Wealthy merchants and ship
                owners became patrons of learning, funding schools and
                supporting scholars. The famous Rhodian maritime law, which
                governed commercial disputes across the Mediterranean,
                demonstrated the island's practical approach to problem-solving
                that would influence later Stoic emphasis on applied ethics.
              </p>
            </section>

            {/* Schools of Rhetoric */}
            <section id="rhetoric-schools" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Schools of Rhetoric and Philosophy
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Rhodes became particularly renowned for its schools of rhetoric,
                which combined Greek philosophical principles with practical
                training in public speaking and political leadership. These
                institutions attracted students from across the Roman world,
                including future statesmen, generals, and emperors who sought to
                master both the art of persuasion and the wisdom of
                philosophical inquiry.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Rhodian approach to education emphasized the integration of
                theoretical knowledge with practical application, a methodology
                that would later influence Roman Stoicism's focus on ethics in
                action. Students learned not only the techniques of oratory but
                also the philosophical foundations of justice, courage, and
                wisdom that should guide public discourse and political
                decision-making.
              </p>
            </section>

            {/* The Colossus */}
            <section id="colossus" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                The Colossus - Symbol of Cultural Significance
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The famous Colossus of Rhodes, one of the Seven Wonders of the
                Ancient World, stood as more than just an impressive statue—it
                symbolized the island's cultural ambitions and intellectual
                achievements. Built to commemorate Rhodes' successful defense
                against a siege, the Colossus represented the triumph of wisdom
                and strategy over brute force, embodying philosophical ideals
                that resonated throughout the ancient world.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Though the statue stood for only about 60 years before being
                toppled by an earthquake, its symbolic significance endured. The
                Colossus became a metaphor for the intellectual grandeur that
                Rhodes represented, inspiring generations of students and
                scholars who came to the island seeking wisdom and
                enlightenment.
              </p>
            </section>

            {/* Roman Students */}
            <section id="roman-students" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Training Ground for Roman Elites
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Among the most famous students who studied in Rhodes were Cicero
                and Julius Caesar, both of whom spent formative years on the
                island mastering rhetoric and philosophy. Cicero's time in
                Rhodes profoundly influenced his later philosophical works,
                particularly his synthesis of Stoic ethics with Roman political
                thought. Caesar's education in Rhodian schools helped shape his
                understanding of leadership and governance.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The influence of Rhodian education extended far beyond
                individual students to shape the entire character of Roman
                intellectual life. The practical wisdom and ethical grounding
                that Roman leaders acquired in Rhodes became integral to the
                development of Roman law, administration, and political
                philosophy, creating a lasting legacy that influenced Western
                civilization for centuries.
              </p>
            </section>

            {/* Visiting Today */}
            <section id="visiting" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Visiting Rhodes Today
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Modern Rhodes preserves significant archaeological remains that
                allow visitors to connect with its philosophical heritage. The
                ancient acropolis, harbor installations, and city walls provide
                tangible links to the world where ancient students once gathered
                to study rhetoric and philosophy. The Archaeological Museum of
                Rhodes houses artifacts that illuminate daily life in the
                ancient city.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                While the original Colossus no longer stands, visitors can
                explore the harbor where it once welcomed ships carrying
                students and scholars from across the Mediterranean. The
                medieval Old Town, built by the Knights of Rhodes, incorporates
                many ancient stones and foundations, creating a unique layering
                of historical periods that reflects the island's continuous
                importance as a center of learning and culture.
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
