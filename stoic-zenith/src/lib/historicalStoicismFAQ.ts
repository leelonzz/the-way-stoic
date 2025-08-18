export interface HistoricalFAQItem {
  question: string
  answer: string
  category: 'hellenistic' | 'roman-republic' | 'roman-empire' | 'general'
  period?: string
  keyFigures?: string[]
  relatedEvents?: string[]
}

export const historicalStoicismFAQ: HistoricalFAQItem[] = [
  // General Historical Questions
  {
    question: 'When and where did Stoicism originate?',
    answer:
      'Stoicism was founded around 300 BCE in Athens by Zeno of Citium (334-262 BCE). The school got its name from the Stoa Poikile (Painted Porch) in the Athenian Agora, where Zeno taught. This was during the early Hellenistic period, following the death of Alexander the Great in 323 BCE, when the Greek world was experiencing unprecedented political fragmentation and uncertainty.',
    category: 'hellenistic',
    period: 'Early Hellenistic Period (323-146 BCE)',
    keyFigures: ['Zeno of Citium', 'Alexander the Great'],
    relatedEvents: ['Death of Alexander the Great', 'Diadochi Wars'],
  },
  {
    question: 'What historical events led to the creation of Stoic philosophy?',
    answer:
      "The Diadochi Wars (322-275 BCE) between Alexander the Great's successors created massive political instability across the Mediterranean. Traditional city-state structures collapsed, leaving individuals feeling powerless against larger forces. This chaos drove philosophers like Zeno to develop a philosophy focused on what individuals could control - their own thoughts, judgments, and responses - rather than external circumstances.",
    category: 'hellenistic',
    period: 'Hellenistic Period (323-146 BCE)',
    keyFigures: ['Zeno of Citium', "Alexander's Successors"],
    relatedEvents: ['Diadochi Wars', "Collapse of Alexander's Empire"],
  },
  {
    question:
      'How did the three main periods of Stoicism differ from each other?',
    answer:
      "The Hellenistic Period (323-146 BCE) saw Stoicism's birth and early development, focusing on logic, physics, and ethics as responses to political chaos. The Roman Republic Crisis (133-27 BCE) transformed Stoicism into a philosophy of political resistance and moral courage during civil wars. The Early Roman Empire (27 BCE-180 CE) represented Stoicism's peak influence, when it dominated Roman elite thought and produced works like Marcus Aurelius's Meditations.",
    category: 'general',
    keyFigures: [
      'Zeno of Citium',
      'Cato the Younger',
      'Marcus Aurelius',
      'Seneca',
      'Epictetus',
    ],
    relatedEvents: ['Diadochi Wars', 'Marian-Sullan Civil Wars', 'Pax Romana'],
  },

  // Hellenistic Period Questions
  {
    question: 'Who was Zeno of Citium and how did he found Stoicism?',
    answer:
      'Zeno of Citium (334-262 BCE) was a Phoenician merchant who became stranded in Athens after a shipwreck around 312 BCE. While there, he encountered the philosophy of Crates the Cynic and began developing his own philosophical system. He established his school at the Stoa Poikile around 300 BCE, teaching that virtue is the only true good and that we should focus on what we can control while accepting what we cannot.',
    category: 'hellenistic',
    period: 'Early Hellenistic Period',
    keyFigures: ['Zeno of Citium', 'Crates the Cynic'],
    relatedEvents: ["Zeno's shipwreck", 'Foundation of the Stoa'],
  },
  {
    question: 'What role did Diogenes of Babylon play in Stoic history?',
    answer:
      "Diogenes of Babylon (c. 230-150 BCE) was a crucial figure who led Stoicism during the decline of the Seleucid Empire. As head of the Stoic school, he was part of the famous 'Philosophical Embassy' to Rome in 155 BCE, along with representatives from other schools. This mission introduced Stoic philosophy directly to Roman aristocrats and marked the beginning of Stoicism's transformation from a Greek to a Roman philosophy.",
    category: 'hellenistic',
    period: 'Late Hellenistic Period',
    keyFigures: ['Diogenes of Babylon', 'Carneades', 'Critolaus'],
    relatedEvents: ['Philosophical Embassy to Rome', 'Seleucid Empire decline'],
  },

  // Roman Republic Crisis Questions
  {
    question:
      'How did the Marian-Sullan Civil Wars influence Stoic development?',
    answer:
      'The Marian-Sullan Civil Wars (88-82 BCE) were the first major internal conflicts of the Roman Republic, demonstrating the fragility of political institutions. These brutal conflicts reinforced core Stoic teachings about the unreliability of external goods like political power and the importance of maintaining virtue regardless of circumstances. The wars showed Romans that even their seemingly stable republic could collapse, making Stoic emphasis on inner resilience highly relevant.',
    category: 'roman-republic',
    period: 'Roman Republic Crisis (133-27 BCE)',
    keyFigures: ['Gaius Marius', 'Lucius Cornelius Sulla'],
    relatedEvents: ['Marian-Sullan Civil Wars', "Sulla's proscriptions"],
  },
  {
    question:
      "Why was Cato the Younger considered the ideal Stoic during the Republic's fall?",
    answer:
      "Marcus Porcius Cato the Younger (95-46 BCE) embodied Stoic principles during the Roman Republic's final crisis. He consistently opposed Julius Caesar's rise to power, not from personal ambition but from philosophical conviction about republican virtue. His dramatic suicide at Utica in 46 BCE, rather than submit to Caesar's clemency, became the ultimate example of Stoic commitment to principle over life itself. His actions inspired later Stoics and made him a symbol of resistance to tyranny.",
    category: 'roman-republic',
    period: 'Late Roman Republic',
    keyFigures: ['Cato the Younger', 'Julius Caesar', 'Cicero'],
    relatedEvents: [
      "Caesar's Civil War",
      'Battle of Thapsus',
      "Cato's suicide at Utica",
    ],
  },

  // Roman Empire Questions
  {
    question: 'How did Stoicism reach its peak during the Early Roman Empire?',
    answer:
      "During the Early Roman Empire (27 BCE-180 CE), Stoicism became the dominant philosophy among Roman elites. The Pax Romana provided stability that allowed philosophical reflection to flourish. Key figures like Seneca (advisor to Nero), Epictetus (former slave turned teacher), and Marcus Aurelius (philosopher-emperor) demonstrated Stoicism's applicability across all social levels. This period produced the most influential Stoic writings that survive today.",
    category: 'roman-empire',
    period: 'Early Roman Empire (27 BCE-180 CE)',
    keyFigures: ['Seneca', 'Epictetus', 'Marcus Aurelius', 'Augustus'],
    relatedEvents: [
      'Establishment of the Principate',
      'Pax Romana',
      'Reign of Marcus Aurelius',
    ],
  },
  {
    question:
      'What was the significance of Marcus Aurelius being both emperor and Stoic philosopher?',
    answer:
      "Marcus Aurelius (121-180 CE) was unique as the only philosopher-king in history, embodying Plato's ideal. His 'Meditations,' written during military campaigns, showed how Stoic principles could guide someone with ultimate power. His reign marked both the height of Stoic influence and, ironically, the beginning of its decline, as the empire faced increasing pressures from barbarian invasions and internal strife after his death.",
    category: 'roman-empire',
    period: 'High Roman Empire',
    keyFigures: ['Marcus Aurelius', 'Plato', 'Commodus'],
    relatedEvents: ['Marcomannic Wars', 'Antonine Plague', 'End of Pax Romana'],
  },
  {
    question:
      'How did political chaos in the Hellenistic period specifically create conditions for Stoicism?',
    answer:
      "After Alexander's death in 323 BCE, his empire fragmented into competing kingdoms ruled by his generals (the Diadochi). Traditional Greek city-states lost independence, becoming pawns in larger power struggles. Citizens could no longer rely on stable political institutions or civic participation for meaning and security. This created a demand for personal philosophies that could provide inner stability regardless of external political turmoil - exactly what Stoicism offered with its focus on individual virtue and emotional resilience.",
    category: 'hellenistic',
    period: 'Hellenistic Period (323-146 BCE)',
    keyFigures: [
      'Alexander the Great',
      'Ptolemy I',
      'Seleucus I',
      'Antigonus I',
    ],
    relatedEvents: [
      'Death of Alexander',
      'Diadochi Wars',
      'Battle of Ipsus',
      'Dissolution of city-state independence',
    ],
  },
  {
    question:
      "What specific events during the Roman Republic's crisis made Stoicism appealing to Romans?",
    answer:
      "The Social War (91-88 BCE), Marian-Sullan Civil Wars (88-82 BCE), and subsequent conflicts showed Romans that their republic was fragile. Traditional Roman values of honor, duty, and service to the state remained important, but political institutions were failing. Stoicism offered a way to maintain these values through personal virtue rather than political success. The philosophy's emphasis on duty, courage, and acceptance of fate resonated with Roman military culture while providing stability during chaos.",
    category: 'roman-republic',
    period: 'Roman Republic Crisis (133-27 BCE)',
    keyFigures: [
      'Gaius Marius',
      'Sulla',
      'Pompey',
      'Julius Caesar',
      'Cato the Younger',
    ],
    relatedEvents: [
      'Social War',
      'Marian-Sullan Civil Wars',
      'First Triumvirate',
      "Caesar's Civil War",
    ],
  },
  {
    question: "How did the Seleucid Empire's decline affect Stoic philosophy?",
    answer:
      "The Seleucid Empire's gradual collapse (from 200 BCE onward) created instability across the Eastern Mediterranean, where many Stoic schools operated. As Hellenistic kingdoms weakened, Greek intellectuals increasingly looked to Rome for patronage and stability. This migration of philosophers, including Stoics like Diogenes of Babylon, facilitated the transfer of Stoic ideas to Roman culture, where they would find their most influential expression.",
    category: 'hellenistic',
    period: 'Late Hellenistic Period',
    keyFigures: [
      'Diogenes of Babylon',
      'Antiochus III',
      'Antiochus IV Epiphanes',
    ],
    relatedEvents: [
      'Battle of Magnesia',
      'Seleucid decline',
      'Roman expansion eastward',
      'Philosophical Embassy to Rome',
    ],
  },
  {
    question:
      'What made the Early Roman Empire period ideal for Stoic philosophy?',
    answer:
      "The Early Roman Empire (27 BCE-180 CE) provided unprecedented peace and prosperity through the Pax Romana. This stability allowed for philosophical reflection and writing, while the empire's vast scale created a cosmopolitan environment that matched Stoic ideals of universal citizenship. The imperial system also created new ethical challenges about power and responsibility that Stoic philosophy was well-equipped to address, as seen in the works of Seneca (advisor to power) and Marcus Aurelius (wielder of absolute power).",
    category: 'roman-empire',
    period: 'Early Roman Empire (27 BCE-180 CE)',
    keyFigures: ['Augustus', 'Seneca', 'Epictetus', 'Marcus Aurelius'],
    relatedEvents: [
      'Battle of Actium',
      'Establishment of Principate',
      'Pax Romana',
      'Antonine Dynasty',
    ],
  },

  // Additional Historical Context Questions
  {
    question: 'How did the Battle of Actium (31 BCE) affect Stoic philosophy?',
    answer:
      "The Battle of Actium marked the end of the Roman Republic and the beginning of the Empire under Augustus. This transition created a new political reality where traditional republican virtues needed reinterpretation. Stoics had to adapt their philosophy to serve under autocratic rule rather than in a republic, leading to the development of ideas about duty to the state regardless of its form of government, as later exemplified by Seneca's service to Nero.",
    category: 'roman-empire',
    period: 'Transition to Roman Empire',
    keyFigures: ['Augustus', 'Mark Antony', 'Cleopatra', 'Seneca'],
    relatedEvents: [
      'Battle of Actium',
      'End of Roman Republic',
      'Beginning of Principate',
    ],
  },
  {
    question:
      'What was the Philosophical Embassy to Rome (155 BCE) and why was it significant?',
    answer:
      "In 155 BCE, Athens sent three philosophers to Rome as ambassadors: Diogenes of Babylon (Stoic), Carneades (Academic), and Critolaus (Peripatetic). They were negotiating a fine imposed on Athens, but their philosophical lectures captivated Roman audiences. This event marked the formal introduction of Greek philosophy to Roman elite culture and began Stoicism's transformation from a Greek to a Roman philosophy.",
    category: 'hellenistic',
    period: 'Late Hellenistic Period',
    keyFigures: [
      'Diogenes of Babylon',
      'Carneades',
      'Critolaus',
      'Cato the Elder',
    ],
    relatedEvents: [
      'Philosophical Embassy to Rome',
      'Roman conquest of Greece',
      'Cultural Hellenization of Rome',
    ],
  },
  {
    question:
      "How did the Antonine Plague (165-180 CE) influence Marcus Aurelius's Stoicism?",
    answer:
      "The Antonine Plague devastated the Roman Empire during Marcus Aurelius's reign, killing millions including possibly the emperor himself. This catastrophe deeply influenced his 'Meditations,' where he frequently reflects on death, impermanence, and accepting what cannot be controlled. The plague reinforced core Stoic teachings about the fragility of life and the importance of focusing on virtue rather than external circumstances.",
    category: 'roman-empire',
    period: 'High Roman Empire',
    keyFigures: ['Marcus Aurelius', 'Galen'],
    relatedEvents: [
      'Antonine Plague',
      'Marcomannic Wars',
      'Death of Marcus Aurelius',
    ],
  },
  {
    question:
      "Why did Stoicism decline after Marcus Aurelius's death in 180 CE?",
    answer:
      "Several factors contributed to Stoicism's decline: the end of the Pax Romana brought instability that made philosophical reflection less practical; the rise of Christianity offered competing answers to life's meaning; and the lack of major Stoic teachers after Marcus Aurelius meant the tradition lost intellectual leadership. The empire's increasing focus on survival rather than philosophical excellence also reduced demand for Stoic education among elites.",
    category: 'roman-empire',
    period: 'Late Roman Empire',
    keyFigures: ['Marcus Aurelius', 'Commodus', 'Early Christian Fathers'],
    relatedEvents: [
      'Death of Marcus Aurelius',
      'Crisis of the Third Century',
      'Rise of Christianity',
      'End of Antonine Dynasty',
    ],
  },
]

// Helper function to get FAQ data by category
export function getHistoricalFAQByCategory(
  category: HistoricalFAQItem['category']
): HistoricalFAQItem[] {
  return historicalStoicismFAQ.filter(item => item.category === category)
}

// Helper function to get all FAQ data
export function getAllHistoricalFAQ(): HistoricalFAQItem[] {
  return historicalStoicismFAQ
}

// Helper function to generate FAQ structured data for SEO
export function generateHistoricalFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: historicalStoicismFAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
