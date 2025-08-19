export interface AncientAthensFAQItem {
  question: string
  answer: string
  category: 'general' | 'stoicism' | 'schools' | 'locations' | 'visiting'
  keyFigures?: string[]
  relatedSites?: string[]
  period?: string
}

export const ancientAthensFAQ: AncientAthensFAQItem[] = [
  // General Questions
  {
    question: "Why did philosophy flourish in ancient Athens?",
    answer: "Athens became the center of ancient philosophy due to a unique combination of factors: its democratic system encouraged open debate and intellectual freedom; economic prosperity from trade and tribute provided citizens with leisure time for contemplation; the city's cultural values emphasized wisdom and intellectual achievement; and its position as a major Mediterranean hub attracted thinkers from across the Greek world. The Athenian agora provided public spaces for philosophical discussion, while wealthy patrons supported philosophical schools.",
    category: "general",
    keyFigures: ["Pericles", "Socrates", "Plato", "Aristotle"],
    relatedSites: ["Ancient Agora", "Acropolis"],
    period: "5th-4th century BCE"
  },
  {
    question: "What made Athens the center of ancient philosophy?",
    answer: "Athens became philosophy's epicenter through its democratic culture that valued debate, economic prosperity that allowed intellectual leisure, and strategic location that attracted scholars from across the Mediterranean. The city's unique institutions - from the democratic assembly to the gymnasium - created spaces for philosophical inquiry. Most importantly, Athens produced a continuous tradition of philosophical teaching, from Socrates to his student Plato, to Plato's student Aristotle, creating an intellectual dynasty that attracted students worldwide.",
    category: "general",
    keyFigures: ["Socrates", "Plato", "Aristotle", "Zeno of Citium"],
    relatedSites: ["Ancient Agora", "Academy", "Lyceum"],
    period: "Classical Period"
  },
  {
    question: "Which philosophical school was most influential in Athens?",
    answer: "While all four major schools were influential, Plato's Academy had the longest-lasting impact, operating for nearly 900 years (387 BCE - 529 CE). However, each school contributed uniquely: the Academy established the model for higher education; the Lyceum developed systematic scientific methods; the Stoa created practical philosophy for daily life; and the Garden offered alternative approaches to happiness. For Stoicism specifically, the Stoa Poikile was crucial as the birthplace of this enduring philosophical tradition.",
    category: "schools",
    keyFigures: ["Plato", "Aristotle", "Zeno of Citium", "Epicurus"],
    relatedSites: ["Academy", "Lyceum", "Stoa Poikile", "Garden of Epicurus"],
    period: "Classical and Hellenistic periods"
  },

  // Stoicism-specific Questions
  {
    question: "Where did Stoic philosophy originate in Athens?",
    answer: "Stoic philosophy originated at the Stoa Poikile (Painted Porch) in the Ancient Agora of Athens around 300 BCE. Zeno of Citium began teaching there after being shipwrecked and stranded in Athens. The Stoa Poikile was a covered walkway decorated with paintings of mythological and historical scenes, providing shelter for philosophical discussions. The name 'Stoic' literally comes from 'stoa,' meaning porch or covered walkway, making this location integral to the philosophy's identity.",
    category: "stoicism",
    keyFigures: ["Zeno of Citium", "Cleanthes", "Chrysippus"],
    relatedSites: ["Stoa Poikile", "Ancient Agora"],
    period: "Early Hellenistic Period (300 BCE)"
  },
  {
    question: "How did the Stoa Poikile influence Stoic philosophy?",
    answer: "The Stoa Poikile profoundly shaped Stoic philosophy both practically and symbolically. Practically, its public location in the agora meant Stoicism developed as a philosophy for active civic life, not withdrawn contemplation. The painted scenes on its walls - depicting both mythological heroes and historical battles - reinforced Stoic themes of virtue, courage, and accepting fate. Symbolically, the covered walkway represented protection from life's storms while remaining engaged with the world, perfectly embodying the Stoic ideal of inner tranquility amid external challenges.",
    category: "stoicism",
    keyFigures: ["Zeno of Citium", "Cleanthes"],
    relatedSites: ["Stoa Poikile", "Ancient Agora"],
    period: "Hellenistic Period"
  },
  {
    question: "What was daily life like for ancient philosophy students in Athens?",
    answer: "Philosophy students in Athens lived in vibrant intellectual communities. At the Academy, students studied mathematics, dialectic, and natural philosophy, often staying for decades. Lyceum students participated in morning lectures for the public and afternoon discussions for advanced students, walking the covered pathways (peripatos) while learning. Stoic students gathered daily at the Stoa Poikile for discussions about ethics and practical wisdom. The Garden of Epicurus functioned as a residential community where students lived together, sharing meals and philosophical conversations. Most schools charged fees, though some offered scholarships for promising students.",
    category: "schools",
    keyFigures: ["Plato", "Aristotle", "Zeno of Citium", "Epicurus"],
    relatedSites: ["Academy", "Lyceum", "Stoa Poikile", "Garden of Epicurus"],
    period: "Classical and Hellenistic periods"
  },

  // Location-specific Questions
  {
    question: "When was Plato's Academy founded?",
    answer: "Plato's Academy was founded in 387 BCE in a grove dedicated to the hero Akademos, northwest of Athens. It was established after Plato's return from his travels to Sicily and Egypt, and operated continuously for nearly 900 years until Emperor Justinian closed it in 529 CE. The Academy was the first institution of higher learning in the Western world, serving as the model for all subsequent universities. Plato taught there for 40 years until his death in 347 BCE, with Aristotle among his most famous students.",
    category: "schools",
    keyFigures: ["Plato", "Aristotle", "Speusippus"],
    relatedSites: ["Academy", "Grove of Akademos"],
    period: "387 BCE - 529 CE"
  },
  {
    question: "Why was Aristotle's school called the Lyceum?",
    answer: "Aristotle's school was called the Lyceum because it was located near the temple of Apollo Lykeios (Apollo the Wolf-God) in a grove east of Athens. Founded in 335 BCE, the school became known for its covered walkway (peripatos) where Aristotle and his students would walk while discussing philosophy, earning them the nickname 'Peripatetics' (those who walk around). The Lyceum differed from other schools by emphasizing empirical research and systematic classification of knowledge, with extensive libraries and collections of specimens.",
    category: "schools",
    keyFigures: ["Aristotle", "Theophrastus", "Alexander the Great"],
    relatedSites: ["Lyceum", "Temple of Apollo Lykeios"],
    period: "335-86 BCE"
  },
  {
    question: "What is the difference between Stoicism and Epicureanism?",
    answer: "Stoicism and Epicureanism offered contrasting approaches to achieving happiness and tranquility. Stoics believed virtue was the only true good and emphasized duty, courage, and acceptance of fate, encouraging active participation in civic life. Epicureans considered pleasure the highest good, but defined it as the absence of pain (ataraxia) and anxiety, often withdrawing from public life to focus on friendship and simple pleasures. Stoics taught that emotions should be controlled through reason, while Epicureans sought to eliminate fear and anxiety. Both schools aimed for tranquility but through opposite means: Stoics through engagement and duty, Epicureans through withdrawal and pleasure.",
    category: "schools",
    keyFigures: ["Zeno of Citium", "Epicurus", "Chrysippus", "Lucretius"],
    relatedSites: ["Stoa Poikile", "Garden of Epicurus"],
    period: "Hellenistic Period"
  },

  // Modern Visiting Questions
  {
    question: "Can you still visit these ancient philosophical sites?",
    answer: "Yes, many ancient philosophical sites in Athens are accessible today. The Ancient Agora is a major archaeological site where you can see the reconstructed Stoa of Attalos (which echoes the original Stoa Poikile) and visit the excellent museum. The Academy Park preserves the approximate location of Plato's school with some archaeological remains. The Lyceum site was recently discovered and excavated, though it's not yet open to the public. The National Archaeological Museum and Acropolis Museum contain artifacts from these philosophical schools. Guided tours specifically focused on ancient philosophy are available.",
    category: "visiting",
    relatedSites: ["Ancient Agora", "Academy Park", "Lyceum site", "Archaeological Museums"],
    period: "Modern day"
  },
  {
    question: "Where did ancient Greek philosophers teach?",
    answer: "Ancient Greek philosophers taught in various locations throughout Athens. Socrates famously taught in the Ancient Agora, questioning citizens in the marketplace and public spaces. Plato established his Academy in a grove northwest of the city, creating the first formal educational institution. Aristotle taught at the Lyceum with its covered walkways east of Athens. Zeno and the Stoics gathered at the Stoa Poikile in the agora. Epicurus created a private garden community outside the city walls. Many philosophers also taught in gymnasiums, private homes, and during symposiums (drinking parties that included philosophical discussion).",
    category: "locations",
    keyFigures: ["Socrates", "Plato", "Aristotle", "Zeno of Citium", "Epicurus"],
    relatedSites: ["Ancient Agora", "Academy", "Lyceum", "Stoa Poikile", "Garden of Epicurus", "Gymnasiums"],
    period: "Classical and Hellenistic periods"
  },
  {
    question: "How did these schools influence modern philosophy?",
    answer: "Athens' philosophical schools profoundly shaped Western thought and education. Plato's Academy established the university model still used today, emphasizing systematic curriculum and scholarly research. Aristotelian logic and scientific methods became foundations of medieval and modern scholarship. Stoicism influences contemporary cognitive behavioral therapy, resilience training, and leadership development. The Socratic method remains central to legal education and critical thinking. These schools also established philosophy as a way of life, not just academic study, inspiring modern movements in practical philosophy and personal development.",
    category: "general",
    keyFigures: ["Socrates", "Plato", "Aristotle", "Zeno of Citium"],
    relatedSites: ["Academy", "Lyceum", "Stoa Poikile"],
    period: "Classical to Modern"
  }
]

// Helper functions
export function getAncientAthensFAQByCategory(category: AncientAthensFAQItem['category']): AncientAthensFAQItem[] {
  return ancientAthensFAQ.filter(item => item.category === category)
}

export function getAllAncientAthensFAQ(): AncientAthensFAQItem[] {
  return ancientAthensFAQ
}

// Generate FAQ structured data for SEO
export function generateAncientAthensFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ancientAthensFAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}
