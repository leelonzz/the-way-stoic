import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlacesPageData } from '@/lib/placeData'
import { MapPin, Clock, BookOpen, Users } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Philosophical Places | Ancient Centers of Wisdom | The Stoic Way',
    description: 'Explore the ancient places where philosophy was born and flourished. From Athens\' Stoa Poikile to Rome\'s forums, discover the locations that shaped Western thought.',
    keywords: 'philosophical places, ancient Athens, Stoa Poikile, Plato Academy, philosophical destinations, ancient philosophy sites',
    openGraph: {
      title: 'Philosophical Places | Ancient Centers of Wisdom | The Stoic Way',
      description: 'Explore the ancient places where philosophy was born and flourished. From Athens\' Stoa Poikile to Rome\'s forums, discover the locations that shaped Western thought.',
      type: 'website',
      url: 'https://thewaystoic.site/places',
      siteName: 'The Stoic Way',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Philosophical Places | Ancient Centers of Wisdom',
      description: 'Explore the ancient places where philosophy was born and flourished.',
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
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Discover the ancient places where Western philosophy was born and flourished. 
          From the bustling agoras of Athens to the quiet gardens of contemplation, 
          explore the physical spaces that shaped human thought.
        </p>
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
            Explore the most significant places in the history of philosophy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPlaces.map(place => (
            <article key={place.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
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
                      <span>{place.city}, {place.country}</span>
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
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Figures:</h4>
                    <div className="flex flex-wrap gap-1">
                      {place.keyFigures.slice(0, 3).map((figure, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {figure}
                        </span>
                      ))}
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

      {/* Coming Soon */}
      <section className="bg-gray-50 rounded-xl p-8 text-center">
        <h2 
          className="text-2xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Inknut Antiqua, serif' }}
        >
          More Destinations Coming Soon
        </h2>
        <p 
          className="text-gray-600 mb-6"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          We're working on adding more philosophical destinations including Ancient Rome, 
          Alexandria, Rhodes, and other centers of ancient wisdom.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span>• Ancient Rome</span>
          <span>• Alexandria</span>
          <span>• Rhodes</span>
          <span>• Pergamon</span>
          <span>• Tarsus</span>
        </div>
      </section>
    </div>
  )
}
