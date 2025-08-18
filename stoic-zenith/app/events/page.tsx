import type { Metadata } from 'next'
import Link from 'next/link'
import { getEventsPageData } from '@/lib/eventData'
import { EventCard } from '@/components/events/EventCard'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Historical Events That Shaped Stoicism | The Stoic Way',
    description:
      'Discover pivotal ancient events that created Stoic philosophy: Diadochi Wars, Catiline Conspiracy, Marcus Aurelius reign. Learn how political chaos birthed inner resilience.',
    keywords:
      'stoic history, ancient events, Diadochi Wars, Catiline Conspiracy, Marcus Aurelius, Hellenistic period, Roman Republic, Roman Empire, historical stoicism, ancient philosophy, Zeno Citium, Cato Younger, Epictetus',
    openGraph: {
      title: 'Historical Events That Shaped Stoicism | The Stoic Way',
      description:
        'Discover pivotal ancient events that created Stoic philosophy: Diadochi Wars, Catiline Conspiracy, Marcus Aurelius reign. Learn how political chaos birthed inner resilience.',
      type: 'website',
      url: 'https://thewaystoic.site/events',
      siteName: 'The Stoic Way',
      images: [
        {
          url: 'https://thewaystoic.site/images/events-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Historical Events That Shaped Stoicism - Ancient Roman and Greek scenes',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Historical Events That Shaped Stoicism | The Stoic Way',
      description:
        'Discover pivotal ancient events that created Stoic philosophy: Diadochi Wars, Catiline Conspiracy, Marcus Aurelius reign.',
      images: ['https://thewaystoic.site/images/events-og-image.jpg'],
      creator: '@thestoicway',
    },
    alternates: {
      canonical: 'https://thewaystoic.site/events',
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

export default async function EventsPage() {
  const { periods, featuredEvents } = getEventsPageData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Historical Events That Shaped Stoicism',
    description:
      'A comprehensive collection of historical events that influenced the development of Stoic philosophy',
    url: 'https://thewaystoic.site/events',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: featuredEvents.length,
      itemListElement: featuredEvents.map((event, index) => ({
        '@type': 'HistoricalEvent',
        position: index + 1,
        name: event.title,
        description: event.description,
        startDate:
          event.startYear < 0
            ? `${Math.abs(event.startYear)}-01-01 BCE`
            : `${event.startYear}-01-01 CE`,
        endDate: event.endYear
          ? event.endYear < 0
            ? `${Math.abs(event.endYear)}-01-01 BCE`
            : `${event.endYear}-01-01 CE`
          : undefined,
        location: {
          '@type': 'Place',
          name: event.location,
        },
        url: `https://thewaystoic.site/events/${event.slug}`,
      })),
    },
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
            <li aria-current="page" className="text-gray-700">
              Events
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-inknut text-gray-900 mb-6">
            Historical Events That Shaped Stoicism
          </h1>
          <p className="text-xl font-inknut text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6">
            Discover the pivotal moments in ancient history that directly
            influenced the development of Stoic philosophy. From the political
            chaos following Alexander the Great's death to Marcus Aurelius's
            reign as philosopher-emperor, these events demonstrate how external
            turmoil created the need for inner resilience and virtue-based
            living.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              323 BCE - 192 CE
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Mediterranean Basin
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {featuredEvents.length} Key Events
            </span>
          </div>
        </div>

        {/* Period Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold font-inknut text-gray-900 mb-8 text-center">
            Three Defining Periods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {periods.map(period => (
              <div
                key={period.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold font-inknut text-gray-900 mb-2">
                    {period.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    {period.dateRange}
                  </p>
                </div>
                <p className="font-inknut text-gray-700 text-sm leading-relaxed mb-4">
                  {period.description}
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Significance:
                  </h4>
                  <p className="font-inknut text-gray-600 text-sm">
                    {period.significance}
                  </p>
                </div>
                <Link
                  href={`/events?period=${period.slug}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View {period.events.length} events
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Events */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-inknut text-gray-900 mb-4">
              Key Historical Events
            </h2>
            <p className="text-lg font-inknut text-gray-600 max-w-2xl mx-auto">
              Explore the most significant events that shaped Stoic philosophy
              and influenced its greatest practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold font-inknut text-gray-900 mb-4">
            Explore by Time Period
          </h2>
          <p className="font-inknut text-gray-600 mb-6">
            Navigate through the chronological development of Stoic philosophy
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {periods.map(period => (
              <Link
                key={period.id}
                href={`/events?period=${period.slug}`}
                className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                {period.name}
                <span className="ml-2 text-sm text-gray-500">
                  ({period.events.length})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
