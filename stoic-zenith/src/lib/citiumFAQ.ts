export interface CitiumFAQItem {
  question: string
  answer: string
  category: 'general' | 'zeno' | 'culture' | 'philosophy' | 'visiting'
  keyFigures?: string[]
  relatedSites?: string[]
  period?: string
}

export const citiumFAQ: CitiumFAQItem[] = [
  // General Questions
  {
    question: 'Why is Citium important in the history of philosophy?',
    answer:
      "Citium (modern Larnaca, Cyprus) is crucial to philosophical history as the birthplace of Zeno of Citium, the founder of Stoic philosophy. The multicultural environment of this ancient Phoenician trading city profoundly shaped Zeno's philosophical outlook, particularly his emphasis on cosmopolitanism and universal human brotherhood. The diverse cultural influences Zeno encountered in Citium became foundational to Stoic ethics and the concept of natural law that would influence Western thought for centuries.",
    category: 'general',
    keyFigures: ['Zeno of Citium'],
    relatedSites: ['Ancient Citium ruins', 'Phoenician harbor'],
    period: '4th-3rd century BCE',
  },

  {
    question: 'What was Citium like in ancient times?',
    answer:
      "Ancient Citium was a thriving Phoenician trading city and major Mediterranean port that served as a melting pot of cultures. The city brought together Phoenicians, Greeks, Egyptians, Persians, and other peoples in a cosmopolitan environment centered around maritime commerce. This multicultural setting featured temples to various deities, bustling markets, and constant interaction between people of different backgrounds, creating the diverse intellectual environment that shaped young Zeno's worldview.",
    category: 'general',
    relatedSites: ['Ancient harbor', 'Phoenician temples'],
    period: 'Classical and Hellenistic periods',
  },

  // Zeno Questions
  {
    question: "How did Zeno's upbringing in Citium influence Stoic philosophy?",
    answer:
      "Zeno's upbringing in Citium's multicultural environment fundamentally shaped Stoic philosophy in several ways. The city's diversity taught him to look for universal truths that transcended cultural boundaries, leading to the Stoic emphasis on natural law and cosmopolitanism. The practical, adaptable nature of Phoenician merchant culture influenced Stoicism's focus on practical wisdom over theoretical speculation. Most importantly, witnessing successful cooperation between people of different backgrounds convinced Zeno that universal ethical principles must exist to make such harmony possible.",
    category: 'zeno',
    keyFigures: ['Zeno of Citium'],
    period: '4th century BCE',
  },

  {
    question: "What do we know about Zeno's family and early life in Citium?",
    answer:
      "Zeno was born around 334 BCE into a merchant family in Citium, giving him direct exposure to the international trade that characterized the city. His father was likely involved in the purple dye trade, a major Phoenician industry. Growing up in a merchant household, Zeno would have been familiar with the practical challenges of dealing with people from different cultures and the importance of adaptability and resilience—qualities that later became central to Stoic philosophy. His early exposure to diverse philosophical and religious traditions in Citium's cosmopolitan environment laid the groundwork for his later philosophical synthesis.",
    category: 'zeno',
    keyFigures: ['Zeno of Citium'],
    relatedSites: ['Ancient Citium commercial district'],
    period: '4th century BCE',
  },

  // Culture Questions
  {
    question: 'How did Phoenician culture influence early Stoicism?',
    answer:
      "Phoenician culture significantly influenced early Stoicism through its emphasis on practical wisdom, adaptability, and cosmopolitan outlook. Phoenicians were renowned for their ability to work successfully with people from different cultures, a skill essential for Mediterranean trade. This cultural adaptability became reflected in Stoic teachings about accepting what cannot be changed and finding common ground with all humanity. The Phoenician focus on practical problem-solving over theoretical speculation also shaped Stoicism's emphasis on applied ethics and real-world wisdom.",
    category: 'culture',
    keyFigures: ['Zeno of Citium'],
    period: 'Ancient period',
  },

  {
    question: 'What role did trade and commerce play in shaping Stoic ideas?',
    answer:
      'Trade and commerce in Citium played a crucial role in shaping Stoic ideas about human nature and ethics. The constant interaction between merchants from different cultures demonstrated that despite surface differences, all humans shared common needs, emotions, and aspirations. This observation became central to Stoic ethics and the concept of universal human brotherhood. The practical challenges of international trade also emphasized the importance of virtues like honesty, reliability, and fair dealing—values that became fundamental to Stoic moral philosophy.',
    category: 'culture',
    relatedSites: ['Ancient harbor', 'Commercial districts'],
    period: 'Classical and Hellenistic periods',
  },

  // Philosophy Questions
  {
    question:
      'What is the connection between Citium and Stoic cosmopolitanism?',
    answer:
      "Citium's multicultural environment directly inspired Stoic cosmopolitanism—the idea that all humans are citizens of a single world community. Zeno's famous declaration that he was a 'citizen of the world' (kosmopolites) reflected his upbringing in Citium's international community. Unlike Greeks from more homogeneous city-states, Zeno grew up thinking of himself as part of a larger human community that transcended local loyalties. This cosmopolitan perspective became one of Stoicism's most distinctive and influential features, influencing later concepts of universal human rights and international law.",
    category: 'philosophy',
    keyFigures: ['Zeno of Citium'],
    period: 'Hellenistic period',
  },

  {
    question: "How did Citium's religious diversity influence Stoic theology?",
    answer:
      'The religious diversity of Citium, with temples to Phoenician, Greek, and other deities, influenced Stoic theology by encouraging Zeno to look for universal spiritual truths that transcended particular religious traditions. This exposure to different ways of understanding the divine contributed to the Stoic concept of a rational, universal divine principle (Logos) that governs the cosmos. Rather than favoring one particular religious tradition, Stoicism developed a philosophical theology that could accommodate diverse spiritual perspectives while emphasizing reason and virtue as the path to understanding divine will.',
    category: 'philosophy',
    keyFigures: ['Zeno of Citium'],
    relatedSites: ['Ancient temples'],
    period: 'Hellenistic period',
  },

  // Visiting Questions
  {
    question:
      'What can visitors see in modern Larnaca related to ancient Citium?',
    answer:
      "Modern Larnaca preserves several archaeological remains of ancient Citium that connect visitors to Zeno's birthplace. The Larnaca Archaeological Museum displays artifacts from the ancient city, including Phoenician inscriptions and Greek pottery that illustrate the multicultural environment where Zeno grew up. Excavations near the city center reveal foundations of ancient buildings and harbor installations. The Pierides Museum also contains important artifacts from ancient Cyprus, providing context for understanding the island's ancient cultures.",
    category: 'visiting',
    relatedSites: ['Larnaca Archaeological Museum', 'Ancient Citium ruins'],
    period: 'Modern',
  },

  {
    question:
      'How does modern Larnaca reflect its ancient philosophical heritage?',
    answer:
      "Modern Larnaca continues to reflect its ancient philosophical heritage through its role as an international crossroads and its multicultural character. The city's modern airport and port facilities echo the cosmopolitan nature that shaped Zeno's philosophical vision over two millennia ago. Visitors can walk through the harbor area and imagine the bustling ancient port where young Zeno first encountered the diversity of human cultures that inspired Stoic cosmopolitanism. The city celebrates its connection to Stoic philosophy through cultural programs and educational initiatives.",
    category: 'visiting',
    period: 'Modern',
  },

  {
    question:
      "What is the best way to understand Zeno's early influences while visiting Cyprus?",
    answer:
      "To understand Zeno's early influences while visiting Cyprus, visitors should explore both the archaeological remains and the modern multicultural environment of Larnaca. Start with the Archaeological Museum to see artifacts from ancient Citium, then walk through the old harbor area to imagine the ancient port's cosmopolitan atmosphere. Consider the island's position at the crossroads of Europe, Asia, and Africa, and how this geographic location created the cultural diversity that shaped Zeno's worldview. Reading Stoic texts while experiencing Cyprus's continued role as a cultural meeting point provides insight into how place shapes philosophical thought.",
    category: 'visiting',
    keyFigures: ['Zeno of Citium'],
    relatedSites: ['Archaeological sites', 'Harbor area'],
    period: 'Modern',
  },
]

// Helper functions
export function getCitiumFAQByCategory(
  category: CitiumFAQItem['category']
): CitiumFAQItem[] {
  return citiumFAQ.filter(item => item.category === category)
}

export function getAllCitiumFAQ(): CitiumFAQItem[] {
  return citiumFAQ
}

// Generate FAQ structured data for SEO
export function generateCitiumFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: citiumFAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
