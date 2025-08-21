import {
  PhilosophicalPlace,
  PhilosophicalSchool,
  HistoricalSite,
  PlaceCategory,
  PlacesPageData,
} from '@/types/place'
import { placeImages } from './imageData'

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
      'Emotional resilience through reason',
    ],
    notableMembers: [
      'Zeno of Citium',
      'Cleanthes',
      'Chrysippus',
      'Diogenes of Babylon',
      'Antipater of Tarsus',
    ],
    location: 'Stoa Poikile (Painted Porch), Ancient Agora',
    description:
      'Founded around 300 BCE, the Stoic school taught that virtue is the only true good and that we should focus on what we can control while accepting what we cannot.',
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
      'Soul immortality and reincarnation',
    ],
    notableMembers: [
      'Plato',
      'Aristotle',
      'Speusippus',
      'Xenocrates',
      'Arcesilaus',
    ],
    location: 'Grove of Akademos, northwest of Athens',
    description:
      'The first institution of higher learning in the Western world, operating for nearly 900 years until 529 CE.',
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
      'Natural philosophy and biology',
    ],
    notableMembers: [
      'Aristotle',
      'Theophrastus',
      'Strato of Lampsacus',
      'Lyco of Troas',
      'Aristo of Ceos',
    ],
    location: 'Near the temple of Apollo Lykeios, east of Athens',
    description:
      'Known for its covered walkway (peripatos) where philosophers walked while teaching, giving rise to the term "peripatetic."',
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
      'Gods do not interfere in human affairs',
    ],
    notableMembers: [
      'Epicurus',
      'Metrodorus of Lampsacus',
      'Hermarchus',
      'Polyaenus',
      'Lucretius (Roman follower)',
    ],
    location: 'Private garden compound outside Athens',
    description:
      'A private philosophical community that welcomed women and slaves, emphasizing friendship and simple pleasures.',
  },
]

