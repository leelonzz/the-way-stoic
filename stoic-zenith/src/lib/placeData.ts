import { PhilosophicalPlace, PhilosophicalSchool, HistoricalSite, PlaceCategory, PlacesPageData } from '@/types/place'

// Philosophical Schools Data
export const philosophicalSchools: PhilosophicalSchool[] = [
  {
    id: 'stoic-school',
    name: 'Stoic School',
    founder: 'Zeno of Citium',
    foundedYear: -300,
    philosophy: 'Stoicism',
    keyTeachings: [
      'Virtue is the only true good',
      'Focus on what you can control',
      'Accept what you cannot change',
      'Live according to nature',
      'Emotional resilience through reason'
    ],
    notableMembers: [
      'Zeno of Citium',
      'Cleanthes',
      'Chrysippus',
      'Diogenes of Babylon',
      'Antipater of Tarsus'
    ],
    location: 'Stoa Poikile (Painted Porch), Ancient Agora',
    description: 'Founded around 300 BCE, the Stoic school taught that virtue is the only true good and that we should focus on what we can control while accepting what we cannot.'
  },
  {
    id: 'academy',
    name: "Plato's Academy",
    founder: 'Plato',
    foundedYear: -387,
    philosophy: 'Platonism',
    keyTeachings: [
      'Theory of Forms',
      'Philosopher-kings should rule',
      'Knowledge through dialectic',
      'Mathematics as foundation of reality',
      'Soul immortality and reincarnation'
    ],
    notableMembers: [
      'Plato',
      'Aristotle',
      'Speusippus',
      'Xenocrates',
      'Arcesilaus'
    ],
    location: 'Grove of Akademos, northwest of Athens',
    description: 'The first institution of higher learning in the Western world, operating for nearly 900 years until 529 CE.'
  },
  {
    id: 'lyceum',
    name: "Aristotle's Lyceum",
    founder: 'Aristotle',
    foundedYear: -335,
    philosophy: 'Aristotelianism (Peripatetic)',
    keyTeachings: [
      'Empirical observation and classification',
      'Logic and syllogistic reasoning',
      'Ethics of the golden mean',
      'Politics and constitutional theory',
      'Natural philosophy and biology'
    ],
    notableMembers: [
      'Aristotle',
      'Theophrastus',
      'Strato of Lampsacus',
      'Lyco of Troas',
      'Aristo of Ceos'
    ],
    location: 'Near the temple of Apollo Lykeios, east of Athens',
    description: 'Known for its covered walkway (peripatos) where philosophers walked while teaching, giving rise to the term "peripatetic."'
  },
  {
    id: 'garden-epicurus',
    name: 'Garden of Epicurus',
    founder: 'Epicurus',
    foundedYear: -306,
    philosophy: 'Epicureanism',
    keyTeachings: [
      'Pleasure as the highest good',
      'Ataraxia (tranquility of mind)',
      'Friendship as greatest pleasure',
      'Death is nothing to us',
      'Gods do not interfere in human affairs'
    ],
    notableMembers: [
      'Epicurus',
      'Metrodorus of Lampsacus',
      'Hermarchus',
      'Polyaenus',
      'Lucretius (Roman follower)'
    ],
    location: 'Private garden compound outside Athens',
    description: 'A private philosophical community that welcomed women and slaves, emphasizing friendship and simple pleasures.'
  }
]

