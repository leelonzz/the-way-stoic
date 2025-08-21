import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPlaceBySlug } from '@/lib/placeData'
import { SmoothFAQ, type FAQItem } from '@/components/ui/smooth-faq'
import { getAllAncientRomeFAQ } from '@/lib/ancientRomeFAQ'
import { StickyTableOfContents } from '@/components/places/StickyTableOfContents'
import { generateAncientRomeFAQStructuredData } from '@/lib/ancientRomeFAQ'
import { PlaceHero } from '@/components/places/PlaceHero'
import { SectionImage } from '@/components/places/SectionImage'
import { MapPin, Clock, Users, BookOpen, ExternalLink } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const place = getPlaceBySlug('ancient-rome')

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
      url: 'https://thewaystoic.site/places/ancient-rome',
      siteName: 'The Stoic Way',
      images: [
        {
          url: place.images.og.src,
          width: 1200,
          height: 630,
          alt: 'Ancient Rome - Imperial Center of Stoicism',
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
      canonical: 'https://thewaystoic.site/places/ancient-rome',
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

export default function AncientRomePage() {
  const place = getPlaceBySlug('ancient-rome')
  const faqStructuredData = generateAncientRomeFAQStructuredData()

  // Transform FAQ data for SmoothFAQ component
  const faqItems: FAQItem[] = getAllAncientRomeFAQ().map(item => ({
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
      title: 'Rome as the Center of Stoic Practice',
      level: 2 as const,
    },
    {
      id: 'forum-romanum',
      title: 'Forum Romanum - Political Heart of Stoicism',
      level: 2 as const,
    },
    {
      id: 'palatine-hill',
      title: 'Palatine Hill - Imperial Stoic Philosophy',
      level: 2 as const,
    },
    {
      id: 'campus-martius',
      title: 'Campus Martius - Military Discipline and Virtue',
      level: 2 as const,
    },
    {
      id: 'subura',
      title: 'Subura - Philosophy Among the People',
      level: 2 as const,
    },
    {
      id: 'libraries',
      title: 'Roman Libraries and Stoic Texts',
      level: 2 as const,
    },
    { id: 'visiting', title: 'Visiting Ancient Rome Today', level: 2 as const },
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
    availableLanguage: ['en', 'it'],
    hasMap: 'https://maps.google.com/?q=Roman+Forum+Rome',
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
              Ancient Rome
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
              Ancient Rome: Imperial Center of Stoicism
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
                Rome as the Center of Stoic Practice
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
                The transformation of Stoicism in Rome was profound and lasting.
                While Greek Stoicism had been primarily concerned with
                theoretical questions of physics, logic, and ethics, Roman
                Stoicism became intensely practical, focused on how
                philosophical principles could guide daily decisions, political
                actions, and personal conduct. The city's forums, palaces, and
                public spaces became laboratories for testing Stoic ideals in
                the real world of power, responsibility, and human complexity.
              </p>
            </section>

            {/* Forum Romanum */}
            <section id="forum-romanum" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Forum Romanum - Political Heart of Stoicism
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Roman Forum served as the primary stage where Stoic
                principles met political reality. Here, senators like Cato the
                Younger demonstrated Stoic virtue in their speeches and actions,
                while philosophers like Seneca navigated the complex world of
                imperial politics. The Forum's basilicas, temples, and speaking
                platforms witnessed countless moments where Stoic ideals of
                justice, courage, and wisdom were tested in the crucible of
                public life.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Curia, where the Roman Senate met, became a particular focus
                of Stoic political philosophy. Senators trained in Stoic
                principles brought concepts of duty, service, and rational
                decision-making to their deliberations. The tension between
                Stoic ideals and political pragmatism, played out daily in the
                Forum, helped shape a distinctly Roman approach to philosophy
                that emphasized practical wisdom over theoretical speculation.
              </p>
            </section>

            {/* Palatine Hill */}
            <section id="palatine-hill" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Palatine Hill - Imperial Stoic Philosophy
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Palatine Hill, home to the imperial palaces, became the
                ultimate testing ground for Stoic philosophy when it intersected
                with absolute power. Here, Seneca served as advisor to Emperor
                Nero, attempting to guide imperial policy through Stoic
                principles of justice and moderation. The hill's palaces
                witnessed the complex relationship between philosophical ideals
                and political reality that characterized Roman Stoicism.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Later, Marcus Aurelius would write portions of his "Meditations"
                while residing on the Palatine, creating one of history's most
                intimate records of a ruler struggling to apply Stoic principles
                to the challenges of governing an empire. The contrast between
                the luxury of imperial surroundings and the austerity of Stoic
                ideals created a unique tension that enriched Roman
                philosophical thought.
              </p>
            </section>

            {/* Campus Martius */}
            <section id="campus-martius" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Campus Martius - Military Discipline and Virtue
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Campus Martius, Rome's military training ground, embodied
                the Stoic virtues of discipline, courage, and duty that became
                central to Roman character. Here, young Romans learned not only
                military skills but also the philosophical foundations of
                service to the state. The connection between physical training
                and moral development, emphasized in Stoic thought, found
                perfect expression in the rigorous exercises conducted on this
                field.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Campus also hosted public assemblies and ceremonies that
                reinforced Roman values of honor, sacrifice, and civic duty.
                These gatherings provided opportunities for Stoic philosophers
                to address large audiences about the relationship between
                individual virtue and collective welfare, helping to spread
                Stoic ideals throughout Roman society.
              </p>
            </section>

            {/* Subura */}
            <section id="subura" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Subura - Philosophy Among the People
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Subura, Rome's densely populated working-class district,
                provided crucial context for understanding how Stoic philosophy
                addressed the concerns of ordinary citizens. While elite Romans
                debated philosophical principles in palaces and forums, the
                crowded streets and tenements of the Subura revealed the social
                conditions that made Stoic teachings about endurance,
                acceptance, and inner freedom particularly relevant to daily
                life.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Philosophers like Epictetus, who had experienced slavery and
                poverty, understood how Stoic principles could provide dignity
                and purpose even in difficult circumstances. The contrast
                between the Subura's material hardships and the philosophical
                wealth available to all Romans, regardless of social status,
                exemplified Stoicism's democratic ideals and universal
                applicability.
              </p>
            </section>

            {/* Libraries */}
            <section id="libraries" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Roman Libraries and Stoic Texts
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Rome's great libraries, including Trajan's Library and the
                libraries attached to the Baths of Caracalla, served as
                repositories for Stoic texts and centers of philosophical study.
                These institutions preserved the works of early Greek Stoics
                while fostering the development of distinctly Roman Stoic
                literature. Scholars and students gathered here to study, copy,
                and debate the philosophical works that would influence Western
                thought for centuries.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The libraries also facilitated the synthesis of Stoic philosophy
                with other intellectual traditions, as Roman scholars had access
                to works from across the Mediterranean world. This
                cross-cultural exchange enriched Stoic thought and helped create
                the comprehensive philosophical system that characterized the
                Roman period of Stoicism.
              </p>
            </section>

            {/* Visiting Today */}
            <section id="visiting" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Visiting Ancient Rome Today
              </h2>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Modern Rome preserves extensive archaeological remains where
                ancient Stoics lived and worked, offering visitors direct
                connection to imperial Stoic philosophy. The Roman Forum,
                Palatine Hill, and Campus Martius area provide tangible links to
                the world where Marcus Aurelius, Seneca, and other Stoic figures
                shaped both philosophy and history. The Capitoline Museums house
                artifacts and inscriptions that illuminate daily life in ancient
                Rome.
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Walking through the Forum Romanum, visitors can stand where Cato
                the Younger delivered his famous speeches, while the ruins of
                imperial palaces on the Palatine Hill evoke the complex world
                where Stoic advisors attempted to guide emperors. The
                preservation of these sites allows modern visitors to
                contemplate the same questions about power, responsibility, and
                virtue that occupied ancient Stoic philosophers.
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
