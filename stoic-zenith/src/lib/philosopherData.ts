import { readFileSync } from 'fs'
import { join } from 'path'

export interface Philosopher {
  name: string
  fullName: string
  slug: string
  school: string
  role: string
  bornDate: string
  bornPlace: string
  diedDate: string
  primaryLanguage: string
  activePeriod: string
  notableWorks: string
  influences: string
  signatureQuotes: string
  description: string
  metaTitle: string
  metaDescription: string
  h1: string
  popularTags: string
  relatedAuthors: string
  schemaType: string
  birthDate: string
  deathDate: string
  birthPlace: string
  occupation: string
  knowsAbout: string
  link: string
}

export interface BiographySection {
  title: string
  content: string
}

export interface PhilosopherBiography extends Philosopher {
  lifeStory: BiographySection[]
  quotes: Array<{
    text: string
    explanation: string
  }>
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

let philosophersCache: Philosopher[] | null = null

export function getAllPhilosophers(): Philosopher[] {
  if (philosophersCache) return philosophersCache

  try {
    const csvPath = join(process.cwd(), '..', 'books', 'The Way Stoic SEO - Description of Philosophers.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = parseCSVLine(lines[0])
    
    const philosophers: Philosopher[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length < 10) continue
      
      const philosopher: Philosopher = {
        name: values[0] || '',
        fullName: values[1] || '',
        slug: values[2] || '',
        school: values[3] || '',
        role: values[4] || '',
        bornDate: values[5] || '',
        bornPlace: values[6] || '',
        diedDate: values[7] || '',
        primaryLanguage: values[8] || '',
        activePeriod: values[9] || '',
        notableWorks: values[10] || '',
        influences: values[11] || '',
        signatureQuotes: values[12] || '',
        description: values[13] || '',
        metaTitle: values[14] || '',
        metaDescription: values[15] || '',
        h1: values[16] || '',
        popularTags: values[17] || '',
        relatedAuthors: values[18] || '',
        schemaType: values[19] || '',
        birthDate: values[20] || '',
        deathDate: values[21] || '',
        birthPlace: values[22] || '',
        occupation: values[23] || '',
        knowsAbout: values[24] || '',
        link: values[25] || ''
      }
      
      philosophers.push(philosopher)
    }
    
    philosophersCache = philosophers
    return philosophers
  } catch (error) {
    console.error('Error loading philosopher data:', error)
    return []
  }
}

export function getPhilosopherBySlug(slug: string): Philosopher | null {
  const philosophers = getAllPhilosophers()
  return philosophers.find(p => p.slug === slug) || null
}

export function getPhilosopherBiography(slug: string): PhilosopherBiography | null {
  const philosopher = getPhilosopherBySlug(slug)
  if (!philosopher) return null

  if (slug === 'marcus-aurelius') {
    return {
      ...philosopher,
      lifeStory: [
        {
          title: 'Early Life and Education',
          content: `Marcus Aurelius was born on April 26, 121 CE, in Rome to Marcus Annius Verus and Domitia Calvilla. When Marcus was just three years old, his father died, leaving him to be raised by his mother and paternal grandfather. His grandfather had served as consul twice, and his maternal grandmother was heiress to one of the most massive Roman fortunes, ensuring Marcus had access to the finest education available.

From an exceptionally young age, Marcus showed a deep intellectual curiosity. He learned both Latin and Greek, but his greatest interest was philosophy, particularly Stoicism. At just twelve years old, he began wearing the philosopher's cloak and dedicated himself completely to philosophical study, influenced by the teachings of Stoic philosophers like Epictetus.`
        },
        {
          title: 'Rise to Power',
          content: `When Marcus was seventeen, his life changed dramatically. His uncle became Emperor Antoninus Pius in 138 CE and adopted Marcus along with another young man as his successors. This began Marcus's long apprenticeship in governance, learning the complex business of ruling the Roman Empire.

In 140 CE, Marcus became consul, leader of the senate—a position he would hold three times in his lifetime. As the years passed under Antoninus Pius, he received increasingly greater responsibilities and official powers, evolving into a strong source of support and counsel for the emperor. This twenty-three-year apprenticeship prepared him uniquely for the challenges of imperial rule.`
        },
        {
          title: 'Personal Life and Family',
          content: `In 145 CE, Marcus married his cousin Annia Galeria Faustina, who was Emperor Antoninus Pius's daughter. Their marriage was both politically significant and personally meaningful, producing many children together. Historical records suggest they had at least twelve children, though some did not survive to adulthood—a common tragedy in ancient times.

Their most well-known children include their daughter Lucilla and their son Commodus, who would later succeed Marcus as emperor. Despite the political pressures of imperial life, Marcus maintained strong family bonds and wrote with deep affection about the importance of virtue in family relationships.`
        },
        {
          title: 'Reign as Emperor',
          content: `When Antoninus Pius died in 161 CE, the Senate planned to confirm Marcus as sole emperor. However, in a remarkable display of his character, Marcus refused to take office unless his adoptive brother Lucius Verus received equal powers. This created the first time in Roman history that the empire was ruled by two emperors simultaneously.

Marcus's reign was marked by constant challenges: wars with the Parthians, conflicts with Germanic tribes, a devastating plague that swept through the empire, and various internal rebellions. Despite these enormous pressures, Marcus maintained his philosophical approach to governance, viewing his imperial duties as an opportunity to practice Stoic virtue on the largest possible stage.`
        },
        {
          title: 'Death and Legacy',
          content: `Marcus Aurelius died on March 17, 180 CE, likely at Vindobona (modern Vienna) during a military campaign against Germanic tribes. He had ruled for nineteen years, and his death marked the end of the Pax Romana and the last of the "Five Good Emperors."

His philosophical legacy, however, far outlasted his political one. The personal journal he kept during his later years, now known as "Meditations," became one of the most influential works in Western philosophy, offering timeless insights into virtue, duty, and the human condition that continue to inspire readers today.`
        }
      ],
      quotes: [
        {
          text: "The impediment to action advances action. What stands in the way becomes the way.",
          explanation: "This powerful paradox captures the Stoic principle of turning obstacles into opportunities. Marcus believed that challenges don't block our path—they become the path itself, forcing us to develop resilience, creativity, and strength we might never have discovered otherwise."
        },
        {
          text: "Waste no more time arguing what a good man should be. Be one.",
          explanation: "As emperor, Marcus understood the difference between theory and practice. This quote reflects his belief that virtue requires action, not endless debate. Rather than philosophizing about goodness in abstract terms, we should embody it in our daily choices and behaviors."
        },
        {
          text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
          explanation: "Perhaps Marcus's most famous insight, this quote encapsulates the core Stoic principle of the dichotomy of control. External circumstances—whether political crises or personal setbacks—cannot determine our inner state. True strength comes from mastering our responses, thoughts, and attitudes."
        },
        {
          text: "You could leave life right now. Let that determine what you do and say and think.",
          explanation: "This memento mori reflection wasn't morbid but practical. By remembering life's brevity, Marcus focused on what truly mattered: acting with virtue, speaking with honesty, and thinking with clarity. Death's inevitability should inspire us to live more intentionally."
        }
      ]
    }
  }

  return {
    ...philosopher,
    lifeStory: [],
    quotes: []
  }
}

export function generatePhilosopherStructuredData(philosopher: Philosopher) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: philosopher.fullName,
    alternateName: philosopher.name,
    birthDate: philosopher.birthDate,
    deathDate: philosopher.deathDate,
    birthPlace: {
      '@type': 'Place',
      name: philosopher.birthPlace
    },
    occupation: philosopher.occupation.split(';').map(occ => occ.trim()),
    knowsAbout: philosopher.knowsAbout.split(';').map(subject => subject.trim()),
    description: philosopher.description,
    sameAs: philosopher.link ? [philosopher.link] : [],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://thewaystoic.com/biography/${philosopher.slug}`
    }
  }
}