// Historical Sites Data
export const historicalSites: HistoricalSite[] = [
  {
    id: 'stoa-poikile',
    name: 'Stoa Poikile (Painted Porch)',
    type: 'stoa',
    period: '460-300 BCE',
    coordinates: { lat: 37.9755, lng: 23.7225 },
    description:
      'A covered walkway in the Ancient Agora decorated with paintings of mythological and historical scenes.',
    significance:
      'Birthplace of Stoic philosophy, where Zeno of Citium taught around 300 BCE.',
    currentStatus: 'Archaeological remains visible in Ancient Agora',
    visitingInfo: {
      accessible: true,
      museumNearby: 'Ancient Agora Museum',
      tourAvailable: true,
    },
  },
  {
    id: 'ancient-agora',
    name: 'Ancient Agora of Athens',
    type: 'agora',
    period: '6th century BCE - 6th century CE',
    coordinates: { lat: 37.9755, lng: 23.7225 },
    description:
      'The heart of ancient Athens, serving as marketplace, political center, and philosophical gathering place.',
    significance:
      'Where Socrates taught and many philosophical discussions took place in public.',
    currentStatus: 'Major archaeological site with museum',
    visitingInfo: {
      accessible: true,
      museumNearby: 'Ancient Agora Museum',
      tourAvailable: true,
    },
  },
  {
    id: 'academy-site',
    name: "Site of Plato's Academy",
    type: 'school',
    period: '387 BCE - 529 CE',
    coordinates: { lat: 37.9908, lng: 23.7033 },
    description:
      'The location of the first university in Western civilization, in the grove of Akademos.',
    significance:
      'Where Plato taught for 40 years and Aristotle studied for 20 years.',
    currentStatus: 'Archaeological park with some remains',
    visitingInfo: {
      accessible: true,
      museumNearby: 'National Archaeological Museum',
      tourAvailable: false,
    },
  },
  {
    id: 'lyceum-site',
    name: "Site of Aristotle's Lyceum",
    type: 'school',
    period: '335-86 BCE',
    coordinates: { lat: 37.9838, lng: 23.7425 },
    description:
      "Location of Aristotle's school with its famous covered walkway (peripatos).",
    significance:
      'Where Aristotle developed his systematic approach to knowledge and taught Alexander the Great.',
    currentStatus: 'Recently discovered archaeological remains',
    visitingInfo: {
      accessible: false,
      museumNearby: 'Byzantine and Christian Museum',
      tourAvailable: false,
    },
  },
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
    lng: 23.7225,
  },
  description:
    'The philosophical capital of the ancient world, where Western philosophy was born and flourished during the Classical and Hellenistic periods.',
  significance:
    'Birthplace of major philosophical schools including Stoicism, Platonism, Aristotelianism, and Epicureanism.',
  philosophicalImportance:
    'Athens created the intellectual environment that produced the foundational ideas of Western philosophy, particularly Stoicism which emerged from the political chaos following Alexander the Great.',
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
    'Cleanthes',
  ],
  relatedPlaces: ['ancient-rome', 'alexandria', 'rhodes'],
  modernRelevance:
    'Modern Athens preserves many archaeological sites where ancient philosophy was taught, offering visitors a direct connection to the birthplace of Western thought.',
  images: placeImages['ancient-athens'],
  visitingInfo: {
    accessible: true,
    bestTimeToVisit: 'April-June, September-October',
    nearbyMuseums: [
      'Ancient Agora Museum',
      'National Archaeological Museum',
      'Acropolis Museum',
      'Byzantine and Christian Museum',
    ],
    guidedTours: true,
    archaeologicalSites: [
      'Ancient Agora',
      'Acropolis',
      'Kerameikos Cemetery',
      'Academy Park',
      'Lyceum remains',
    ],
  },
  seo: {
    metaTitle:
      'Ancient Athens: The Philosophical Capital of the Classical World | The Stoic Way',
    metaDescription:
      "Discover ancient Athens' legendary philosophical schools - from the Stoic Stoa Poikile to Plato's Academy. Explore where Western philosophy was born.",
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
      'classical Athens',
    ],
    featuredSnippet: 'What made Athens the center of ancient philosophy?',
  },
  content: {
    introduction:
      'Ancient Athens stands as the undisputed philosophical capital of the classical world, where the foundations of Western thought were laid during the 5th and 4th centuries BCE. This remarkable city-state created the perfect conditions for philosophical inquiry: democratic governance that encouraged debate, economic prosperity that allowed leisure for contemplation, and a culture that valued wisdom and intellectual achievement. From the bustling Ancient Agora where Socrates questioned passersby to the serene groves where Plato taught his students, Athens provided the physical and intellectual spaces where philosophy could flourish.',

    historicalContext:
      "Athens reached its philosophical zenith during the Classical period (5th-4th century BCE), following its victory in the Persian Wars and the establishment of the Delian League. The city's democratic system, unique in the ancient world, fostered an environment of open debate and intellectual freedom. The wealth generated from trade and tribute allowed citizens the leisure necessary for philosophical contemplation. However, it was the political chaos following Alexander the Great's death in 323 BCE that created the conditions for Stoicism's emergence, as people sought inner stability amid external turmoil.",

    philosophicalSignificance:
      "Athens birthed the major schools of Hellenistic philosophy that would dominate Western thought for centuries. The city's unique contribution was creating institutional spaces for philosophical education - from Plato's Academy (387 BCE), the first university in history, to the Stoa Poikile where Zeno founded Stoicism (c. 300 BCE). These weren't just teaching venues but communities of inquiry that preserved and transmitted philosophical knowledge across generations.",

    majorSchools:
      "Four major philosophical schools defined Athens' intellectual landscape: Plato's Academy emphasized mathematical reasoning and the theory of Forms; Aristotle's Lyceum developed empirical observation and systematic classification; the Garden of Epicurus promoted pleasure and friendship as life's highest goods; and the Stoic school at the Stoa Poikile taught virtue as the only true good and emotional resilience through reason. Each school offered different answers to fundamental questions about how to live well.",

    keyLocations:
      "The Ancient Agora served as the beating heart of Athenian philosophical life, where Socrates conducted his famous dialogues and various schools maintained a presence. The Stoa Poikile, with its painted walls depicting mythological and historical scenes, became synonymous with Stoic philosophy. Plato's Academy occupied a grove northwest of the city, while Aristotle's Lyceum featured covered walkways perfect for peripatetic teaching. The Garden of Epicurus provided a private alternative to public philosophical spaces.",

    modernDay:
      "Today, visitors to Athens can walk through the same Ancient Agora where Socrates taught, see the reconstructed Stoa of Attalos that echoes the original Stoa Poikile, and visit the archaeological remains of these legendary schools. The Ancient Agora Museum houses artifacts from daily philosophical life, while the Academy Park preserves the approximate location of Plato's school. Modern Athens continues its philosophical tradition through universities and research centers that study ancient wisdom.",

    legacy:
      "Athens' philosophical legacy extends far beyond ancient history. The Socratic method of questioning remains fundamental to education and critical thinking. Plato's Academy provided the model for universities worldwide. Aristotelian logic and classification systems underpin modern science. Stoic philosophy, born in the Athenian Agora, continues to influence psychology, therapy, and personal development. The very concept of philosophy as a way of life, rather than mere academic exercise, originated in these Athenian schools and remains relevant today.",
  },
}

