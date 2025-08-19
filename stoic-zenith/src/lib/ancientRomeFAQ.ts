export interface AncientRomeFAQItem {
  question: string
  answer: string
  category: 'general' | 'stoicism' | 'emperors' | 'locations' | 'visiting'
  keyFigures?: string[]
  relatedSites?: string[]
  period?: string
}

export const ancientRomeFAQ: AncientRomeFAQItem[] = [
  // General Questions
  {
    question:
      'How did Stoicism develop differently in Rome compared to Greece?',
    answer:
      'Roman Stoicism evolved from Greek theoretical foundations into a highly practical philosophy focused on ethics, governance, and daily life. While Greek Stoics like Zeno and Chrysippus emphasized logic, physics, and theoretical ethics, Roman Stoics like Seneca, Epictetus, and Marcus Aurelius concentrated on applying philosophical principles to real-world challenges of politics, military command, and personal conduct. Roman Stoicism became more accessible, practical, and focused on character development and civic duty.',
    category: 'general',
    keyFigures: ['Seneca', 'Marcus Aurelius', 'Epictetus'],
    period: 'Roman Imperial Period (1st-3rd century CE)',
  },

  {
    question:
      'Why was Rome the perfect environment for Stoic philosophy to flourish?',
    answer:
      'Rome provided the ideal conditions for Stoic philosophy because it was a society built on duty, discipline, and service to the state—values that aligned perfectly with Stoic principles. The challenges of governing a vast empire, leading armies, and making complex political decisions created practical situations where Stoic teachings about virtue, wisdom, and emotional control proved invaluable. The Roman emphasis on character, honor, and civic responsibility resonated deeply with Stoic ideals.',
    category: 'general',
    keyFigures: ['Cato the Younger', 'Seneca', 'Marcus Aurelius'],
    relatedSites: ['Forum Romanum', 'Palatine Hill'],
    period: 'Roman Republic and Empire',
  },

  // Stoicism Questions
  {
    question: 'What role did Seneca play in Roman Stoicism?',
    answer:
      "Seneca the Younger (4 BCE - 65 CE) was one of the most influential Roman Stoic philosophers, serving as advisor to Emperor Nero while writing extensively on Stoic ethics. His letters, essays, and tragedies made Stoic philosophy accessible to educated Romans, emphasizing practical wisdom and moral development. Seneca's unique position as both philosopher and political figure exemplified the Roman integration of philosophical principles with public life, though his wealth and political involvement also created tensions with traditional Stoic ideals.",
    category: 'stoicism',
    keyFigures: ['Seneca', 'Nero'],
    relatedSites: ['Palatine Hill', 'Forum Romanum'],
    period: 'Early Imperial Period (1st century CE)',
  },

  {
    question: 'How did Marcus Aurelius apply Stoicism as emperor?',
    answer:
      "Marcus Aurelius (121-180 CE) was unique as both a Roman emperor and practicing Stoic philosopher. His 'Meditations,' written while campaigning on the frontier, reveal his daily struggle to apply Stoic principles to the enormous responsibilities of ruling an empire. He emphasized duty, justice, and service to the common good, viewing his imperial role as an opportunity to practice Stoic virtue on the largest possible scale. His reign demonstrated how Stoic philosophy could guide ethical leadership even in positions of absolute power.",
    category: 'stoicism',
    keyFigures: ['Marcus Aurelius'],
    relatedSites: ['Palatine Hill', 'Campus Martius'],
    period: 'High Imperial Period (2nd century CE)',
  },

  // Emperors Questions
  {
    question: 'Which Roman emperors were influenced by Stoicism?',
    answer:
      'Several Roman emperors were significantly influenced by Stoic philosophy. Marcus Aurelius was himself a practicing Stoic philosopher. Hadrian showed strong Stoic influences in his policies and personal conduct. Even Nero, despite his later excesses, was initially guided by Stoic principles through his advisor Seneca. Trajan and Antoninus Pius also demonstrated Stoic virtues in their governance, emphasizing duty, justice, and service to the empire. This imperial adoption of Stoic principles helped spread the philosophy throughout Roman society.',
    category: 'emperors',
    keyFigures: [
      'Marcus Aurelius',
      'Hadrian',
      'Nero',
      'Trajan',
      'Antoninus Pius',
    ],
    relatedSites: ['Palatine Hill'],
    period: 'Imperial Period (1st-2nd century CE)',
  },

  {
    question: 'How did Stoic philosophy influence Roman law and governance?',
    answer:
      "Stoic philosophy profoundly influenced Roman law and governance through its emphasis on natural law, universal justice, and rational decision-making. Stoic concepts of natural rights and universal human dignity contributed to the development of Roman legal principles that would later influence Western jurisprudence. Stoic-trained administrators and judges brought philosophical rigor to legal reasoning, while the Stoic emphasis on duty and service shaped the Roman ideal of public service that characterized the empire's most effective periods.",
    category: 'emperors',
    keyFigures: ['Marcus Aurelius', 'Seneca'],
    relatedSites: ['Forum Romanum', 'Palatine Hill'],
    period: 'Imperial Period',
  },

  // Locations Questions
  {
    question: 'What happened in the Roman Forum related to Stoicism?',
    answer:
      "The Roman Forum was the primary stage where Stoic principles met political reality. Senators like Cato the Younger delivered speeches demonstrating Stoic virtue and opposition to corruption. The Forum's basilicas and speaking platforms witnessed debates where Stoic-trained politicians applied philosophical principles to governance. The Curia, where the Senate met, became a particular focus of Stoic political philosophy as senators brought concepts of duty, rational decision-making, and service to their deliberations about imperial policy.",
    category: 'locations',
    keyFigures: ['Cato the Younger', 'Seneca'],
    relatedSites: ['Forum Romanum', 'Curia'],
    period: 'Late Republic and Imperial Period',
  },

  {
    question: 'Why was the Palatine Hill significant for Stoic philosophy?',
    answer:
      "The Palatine Hill, home to imperial palaces, became the ultimate testing ground for Stoic philosophy when it intersected with absolute power. Seneca served as advisor to Nero from the Palatine, attempting to guide imperial policy through Stoic principles. Marcus Aurelius wrote portions of his 'Meditations' while residing there, creating an intimate record of a ruler applying Stoic principles to governing an empire. The hill represented the complex relationship between philosophical ideals and political reality that characterized Roman Stoicism.",
    category: 'locations',
    keyFigures: ['Seneca', 'Marcus Aurelius', 'Nero'],
    relatedSites: ['Palatine Hill', 'Imperial Palaces'],
    period: 'Imperial Period',
  },

  {
    question:
      'What was the significance of the Campus Martius for Stoic values?',
    answer:
      "The Campus Martius embodied Stoic virtues of discipline, courage, and duty that became central to Roman character. As Rome's military training ground, it connected physical training with moral development, a key Stoic principle. Young Romans learned not only military skills but also philosophical foundations of service to the state. The Campus hosted public assemblies where Stoic philosophers could address large audiences about the relationship between individual virtue and collective welfare, helping spread Stoic ideals throughout Roman society.",
    category: 'locations',
    relatedSites: ['Campus Martius'],
    period: 'Roman Republic and Empire',
  },

  // Visiting Questions
  {
    question:
      'What can visitors see in Rome today related to ancient Stoicism?',
    answer:
      "Modern Rome preserves extensive archaeological remains where ancient Stoics lived and worked. The Roman Forum allows visitors to walk where Cato the Younger delivered speeches and senators debated policy guided by Stoic principles. The Palatine Hill contains ruins of imperial palaces where Seneca advised Nero and Marcus Aurelius wrote his 'Meditations.' The Capitoline Museums house artifacts and inscriptions that illuminate daily life in ancient Rome. These sites provide direct connection to the world where Stoic philosophy shaped both individual lives and imperial policy.",
    category: 'visiting',
    keyFigures: ['Marcus Aurelius', 'Seneca', 'Cato the Younger'],
    relatedSites: ['Roman Forum', 'Palatine Hill', 'Capitoline Museums'],
    period: 'Modern',
  },

  {
    question: 'How can modern visitors connect with Roman Stoic philosophy?',
    answer:
      'Visitors can connect with Roman Stoic philosophy by walking through the same spaces where ancient Stoics lived and worked. Standing in the Roman Forum, one can contemplate the same questions about duty, justice, and virtue that occupied ancient senators. The Palatine Hill offers opportunities to reflect on the challenges of leadership and power that Marcus Aurelius faced. Reading Stoic texts while visiting these sites creates a powerful connection between ancient wisdom and modern experience, allowing visitors to understand how philosophical principles were applied in real-world situations.',
    category: 'visiting',
    relatedSites: ['Roman Forum', 'Palatine Hill', 'Campus Martius'],
    period: 'Modern',
  },
]

// Helper functions
export function getAncientRomeFAQByCategory(
  category: AncientRomeFAQItem['category']
): AncientRomeFAQItem[] {
  return ancientRomeFAQ.filter(item => item.category === category)
}

export function getAllAncientRomeFAQ(): AncientRomeFAQItem[] {
  return ancientRomeFAQ
}

// Generate FAQ structured data for SEO
export function generateAncientRomeFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ancientRomeFAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
