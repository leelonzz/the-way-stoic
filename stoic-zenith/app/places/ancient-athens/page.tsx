import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPlaceBySlug } from '@/lib/placeData'
import { SmoothFAQ, type FAQItem } from '@/components/ui/smooth-faq'
import { getAllAncientAthensFAQ } from '@/lib/ancientAthensFAQ'
import { StickyTableOfContents } from '@/components/places/StickyTableOfContents'
import { generateAncientAthensFAQStructuredData } from '@/lib/ancientAthensFAQ'
import { MapPin, Clock, Users, BookOpen, ExternalLink } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const place = getPlaceBySlug('ancient-athens')

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
      url: 'https://thewaystoic.site/places/ancient-athens',
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
      canonical: 'https://thewaystoic.site/places/ancient-athens',
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

export default function AncientAthensPage() {
  const place = getPlaceBySlug('ancient-athens')
  const faqStructuredData = generateAncientAthensFAQStructuredData()

  // Transform FAQ data for SmoothFAQ component
  const faqItems: FAQItem[] = getAllAncientAthensFAQ().map(item => ({
    question: item.question,
    answer: item.answer,
    category: item.category,
    period: item.period,
    keyFigures: item.keyFigures,
    relatedEvents: item.relatedSites, // Map relatedSites to relatedEvents
  }))

  if (!place) {
    return <div>Place not found</div>
  }

  // Table of Contents data
  const tocItems = [
    {
      id: 'introduction',
      title: "Why Athens Became Philosophy's Birthplace",
      level: 2 as const,
    },
    {
      id: 'stoa-poikile',
      title: 'The Stoa Poikile - Birthplace of Stoicism',
      level: 2 as const,
    },
    {
      id: 'platos-academy',
      title: "Plato's Academy - The First University",
      level: 2 as const,
    },
    {
      id: 'aristotles-lyceum',
      title: "Aristotle's Lyceum - The Peripatetic School",
      level: 2 as const,
    },
    {
      id: 'garden-epicurus',
      title: 'The Garden of Epicurus - Philosophical Opposition',
      level: 2 as const,
    },
    {
      id: 'ancient-agora',
      title: 'The Agora - Philosophy in Public Space',
      level: 2 as const,
    },
    {
      id: 'comparative-analysis',
      title: 'Comparative Analysis of Schools',
      level: 2 as const,
    },
    {
      id: 'visiting-today',
      title: 'Visiting Ancient Sites Today',
      level: 2 as const,
    },
    { id: 'faq', title: 'Frequently Asked Questions', level: 2 as const },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: place.name,
    description: place.description,
    url: 'https://thewaystoic.site/places/ancient-athens',
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
    hasMap: 'https://maps.google.com/?q=Ancient+Agora+Athens',
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
              Ancient Athens
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-16">
          {/* Hero Image */}
          <div className="relative mb-8 rounded-lg overflow-hidden">
            <Image
              src={place.images.hero.src}
              alt={place.images.hero.alt}
              width={place.images.hero.width}
              height={place.images.hero.height}
              className="w-full h-[60vh] object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-sm opacity-90">{place.images.hero.caption}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inknut Antiqua, serif' }}
            >
              Ancient Athens: The Philosophical Capital of the Classical World
            </h1>
            <p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {place.description}
            </p>
          </div>

          {/* Key Information Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Period</h3>
                  <p className="text-gray-700">{place.dateRange}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-gray-700">
                    {place.city}, {place.country}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Schools</h3>
                  <p className="text-gray-700">
                    {place.schools.length} Major Schools
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Key Figures</h3>
                  <p className="text-gray-700">
                    {place.keyFigures.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
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
                Why Athens Became Philosophy's Birthplace
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

            {/* The Stoa Poikile */}
            <section id="stoa-poikile" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                The Stoa Poikile (Painted Porch) - Birthplace of Stoicism
              </h2>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Historical Significance and Architecture
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Stoa Poikile, constructed around 460 BCE, was a covered
                walkway in the Ancient Agora decorated with magnificent
                paintings depicting both mythological scenes and historical
                battles. Located on the north side of the agora, this
                architectural marvel featured a colonnade that provided shelter
                from sun and rain while creating an ideal space for
                philosophical discourse. The painted walls, which gave the stoa
                its name, included works by renowned artists like Polygnotos and
                depicted scenes from the Trojan War and the Battle of Marathon.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                The Stoic School's Foundation
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Around 300 BCE, Zeno of Citium began teaching at the Stoa
                Poikile after being shipwrecked and stranded in Athens. Unlike
                other philosophical schools that required fees or operated in
                private spaces, Zeno chose this public location, making Stoic
                philosophy accessible to all citizens. The daily gatherings
                attracted merchants, politicians, and ordinary Athenians,
                creating a diverse intellectual community. The school's emphasis
                on practical ethics and civic virtue perfectly matched the
                public nature of its location.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Visiting the Stoa Poikile Today
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                While the original Stoa Poikile no longer stands, visitors can
                explore its approximate location in the Ancient Agora
                archaeological site. The reconstructed Stoa of Attalos, now
                housing the Ancient Agora Museum, provides an excellent example
                of ancient stoa architecture and helps visitors visualize how
                the Painted Porch would have appeared. The museum contains
                artifacts from daily life in ancient Athens, including pottery
                and inscriptions that illuminate the world of the early Stoics.
              </p>
            </section>

            {/* Plato's Academy */}
            <section id="platos-academy" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Plato's Academy - The First University in History
              </h2>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Foundation and Historical Context
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Founded in 387 BCE in a grove dedicated to the hero Akademos,
                Plato's Academy was the first institution of higher learning in
                the Western world. Located northwest of Athens, the Academy
                operated continuously for nearly 900 years until Emperor
                Justinian closed it in 529 CE. The school featured gardens,
                lecture halls, and residential quarters where students could
                dedicate themselves entirely to philosophical study. Above the
                entrance, an inscription reportedly read "Let no one ignorant of
                geometry enter here," emphasizing the mathematical foundation of
                Platonic philosophy.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Academic Curriculum and Philosophy
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Academy's curriculum encompassed mathematics, dialectics,
                natural science, and ethics, with geometry serving as the
                foundation for all learning. Plato believed mathematical
                reasoning trained the mind for philosophical contemplation of
                eternal Forms. Students engaged in rigorous dialectical
                exercises, learning to question assumptions and pursue truth
                through reasoned argument. The Academy's method of collaborative
                inquiry, where students and teachers explored questions
                together, established the model for university education that
                persists today.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                The Academy's Influence and Legacy
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Academy's 900-year history produced countless influential
                thinkers, most notably Aristotle, who studied there for 20
                years. The institution's emphasis on systematic curriculum,
                scholarly research, and preservation of knowledge became the
                template for universities worldwide. Modern archaeological
                excavations at the Academy site have revealed lecture halls,
                gardens, and residential quarters, confirming ancient
                descriptions of this remarkable educational community. Today,
                the Academy Park preserves the approximate location where
                Western higher education began.
              </p>
            </section>

            {/* Aristotle's Lyceum */}
            <section id="aristotles-lyceum" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Aristotle's Lyceum - The Peripatetic School
              </h2>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Establishment and Physical Features
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Founded in 335 BCE near the temple of Apollo Lykeios,
                Aristotle's Lyceum was renowned for its covered walkway
                (peripatos) where the philosopher and his students would stroll
                while discussing complex topics. This peripatetic method of
                teaching gave the school its nickname and reflected Aristotle's
                belief that physical movement aided intellectual activity. The
                Lyceum featured extensive gardens, a library containing the
                first systematic collection of manuscripts, and research
                facilities where Aristotle conducted his groundbreaking studies
                in biology and natural philosophy.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Educational Approach and Contributions
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Lyceum operated on a dual system: morning lectures open to
                the public covered general topics, while afternoon sessions for
                advanced students delved into specialized research. Aristotle's
                empirical approach emphasized observation and classification,
                establishing methodologies that became foundational to modern
                science. The school produced comprehensive works on logic,
                ethics, politics, biology, and physics, many of which survived
                to influence medieval and Renaissance thought. This systematic
                approach to knowledge organization became a model for academic
                institutions throughout history.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Connection to Stoicism
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Although philosophically distinct from Stoicism, the Lyceum
                significantly influenced Stoic development, particularly in
                logic and natural philosophy. Aristotelian logical frameworks,
                including syllogistic reasoning, were adopted and refined by
                Stoic philosophers like Chrysippus. The Lyceum's emphasis on
                systematic classification and empirical observation complemented
                Stoic physics and their understanding of the natural world. Many
                concepts shared between the schools, such as the importance of
                virtue and the role of reason in human life, created productive
                philosophical dialogue in ancient Athens.
              </p>
            </section>

            {/* Garden of Epicurus */}
            <section id="garden-epicurus" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                The Garden of Epicurus - Philosophical Opposition
              </h2>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Foundation and Philosophy
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Established in 306 BCE, the Garden of Epicurus offered a radical
                alternative to other Athenian schools. Located in a private
                compound outside the city walls, the Garden welcomed women and
                slaves as equals, creating an inclusive philosophical community
                unprecedented in ancient Greece. Epicurus taught that pleasure
                (defined as the absence of pain and anxiety) was the highest
                good, directly opposing the Stoic emphasis on virtue. The Garden
                functioned as a self-sufficient community where members shared
                meals, participated in philosophical discussions, and cultivated
                deep friendships.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Contrast with Stoic Philosophy
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The philosophical differences between Epicureanism and Stoicism
                created vibrant intellectual debates in ancient Athens. While
                Stoics advocated active civic engagement and viewed virtue as
                the only true good, Epicureans promoted withdrawal from public
                life and the pursuit of ataraxia (tranquility) through simple
                pleasures. Stoics taught emotional control through reason, while
                Epicureans sought to eliminate fear and anxiety through
                understanding natural phenomena. These competing approaches to
                happiness and the good life enriched Athenian philosophical
                discourse and continue to influence modern thought.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Physical Location and Community
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Unlike the public spaces favored by other schools, the Garden's
                private setting reflected Epicurean values of withdrawal and
                contemplation. The compound featured residential quarters,
                gardens for growing food, and spaces for communal dining and
                discussion. Archaeological evidence suggests the Garden operated
                as a self-sustaining community where philosophical principles
                were lived daily. The garden setting itself held symbolic
                significance, representing the cultivation of wisdom and the
                natural simplicity that Epicureans valued over political
                ambition or material wealth.
              </p>
            </section>

            {/* The Agora */}
            <section id="ancient-agora" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                The Agora - Philosophy in Public Space
              </h2>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                The Heart of Athenian Democracy
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The Ancient Agora served as the beating heart of Athenian civic
                life, combining commercial, political, and intellectual
                functions in a single space. As both marketplace and meeting
                place, the agora embodied the democratic ideals that made
                philosophical inquiry possible. Citizens gathered here not only
                to buy goods and conduct business, but to participate in
                political discussions, attend trials, and engage in the kind of
                public discourse that Socrates made famous. The agora's open,
                accessible nature reflected Athens' commitment to democratic
                participation and intellectual freedom.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Philosophical Activities in the Agora
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Socrates famously conducted his philosophical inquiries
                throughout the agora, approaching citizens from all walks of
                life to examine their beliefs about virtue, justice, and the
                good life. The Stoa Poikile, where Stoicism was born, formed
                part of the agora's northern boundary, making Stoic philosophy
                accessible to anyone who visited the marketplace. Other
                philosophical schools also maintained a presence here, creating
                a vibrant intellectual ecosystem where different ideas could
                compete and interact. The agora thus became a laboratory for
                democratic discourse and philosophical investigation.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Important Structures for Philosophy
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Several key buildings in the agora supported philosophical
                activity: the Royal Stoa housed the Archon Basileus and served
                as a venue for legal and philosophical discussions; the Stoa of
                Zeus provided another covered space for teaching and debate; the
                Tholos, where the executive committee of the Council met,
                represented the democratic institutions that philosophers often
                analyzed; and the nearby Temple of Hephaestus, still standing
                today, reminded visitors of the religious context within which
                philosophy developed. These structures created a physical
                framework for the intersection of philosophy, politics, and
                daily life.
              </p>
            </section>

            {/* Comparative Analysis */}
            <section id="comparative-analysis" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Comparative Analysis of Athens' Philosophical Schools
              </h2>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Teaching Methods and Accessibility
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                The four major schools employed distinctly different approaches
                to education and accessibility. Plato's Academy operated as an
                exclusive institution requiring substantial fees and long-term
                commitment, attracting wealthy students who could afford years
                of study. Aristotle's Lyceum offered a more flexible system with
                public morning lectures and private afternoon sessions, making
                knowledge accessible to different social classes. The Stoic
                school at the Stoa Poikile was entirely public and free,
                reflecting its commitment to practical philosophy for all
                citizens. The Garden of Epicurus, while private, welcomed women
                and slaves, creating the most socially inclusive philosophical
                community in ancient Athens.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Philosophical Approaches and Legacy
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Each school's approach to philosophy reflected its founders'
                values and attracted different types of students. The Academy
                emphasized mathematical reasoning and abstract theory, producing
                philosophers and mathematicians who influenced intellectual
                development for centuries. The Lyceum's empirical methods and
                systematic classification laid foundations for modern science
                and scholarship. Stoicism's practical focus on ethics and
                emotional resilience created a philosophy that could guide daily
                life and political action. Epicureanism's emphasis on friendship
                and simple pleasure offered an alternative to public engagement,
                appealing to those seeking personal tranquility over civic
                involvement.
              </p>
            </section>

            {/* Visiting Today */}
            <section id="visiting-today" className="mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Visiting Ancient Philosophical Sites Today
              </h2>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Archaeological Sites and Museums
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Modern visitors can explore several well-preserved sites
                connected to ancient philosophy. The Ancient Agora
                archaeological site offers the most comprehensive experience,
                featuring the reconstructed Stoa of Attalos (which houses an
                excellent museum) and the remarkably preserved Temple of
                Hephaestus. The Academy Park preserves the approximate location
                of Plato's school with some archaeological remains and
                informative displays. Recent excavations have uncovered parts of
                Aristotle's Lyceum, though these are not yet fully accessible to
                the public. The National Archaeological Museum and Acropolis
                Museum contain artifacts that illuminate daily life in
                philosophical Athens.
              </p>

              <h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Modern Philosophy Tours and Education
              </h3>
              <p
                className="text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Several organizations offer specialized philosophical tours of
                Athens, combining historical sites with discussions of ancient
                ideas and their modern relevance. The American School of
                Classical Studies provides scholarly lectures and site visits
                for serious students of ancient philosophy. Various universities
                offer summer programs that include philosophical walks through
                ancient Athens. Online resources, including virtual reality
                reconstructions and digital archives, allow global audiences to
                explore these sites and their philosophical significance.
                Contemporary philosophical societies in Athens continue the
                tradition of public philosophical discussion, often meeting in
                locations connected to the ancient schools.
              </p>
            </section>

            {/* FAQ Section */}
            <section id="faq">
              <SmoothFAQ
                items={faqItems}
                title="Frequently Asked Questions"
                description="Common questions about Athens' philosophical heritage, answered with historical context and practical information for modern visitors."
                showMetadata={true}
                showBackground={true}
                maxWidth="800px"
                className="w-full py-16"
              />
            </section>

            {/* Additional Resources */}
            <section className="mb-12">
              <h2
                className="text-2xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inknut Antiqua, serif' }}
              >
                Additional Resources and Further Reading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Primary Sources
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0168"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Plato's Republic
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Perseus Digital Library (Tufts University)
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0178"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Aristotle's Nicomachean Ethics
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Perseus Digital Library
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://archive.org/details/dgnsl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Diogenes Laërtius' Lives of Eminent Philosophers
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Internet Archive Complete Edition
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A2008.01.0007"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Plutarch's Lives
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Perseus Digital Library
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Modern Resources
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://archaeologicalmuseums.gr/en/museum/5df34af3deca5e2d79e8c180"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ancient Agora Museum
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Official Museum Website
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://www.ascsa.edu.gr/excavations/athenian-agora"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          American School of Classical Studies
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Athenian Agora Excavations
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://plato.stanford.edu/entries/stoicism/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Stanford Encyclopedia: Stoicism
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Comprehensive Academic Article
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div>
                        <a
                          href="https://www.culture.gov.gr/en/service/SitePages/view.aspx?iID=2695"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Greek Ministry of Culture
                        </a>
                        <span className="text-gray-600">
                          {' '}
                          - Official Archaeological Sites Guide
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  )
}