// Rhodes Data
export const rhodes: PhilosophicalPlace = {
  id: 'rhodes',
  name: 'Rhodes',
  slug: 'rhodes',
  city: 'Rhodes',
  country: 'Greece',
  region: 'Dodecanese',
  period: 'hellenistic',
  periodName: 'Hellenistic Period',
  dateRange: '3rd century BCE - 1st century CE',
  startYear: -300,
  endYear: 100,
  coordinates: {
    lat: 36.4341,
    lng: 28.2176,
  },
  description:
    'A strategic island between East and West that became a major center of philosophical learning, rhetoric, and cultural synthesis during the Hellenistic period.',
  significance:
    'Rhodes served as a crucial bridge between Greek and Roman intellectual traditions, hosting renowned schools of rhetoric that trained Roman elites and fostering the development of Stoic philosophy.',
  philosophicalImportance:
    "The island's independent status and commercial prosperity created an ideal environment for intellectual exchange, making it a preferred destination for Roman students seeking philosophical and rhetorical education.",
  keyFigures: [
    'Apollonius of Rhodes',
    'Dionysius Thrax',
    'Posidonius',
    'Cicero',
    'Julius Caesar',
  ],
  schools: ['rhodian-rhetoric', 'stoic-rhodes'],
  historicalSites: ['colossus-site', 'ancient-harbor', 'acropolis-rhodes'],
  content: {
    introduction:
      'Rhodes emerged as one of the most important intellectual centers of the ancient Mediterranean, strategically positioned between the Greek mainland and the eastern territories. Its unique location made it a natural meeting point for diverse philosophical traditions, while its political independence and economic prosperity provided the stability necessary for sustained intellectual development.',
    historicalContext:
      "Following Alexander the Great's conquests, Rhodes maintained its autonomy through skillful diplomacy, becoming a wealthy trading hub that attracted scholars, philosophers, and students from across the Mediterranean. The island's famous Colossus symbolized not only its material prosperity but also its cultural significance as a beacon of learning.",
    philosophicalLegacy:
      'Rhodes became particularly renowned for its schools of rhetoric, which combined Greek philosophical principles with practical training in public speaking. Many future Roman leaders, including Cicero and Julius Caesar, studied here, carrying Rhodian intellectual traditions back to Rome and helping to shape the philosophical landscape of the Roman Republic and Empire.',
  },
  seo: {
    metaTitle:
      'Rhodes - Island of Philosophers | Ancient Center of Learning | The Stoic Way',
    metaDescription:
      'Discover Rhodes, the strategic island that became a major center of philosophical learning and rhetoric in the ancient world. Explore where Roman elites studied Stoic philosophy.',
    keywords: [
      'Rhodes ancient philosophy',
      'Hellenistic philosophy',
      'ancient rhetoric schools',
      'Posidonius',
      'Cicero Rhodes',
      'ancient Greek islands',
      'philosophical tourism',
    ],
  },
  relatedPlaces: ['ancient-athens', 'ancient-rome', 'alexandria'],
  modernRelevance:
    'Modern Rhodes preserves significant archaeological remains and continues to attract visitors interested in ancient philosophy and rhetoric.',
  images: placeImages['rhodes'],
  visitingInfo: {
    accessible: true,
    bestTimeToVisit: 'April-June, September-October',
    nearbyMuseums: [
      'Archaeological Museum of Rhodes',
      'Palace of the Grand Master',
      'Museum of Modern Greek Art',
    ],
    guidedTours: true,
    archaeologicalSites: [
      'Ancient Rhodes Acropolis',
      'Ancient Harbor',
      'Colossus of Rhodes site',
    ],
  },
}

