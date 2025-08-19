import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllEvents, getEventBySlug, getRelatedEvents } from '@/lib/eventData'
import { EventCard } from '@/components/events/EventCard'
import { EventSpecificFAQ } from '@/components/events/EventSpecificFAQ'
import { generateEventFAQStructuredData } from '@/lib/eventSpecificFAQ'

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const events = getAllEvents()

  return events.map(event => ({
    slug: event.slug,
  }))
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const event = getEventBySlug(resolvedParams.slug)

  if (!event) {
    return {
      title: 'Historical Event Not Found | The Stoic Way',
      description:
        'The requested historical event could not be found. Explore other pivotal moments that shaped Stoic philosophy.',
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const publishedTime =
    event.startYear < 0
      ? `${Math.abs(event.startYear)}-01-01 BCE`
      : `${event.startYear}-01-01 CE`

  return {
    title: event.seo.metaTitle,
    description: event.seo.metaDescription,
    keywords: event.seo.keywords.join(', '),
    authors: [{ name: 'The Stoic Way' }],
    openGraph: {
      type: 'article',
      title: event.seo.metaTitle,
      description: event.seo.metaDescription,
      url: `https://thewaystoic.site/events/${resolvedParams.slug}`,
      siteName: 'The Stoic Way',
      images: [
        {
          url: `https://thewaystoic.site/images/events/${event.slug}-og.jpg`,
          width: 1200,
          height: 630,
          alt: `${event.title} - Historical event that shaped Stoic philosophy`,
        },
      ],
      publishedTime: publishedTime,
      section: 'Historical Events',
      tags: event.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.seo.metaTitle,
      description: event.seo.metaDescription,
      images: [`https://thewaystoic.site/images/events/${event.slug}-og.jpg`],
      creator: '@thestoicway',
    },
    alternates: {
      canonical: `https://thewaystoic.site/events/${resolvedParams.slug}`,
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
    other: {
      'article:section': 'Historical Events',
      'article:tag': event.tags.join(', '),
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params
  const event = getEventBySlug(resolvedParams.slug)

  if (!event) {
    notFound()
  }

  const relatedEvents = getRelatedEvents(event.id, 3)
  const faqStructuredData = generateEventFAQStructuredData(event.id)

  const formatDateRange = (dateRange: string) => {
    return dateRange.replace(/BCE/g, 'BCE').replace(/CE/g, 'CE')
  }

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'hellenistic':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'roman-republic':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'roman-empire':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HistoricalEvent',
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
    about: {
      '@type': 'Thing',
      name: 'Stoic Philosophy',
      description:
        'Ancient Greek and Roman philosophy emphasizing virtue, wisdom, and emotional resilience',
    },
    keywords: event.tags.join(', '),
    url: `https://thewaystoic.site/events/${resolvedParams.slug}`,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}

      <div
        className="mx-auto max-w-4xl px-6 py-10"
        style={{ fontFamily: 'Inknut Antiqua, serif' }}
      >
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
              <Link href="/events" className="hover:underline">
                Events
              </Link>
            </li>
            <li>/</li>
            <li aria-current="page" className="text-gray-700 truncate">
              {event.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPeriodColor(event.period)}`}
            >
              {event.periodName}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <time className="font-medium">
                {formatDateRange(event.dateRange)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{event.location}</span>
            </div>
          </div>

          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            {event.description}
          </p>

          {/* Key Information Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Historical Period
                </h3>
                <p className="text-gray-700">{event.periodName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Key Figures
                </h3>
                <p className="text-gray-700">
                  {event.keyFigures.slice(0, 2).join(', ')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Stoic Connection
                </h3>
                <p className="text-gray-700">Direct influence on philosophy</p>
              </div>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Table of Contents
            </h2>
            <nav className="space-y-2">
              <a
                href="#overview"
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                1. Overview
              </a>
              <a
                href="#historical-context"
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                2. Historical Context
              </a>
              <a
                href="#stoic-influence"
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                3. Influence on Stoicism
              </a>
              {event.content.keyMoments.length > 0 && (
                <a
                  href="#key-moments"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  4. Key Moments
                </a>
              )}
              <a
                href="#legacy"
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                5. Legacy
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <main className="min-w-0 overflow-hidden">
            <article className="prose prose-lg prose-gray max-w-none">
              {/* Overview */}
              <section id="overview" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Overview
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {event.content.overview}
                </p>
              </section>

              {/* Historical Context */}
              <section id="historical-context" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Historical Context
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {event.content.historicalContext}
                </p>
              </section>

              {/* Stoic Influence */}
              <section id="stoic-influence" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Influence on Stoicism
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {event.content.stoicInfluence}
                </p>
              </section>

              {/* Key Moments */}
              {event.content.keyMoments.length > 0 && (
                <section id="key-moments" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Key Moments
                  </h2>
                  <div className="space-y-6">
                    {event.content.keyMoments.map((moment, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-200 pl-6 py-2"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {moment.date}
                        </h3>
                        <h4 className="text-base font-medium text-gray-800 mb-2">
                          {moment.event}
                        </h4>
                        <p className="text-gray-700">{moment.significance}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Legacy */}
              <section id="legacy" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Legacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {event.content.legacy}
                </p>
              </section>
            </article>
          </main>

          <hr className="my-10" />

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedEvents.map(relatedEvent => (
                  <EventCard key={relatedEvent.id} event={relatedEvent} />
                ))}
              </div>
            </section>
          )}

          {/* Event-Specific FAQ Section */}
          <EventSpecificFAQ eventId={event.id} />

          {/* Navigation */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Explore More Historical Events
            </h3>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Events
              <svg
                className="w-4 h-4 ml-2"
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
        </div>
      </div>
    </>
  )
}