// Historical Sites Data
export const historicalSites: HistoricalSite[] = [
  {
    id: 'stoa-poikile',
    name: 'Stoa Poikile (Painted Porch)',
    type: 'stoa',
    period: '460-300 BCE',
    coordinates: { lat: 37.9755, lng: 23.7225 },
    description: 'A covered walkway in the Ancient Agora decorated with paintings of mythological and historical scenes.',
    significance: 'Birthplace of Stoic philosophy, where Zeno of Citium taught around 300 BCE.',
    currentStatus: 'Archaeological remains visible in Ancient Agora',
    visitingInfo: {
      accessible: true,
      museumNearby: 'Ancient Agora Museum',
      tourAvailable: true
    }
  },
  {
    id: 'ancient-agora',
    name: 'Ancient Agora of Athens',
    type: 'agora',
    period: '6th century BCE - 6th century CE',
    coordinates: { lat: 37.9755, lng: 23.7225 },
    description: 'The heart of ancient Athens, serving as marketplace, political center, and philosophical gathering place.',
    significance: 'Where Socrates taught and many philosophical discussions took place in public.',
    currentStatus: 'Major archaeological site with museum',
    visitingInfo: {
      accessible: true,
      museumNearby: 'Ancient Agora Museum',
      tourAvailable: true
    }
  },
  {
    id: 'academy-site',
    name: 'Site of Plato\'s Academy',
    type: 'school',
    period: '387 BCE - 529 CE',
    coordinates: { lat: 37.9908, lng: 23.7033 },
    description: 'The location of the first university in Western civilization, in the grove of Akademos.',
    significance: 'Where Plato taught for 40 years and Aristotle studied for 20 years.',
    currentStatus: 'Archaeological park with some remains',
    visitingInfo: {
      accessible: true,
      museumNearby: 'National Archaeological Museum',
      tourAvailable: false
    }
  },
  {
    id: 'lyceum-site',
    name: 'Site of Aristotle\'s Lyceum',
    type: 'school',
    period: '335-86 BCE',
    coordinates: { lat: 37.9838, lng: 23.7425 },
    description: 'Location of Aristotle\'s school with its famous covered walkway (peripatos).',
    significance: 'Where Aristotle developed his systematic approach to knowledge and taught Alexander the Great.',
    currentStatus: 'Recently discovered archaeological remains',
    visitingInfo: {
      accessible: false,
      museumNearby: 'Byzantine and Christian Museum',
      tourAvailable: false
    }
  }
]