// Ancient Rome Data
export const ancientRome: PhilosophicalPlace = {
  id: 'ancient-rome',
  name: 'Ancient Rome',
  slug: 'ancient-rome',
  city: 'Rome',
  country: 'Italy',
  region: 'Lazio',
  period: 'imperial',
  periodName: 'Roman Imperial Period',
  dateRange: '1st century BCE - 3rd century CE',
  startYear: -100,
  endYear: 300,
  coordinates: {
    lat: 41.8919,
    lng: 12.5113,
  },
  description:
    'The imperial capital where Stoic philosophy reached its practical and political zenith, influencing emperors, senators, and the governance of the vast Roman Empire.',
  significance:
    'Rome transformed Stoicism from a Greek philosophical school into a practical system of ethics and governance that shaped imperial policy and Roman character for centuries.',
  philosophicalImportance:
    'As the center of Roman power, Rome provided the stage where Stoic principles were tested in the highest levels of government, military command, and public administration.',
  keyFigures: [
    'Seneca',
    'Marcus Aurelius',
    'Epictetus',
    'Cato the Younger',
    'Lucan',
    'Thrasea Paetus',
  ],
  schools: ['roman-stoicism', 'imperial-court'],
  historicalSites: [
    'forum-romanum',
    'palatine-hill',
    'campus-martius',
    'subura',
  ],
  content: {
    introduction:
      'Ancient Rome represents the culmination of Stoic philosophical development, where Greek theoretical principles met Roman practical governance. The eternal city provided the ultimate testing ground for Stoic ethics, as philosophers advised emperors, senators debated policy, and ordinary citizens sought guidance for daily life.',
    historicalContext:
      "From the late Republic through the height of the Empire, Rome attracted the greatest minds of the Mediterranean world. The city's forums, libraries, and imperial palaces became venues for philosophical discourse that would influence Western thought for millennia.",
    philosophicalLegacy:
      "Roman Stoicism, as developed in the imperial capital, emphasized duty, service, and practical wisdom. The philosophical writings produced here, from Seneca's letters to Marcus Aurelius' Meditations, continue to guide readers seeking meaning and purpose in their daily lives.",
  },
  seo: {
    metaTitle:
      'Ancient Rome - Imperial Center of Stoicism | Roman Philosophy | The Stoic Way',
    metaDescription:
      'Explore Ancient Rome, where Stoic philosophy reached its zenith in the imperial court. Discover the Forum, Palatine Hill, and places where Marcus Aurelius and Seneca lived.',
    keywords: [
      'Ancient Rome Stoicism',
      'Marcus Aurelius Rome',
      'Seneca Rome',
      'Roman Forum philosophy',
      'imperial Stoicism',
      'Roman philosophy sites',
    ],
  },
  relatedPlaces: ['ancient-athens', 'rhodes', 'cordoba'],
  modernRelevance:
    'Modern Rome preserves extensive archaeological remains where ancient Stoics lived and worked, offering visitors direct connection to imperial Stoic philosophy.',
  images: placeImages['ancient-rome'],
  visitingInfo: {
    accessible: true,
    bestTimeToVisit: 'April-June, September-November',
    nearbyMuseums: [
      'Capitoline Museums',
      'Roman National Museum',
      'Palazzo Altemps',
      'Baths of Diocletian',
    ],
    guidedTours: true,
    archaeologicalSites: [
      'Roman Forum',
      'Palatine Hill',
      'Campus Martius',
      'Baths of Caracalla',
    ],
  },
}

