export interface RhodesFAQItem {
  question: string
  answer: string
  category: 'general' | 'philosophy' | 'education' | 'locations' | 'visiting'
  keyFigures?: string[]
  relatedSites?: string[]
  period?: string
}

export const rhodesFAQ: RhodesFAQItem[] = [
  // General Questions
  {
    question: 'Why was Rhodes important in ancient philosophy?',
    answer:
      'Rhodes became a major center of philosophical learning due to its strategic location between East and West, political independence, and commercial prosperity. The island served as a bridge between Greek and Roman intellectual traditions, hosting renowned schools of rhetoric that combined philosophical principles with practical training. Its position as a major Mediterranean hub attracted scholars and students from across the ancient world, making it a crucial center for cultural synthesis and intellectual exchange.',
    category: 'general',
    keyFigures: ['Cicero', 'Julius Caesar', 'Posidonius'],
    relatedSites: ['Ancient Harbor', 'Acropolis of Rhodes'],
    period: 'Hellenistic Period (3rd century BCE - 1st century CE)',
  },

  {
    question: 'How did Rhodes maintain its independence in the ancient world?',
    answer:
      "Rhodes maintained its independence through skillful diplomacy, naval power, and economic strength. Unlike many Greek cities that fell under the control of Hellenistic kingdoms, Rhodes used its strategic position and commercial wealth to negotiate favorable relationships with major powers. The island's strong navy protected its trade routes, while its diplomatic corps skillfully balanced relationships between competing empires. This independence was crucial for intellectual freedom, allowing philosophers and teachers to pursue their work without political interference.",
    category: 'general',
    period: 'Hellenistic Period',
  },

  // Philosophy Questions
  {
    question: 'What role did Rhodes play in the development of Stoicism?',
    answer:
      "While Stoicism originated in Athens, Rhodes played a crucial role in its development and transmission to the Roman world. The island's schools of rhetoric and philosophy provided a bridge between Greek theoretical Stoicism and Roman practical application. Many future Roman leaders studied in Rhodes, where they encountered Stoic principles integrated with rhetorical training and political education. This Rhodian synthesis helped shape the distinctly Roman character of later Stoicism.",
    category: 'philosophy',
    keyFigures: ['Posidonius', 'Cicero'],
    relatedSites: ['Schools of Rhetoric'],
    period: 'Late Hellenistic Period',
  },

  {
    question: 'Who was Posidonius and what was his connection to Rhodes?',
    answer:
      'Posidonius (c. 135-51 BCE) was a prominent Stoic philosopher, scientist, and teacher who established a famous school in Rhodes. He was known for his synthesis of Stoic philosophy with scientific inquiry, studying everything from astronomy to geography. Posidonius taught many prominent Romans, including Cicero, and his approach to combining theoretical knowledge with practical application became characteristic of Rhodian education. His work helped bridge the gap between Greek philosophical traditions and Roman practical needs.',
    category: 'philosophy',
    keyFigures: ['Posidonius', 'Cicero'],
    relatedSites: ['Schools of Rhodes'],
    period: 'Late Hellenistic Period (2nd-1st century BCE)',
  },

  // Education Questions
  {
    question: 'What made Rhodian schools of rhetoric special?',
    answer:
      'Rhodian schools of rhetoric were renowned for combining Greek philosophical principles with practical training in public speaking and political leadership. Unlike purely theoretical philosophical schools, Rhodian institutions emphasized the integration of wisdom with eloquence, teaching students not only the techniques of oratory but also the ethical foundations that should guide public discourse. This practical approach attracted Roman elites who needed both intellectual sophistication and practical skills for political careers.',
    category: 'education',
    keyFigures: ['Cicero', 'Julius Caesar'],
    period: 'Hellenistic and Roman Periods',
  },

  {
    question: 'Which famous Romans studied in Rhodes?',
    answer:
      'Many prominent Romans studied in Rhodes, most notably Cicero and Julius Caesar. Cicero spent time there in his youth studying rhetoric and philosophy, which profoundly influenced his later philosophical works and political career. Julius Caesar also received part of his education in Rhodes, where he developed his understanding of leadership and governance. Other notable Roman students included various senators, generals, and future administrators who carried Rhodian intellectual traditions back to Rome.',
    category: 'education',
    keyFigures: ['Cicero', 'Julius Caesar'],
    relatedSites: ['Schools of Rhetoric'],
    period: 'Late Republic (2nd-1st century BCE)',
  },

  // Locations Questions
  {
    question: 'What was the significance of the Colossus of Rhodes?',
    answer:
      "The Colossus of Rhodes, one of the Seven Wonders of the Ancient World, symbolized more than just artistic achievement—it represented the island's cultural ambitions and intellectual significance. Built to commemorate Rhodes' successful defense against a siege, the statue embodied the triumph of wisdom and strategy over brute force. Though it stood for only about 60 years before being destroyed by an earthquake, the Colossus became a lasting symbol of the intellectual grandeur that Rhodes represented in the ancient world.",
    category: 'locations',
    relatedSites: ['Ancient Harbor', 'Colossus Site'],
    period: 'Hellenistic Period (280-226 BCE)',
  },

  {
    question: 'Where were the ancient schools located in Rhodes?',
    answer:
      'The ancient schools of Rhodes were likely located in the main city, near the harbor and agora where students and teachers could easily gather. While specific locations of individual schools are not precisely known, they would have been situated in areas accessible to both local residents and visiting students from across the Mediterranean. The schools probably occupied buildings near the commercial and civic centers, reflecting their integration with the practical life of the city.',
    category: 'locations',
    relatedSites: ['Ancient City Center', 'Harbor Area'],
    period: 'Hellenistic and Roman Periods',
  },

  // Visiting Questions
  {
    question:
      'What can visitors see in Rhodes today related to ancient philosophy?',
    answer:
      'Modern Rhodes preserves significant archaeological remains that connect visitors to its philosophical heritage. The ancient acropolis offers views over the harbor where the Colossus once stood and ships brought students from across the Mediterranean. The Archaeological Museum houses artifacts from daily life in the ancient city. While the original schools no longer exist, visitors can explore the ancient city walls, harbor installations, and foundations that formed the backdrop for philosophical education.',
    category: 'visiting',
    relatedSites: ['Archaeological Museum', 'Ancient Acropolis', 'Harbor'],
    period: 'Modern',
  },

  {
    question: 'How does modern Rhodes commemorate its philosophical heritage?',
    answer:
      "Modern Rhodes celebrates its philosophical heritage through its archaeological sites, museums, and cultural programs. The Archaeological Museum of Rhodes displays artifacts that illuminate ancient intellectual life, while the preserved medieval Old Town incorporates many ancient stones and foundations. The island continues to attract visitors interested in ancient philosophy and rhetoric, and various cultural events and educational programs highlight Rhodes' role in the development of Western thought.",
    category: 'visiting',
    relatedSites: ['Archaeological Museum', 'Old Town'],
    period: 'Modern',
  },
]

// Helper functions
export function getRhodesFAQByCategory(
  category: RhodesFAQItem['category']
): RhodesFAQItem[] {
  return rhodesFAQ.filter(item => item.category === category)
}

export function getAllRhodesFAQ(): RhodesFAQItem[] {
  return rhodesFAQ
}

// Generate FAQ structured data for SEO
export function generateRhodesFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rhodesFAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