// Ancient Athens Data
export const ancientAthens: PhilosophicalPlace = {
  id: 'ancient-athens',
  name: 'Ancient Athens',
  slug: 'ancient-athens',
  city: 'Athens',
  country: 'Greece',
  region: 'Attica',
  period: 'classical',
  periodName: 'Classical Period',
  dateRange: '5th-4th century BCE',
  startYear: -500,
  endYear: -300,
  coordinates: {
    lat: 37.9755,
    lng: 23.7225
  },
  description: 'The philosophical capital of the ancient world, where Western philosophy was born and flourished during the Classical and Hellenistic periods.',
  significance: 'Birthplace of major philosophical schools including Stoicism, Platonism, Aristotelianism, and Epicureanism.',
  philosophicalImportance: 'Athens created the intellectual environment that produced the foundational ideas of Western philosophy, particularly Stoicism which emerged from the political chaos following Alexander the Great.',
  schools: philosophicalSchools,
  sites: historicalSites,
  keyFigures: [
    'Socrates',
    'Plato',
    'Aristotle',
    'Zeno of Citium',
    'Epicurus',
    'Diogenes of Babylon',
    'Chrysippus',
    'Cleanthes'
  ],
  relatedPlaces: ['ancient-rome', 'alexandria', 'rhodes'],
  modernRelevance: 'Modern Athens preserves many archaeological sites where ancient philosophy was taught, offering visitors a direct connection to the birthplace of Western thought.',
  visitingInfo: {
    accessible: true,
    bestTimeToVisit: 'April-June, September-October',
    nearbyMuseums: [
      'Ancient Agora Museum',
      'National Archaeological Museum',
      'Acropolis Museum',
      'Byzantine and Christian Museum'
    ],
    guidedTours: true,
    archaeologicalSites: [
      'Ancient Agora',
      'Acropolis',
      'Kerameikos Cemetery',
      'Academy Park',
      'Lyceum remains'
    ]
  },
  seo: {
    metaTitle: 'Ancient Athens: The Philosophical Capital of the Classical World | The Stoic Way',
    metaDescription: 'Discover ancient Athens\' legendary philosophical schools - from the Stoic Stoa Poikile to Plato\'s Academy. Explore where Western philosophy was born.',
    keywords: [
      'ancient Athens philosophy',
      'Stoa Poikile',
      'Plato Academy',
      'Aristotle Lyceum',
      'birthplace of Stoicism',
      'ancient Greek philosophy',
      'philosophical schools Athens',
      'Zeno of Citium',
      'ancient Agora',
      'classical Athens'
    ],
    featuredSnippet: 'What made Athens the center of ancient philosophy?'
  },
  content: {
    introduction: 'Ancient Athens stands as the undisputed philosophical capital of the classical world, where the foundations of Western thought were laid during the 5th and 4th centuries BCE. This remarkable city-state created the perfect conditions for philosophical inquiry: democratic governance that encouraged debate, economic prosperity that allowed leisure for contemplation, and a culture that valued wisdom and intellectual achievement. From the bustling Ancient Agora where Socrates questioned passersby to the serene groves where Plato taught his students, Athens provided the physical and intellectual spaces where philosophy could flourish.',

    historicalContext: 'Athens reached its philosophical zenith during the Classical period (5th-4th century BCE), following its victory in the Persian Wars and the establishment of the Delian League. The city\'s democratic system, unique in the ancient world, fostered an environment of open debate and intellectual freedom. The wealth generated from trade and tribute allowed citizens the leisure necessary for philosophical contemplation. However, it was the political chaos following Alexander the Great\'s death in 323 BCE that created the conditions for Stoicism\'s emergence, as people sought inner stability amid external turmoil.',

    philosophicalSignificance: 'Athens birthed the major schools of Hellenistic philosophy that would dominate Western thought for centuries. The city\'s unique contribution was creating institutional spaces for philosophical education - from Plato\'s Academy (387 BCE), the first university in history, to the Stoa Poikile where Zeno founded Stoicism (c. 300 BCE). These weren\'t just teaching venues but communities of inquiry that preserved and transmitted philosophical knowledge across generations.',

    majorSchools: 'Four major philosophical schools defined Athens\' intellectual landscape: Plato\'s Academy emphasized mathematical reasoning and the theory of Forms; Aristotle\'s Lyceum developed empirical observation and systematic classification; the Garden of Epicurus promoted pleasure and friendship as life\'s highest goods; and the Stoic school at the Stoa Poikile taught virtue as the only true good and emotional resilience through reason. Each school offered different answers to fundamental questions about how to live well.',

    keyLocations: 'The Ancient Agora served as the beating heart of Athenian philosophical life, where Socrates conducted his famous dialogues and various schools maintained a presence. The Stoa Poikile, with its painted walls depicting mythological and historical scenes, became synonymous with Stoic philosophy. Plato\'s Academy occupied a grove northwest of the city, while Aristotle\'s Lyceum featured covered walkways perfect for peripatetic teaching. The Garden of Epicurus provided a private alternative to public philosophical spaces.',

    modernDay: 'Today, visitors to Athens can walk through the same Ancient Agora where Socrates taught, see the reconstructed Stoa of Attalos that echoes the original Stoa Poikile, and visit the archaeological remains of these legendary schools. The Ancient Agora Museum houses artifacts from daily philosophical life, while the Academy Park preserves the approximate location of Plato\'s school. Modern Athens continues its philosophical tradition through universities and research centers that study ancient wisdom.',

    legacy: 'Athens\' philosophical legacy extends far beyond ancient history. The Socratic method of questioning remains fundamental to education and critical thinking. Plato\'s Academy provided the model for universities worldwide. Aristotelian logic and classification systems underpin modern science. Stoic philosophy, born in the Athenian Agora, continues to influence psychology, therapy, and personal development. The very concept of philosophy as a way of life, rather than mere academic exercise, originated in these Athenian schools and remains relevant today.'
  }
}

// Helper functions
export function getPlaceBySlug(slug: string): PhilosophicalPlace | undefined {
  // For now, we only have Ancient Athens
  if (slug === 'ancient-athens') {
    return ancientAthens
  }
  return undefined
}

export function getAllPlaces(): PhilosophicalPlace[] {
  return [ancientAthens]
}

export function getSchoolById(schoolId: string): PhilosophicalSchool | undefined {
  return philosophicalSchools.find(school => school.id === schoolId)
}

export function getSiteById(siteId: string): HistoricalSite | undefined {
  return historicalSites.find(site => site.id === siteId)
}

export function getPlacesPageData(): PlacesPageData {
  const places = getAllPlaces()

  return {
    categories: [
      {
        id: 'classical-cities',
        name: 'Classical Cities',
        slug: 'classical-cities',
        description: 'Ancient cities that served as centers of philosophical learning',
        places: places.filter(place => place.period === 'classical')
      }
    ],
    featuredPlaces: places
  }
}