// Citium Data
export const citium: PhilosophicalPlace = {
  id: 'citium',
  name: 'Citium',
  slug: 'citium',
  city: 'Larnaca',
  country: 'Cyprus',
  region: 'Cyprus',
  period: 'hellenistic',
  periodName: 'Hellenistic Period',
  dateRange: '4th-3rd century BCE',
  startYear: -400,
  endYear: -200,
  coordinates: {
    lat: 34.9176,
    lng: 33.6291,
  },
  description:
    'The birthplace of Zeno of Citium, founder of Stoic philosophy, this ancient Phoenician trading city provided the multicultural environment that shaped early Stoic thought.',
  significance:
    "As Zeno's birthplace, Citium holds the distinction of being the origin point of Stoic philosophy, where the future founder was exposed to diverse philosophical and cultural traditions.",
  philosophicalImportance:
    "The cosmopolitan nature of this Phoenician trading center influenced Zeno's later development of Stoic cosmopolitanism and universal ethics.",
  keyFigures: ['Zeno of Citium'],
  schools: ['early-stoic-influences'],
  historicalSites: ['ancient-citium-ruins', 'phoenician-harbor'],
  content: {
    introduction:
      "Citium, modern-day Larnaca in Cyprus, was a thriving Phoenician trading city that gave birth to one of history's most influential philosophers. Zeno of Citium, born here around 334 BCE, would later found the Stoic school in Athens, but his philosophical outlook was fundamentally shaped by his multicultural upbringing in this cosmopolitan port city.",
    historicalContext:
      "As a major Phoenician settlement, Citium was a melting pot of cultures, religions, and philosophical ideas. The city's position as a trading hub brought together Greek, Phoenician, Egyptian, and Persian influences, creating an environment where young Zeno was exposed to diverse ways of thinking about ethics, politics, and human nature.",
    philosophicalLegacy:
      "The multicultural environment of Citium profoundly influenced Zeno's later philosophical development, particularly his emphasis on cosmopolitanism and universal human brotherhood that became central to Stoic ethics.",
  },
  seo: {
    metaTitle:
      'Citium, Cyprus - Birthplace of Zeno and Stoic Philosophy | The Stoic Way',
    metaDescription:
      'Discover Citium (modern Larnaca), the ancient Phoenician city where Zeno of Citium was born and first exposed to the diverse ideas that would shape Stoic philosophy.',
    keywords: [
      'Citium Cyprus',
      'Zeno of Citium birthplace',
      'ancient Cyprus',
      'Phoenician cities',
      'Stoic philosophy origins',
      'Larnaca archaeology',
    ],
  },
  relatedPlaces: ['ancient-athens', 'rhodes', 'ancient-rome'],
  modernRelevance:
    'Modern Larnaca preserves archaeological remains of ancient Citium and celebrates its connection to Stoic philosophy.',
  images: placeImages['citium'],
  visitingInfo: {
    accessible: true,
    bestTimeToVisit: 'March-May, September-November',
    nearbyMuseums: ['Larnaca Archaeological Museum', 'Pierides Museum'],
    guidedTours: true,
    archaeologicalSites: ['Ancient Citium ruins', 'Phoenician harbor remains'],
  },
}

// Seleucia on Tigris Data
export const seleuciaTigris: PhilosophicalPlace = {
  id: 'seleucia-tigris',
  name: 'Seleucia on Tigris',
  slug: 'seleucia-on-tigris',
  city: 'Tell Umar',
  country: 'Iraq',
  region: 'Mesopotamia',
  period: 'hellenistic',
  periodName: 'Hellenistic Period',
  dateRange: '3rd-2nd century BCE',
  startYear: -300,
  endYear: -100,
  coordinates: {
    lat: 33.0955,
    lng: 44.5814,
  },
  description:
    'The cosmopolitan birthplace of Diogenes of Babylon, this major Hellenistic city exemplified the cultural synthesis that influenced later Stoic development.',
  significance:
    'As the birthplace of Diogenes of Babylon, a prominent Stoic philosopher, Seleucia represents the eastern expansion of Hellenistic culture and its influence on Stoic thought.',
  philosophicalImportance:
    "The city's position as a major center of Hellenistic learning in Mesopotamia contributed to the cosmopolitan outlook that characterized later Stoic philosophy.",
  keyFigures: ['Diogenes of Babylon'],
  schools: ['hellenistic-synthesis'],
  historicalSites: ['seleucia-ruins', 'tigris-harbor'],
  content: {
    introduction:
      'Seleucia on Tigris was one of the greatest cities of the Hellenistic world, serving as the eastern capital of the Seleucid Empire. This cosmopolitan metropolis, located in modern-day Iraq, was the birthplace of Diogenes of Babylon, who would become one of the most important Stoic philosophers of the 2nd century BCE.',
    historicalContext:
      "Founded by Seleucus I Nicator around 305 BCE, Seleucia quickly grew to rival Alexandria and Antioch as a center of Hellenistic culture and learning. The city's position on the Tigris River made it a crucial link between the Greek world and the ancient civilizations of Mesopotamia, Persia, and India.",
    philosophicalLegacy:
      "The multicultural environment of Seleucia, where Greek, Mesopotamian, and Persian traditions intersected, profoundly influenced Diogenes of Babylon's philosophical outlook and contributed to the development of Stoic cosmopolitanism.",
  },
  seo: {
    metaTitle:
      'Seleucia on Tigris - Birthplace of Diogenes of Babylon | Hellenistic Philosophy | The Stoic Way',
    metaDescription:
      'Explore Seleucia on Tigris, the great Hellenistic city in Mesopotamia where Diogenes of Babylon was born and the cosmopolitan ideals of Stoicism were nurtured.',
    keywords: [
      'Seleucia Tigris',
      'Diogenes of Babylon',
      'Hellenistic cities',
      'ancient Mesopotamia',
      'Seleucid Empire',
      'ancient Iraq philosophy',
    ],
  },
  relatedPlaces: ['ancient-athens', 'rhodes', 'ancient-rome'],
  modernRelevance:
    'Archaeological excavations at Tell Umar continue to reveal the grandeur of this ancient cosmopolitan center.',
  images: placeImages['seleucia-tigris'],
  visitingInfo: {
    accessible: false,
    bestTimeToVisit: 'Currently not accessible due to regional conditions',
    nearbyMuseums: ['Iraq National Museum (Baghdad)'],
    guidedTours: false,
    archaeologicalSites: ['Tell Umar excavations'],
  },
}

