export interface EventFAQItem {
  question: string
  answer: string
  category:
    | 'historical-context'
    | 'stoic-influence'
    | 'key-figures'
    | 'legacy'
    | 'general'
  keyFigures?: string[]
  relatedConcepts?: string[]
}

export interface EventFAQData {
  eventId: string
  faqs: EventFAQItem[]
}

// FAQ data for specific events
export const eventSpecificFAQs: EventFAQData[] = [
  // Diadochi Wars FAQs
  {
    eventId: 'diadochi-wars',
    faqs: [
      {
        question: 'What were the Diadochi Wars and why were they significant?',
        answer:
          "The Diadochi Wars (322-275 BCE) were a series of conflicts between Alexander the Great's successors (the 'Diadochi' meaning 'successors' in Greek) for control of his vast empire. These wars created unprecedented political instability across the Mediterranean world, fragmenting the unified Hellenistic empire into competing kingdoms. This chaos directly contributed to the birth of Stoicism, as people sought philosophical frameworks for finding inner peace amid external turmoil.",
        category: 'historical-context',
        keyFigures: [
          'Alexander the Great',
          'Ptolemy I',
          'Seleucus I',
          'Antigonus I',
          'Cassander',
        ],
        relatedConcepts: [
          'Political fragmentation',
          'Hellenistic kingdoms',
          'Philosophical response to chaos',
        ],
      },
      {
        question:
          'How did the Diadochi Wars directly influence the creation of Stoic philosophy?',
        answer:
          "The political chaos of the Diadochi Wars created conditions that made Stoic philosophy both necessary and appealing. Traditional city-state structures collapsed, leaving individuals feeling powerless against larger political forces. Zeno of Citium, who founded Stoicism around 300 BCE, developed a philosophy that emphasized what individuals could control - their thoughts, judgments, and responses - rather than external political circumstances. This practical approach to finding stability amid chaos became Stoicism's defining characteristic.",
        category: 'stoic-influence',
        keyFigures: ['Zeno of Citium', 'Cleanthes', 'Chrysippus'],
        relatedConcepts: [
          'Individual agency',
          'Control vs. acceptance',
          'Inner stability',
          'Practical philosophy',
        ],
      },
      {
        question:
          'Who were the main Diadochi and how did their conflicts shape the ancient world?',
        answer:
          "The primary Diadochi included Ptolemy I (who established the Ptolemaic Kingdom in Egypt), Seleucus I (founder of the Seleucid Empire), Antigonus I (who controlled much of Asia Minor), and Cassander (who ruled Macedonia). Their 50-year struggle for supremacy (322-275 BCE) permanently fragmented Alexander's empire, creating a multipolar world where no single power dominated. This fragmentation fostered cultural exchange and philosophical innovation, as ideas could spread across multiple kingdoms rather than being controlled by a single imperial authority.",
        category: 'key-figures',
        keyFigures: [
          'Ptolemy I',
          'Seleucus I',
          'Antigonus I',
          'Cassander',
          'Lysimachus',
        ],
        relatedConcepts: [
          'Hellenistic kingdoms',
          'Cultural diffusion',
          'Political decentralization',
        ],
      },
      {
        question:
          'What was the long-term impact of the Diadochi Wars on philosophy and culture?',
        answer:
          "The Diadochi Wars fundamentally transformed the ancient world's intellectual landscape. The collapse of unified political authority created space for new philosophical schools like Stoicism, Epicureanism, and Skepticism to emerge and compete. The resulting Hellenistic kingdoms became centers of learning and cultural exchange, with places like Alexandria, Pergamon, and Antioch rivaling Athens as intellectual centers. This decentralized cultural environment allowed philosophical ideas to develop and spread more freely than under a single imperial system.",
        category: 'legacy',
        keyFigures: ['Zeno of Citium', 'Epicurus', 'Pyrrho of Elis'],
        relatedConcepts: [
          'Philosophical pluralism',
          'Cultural centers',
          'Intellectual freedom',
          'Hellenistic philosophy',
        ],
      },
      {
        question:
          'How did ordinary people experience the chaos of the Diadochi Wars?',
        answer:
          "For ordinary citizens, the Diadochi Wars meant constant uncertainty, changing rulers, and economic disruption. Cities changed hands multiple times, trade routes were disrupted, and traditional social structures broke down. This instability created a demand for personal philosophies that could provide guidance and stability regardless of external political circumstances. Stoicism's emphasis on virtue, emotional resilience, and focusing on what one could control directly addressed these concerns, making it appealing to people seeking practical wisdom for navigating uncertain times.",
        category: 'historical-context',
        keyFigures: ['Common citizens', 'Merchants', 'Soldiers'],
        relatedConcepts: [
          'Social disruption',
          'Economic uncertainty',
          'Personal philosophy',
          'Practical wisdom',
        ],
      },
    ],
  },

  // Catiline Conspiracy FAQs
  {
    eventId: 'catiline-conspiracy',
    faqs: [
      {
        question:
          'What was the Catiline Conspiracy and why did it threaten the Roman Republic?',
        answer:
          "The Catiline Conspiracy (63 BCE) was a plot by Lucius Sergius Catilina to overthrow the Roman government through violence, including plans to assassinate senators and burn Rome. Led by a disgraced aristocrat facing financial ruin, the conspiracy represented the growing instability of the late Roman Republic. The plot's exposure by Cicero demonstrated both the fragility of republican institutions and the power of oratory and moral courage in defending them - themes that would deeply influence Stoic political philosophy.",
        category: 'historical-context',
        keyFigures: [
          'Lucius Sergius Catilina',
          'Marcus Tullius Cicero',
          'Gaius Julius Caesar',
          'Marcus Porcius Cato',
        ],
        relatedConcepts: [
          'Republican crisis',
          'Political violence',
          'Moral courage',
          'Institutional fragility',
        ],
      },
      {
        question:
          "How did Cicero's response to the Catiline Conspiracy embody Stoic principles?",
        answer:
          "Cicero's handling of the Catiline Conspiracy exemplified key Stoic virtues: courage in facing danger, justice in defending the state, wisdom in gathering evidence, and temperance in using power responsibly. His famous Catiline Orations demonstrated the Stoic belief that virtue should guide political action, even at personal risk. Though not formally a Stoic, Cicero's conduct during this crisis became a model for how Stoic principles could be applied to public service and civic duty.",
        category: 'stoic-influence',
        keyFigures: ['Marcus Tullius Cicero', 'Marcus Porcius Cato'],
        relatedConcepts: [
          'Civic virtue',
          'Moral courage',
          'Public service',
          'Stoic politics',
        ],
      },
      {
        question:
          'What role did Cato the Younger play in the Catiline Conspiracy?',
        answer:
          "Cato the Younger played a crucial role in the Senate's response to the Catiline Conspiracy, advocating for the death penalty for the captured conspirators. His uncompromising stance on justice and his willingness to prioritize the state's welfare over personal relationships exemplified Stoic principles in action. Cato's moral authority and reputation for incorruptibility gave weight to the Senate's decisions, demonstrating how Stoic virtue could provide leadership during political crises.",
        category: 'key-figures',
        keyFigures: [
          'Marcus Porcius Cato',
          'Marcus Tullius Cicero',
          'Gaius Julius Caesar',
        ],
        relatedConcepts: [
          'Moral authority',
          'Stoic virtue',
          'Political leadership',
          'Uncompromising justice',
        ],
      },
      {
        question:
          'How did the Catiline Conspiracy influence later Stoic thinking about politics?',
        answer:
          'The Catiline Conspiracy became a touchstone for Stoic political philosophy, demonstrating both the importance of civic engagement and the challenges of maintaining virtue in politics. Later Stoics like Seneca and Marcus Aurelius would reference this crisis when discussing the tension between philosophical ideals and political realities. The conspiracy showed that Stoic principles could be practically applied to defend republican institutions, but also highlighted the personal costs of political virtue.',
        category: 'legacy',
        keyFigures: ['Seneca', 'Marcus Aurelius', 'Epictetus'],
        relatedConcepts: [
          'Political philosophy',
          'Civic engagement',
          'Virtue in politics',
          'Republican ideals',
        ],
      },
      {
        question:
          'What does the Catiline Conspiracy teach us about the relationship between personal virtue and public service?',
        answer:
          "The Catiline Conspiracy illustrates the Stoic principle that personal virtue must guide public action, even when facing significant risks. Cicero and Cato's responses showed that maintaining moral integrity in politics requires courage, wisdom, and a willingness to sacrifice personal interests for the common good. The crisis demonstrated that individual virtue can have profound public consequences, reinforcing the Stoic belief that personal character development serves not just the individual but society as a whole.",
        category: 'stoic-influence',
        keyFigures: ['Marcus Tullius Cicero', 'Marcus Porcius Cato'],
        relatedConcepts: [
          'Personal virtue',
          'Public service',
          'Moral integrity',
          'Common good',
        ],
      },
    ],
  },

  // Marcus Aurelius Reign FAQs
  {
    eventId: 'marcus-aurelius-reign',
    faqs: [
      {
        question:
          'How did Marcus Aurelius balance being both emperor and philosopher?',
        answer:
          "Marcus Aurelius uniquely embodied Plato's ideal of the philosopher-king, applying Stoic principles to imperial governance. His 'Meditations,' written during military campaigns, show how he used Stoic practices like morning reflection and evening review to maintain philosophical perspective while wielding absolute power. He approached imperial duties as exercises in virtue, viewing challenges like the Antonine Plague and Marcomannic Wars as opportunities to practice Stoic resilience and service to the common good.",
        category: 'stoic-influence',
        keyFigures: ['Marcus Aurelius', 'Plato', 'Epictetus'],
        relatedConcepts: [
          'Philosopher-king',
          'Stoic governance',
          'Power and virtue',
          'Practical philosophy',
        ],
      },
      {
        question:
          'What were the major challenges Marcus Aurelius faced during his reign?',
        answer:
          "Marcus Aurelius confronted unprecedented challenges: the devastating Antonine Plague (165-180 CE) that killed millions across the empire, the Marcomannic Wars against Germanic tribes threatening the Danube frontier, internal rebellions including Avidius Cassius's revolt, and economic strain from constant warfare. These crises tested both his Stoic philosophy and imperial leadership, demonstrating how philosophical principles could guide decision-making during existential threats to the empire.",
        category: 'historical-context',
        keyFigures: [
          'Marcus Aurelius',
          'Avidius Cassius',
          'Germanic tribal leaders',
        ],
        relatedConcepts: [
          'Imperial crisis',
          'Plague management',
          'Military leadership',
          'Economic challenges',
        ],
      },
      {
        question:
          "How did the Antonine Plague influence Marcus Aurelius's Stoic philosophy?",
        answer:
          "The Antonine Plague profoundly shaped Marcus Aurelius's philosophical reflections, as seen throughout his 'Meditations.' The pandemic reinforced core Stoic teachings about impermanence, the fragility of life, and the importance of accepting what cannot be controlled. His writings during this period emphasize memento mori (remembrance of death), the interconnectedness of all things, and the duty to serve others even in the face of personal loss. The plague became a practical laboratory for applying Stoic principles to extreme adversity.",
        category: 'stoic-influence',
        keyFigures: ['Marcus Aurelius', 'Galen'],
        relatedConcepts: [
          'Memento mori',
          'Impermanence',
          'Acceptance',
          'Service to others',
          'Adversity as teacher',
        ],
      },
      {
        question:
          "What is the lasting significance of Marcus Aurelius's 'Meditations'?",
        answer:
          "The 'Meditations' represent the unique perspective of absolute power guided by philosophical principle. Written as personal notes during military campaigns, they offer insights into how Stoic philosophy can be practically applied to leadership, decision-making, and personal growth. The work's enduring influence stems from its authentic voice - not a theoretical treatise but the real-time philosophical reflections of someone facing enormous responsibilities and challenges. It remains one of the most accessible and practical guides to Stoic philosophy.",
        category: 'legacy',
        keyFigures: ['Marcus Aurelius'],
        relatedConcepts: [
          'Philosophical leadership',
          'Personal reflection',
          'Practical Stoicism',
          'Authentic voice',
        ],
      },
      {
        question:
          "How did Marcus Aurelius's death mark the end of the Pax Romana?",
        answer:
          "Marcus Aurelius's death in 180 CE marked the end of the Pax Romana and the beginning of imperial decline. His son Commodus abandoned Stoic principles for tyrannical rule, reversing his father's policies and philosophical approach to governance. The contrast between father and son demonstrated how personal character affects political leadership. Marcus Aurelius's death also marked the end of Stoicism's peak influence in Roman politics, as subsequent emperors lacked both his philosophical commitment and moral authority.",
        category: 'legacy',
        keyFigures: ['Marcus Aurelius', 'Commodus', 'Pertinax'],
        relatedConcepts: [
          'End of Pax Romana',
          'Imperial decline',
          'Character and leadership',
          'Philosophical governance',
        ],
      },
    ],
  },
]

// Helper functions
export function getEventFAQs(eventId: string): EventFAQItem[] {
  const eventFAQ = eventSpecificFAQs.find(faq => faq.eventId === eventId)
  return eventFAQ ? eventFAQ.faqs : []
}

export function getEventFAQsByCategory(
  eventId: string,
  category: EventFAQItem['category']
): EventFAQItem[] {
  const faqs = getEventFAQs(eventId)
  return faqs.filter(faq => faq.category === category)
}

export function generateEventFAQStructuredData(eventId: string) {
  const faqs = getEventFAQs(eventId)

  if (faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}