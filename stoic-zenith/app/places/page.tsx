import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlacesPageData } from '@/lib/placeData'
import { MapPin, Clock, BookOpen, Users } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Philosophical Places | Ancient Centers of Wisdom | The Stoic Way',
    description:
      "Explore the ancient places where philosophy was born and flourished. From Athens' Stoa Poikile to Rome's forums, discover the locations that shaped Western thought.",
    keywords:
      'philosophical places, ancient Athens, Stoa Poikile, Plato Academy, philosophical destinations, ancient philosophy sites',
    openGraph: {
      title: 'Philosophical Places | Ancient Centers of Wisdom | The Stoic Way',
      description:
        "Explore the ancient places where philosophy was born and flourished. From Athens' Stoa Poikile to Rome's forums, discover the locations that shaped Western thought.",
      type: 'website',
      url: 'https://thewaystoic.site/places',
      siteName: 'The Stoic Way',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Philosophical Places | Ancient Centers of Wisdom',
      description:
        'Explore the ancient places where philosophy was born and flourished.',
      creator: '@thestoicway',
    },
    alternates: {
      canonical: 'https://thewaystoic.site/places',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function PlacesPage() {
  const { categories, featuredPlaces } = getPlacesPageData()

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
          <li aria-current="page" className="text-gray-700">
            Places
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <header className="text-center mb-16">
        <h1
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: 'Inknut Antiqua, serif' }}
        >
          Philosophical Places
        </h1>
        <p
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Discover the ancient places where Western philosophy was born and
          flourished. From the bustling agoras of Athens to the quiet gardens of
          contemplation, explore the physical spaces that shaped human thought.
          Walk in the footsteps of{' '}
          <Link
            href="/biography/marcus-aurelius"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Marcus Aurelius
          </Link>
          ,{' '}
          <Link
            href="/biography/seneca"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Seneca
          </Link>
          , and{' '}
          <Link
            href="/biography/epictetus"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Epictetus
          </Link>{' '}
          as you journey through the locations that gave birth to{' '}
          <Link
            href="/quotes"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            timeless wisdom
          </Link>
          .
        </p>

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="/mentors"
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            Meet the Philosophers
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 transition-colors font-medium"
          >
            Historical Events
          </Link>
          <Link
            href="/journal"
            className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors font-medium"
          >
            Start Your Journey
          </Link>
        </div>
      </header>

      {/* Featured Places */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Inknut Antiqua, serif' }}
          >
            Featured Destinations
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Explore the most significant places in the history of philosophy.
            Each destination offers insights into the{' '}
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              historical events
            </Link>{' '}
            and{' '}
            <Link
              href="/mentors"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              great minds
            </Link>{' '}
            that shaped Western thought.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPlaces.map(place => (
            <article
              key={place.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <Link href={`/places/${place.slug}`} className="block">
                <div className="p-6">
                  {/* Period Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-blue-100 text-blue-800 border-blue-200">
                      {place.periodName}
                    </span>
                  </div>

                  {/* Title and Location */}
                  <div className="mb-4">
                    <h3
                      className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
                      style={{ fontFamily: 'Inknut Antiqua, serif' }}
                    >
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {place.city}, {place.country}
                      </span>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>{place.dateRange}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {place.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{place.schools.length} Schools</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{place.keyFigures.length} Key Figures</span>
                    </div>
                  </div>

                  {/* Key Figures */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Key Figures:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {place.keyFigures.slice(0, 3).map((figure, index) => {
                        // Create philosopher biography links for key figures
                        const getPhilosopherSlug = (name: string) => {
                          const slugMap: { [key: string]: string } = {
                            'Marcus Aurelius': 'marcus-aurelius',
                            Seneca: 'seneca',
                            Epictetus: 'epictetus',
                            'Zeno of Citium': 'zeno-of-citium',
                            Plato: 'plato',
                            Socrates: 'socrates',
                            Cicero: 'cicero',
                            'Musonius Rufus': 'musonius-rufus',
                            'Cato the Younger': 'cato-the-younger',
                          }
                          return slugMap[name]
                        }

                        const slug = getPhilosopherSlug(figure)

                        if (slug) {
                          return (
                            <Link
                              key={index}
                              href={`/biography/${slug}`}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            >
                              {figure}
                            </Link>
                          )
                        }

                        return (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {figure}
                          </span>
                        )
                      })}
                      {place.keyFigures.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          +{place.keyFigures.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="text-blue-600 text-sm font-medium group-hover:text-blue-800 transition-colors">
                    Explore this destination →
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Explore Related Content */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Inknut Antiqua, serif' }}
          >
            Deepen Your Philosophical Journey
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Explore the wisdom, events, and practices that shaped these ancient
            places
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Philosophers */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3
              className="text-xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Meet the Philosophers
            </h3>
            <p
              className="text-gray-600 text-sm mb-4 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Discover the lives and teachings of the great minds who walked
              these ancient streets and developed timeless wisdom.
            </p>
            <div className="space-y-2">
              <Link
                href="/biography/marcus-aurelius"
                className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                Marcus Aurelius: The Philosopher Emperor
              </Link>
              <Link
                href="/biography/seneca"
                className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                Seneca: Letters from a Stoic Master
              </Link>
              <Link
                href="/biography/epictetus"
                className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                Epictetus: From Slave to Sage
              </Link>
              <Link
                href="/mentors"
                className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                View All Philosophers →
              </Link>
            </div>
          </div>

          {/* Historical Events */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-amber-600 mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3
              className="text-xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Historical Context
            </h3>
            <p
              className="text-gray-600 text-sm mb-4 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Understand the historical events and cultural movements that
              shaped philosophical thought in these ancient centers.
            </p>
            <div className="space-y-2">
              <Link
                href="/events"
                className="block text-amber-600 hover:text-amber-800 text-sm font-medium hover:underline"
              >
                The Rise of Stoicism in Athens
              </Link>
              <Link
                href="/events"
                className="block text-amber-600 hover:text-amber-800 text-sm font-medium hover:underline"
              >
                Roman Imperial Philosophy
              </Link>
              <Link
                href="/events"
                className="block text-amber-600 hover:text-amber-800 text-sm font-medium hover:underline"
              >
                Hellenistic Period Developments
              </Link>
              <Link
                href="/events"
                className="block text-amber-600 hover:text-amber-800 text-sm font-medium hover:underline"
              >
                Explore All Events →
              </Link>
            </div>
          </div>

          {/* Wisdom & Quotes */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-green-600 mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3
              className="text-xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Ancient Wisdom
            </h3>
            <p
              className="text-gray-600 text-sm mb-4 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Immerse yourself in the profound quotes and teachings that emerged
              from these philosophical centers.
            </p>
            <div className="space-y-2">
              <Link
                href="/quotes"
                className="block text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
              >
                Daily Stoic Wisdom
              </Link>
              <Link
                href="/blog"
                className="block text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
              >
                Philosophical Insights
              </Link>
              <Link
                href="/quotes"
                className="block text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
              >
                Meditations & Reflections
              </Link>
              <Link
                href="/quotes"
                className="block text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
              >
                Browse All Quotes →
              </Link>
            </div>
          </div>

          {/* Practice & Application */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-purple-600 mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3
              className="text-xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Modern Practice
            </h3>
            <p
              className="text-gray-600 text-sm mb-4 leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Apply the wisdom of these ancient places to your modern life
              through practical exercises and reflection.
            </p>
            <div className="space-y-2">
              <Link
                href="/journal"
                className="block text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
              >
                Start Your Philosophical Journal
              </Link>
              <Link
                href="/calendar"
                className="block text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
              >
                Daily Stoic Practices
              </Link>
              <Link
                href="/mentors"
                className="block text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
              >
                Learn from AI Mentors
              </Link>
              <Link
                href="/"
                className="block text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
              >
                Begin Your Journey →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="bg-gray-50 rounded-xl p-8 text-center">
        <h2
          className="text-2xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Inknut Antiqua, serif' }}
        >
          Continue Your Philosophical Exploration
        </h2>
        <p
          className="text-gray-600 mb-6"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          While we continue adding more destinations, explore the rich
          philosophical content already available. Discover the wisdom of{' '}
          <Link
            href="/places/ancient-rome"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Ancient Rome
          </Link>
          ,{' '}
          <Link
            href="/places/rhodes"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Rhodes
          </Link>
          , and other centers of ancient wisdom, or dive into{' '}
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            philosophical insights
          </Link>{' '}
          and{' '}
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            historical events
          </Link>{' '}
          that shaped these remarkable places.
        </p>

        {/* Quick Links to Existing Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link
            href="/places/ancient-rome"
            className="bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 text-center"
          >
            <div className="text-red-600 font-semibold text-sm mb-1">
              Available Now
            </div>
            <div className="text-gray-800 font-medium">Ancient Rome</div>
          </Link>
          <Link
            href="/places/rhodes"
            className="bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 text-center"
          >
            <div className="text-blue-600 font-semibold text-sm mb-1">
              Available Now
            </div>
            <div className="text-gray-800 font-medium">Rhodes</div>
          </Link>
          <Link
            href="/places/citium"
            className="bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 text-center"
          >
            <div className="text-green-600 font-semibold text-sm mb-1">
              Available Now
            </div>
            <div className="text-gray-800 font-medium">Citium</div>
          </Link>
          <Link
            href="/places/hierapolis"
            className="bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 text-center"
          >
            <div className="text-purple-600 font-semibold text-sm mb-1">
              Available Now
            </div>
            <div className="text-gray-800 font-medium">Hierapolis</div>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-6">
          <span>Coming Soon:</span>
          <span>• Alexandria</span>
          <span>• Pergamon</span>
          <span>• Tarsus</span>
          <span>• Babylon</span>
        </div>

        {/* Call to Action */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/mentors"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Meet Your Philosophical Mentors
          </Link>
          <Link
            href="/journal"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Start Your Philosophical Journey
          </Link>
        </div>
      </section>
    </div>
  )
}