// Hierapolis Data
export const hierapolis: PhilosophicalPlace = {
  id: 'hierapolis',
  name: 'Hierapolis',
  slug: 'hierapolis',
  city: 'Pamukkale',
  country: 'Turkey',
  region: 'Phrygia',
  period: 'imperial',
  periodName: 'Roman Imperial Period',
  dateRange: '1st-2nd century CE',
  startYear: 50,
  endYear: 200,
  coordinates: {
    lat: 37.9244,
    lng: 29.1211,
  },
  description:
    'The birthplace of Epictetus, this ancient religious center in Phrygia became associated with one of the most influential Stoic teachers of the Roman period.',
  significance:
    "As Epictetus' birthplace, Hierapolis represents the provincial origins of one of Stoicism's greatest teachers, whose influence extended throughout the Roman Empire.",
  philosophicalImportance:
    "The religious and multicultural environment of Hierapolis may have influenced Epictetus' later emphasis on spiritual discipline and inner freedom.",
  keyFigures: ['Epictetus'],
  schools: ['stoic-teaching'],
  historicalSites: ['hierapolis-ruins', 'ancient-theater', 'necropolis'],
  content: {
    introduction:
      'Hierapolis, located in ancient Phrygia (modern-day Pamukkale, Turkey), was a significant religious center known for its healing hot springs and diverse spiritual traditions. This city gained philosophical importance as the birthplace of Epictetus, one of the most influential Stoic teachers of the Roman period.',
    historicalContext:
      "Founded in the 2nd century BCE, Hierapolis became a major center of religious activity under Roman rule. The city's famous hot springs attracted visitors from across the empire seeking healing, while its position on major trade routes brought together diverse cultural and religious influences.",
    philosophicalLegacy:
      "Though Epictetus was born into slavery in Hierapolis and later taught in Rome and Nicopolis, his birthplace's religious atmosphere and multicultural environment may have contributed to his later emphasis on spiritual freedom and the discipline of desire.",
  },
  seo: {
    metaTitle:
      'Hierapolis, Phrygia - Birthplace of Epictetus | Ancient Stoic Sites | The Stoic Way',
    metaDescription:
      'Discover Hierapolis (Pamukkale), the ancient religious center in Phrygia where the great Stoic teacher Epictetus was born and first exposed to diverse spiritual traditions.',
    keywords: [
      'Hierapolis Turkey',
      'Epictetus birthplace',
      'Pamukkale ancient',
      'ancient Phrygia',
      'Roman period philosophy',
      'Stoic teachers',
    ],
  },
  relatedPlaces: ['ancient-athens', 'ancient-rome', 'rhodes'],
  modernRelevance:
    'Modern Pamukkale preserves the spectacular ruins of Hierapolis and continues to attract visitors to its famous travertine terraces and ancient sites.',
  images: placeImages['hierapolis'],
  visitingInfo: {
    accessible: true,
    bestTimeToVisit: 'April-June, September-October',
    nearbyMuseums: ['Hierapolis Archaeological Museum', 'Pamukkale Museum'],
    guidedTours: true,
    archaeologicalSites: [
      'Hierapolis ancient city',
      'Roman theater',
      'Necropolis',
      'Plutonium',
    ],
  },
}

// Córdoba Data
export const cordoba: PhilosophicalPlace = {
  id: 'cordoba',
  name: 'Córdoba',
  slug: 'cordoba',
  city: 'Córdoba',
  country: 'Spain',
  region: 'Andalusia',
  period: 'imperial',
  periodName: 'Roman Imperial Period',
  dateRange: '1st century BCE - 1st century CE',
  startYear: -100,
  endYear: 100,
  coordinates: {
    lat: 37.8882,
    lng: -4.7794,
  },
  description:
    "The ancestral home of the Seneca family, this prosperous Roman provincial city in Hispania produced one of Stoicism's most influential writers and political figures.",
  significance:
    "As the family seat of Seneca the Younger, Córdoba represents the provincial Roman culture that shaped one of Stoicism's most prolific and influential authors.",
  philosophicalImportance:
    "The provincial Roman environment of Córdoba, with its blend of local Iberian and Roman cultures, influenced the practical and accessible approach that characterized Seneca's Stoic writings.",
  keyFigures: ['Seneca the Elder', 'Seneca the Younger', 'Lucan'],
  schools: ['roman-provincial-culture'],
  historicalSites: ['roman-cordoba', 'seneca-family-sites'],
  content: {
    introduction:
      "Córdoba (ancient Corduba) was one of the most important cities in Roman Hispania, serving as the capital of Baetica province. This prosperous city became philosophically significant as the ancestral home of the Seneca family, which produced some of Rome's most important literary and philosophical figures.",
    historicalContext:
      "Founded by the Romans in 169 BCE, Córdoba quickly became a major center of Roman culture in Hispania. The city's wealth, derived from agriculture and mining, supported a sophisticated urban culture that attracted scholars, poets, and philosophers from across the empire.",
    philosophicalLegacy:
      "The Seneca family's roots in Córdoba influenced their approach to Stoic philosophy, emphasizing practical wisdom and ethical guidance that could be applied in the complex world of Roman politics and provincial administration.",
  },
  seo: {
    metaTitle:
      "Córdoba, Spain - Seneca's Ancestral Home | Roman Stoicism | The Stoic Way",
    metaDescription:
      'Explore Córdoba (ancient Corduba), the prosperous Roman city in Hispania that was the ancestral home of Seneca and shaped his approach to Stoic philosophy.',
    keywords: [
      'Córdoba Spain Roman',
      'Seneca family origins',
      'ancient Corduba',
      'Roman Hispania',
      'Seneca birthplace',
      'Roman provincial culture',
    ],
  },
  relatedPlaces: ['ancient-rome', 'ancient-athens', 'rhodes'],
  modernRelevance:
    'Modern Córdoba preserves significant Roman remains and celebrates its connection to Seneca and classical literature.',
  images: placeImages['cordoba'],
  visitingInfo: {
    accessible: true,
    bestTimeToVisit: 'March-May, September-November',
    nearbyMuseums: [
      'Archaeological Museum of Córdoba',
      'Julio Romero de Torres Museum',
    ],
    guidedTours: true,
    archaeologicalSites: [
      'Roman bridge',
      'Roman temple',
      'Archaeological remains of Corduba',
    ],
  },
}

// Helper functions
export function getPlaceBySlug(slug: string): PhilosophicalPlace | undefined {
  const places = {
    'ancient-athens': ancientAthens,
    rhodes: rhodes,
    'ancient-rome': ancientRome,
    citium: citium,
    'seleucia-on-tigris': seleuciaTigris,
    hierapolis: hierapolis,
    cordoba: cordoba,
  }
  return places[slug as keyof typeof places]
}

export function getAllPlaces(): PhilosophicalPlace[] {
  return [
    ancientAthens,
    rhodes,
    ancientRome,
    citium,
    seleuciaTigris,
    hierapolis,
    cordoba,
  ]
}

export function getSchoolById(
  schoolId: string
): PhilosophicalSchool | undefined {
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
        description:
          'Ancient cities that served as centers of philosophical learning',
        places: places.filter(place => place.period === 'classical'),
      },
    ],
    featuredPlaces: places,
  }
}
