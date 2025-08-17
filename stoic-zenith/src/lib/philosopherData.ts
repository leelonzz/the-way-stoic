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
  imageUrl?: string
  videoUrl?: string
  lastUpdated: string
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

// Function to clear the cache (useful for development)
export function clearPhilosophersCache(): void {
  philosophersCache = null
}

export function getAllPhilosophers(): Philosopher[] {
  if (philosophersCache) return philosophersCache

  try {
    const csvPath = join(process.cwd(), 'books', 'The Way Stoic SEO - Description of Philosophers.csv')
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
        link: values[25] || '',
        videoUrl: values[25] || '', // Use the same URL for video embedding
        lastUpdated: values[26] || ''
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

function getPhilosopherImageUrl(slug: string): string | undefined {
  const imageMap: Record<string, string> = {
    'marcus-aurelius': '/images/philosophers/marcus aurelius.jpg',
    'seneca': '/images/philosophers/Seneca.JPG',
    'epictetus': '/images/philosophers/Epictetus.webp',
    'zeno-of-citium': '/images/philosophers/zeno-of-citium-stoicism-bust.jpg',
    'cleanthes': '/images/philosophers/Cleanthes.png',
    'chrysippus': '/images/philosophers/Chrysippus.png',
    'musonius-rufus': '/images/philosophers/Musonius Rufu.webp',
    'cato-the-younger': '/images/philosophers/cato_the younger.jpg',
    // New philosophers with existing images
    'antoninus-pius': '/images/philosophers/Antoninus_Pius_Glyptothek_Munich_337_cropped.jpg',
    'cicero': '/images/philosophers/Cicero.jpeg',
    'commodus': '/images/philosophers/Commodus.jpg',
    'plato': '/images/philosophers/Plato.jpg',
    'lucius-verus': '/images/philosophers/lucius Verus.jpeg',
    'pertinax': '/images/philosophers/Pertinax.jpg',
    'crispina': '/images/philosophers/Crispina.jpeg',
    'faustina-the-elder': '/images/philosophers/Faustina the Elder.avif',
    'hadrian': '/images/philosophers/Hadrian.avif',
    'faustina-the-younger': '/images/philosophers/Faustina the Younger.avif',
    'aristotle': '/images/philosophers/aristotle.jpeg',
    'socrates': '/images/philosophers/socrates.jpg',
  }

  return imageMap[slug]
}

export function getPhilosopherBiography(slug: string): PhilosopherBiography | null {
  const philosopher = getPhilosopherBySlug(slug)
  if (!philosopher) return null

  // Add image URL to philosopher data
  const philosopherWithImage = {
    ...philosopher,
    imageUrl: getPhilosopherImageUrl(slug)
  }

  if (slug === 'marcus-aurelius') {
    return {
      ...philosopherWithImage,
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
        },
        {
          title: 'Philosophy and Stoicism',
          content: `Marcus Aurelius was a devoted Stoic philosopher. His ancient biographer, Julius Capitolinus, described him as such. Marcus also mentions several Stoic teachers he learned from, particularly Rusticus, from whom he borrowed copies of the Stoic philosopher Epictetus's works. However, nowhere in the Meditations does Marcus explicitly call himself a Stoic. This may simply reflect that Marcus was writing for himself rather than trying to identify himself before readers.

Marcus Aurelius was clearly familiar with Epictetus's Discourses, often quoting them on various occasions. Epictetus's reputation in the second century is recorded by several ancient sources, praised as the greatest Stoic and more famous than even Plato. If Marcus felt drawn to Stoicism, Epictetus would certainly stand out as the most important Stoic of that time.`
        },
        {
          title: 'The Three Main Topics of Training',
          content: `The philosophical focus of Epictetus centered on his interpretation of three main topics, or three fields of study. He proposed that philosophy students should be trained in three separate areas:

**Desires (orexeis) and aversions (ekkliseis)** - Related to physics, this training teaches students to align their desires with what is in harmony with nature. For Stoics, nature is a complex, interconnected physical system identified with God, where individuals are merely parts of the whole.

**Impulses to action (hormas) and non-action (aphormas)** - Related to ethics, this training involves converting ethical theories into moral actions. To change one's behavior, one must train the impulses that constitute behavior.

**Escaping deception, judgment, and everything related to assigning opinions (sunkatatheseis)** - Related to logic and epistemology, this training involves carefully analyzing one's impressions to avoid agreeing with improper value judgments.

Marcus Aurelius can be seen as a student of Epictetus, and the Meditations can be approached as an example of personal record-keeping where the recording itself is a philosophical exercise aimed at assimilating these three types of philosophical theory.`
        },
        {
          title: 'Philosophical Exercises and the View from the Universe',
          content: `In the Meditations, Marcus Aurelius engages in a series of philosophical exercises designed to assimilate philosophical theories and transform his character. Through contemplating philosophical ideas and writing them down, Marcus participates in a repetitive process designed to train his mind in a new way of thinking.

Among all the philosophical exercises in the Meditations, the most prominent revolves around what can be called the 'view from the universe.' In several passages, Marcus encourages himself to transcend the limited perspective of the individual and experience the world from a cosmic perspective:

"You have the power to rid your life of many unnecessary troubles that lie entirely within your own judgment, and to possess a large room for yourself by embracing the whole universe in your thoughts, contemplating eternal time, thinking of the rapid change in the parts of each thing, how brief the interval from birth to dissolution, and how the void before birth equals the infinite void after dissolution."

Marcus's personal reflections in the Meditations can be read as a series of written exercises aimed at analyzing his own impressions and rejecting his improper value judgments. The philosophical exercises in the Meditations are directed toward cultivating an experience of the universe as a unified living being identified with God.`
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

  if (slug === 'seneca') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Family',
          content: `Lucius Annaeus Seneca was born around 4 BCE in Corduba (modern Córdoba), Spain, into a wealthy and influential Roman family. His father, Seneca the Elder, was a renowned teacher of rhetoric in Rome, famous for his oratorical skills and literary works. His mother, Helvia, was a woman of excellent character and education who would later inspire one of Seneca's most moving philosophical works.

Seneca was the second of three sons in this distinguished family. His elder brother, Gallio, would later become proconsul of Achaea and famously encounter St. Paul the Apostle in 52 CE. His younger brother was the father of the poet Lucan, making Seneca uncle to one of Rome's greatest literary figures. This family environment of intellectual achievement and literary excellence profoundly shaped Seneca's future pursuits.`
        },
        {
          title: 'Education and Early Philosophy',
          content: `As a young boy, Seneca was taken to Rome by an aunt, where he received the finest education available to a Roman aristocrat. He was trained as an orator in the traditional Roman manner, but his true passion lay in philosophy. He studied in the school of the Sextii, which blended Stoicism with an ascetic Neo-Pythagoreanism, providing him with a unique philosophical foundation.

During his early education, Seneca encountered Stoicism, which would become the guiding philosophy of his life. The school emphasized virtue, self-discipline, and the acceptance of fate—principles that would later inform both his philosophical writings and his approach to the dramatic political upheavals he would witness. His health suffered during these intense years of study, leading him to recuperate in Egypt with his aunt and her husband, the prefect Gaius Galerius.`
        },
        {
          title: 'Political Career and Exile',
          content: `Returning to Rome around 31 CE, Seneca began a promising career in politics and law. His eloquence and intellectual brilliance quickly gained attention, but this also made him enemies. He soon fell foul of Emperor Caligula, who was reportedly deterred from killing him only by the argument that Seneca's life was sure to be short due to his poor health.

In 41 CE, under Emperor Claudius, Seneca's fortunes took a dramatic turn for the worse. He was banished to the island of Corsica on charges of adultery with Princess Julia Livilla, the emperor's niece. This eight-year exile proved to be a transformative period. In that harsh and uncongenial environment, Seneca devoted himself to natural science and philosophy, writing his three treatises entitled "Consolationes" (Consolations), which would become foundational works of Stoic literature.`
        },
        {
          title: 'Return to Power and Nero\'s Tutor',
          content: `Seneca's exile ended in 49 CE through the influence of Julia Agrippina, Emperor Claudius's wife, who had him recalled to Rome. He quickly reestablished himself in Roman society, becoming praetor in 50 CE and marrying Pompeia Paulina, a wealthy woman. Most significantly, he was appointed tutor to the young Nero, the future emperor.

When Claudius was murdered in 54 CE, Seneca and his ally Sextus Afranius Burrus found themselves at the pinnacle of Roman power. As Nero's advisors, they effectively ruled the Roman Empire during the early years of his reign. Seneca drafted Nero's first public speech, which promised liberty for the Senate and an end to the corrupting influence of freedmen and women. Together with Burrus, Seneca introduced important fiscal and judicial reforms and fostered a more humane attitude toward slaves.`
        },
        {
          title: 'The Burden of Power',
          content: `Despite their initial success in governing, Seneca and Burrus faced the impossible challenge of managing an increasingly unstable and tyrannical emperor. As the historian Tacitus observed, "Nothing in human affairs is more unstable and precarious than power unsupported by its own strength." They were, ultimately, a tyrant's favorites, dependent on Nero's whims.

The moral compromises required by their position became increasingly difficult to bear. In 59 CE, they were forced to condone—or perhaps even contrive—the murder of Agrippina, Nero's mother. This act marked a turning point in Seneca's relationship with power and deepened his understanding of the corrupting nature of political authority. When Burrus died in 62 CE, Seneca recognized that his own position had become untenable.`
        },
        {
          title: 'Withdrawal and Philosophical Maturity',
          content: `Sensing the growing danger of his position, Seneca withdrew from public life in 62 CE. He attempted to return his vast wealth to Nero and retire to private study, but the emperor refused to accept his resignation completely. During these final years, Seneca wrote some of his most profound philosophical works, including his famous "Letters to Lucilius" (Epistulae Morales ad Lucilium).

These letters, addressed to his friend Lucilius Junior, represent the culmination of Seneca's philosophical thought. Written with the wisdom of experience and the urgency of a man who understood the fragility of life, they offer practical guidance on how to live virtuously in an imperfect world. The letters discuss everything from anger management and grief to the proper use of wealth and the acceptance of mortality.`
        },
        {
          title: 'Death and Final Testament',
          content: `In 65 CE, Seneca's enemies denounced him as having been part of the Pisonian conspiracy to murder Nero. Whether he was actually involved remains unclear, but Nero ordered him to commit suicide. Seneca met this command with the Stoic composure he had long advocated in his writings.

According to Tacitus, Seneca faced death with remarkable fortitude. After dictating his final thoughts to a scribe and saying farewell to his friends and family, he opened his veins. When death came slowly due to his advanced age, he entered a warm bath to speed the process. His wife Pompeia Paulina attempted to die with him but was saved on Nero's orders. Seneca's death became a powerful testament to the Stoic principles he had spent his life teaching—that a philosopher must be prepared to face death with dignity and courage.`
        }
      ],
      quotes: [
        {
          text: "We suffer more often in imagination than in reality.",
          explanation: "This profound insight reveals Seneca's understanding of human psychology. Most of our suffering comes not from actual events, but from our fears, anxieties, and negative projections about what might happen. By recognizing this tendency, we can learn to distinguish between real problems that require action and imaginary ones that only require mental discipline."
        },
        {
          text: "As long as you live, keep learning how to live.",
          explanation: "Seneca believed that philosophy was not an academic exercise but a lifelong practice of learning how to live well. Every day presents new challenges and opportunities to apply philosophical principles. Wisdom comes not from theoretical knowledge alone, but from the continuous effort to embody virtue in our daily choices and responses to life's circumstances."
        },
        {
          text: "It is not that we have a short time to live, but that we waste a lot of it.",
          explanation: "In his essay 'On the Shortness of Life,' Seneca argues that life is actually long enough if we use our time wisely. The problem is not the brevity of life, but our tendency to squander time on trivial pursuits, worry about things beyond our control, and fail to focus on what truly matters. Conscious living makes even a short life feel complete and meaningful."
        },
        {
          text: "Every new beginning comes from some other beginning's end.",
          explanation: "This quote reflects the Stoic understanding of change as the fundamental nature of existence. Seneca recognized that loss and transformation are inevitable parts of life, but they also create opportunities for growth and renewal. By accepting the cyclical nature of beginnings and endings, we can find peace with life's constant changes and even discover hope in times of difficulty."
        }
      ]
    }
  }

  if (slug === 'epictetus') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Birth and Early Slavery',
          content: `Epictetus was born around 50 CE in Hierapolis, Phrygia (present-day Pamukkale, Turkey), into slavery. The name by which he is known, "Epictetus," is derived from the Greek word "epíktētos" meaning "gained" or "acquired"—a name that reflected his status as property rather than his birth name, which remains unknown to history.

As a young slave, Epictetus was brought to Rome, where he served Epaphroditus, a wealthy freedman who held the powerful position of secretary to Emperor Nero. This placed Epictetus in the unique position of being both at the lowest social level as a slave, yet connected to the highest circles of imperial power. Despite his bondage, this environment exposed him to the intellectual and political currents of the Roman Empire.`
        },
        {
          title: 'Discovery of Philosophy',
          content: `Early in his life as a slave, Epictetus developed a passionate interest in philosophy. With the permission of his master Epaphroditus, he was allowed to study Stoic philosophy under Musonius Rufus, one of the most respected Stoic teachers of the time. This education was transformative, not only intellectually but also socially, as it elevated his status within the household.

Musonius Rufus taught Epictetus that philosophy was not merely an academic exercise but a way of life—a practical discipline for achieving virtue and inner freedom. Under his guidance, Epictetus learned that while external circumstances might be beyond one's control, one's responses, judgments, and inner life remained entirely within one's power. This teaching would become the cornerstone of his own philosophical system.`
        },
        {
          title: 'Physical Disability and Inner Strength',
          content: `At some point during his youth, Epictetus became physically disabled, likely affecting his leg and requiring him to use a crutch for the rest of his life. Ancient sources differ on the cause of this disability. Some accounts, including one by Celsus quoted by Origen, suggest that his leg was deliberately broken by his master. Other sources, such as Simplicius, indicate that he was disabled from childhood.

Regardless of the cause, this physical limitation became another aspect of Epictetus's unique perspective on human suffering and resilience. His disability served as a constant reminder of the Stoic principle that external circumstances—including physical limitations—need not determine one's inner state or capacity for virtue. He would later teach that true freedom comes not from physical liberty but from mental and spiritual independence.`
        },
        {
          title: 'Freedom and Teaching in Rome',
          content: `Epictetus obtained his freedom sometime after Emperor Nero's death in 68 CE, likely when Epaphroditus fell from favor. As a freedman, he began teaching philosophy in Rome, quickly gaining a reputation as a powerful and compelling speaker. His teaching style was direct and practical, focusing on how philosophical principles could be applied to daily life rather than abstract theoretical discussions.

His lectures attracted students from across the Roman world, including many from the upper classes who sought practical wisdom for navigating life's challenges. Epictetus taught that philosophy should be a medicine for the soul, helping people achieve tranquility and virtue regardless of their external circumstances. His approach emphasized rigorous self-examination and the cultivation of inner discipline.`
        },
        {
          title: 'Exile and the School at Nicopolis',
          content: `Around 93 CE, Emperor Domitian issued a decree banishing all philosophers from Rome, viewing them as potential threats to imperial authority. Epictetus, along with other philosophers, was forced to leave the city. He chose to settle in Nicopolis, a city in Epirus, Greece, where he established a philosophical school that would become one of the most influential centers of Stoic learning.

At Nicopolis, Epictetus continued teaching for the remainder of his life, attracting students from across the Mediterranean world. His school became renowned for its practical approach to philosophy and its emphasis on ethical living. Among his students was Arrian, a young man who would later become a distinguished historian and general, and who preserved Epictetus's teachings for posterity.`
        },
        {
          title: 'Teaching Method and Philosophy',
          content: `Epictetus's teaching method was revolutionary in its practicality and accessibility. Rather than focusing on abstract metaphysical questions, he concentrated on how philosophy could help people live better lives. He taught that the foundation of all philosophy is self-knowledge—particularly the recognition of our own ignorance and the need for continuous learning and self-improvement.

Central to his teaching was the concept of the "dichotomy of control"—the fundamental distinction between what is "up to us" and what is "not up to us." He taught that our judgments, desires, and actions are within our control, while external events, other people's actions, and even our own bodies are ultimately beyond our control. True freedom and happiness, he argued, come from focusing entirely on what is within our power while accepting what is not.`
        },
        {
          title: 'Later Life and Death',
          content: `Epictetus lived a life of great simplicity at Nicopolis, owning few possessions and maintaining the ascetic lifestyle he had learned as a student of Musonius Rufus. He remained unmarried for most of his life, dedicating himself entirely to teaching and philosophical practice. However, in his old age, he adopted the child of a friend who would otherwise have been left to die, raising the child with the help of a woman whose relationship to him remains unclear.

Emperor Hadrian was known to have been friendly with Epictetus and may have visited his school in Nicopolis. Many other eminent figures of the time sought conversations with him, recognizing his wisdom and the practical value of his teachings. Epictetus died around 135 CE, having spent over forty years teaching and developing the Stoic philosophy that would influence countless future generations, including the Roman Emperor Marcus Aurelius.`
        }
      ],
      quotes: [
        {
          text: "We are disturbed not by events, but by the views we take of them.",
          explanation: "This fundamental insight captures the essence of Stoic psychology. Epictetus taught that external events themselves are neutral—it is our judgments and interpretations that create our emotional responses. By changing how we view situations, we can maintain inner peace regardless of external circumstances. This principle empowers us to find tranquility even in difficult situations by examining and adjusting our perspectives."
        },
        {
          text: "It's not what happens to you, but how you react to it that matters.",
          explanation: "Building on his core teaching about the dichotomy of control, Epictetus emphasized that our power lies not in controlling events but in controlling our responses. This quote reminds us that we always have a choice in how we respond to life's challenges. Our reactions—whether we respond with virtue or vice, wisdom or folly, courage or fear—are entirely within our control and ultimately determine our character and happiness."
        },
        {
          text: "First say to yourself what you would be; and then do what you have to do.",
          explanation: "This practical advice reflects Epictetus's emphasis on intentional living and self-discipline. Before taking action, we must first clarify our values and goals—who we want to become and what kind of person we aspire to be. Only then can we align our actions with our highest aspirations. This quote encourages us to live purposefully, ensuring that our daily choices reflect our deepest values and long-term vision for ourselves."
        },
        {
          text: "No man is free who is not master of himself.",
          explanation: "Speaking from his experience as both a slave and a freedman, Epictetus understood that true freedom is not a matter of external circumstances but of inner mastery. Even a slave can be free if he masters his desires, judgments, and responses, while a wealthy person can be enslaved by their passions and fears. This quote emphasizes that authentic freedom comes through self-discipline and the ability to govern one's own mind and emotions."
        }
      ]
    }
  }

  if (slug === 'zeno-of-citium') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life in Cyprus',
          content: `Zeno of Citium was born around 334 BCE in Citium, a prosperous city on the island of Cyprus. His father, Mnaseas, was a wealthy merchant, and Zeno grew up in a cosmopolitan environment where Phoenician and Greek cultures intermingled. This multicultural upbringing would later influence his philosophical vision of universal citizenship and the brotherhood of all humanity.

As a young man, Zeno followed in his father's footsteps, becoming a successful merchant himself. He traveled extensively throughout the Mediterranean, trading in valuable goods including the famous purple dye that made Citium wealthy. These early travels exposed him to diverse cultures, philosophies, and ways of life, broadening his perspective on human nature and society.`
        },
        {
          title: 'The Shipwreck That Changed Everything',
          content: `Around 312 BCE, Zeno's life took a dramatic turn when he was shipwrecked near Athens while carrying a cargo of purple dye. This disaster, which destroyed his merchant career and fortune, would prove to be the most fortunate event of his life. Stranded in Athens with nothing but the clothes on his back, Zeno found himself at a crossroads that would lead him to philosophy.

According to legend, after the shipwreck, Zeno wandered into a bookshop in Athens where he encountered Xenophon's "Memorabilia," a work about Socrates. Fascinated by the portrayal of the great philosopher, he asked the bookseller where he could find such wise men. At that moment, Crates of Thebes, a prominent Cynic philosopher, happened to walk by, and the bookseller pointed to him. This chance encounter would change the course of Zeno's life and, ultimately, the history of philosophy.`
        },
        {
          title: 'Student of the Cynics',
          content: `Zeno became a devoted student of Crates of Thebes, immersing himself in Cynic philosophy for nearly a decade. The Cynics taught that virtue was the only true good and that one should live in accordance with nature, rejecting conventional social values and material possessions. Under Crates' guidance, Zeno learned to question societal norms and to value inner freedom over external circumstances.

However, Zeno's naturally modest temperament sometimes clashed with the Cynics' radical rejection of social conventions. While he embraced their core teachings about virtue and living according to nature, he was uncomfortable with their complete disregard for social propriety. This tension would later influence his development of Stoicism, which maintained Cynic ethical principles while adopting a more socially acceptable approach to philosophical practice.`
        },
        {
          title: 'Philosophical Education and Development',
          content: `After his time with the Cynics, Zeno studied under various other philosophical schools to broaden his understanding. He learned dialectical reasoning from the Megarian school under Stilpo, and studied with the dialecticians Diodorus Cronus and Philo. He also explored Platonic philosophy under Xenocrates and Polemo, gaining exposure to metaphysical and ethical theories that would later influence his own system.

This diverse philosophical education allowed Zeno to synthesize the best elements from different schools of thought. From the Cynics, he took their emphasis on virtue and living according to nature. From the Megarians, he learned logical rigor. From the Platonists, he gained insights into the structure of reality and the nature of knowledge. This synthesis would become the foundation of his new philosophical system.`
        },
        {
          title: 'Founding the Stoic School',
          content: `Around 301 BCE, at the age of thirty-three, Zeno began teaching his own philosophical system in the Stoa Poikile (Painted Porch) in the Athenian Agora. This covered walkway, decorated with paintings depicting Greek military victories, became the birthplace of Stoicism. The name "Stoic" derives from this location, as Zeno's followers were initially called "those from the Stoa."

Zeno's teaching attracted students from across the Greek world. His philosophy offered a compelling alternative to the existing schools, combining rigorous intellectual content with practical guidance for living. He taught that the universe was a rational, divine entity and that humans could achieve happiness by aligning their will with the cosmic order. His emphasis on virtue, duty, and emotional resilience resonated with students seeking wisdom for navigating life's challenges.`
        },
        {
          title: 'The Philosopher\'s Republic',
          content: `One of Zeno's most influential early works was his "Republic," written as a response to Plato's famous work of the same name. In this radical text, Zeno outlined his vision of an ideal society based on Stoic principles. He proposed a cosmopolitan community where traditional social distinctions would be abolished, where men and women would be equal, and where virtue rather than birth or wealth would determine one's place in society.

This work scandalized many contemporaries with its revolutionary ideas, including the abolition of marriage, private property, and conventional religious practices. However, it also established Zeno as a serious philosophical innovator who was willing to challenge fundamental assumptions about society and human nature. The cosmopolitan ideals expressed in the "Republic" would later influence Roman Stoics and contribute to the development of natural law theory.`
        },
        {
          title: 'Later Years and Death',
          content: `Zeno continued teaching in Athens for nearly forty years, developing and refining his philosophical system. He gained the respect of prominent figures, including King Antigonus II Gonatas of Macedonia, who frequently visited him when in Athens. Despite offers of royal patronage, Zeno remained committed to his simple life and philosophical mission in Athens.

Zeno died around 262 BCE at the age of seventy-two. According to Diogenes Laërtius, he died after tripping and breaking his toe while leaving his school. Taking this as a sign from fate, he quoted a line from Sophocles' "Niobe"—"I come, I come, why dost thou call for me?"—and died by holding his breath. His death was seen as a final demonstration of Stoic principles: accepting fate with dignity and maintaining control over one's final moments. The Athenians honored him with a golden crown and a tomb, recognizing his contributions to philosophy and his moral influence on the youth of Athens.`
        }
      ],
      quotes: [
        {
          text: "The goal of life is to live in agreement with nature.",
          explanation: "This foundational principle of Stoicism reflects Zeno's belief that humans achieve happiness by aligning themselves with the rational order of the universe. For Zeno, 'nature' meant both human nature as rational beings and the cosmic nature that governs all existence. Living according to nature means using reason to guide our actions, accepting what we cannot control, and fulfilling our roles as rational, social beings."
        },
        {
          text: "Well-being is attained by little and little, and nevertheless is no little thing itself.",
          explanation: "Zeno understood that true happiness and virtue are built through consistent daily practice rather than dramatic gestures. This quote emphasizes the importance of small, steady progress in developing wisdom and character. Each small act of virtue, each moment of rational reflection, contributes to the larger goal of living a flourishing life. The cumulative effect of these small efforts creates something truly significant."
        },
        {
          text: "Follow where reason leads.",
          explanation: "As the founder of Stoicism, Zeno placed reason at the center of human life and decision-making. This simple yet profound directive encapsulates the Stoic commitment to rational thinking over emotional impulse. By following reason, we align ourselves with the rational structure of the universe and make decisions based on wisdom rather than passion, fear, or desire."
        },
        {
          text: "A bad feeling is a commotion of the mind repugnant to reason and against nature.",
          explanation: "This quote reveals Zeno's understanding of emotions and their relationship to reason. He taught that negative emotions arise when we make incorrect judgments about external events, allowing our minds to be disturbed by things beyond our control. By maintaining rational perspective and accepting the natural order of events, we can achieve the emotional tranquility that characterizes the wise person."
        }
      ]
    }
  }

  if (slug === 'cleanthes') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Journey to Athens',
          content: `Cleanthes was born around 330 BCE in Assos, a city in the Troad region of Asia Minor (modern-day Turkey). He was the son of Phanias and came from humble beginnings. In his youth, Cleanthes was a successful boxer, a profession that taught him the discipline and endurance that would later characterize his philosophical life.

With only four drachmae to his name—a meager sum even by ancient standards—Cleanthes made the journey to Athens around 280 BCE. This decision to leave his homeland with almost nothing demonstrates the courage and determination that would define his character. Athens was the intellectual center of the Greek world, attracting philosophers, students, and thinkers from across the Mediterranean.`
        },
        {
          title: 'Student of Philosophy',
          content: `Upon arriving in Athens, Cleanthes initially attended lectures by Crates the Cynic, but he soon discovered the teachings of Zeno of Citium, the founder of Stoicism. Zeno's philosophy resonated deeply with Cleanthes, who became one of his most devoted students. However, Cleanthes faced a significant challenge: he had no means of financial support.

To sustain himself while pursuing philosophy, Cleanthes worked as a water-carrier during the night, hauling water for a gardener. This earned him the nickname "the Well-Water-Collector" (Φρεάντλης in Greek). He would spend his days studying philosophy and his nights performing manual labor, demonstrating an extraordinary commitment to learning that few could match.`
        },
        {
          title: 'The Trial and Recognition',
          content: `Cleanthes's unusual lifestyle—studying philosophy all day with no visible means of support—aroused suspicion among the Athenians. He was summoned before the Areopagus, Athens's most prestigious court, to account for his way of living. The judges suspected he might be living off ill-gotten gains or engaging in some form of deception.

When Cleanthes appeared before the court, he presented evidence of his honest labor—his water-carrying tools and testimony from those who employed him. The judges were so impressed by his dedication to both honest work and philosophical study that they voted to award him ten minae, a substantial sum. However, Zeno would not permit him to accept the money, believing it would compromise his philosophical integrity.`
        },
        {
          title: 'The Devoted Student',
          content: `Cleanthes's fellow students, perhaps envious of his dedication or amused by his methodical approach to learning, nicknamed him "the Ass." Rather than taking offense, Cleanthes embraced this title, saying it implied that his back was strong enough to bear whatever burden Zeno placed upon him. This response reveals both his humility and his understanding that true philosophical progress requires patience and persistence.

His power of endurance became legendary among the Stoics. While other students might grow frustrated with difficult concepts or lengthy discussions, Cleanthes would patiently work through problems, demonstrating the very virtues that Stoicism taught: resilience, self-discipline, and emotional equilibrium.`
        },
        {
          title: 'Leadership of the Stoic School',
          content: `When Zeno died around 262 BCE, Cleanthes was chosen to succeed him as the head (scholarch) of the Stoic school. This appointment was a testament to his character and his deep understanding of Stoic principles, even if he was not considered the most intellectually brilliant of Zeno's students. He would lead the school for the next 32 years, from 262 to 230 BCE.

Despite his elevated position, Cleanthes continued to support himself through manual labor, refusing to live off the school's resources or accept patronage that might compromise his independence. This consistency between his teachings and his lifestyle earned him enormous respect and helped establish the Stoic tradition of philosophical integrity.`
        },
        {
          title: 'Philosophical Contributions and Students',
          content: `As head of the school, Cleanthes successfully preserved and developed Zeno's doctrines while adding his own insights, particularly in the area of Stoic physics. He developed the theory of "tension" (tonos), which distinguished Stoic materialism from other philosophical schools by arguing that matter was not inert but possessed an active, divine principle.

Among his most notable students was Chrysippus, who would become the third head of the Stoic school and systematize Stoic doctrine. Cleanthes also taught Antigonus II Gonatas, the king of Macedonia, from whom he accepted a gift of 3,000 minae—a sum he used not for personal luxury but to support the school and its mission.`
        },
        {
          title: 'The Hymn to Zeus and Religious Philosophy',
          content: `Cleanthes brought a deeply religious dimension to Stoicism that complemented its rational foundation. His most famous surviving work is the "Hymn to Zeus," a poetic prayer that expresses the Stoic understanding of divine providence and human acceptance of fate. In this hymn, he articulates the famous prayer: "Lead me, Zeus, and you too, Destiny, to wherever your decrees have assigned me."

This work demonstrates Cleanthes's belief that the universe is a living, rational entity governed by divine reason (Logos). He taught that true freedom comes not from resisting fate but from understanding and willingly accepting the rational order of the cosmos. This religious fervor gave Stoicism a spiritual depth that would influence later practitioners.`
        },
        {
          title: 'Death and Legacy',
          content: `Cleanthes died around 230 BCE at the remarkable age of 99, having lived longer than almost any other ancient philosopher. According to ancient sources, he developed a dangerous ulcer that required him to fast for medical reasons. When the ulcer healed, he chose to continue his abstinence, saying that since he was already halfway on the road to death, he would not trouble to retrace his steps.

His death was seen as a final demonstration of Stoic principles—the rational acceptance of mortality and the courage to face death with dignity. The Roman Senate later erected a statue in his honor at Assos, recognizing his contributions to philosophy and his exemplary character. Cleanthes's legacy lies not in revolutionary new ideas but in his embodiment of Stoic virtues and his role in preserving and transmitting the teachings of Zeno to future generations.`
        }
      ],
      quotes: [
        {
          text: "Lead me, Zeus, and you too, Destiny, to wherever your decrees have assigned me. I follow readily, but if I choose not, wretched though I am, I must follow still. Fate guides the willing, but drags the unwilling.",
          explanation: "This famous prayer from Cleanthes's Hymn to Zeus encapsulates the Stoic understanding of fate and free will. Cleanthes teaches that we have a choice in how we respond to life's circumstances: we can either willingly align ourselves with the rational order of the universe or be dragged along unwillingly. True freedom comes from understanding and accepting divine providence, not from futile resistance to what cannot be changed."
        },
        {
          text: "People walk in wickedness all their lives or, at any rate, for the greater part of it. If they ever attain to virtue, it is late and at the very sunset of their days.",
          explanation: "This sobering observation reflects Cleanthes's realistic understanding of human nature and the difficulty of achieving true virtue. He recognized that most people spend their lives driven by passions and false judgments, only discovering wisdom—if at all—near the end of their lives. This quote emphasizes the importance of beginning philosophical practice early and the challenge of overcoming ingrained habits of thought and behavior."
        },
        {
          text: "The goal of life is to live consistently with nature.",
          explanation: "Cleanthes is credited with adding the crucial phrase 'with nature' to Zeno's original formulation that the goal was simply 'to live consistently.' This addition clarified that Stoic ethics are grounded in understanding and following the rational order of the cosmos. Living according to nature means using reason to guide our actions, accepting what we cannot control, and fulfilling our roles as rational, social beings in harmony with the universal order."
        },
        {
          text: "Pleasure is not only not a good, but is contrary to nature and worthless.",
          explanation: "This quote reveals Cleanthes's strict approach to Stoic ethics and his rejection of hedonistic philosophy. He taught that pleasure-seeking weakens the soul by reducing the 'tension' or strength that constitutes virtue. For Cleanthes, true happiness comes not from pursuing pleasure but from developing the inner strength and self-control that allow us to maintain virtue regardless of external circumstances."
        }
      ]
    }
  }

  if (slug === 'chrysippus') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Loss of Fortune',
          content: `Chrysippus was born around 279 BCE in Soli, Cilicia (modern-day Turkey), presumably of Phoenician descent. He was the son of Apollonius of Tarsus and grew up in a wealthy family with substantial inherited property. Despite his slight stature, Chrysippus was known to have trained as a long-distance runner, developing the physical endurance that would later serve him well in his intellectual pursuits.

His comfortable early life took a dramatic turn when he was still young. His substantial inherited property was confiscated to the king's treasury—likely during the conflicts between Ptolemy II Philadelphus and Antiochus I Soter over control of Cilicia. This sudden loss of wealth forced Chrysippus to leave his homeland and seek his fortune elsewhere, ultimately leading him to Athens, the intellectual center of the Greek world.`
        },
        {
          title: 'Student of Cleanthes',
          content: `Arriving in Athens with little more than his intellectual gifts, Chrysippus became a disciple of Cleanthes, who was then the head (scholarch) of the Stoic school. He is also believed to have attended courses at the Platonic Academy under Arcesilaus and his successor Lacydes, giving him exposure to different philosophical traditions that would later inform his systematic approach to Stoicism.

Chrysippus threw himself eagerly into the study of the Stoic system, quickly gaining a reputation for learning among his contemporaries. He was noted for his intellectual audacity and self-confidence, famously requesting of Cleanthes: "Give me the principles, and I will find the proofs myself." This bold statement revealed both his confidence in his own abilities and his systematic approach to philosophical reasoning.`
        },
        {
          title: 'The Prolific Writer',
          content: `Chrysippus was extraordinarily prolific as a writer, reportedly composing more than 705 works and rarely going a day without writing 500 lines. His desire to be comprehensive meant that he would often take both sides of an argument to explore all possibilities, though his opponents accused him of filling his books with quotations from others. Despite being considered sometimes diffuse and obscure in his utterances and careless in his style, his intellectual abilities were highly regarded.

His comprehensive approach to philosophy was both a strength and a weakness. While it made his work thorough and systematic, it also made it difficult for students to follow, even within the Stoic school itself. The linguistic orientation and complexity of Chrysippus's work created challenges for later generations trying to understand and transmit his teachings.`
        },
        {
          title: 'Leadership of the Stoic School',
          content: `When Cleanthes died around 230 BCE, Chrysippus succeeded him as the third head of the Stoic school, a position he would hold until his own death in 206 BCE. Under his leadership, the school flourished and Stoicism became one of the most influential philosophical movements in the Greek and Roman world. His systematic development of Stoic doctrine earned him the title of the "Second Founder of Stoicism."

Chrysippus excelled in all three branches of Stoic philosophy: logic, physics, and ethics. He created an original system of propositional logic to better understand the workings of the universe and humanity's role within it. His work in logic was so advanced that it wouldn't be surpassed until the modern era, and his contributions to the theory of knowledge, ethics, and physics were equally groundbreaking.`
        },
        {
          title: 'Systematic Philosophy',
          content: `Chrysippus insisted on the organic unity of the universe and the correlation and mutual interdependence of all its parts. Following Zeno, he determined that fiery breath or aether was the primitive substance of the universe, with objects made up of inert matter given form by an informing soul called "pneuma." This pneuma pervades all substance, maintains the unity of the universe, and constitutes the human soul.

He developed sophisticated theories about fate and free will, arguing that while all things happen according to fate, human beings still bear moral responsibility for their actions. His concept of "co-fated" events attempted to reconcile determinism with human agency—our actions are predetermined and causally related to the overarching network of fate, but the moral responsibility of how we respond to impressions remains our own.`
        },
        {
          title: 'Logic and Mathematics',
          content: `Chrysippus made groundbreaking contributions to logic, creating an original system of propositional logic that was far ahead of its time. He developed sophisticated theories about conditional propositions and syllogistic reasoning that wouldn't be matched until the modern era. His work on the nature of truth and the relationship between language and reality laid important foundations for later philosophical development.

In mathematics, Chrysippus engaged with complex problems about infinity and continuity. He notably responded to Democritus's paradox about dividing a cone, arguing that the surfaces produced are both equal and unequal—effectively anticipating principles of modern infinitesimal calculus. He also controversially claimed that "one" is a number, challenging traditional Greek mathematical thinking.`
        },
        {
          title: 'Ethics and the Therapy of Emotions',
          content: `Chrysippus taught that ethics depended on physics, stating that there was no better way of approaching questions of good and evil than through understanding "the nature of all things and the administration of the universe." He believed the goal of life was to live in accordance with one's experience of the actual course of nature, recognizing that individual human nature is part of the nature of the whole universe.

He wrote extensively on the therapy of emotions, particularly in his work "On Passions." Chrysippus viewed the passions as diseases that depress and crush the soul, arising from wrong judgments that gather momentum like a person who has started running and finds it difficult to stop. He taught that one must prepare in advance and deal with passions in the mind as if they were present, using reason to understand the harm they cause.`
        },
        {
          title: 'Death and Legacy',
          content: `Chrysippus died around 206 BCE at the age of 73, reportedly from laughter after seeing a donkey eating figs and exclaiming that the donkey should be given wine to wash them down. Whether this account is accurate or not, it reflects the ancient appreciation for his wit and intellectual playfulness. His death marked the end of an era for the early Stoic school.

Although none of his works have survived intact except as fragments, Chrysippus's influence on Stoicism was immense. He systematized and expanded the fundamental doctrines established by Zeno and Cleanthes, creating the comprehensive philosophical system that would influence centuries of thinkers. His work made Stoicism one of the most successful and enduring philosophical movements in the ancient world, with effects lasting well into the Roman period and beyond.`
        }
      ],
      quotes: [
        {
          text: "Give me the principles, and I will find the proofs myself.",
          explanation: "This bold statement to his teacher Cleanthes reveals Chrysippus's intellectual confidence and systematic approach to philosophy. It demonstrates his belief that with proper foundational principles, rigorous reasoning could establish all necessary philosophical truths. This attitude exemplified his role as the systematizer of Stoicism, taking the basic insights of Zeno and Cleanthes and developing them into a comprehensive philosophical system."
        },
        {
          text: "The goal of life is to live in accordance with one's experience of the actual course of nature.",
          explanation: "Chrysippus refined the Stoic understanding of living according to nature by emphasizing that we must base our ethics on actual observation and experience of how the universe operates. This wasn't abstract theorizing but practical wisdom grounded in understanding the real patterns and processes of the natural world. Our individual nature as rational beings is part of the larger cosmic nature."
        },
        {
          text: "There is no other or more appropriate way of approaching the subject of good and evil, or the virtues, or happiness than from the nature of all things and the administration of the universe.",
          explanation: "This quote from his 'Physical Theses' demonstrates Chrysippus's belief that ethics must be grounded in physics—our understanding of how the universe actually works. Moral philosophy cannot be separated from our understanding of cosmic order and natural law. True ethical living requires comprehending our place in the rational structure of reality."
        },
        {
          text: "Wrong judgments turn into passions when they gather an impetus of their own, just as, when one has started running, it is difficult to stop.",
          explanation: "This insight from his work 'On Passions' reveals Chrysippus's sophisticated understanding of human psychology. He recognized that emotions begin as intellectual errors but can develop momentum that makes them difficult to control through reason alone. This is why he emphasized the importance of preparing in advance and training the mind to recognize and correct false judgments before they become overwhelming passions."
        }
      ]
    }
  }

  if (slug === 'musonius-rufus') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Noble Birth',
          content: `Gaius Musonius Rufus was born around 20-30 CE in Volsinii, an ancient Etruscan city in central Italy. He was born into the Roman equestrian class (eques), the aristocratic rank second only to senators, as the son of a Roman knight named Capito. This privileged background provided him with an excellent education and access to the highest levels of Roman society, advantages he would later use to promote Stoic philosophy among the elite.

Growing up in Etruria during the early years of the Roman Empire, Musonius witnessed the transformation of Roman society under the Julio-Claudian dynasty. His upbringing in a noble family exposed him to both the privileges and responsibilities of Roman citizenship, experiences that would later inform his teachings about virtue, duty, and the proper use of wealth and power.`
        },
        {
          title: 'Friendship with Rubellius Plautus and First Exile',
          content: `By the time of Emperor Nero's reign, Musonius had already gained fame in Rome as a teacher of Stoic philosophy. He formed a close friendship with Rubellius Plautus, a member of the imperial family whom Nero viewed as a potential threat to his rule. This association would prove both formative and dangerous for Musonius's career.

When Nero banished Rubellius Plautus around 60 CE, Musonius demonstrated remarkable loyalty by voluntarily accompanying his friend into exile in Asia Minor. This decision revealed the depth of his commitment to friendship and his willingness to sacrifice personal comfort for principle—values central to his later philosophical teachings. After Rubellius Plautus was killed in 62 CE, Musonius returned to Rome, where he continued teaching Stoicism despite the increasingly dangerous political climate.`
        },
        {
          title: 'The Pisonian Conspiracy and Exile to Gyaros',
          content: `Musonius's continued teaching of Stoic philosophy in Rome aroused the suspicion of Emperor Nero, who viewed Stoic philosophers as potential sources of political opposition. When the great conspiracy led by Calpurnius Piso against Nero was discovered in 65 CE, Musonius was implicated—likely on trumped-up charges—and banished to the harsh, desolate island of Gyaros in the Aegean Sea.

Gyaros was known for being "harsh and devoid of human culture," essentially a barren rock used as a place of punishment for political prisoners. Despite these brutal conditions, Musonius not only survived but thrived, forming a small community of philosophers and using his exile as a practical demonstration of Stoic principles. In his ninth discourse, he would later point out the advantages that exile offered to a practitioner of Stoicism, showing how adversity could become an opportunity for philosophical growth.`
        },
        {
          title: 'Return Under Galba and Political Involvement',
          content: `When Emperor Galba came to power in 68 CE, Musonius was allowed to return to Rome. His experiences in exile had only strengthened his commitment to Stoic principles and his reputation as a teacher. During the chaotic Year of the Four Emperors (69 CE), when Marcus Antonius Primus was marching on Rome for Vespasian, Musonius joined the ambassadors sent by Vitellius to negotiate.

In a remarkable display of his commitment to peace, Musonius went among the soldiers and preached about the blessings of peace and the dangers of war. Though he was quickly made to stop, this incident demonstrates his belief that philosophy should be actively applied to real-world situations, not merely discussed in academic settings. His courage in addressing armed soldiers about philosophical principles showed the practical nature of his Stoic teachings.`
        },
        {
          title: 'Justice and Teaching Epictetus',
          content: `When Vitellius's party gained the upper hand, Musonius was able to pursue justice against Publius Egnatius Celer, a Stoic philosopher who had betrayed Barea Soranus, another member of the Stoic opposition. Musonius successfully secured Celer's conviction, demonstrating that his philosophical principles included a commitment to justice and accountability, even within the philosophical community.

It was likely during this period that Musonius taught his most famous student, Epictetus. The relationship between teacher and student would prove to be one of the most important in the history of Stoicism, as Epictetus would go on to develop and transmit many of Musonius's practical teachings. Musonius's influence on Epictetus was profound, particularly in areas of practical ethics and the application of Stoic principles to daily life.`
        },
        {
          title: 'Second Exile and Final Return',
          content: `Despite being so highly esteemed that Emperor Vespasian initially allowed him to remain in Rome when other philosophers were banished from the city in 71 CE, Musonius was eventually exiled again around 75 CE. This second exile demonstrated the ongoing tension between Stoic philosophers and imperial authority, as emperors continued to view them as potential sources of political opposition.

Musonius returned to Rome only after Vespasian's death in 79 CE, during the reign of Titus. By this time, he was recognized as one of the greatest Stoic teachers of his generation, with a considerable following and widespread respect for his integrity and wisdom. His ability to survive two exiles and continue teaching demonstrated the practical value of the Stoic principles he advocated.`
        },
        {
          title: 'Teaching Philosophy and Revolutionary Ideas',
          content: `Musonius conceived of philosophy as nothing but the practice of noble behavior, emphasizing that virtue was more important than theoretical knowledge. He taught that philosophy was more difficult to learn than other subjects because students came to it already corrupted by vices and thoughtless habits, requiring them to unlearn false beliefs before they could embrace truth.

His most revolutionary teaching was his advocacy for women's education in philosophy. He argued that since women possessed the same rational faculties as men and the same capacity for virtue, they should receive identical philosophical education. This was a radical position in ancient Rome, where women's education was typically limited to domestic skills. His arguments for gender equality in education were centuries ahead of their time.`
        },
        {
          title: 'Death and Lasting Legacy',
          content: `Musonius died sometime before 101-102 CE, when Pliny the Younger mentioned his son-in-law Artemidorus, indicating that Musonius was no longer alive. His death marked the end of a remarkable life dedicated to the practical application of Stoic principles under the most challenging circumstances.

His legacy lived on through his students, particularly Epictetus, and through the collection of his teachings preserved by his followers. Unlike many ancient philosophers who left behind systematic treatises, Musonius's wisdom was preserved in the form of practical discourses and sayings that addressed real-life situations. His influence extended beyond philosophy to early Christian thought, and his ideas about gender equality, practical ethics, and the integration of philosophy with daily life continue to resonate today.`
        }
      ],
      quotes: [
        {
          text: "Philosophy is nothing but the practice of noble behavior.",
          explanation: "This fundamental principle of Musonius's teaching emphasizes that philosophy is not merely an intellectual exercise but a way of life. He believed that true philosophical understanding must be demonstrated through virtuous actions, not just theoretical knowledge. This practical approach to Stoicism made his teachings accessible and applicable to daily life, influencing generations of students including Epictetus."
        },
        {
          text: "Since the gods have given women the same power of reason as men, women ought to receive the same education in philosophy as men.",
          explanation: "This revolutionary statement placed Musonius centuries ahead of his time in advocating for gender equality in education. He argued that since women possess identical rational faculties and capacity for virtue as men, denying them philosophical education was unjust. His arguments laid important groundwork for later discussions of women's rights and capabilities."
        },
        {
          text: "The person who refuses to endure pain all but condemns himself to not being worthy of anything good.",
          explanation: "Musonius taught that hardship and suffering were necessary for developing virtue and character. He believed that avoiding difficulty weakened both body and soul, while embracing challenges strengthened them. This principle guided his own life through two exiles and numerous hardships, demonstrating that adversity could be transformed into opportunity for growth."
        },
        {
          text: "It is better to refuse to do wrong than to be prevented from it.",
          explanation: "This quote reflects Musonius's emphasis on moral agency and personal responsibility. He taught that true virtue comes from choosing to do right when we have the power to do wrong, not from external constraints. This principle guided his teaching that we should obey parents and authorities only when their commands are just and virtuous, placing moral duty above blind obedience."
        }
      ]
    }
  }

  if (slug === 'cato-the-younger') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Noble Birth and Early Tragedy',
          content: `Marcus Porcius Cato was born in 95 BCE into one of Rome's most distinguished families, the Porcii Catones. He was the great-grandson of the legendary Cato the Elder, whose moral authority and conservative values had made him a symbol of traditional Roman virtue. Born to Marcus Porcius Cato and Livia, Cato's early life was marked by privilege but also by profound loss.

When Cato was still very young, his father died, leaving him and his half-brother Quintus Servilius Caepio to be raised by their uncle, Marcus Livius Drusus. This early experience of loss would shape Cato's character, instilling in him a deep appreciation for the fragility of life and the importance of living according to principle rather than circumstance. His uncle Drusus was a prominent politician who advocated for Italian rights, exposing young Cato to the complexities of Roman politics from an early age.`
        },
        {
          title: 'Education in Stoic Philosophy',
          content: `From his youth, Cato was drawn to Stoic philosophy, which emphasized virtue as the only true good and taught that external circumstances could not affect one's inner tranquility. Unlike many Roman aristocrats who studied philosophy as an intellectual exercise, Cato embraced Stoicism as a complete way of life. He studied the works of Zeno of Citium, Cleanthes, and Chrysippus, but more importantly, he sought to embody their teachings in his daily conduct.

His commitment to Stoic principles was evident even in childhood. Ancient sources tell us that he was unusually serious and principled for his age, refusing to flatter or compromise his beliefs even when it would have been advantageous to do so. This early dedication to philosophical principles would become the defining characteristic of his entire life, earning him both admiration and criticism from his contemporaries.`
        },
        {
          title: 'Military Service and Character Formation',
          content: `As a young man, Cato served in the Roman military, where his character was further tested and refined. During his service in the Social War and later campaigns, he demonstrated the same unwavering commitment to duty and principle that would characterize his political career. Unlike many aristocratic officers who used military service as a stepping stone to political advancement, Cato genuinely cared about the welfare of his soldiers and the honor of Rome.

His military experiences reinforced his belief in the importance of discipline, courage, and self-sacrifice. He learned to endure hardship without complaint and to make difficult decisions based on principle rather than personal advantage. These lessons would prove invaluable when he later faced the moral challenges of Roman politics during the republic's final crisis.`
        },
        {
          title: 'Entry into Politics and Early Principles',
          content: `Cato began his political career by serving as quaestor in 64 BCE, where he immediately distinguished himself by his scrupulous honesty and attention to duty. While other magistrates often used their positions to enrich themselves or advance their careers, Cato treated his office as a sacred trust. He meticulously managed public finances, refused all bribes, and insisted on the highest standards of conduct from his subordinates.

His reputation for integrity quickly spread throughout Rome, earning him both respect and enemies. Many politicians found his inflexibility frustrating, as he refused to engage in the traditional practices of compromise and mutual favor-trading that kept the Roman political system functioning. However, his moral authority was undeniable, and even his opponents acknowledged his genuine commitment to the public good.`
        },
        {
          title: 'Tribune and the Catilinarian Conspiracy',
          content: `As tribune of the plebs in 62 BCE, Cato faced his first major political crisis when the Catilinarian conspiracy threatened the stability of the Roman state. When the Senate debated the fate of the conspirators, Cato delivered a powerful speech arguing for their execution, directly opposing Julius Caesar's proposal for life imprisonment. His speech was so compelling that it swayed the Senate to vote for the death penalty.

This moment established Cato as a major political force and demonstrated his willingness to take unpopular but principled stands. His opposition to Caesar during this crisis also marked the beginning of their lifelong political rivalry. While Caesar represented the populist tradition that appealed to the masses through bread and circuses, Cato embodied the conservative tradition that emphasized duty, virtue, and the rule of law.`
        },
        {
          title: 'Opposition to the First Triumvirate',
          content: `When Pompey, Caesar, and Crassus formed their secret political alliance (later called the First Triumvirate) in 60 BCE, Cato immediately recognized the threat it posed to republican government. He understood that when powerful individuals combined their resources and influence, they could effectively bypass the traditional checks and balances of the Roman constitution.

Cato became the leader of the opposition to this alliance, using every legal and procedural tool at his disposal to frustrate their plans. He employed filibusters, religious objections, and other parliamentary tactics to delay or prevent their legislation. While his opponents criticized him as obstructionist, Cato saw himself as defending the fundamental principles of republican government against those who would subvert it for personal gain.`
        },
        {
          title: 'Cyprus Mission and Moral Authority',
          content: `In 58 BCE, Cato was sent to annex the island of Cyprus, a mission that was partly intended to remove him from Rome during a critical political period. However, Cato turned this exile into a demonstration of his principles. He conducted the annexation with scrupulous honesty, refusing to enrich himself or his associates despite numerous opportunities to do so.

When he returned to Rome with the Cypriot treasury intact and properly accounted for, his reputation for integrity was further enhanced. In an age when provincial commands were typically seen as opportunities for personal enrichment, Cato's conduct stood out as a remarkable example of public service. This mission solidified his position as the moral conscience of the Roman Senate.`
        },
        {
          title: 'Final Stand and Noble Death',
          content: `When Caesar crossed the Rubicon in 49 BCE, beginning the civil war that would destroy the Roman Republic, Cato joined Pompey's forces despite his previous disagreements with Pompey. He understood that Caesar's victory would mean the end of republican government and the establishment of autocracy. After Pompey's defeat at Pharsalus, Cato continued to resist from North Africa.

When Caesar's final victory became inevitable, Cato faced a choice that would define his legacy. Rather than submit to Caesar's clemency and live under what he considered tyranny, Cato chose to end his own life in Utica in 46 BCE. Before his suicide, he spent his final evening discussing Stoic philosophy with friends, particularly Plato's dialogue on the immortality of the soul. His death was seen as the ultimate expression of Stoic principles: choosing death over dishonor, and freedom over slavery. This act made him a martyr for republican ideals and inspired future generations, including the American Founding Fathers, who saw in Cato a model of principled resistance to tyranny.`
        }
      ],
      quotes: [
        {
          text: "I would rather be good than seem good.",
          explanation: "This quote encapsulates Cato's fundamental approach to life and politics. While many politicians focused on appearances and public perception, Cato was concerned only with actual virtue and moral integrity. He believed that true worth came from one's character and actions, not from reputation or popular opinion. This principle guided his refusal to engage in the typical political compromises and favor-trading of Roman politics."
        },
        {
          text: "The willing, destiny guides them. The unwilling, destiny drags them.",
          explanation: "Drawing from Stoic philosophy, this quote reflects Cato's belief in accepting fate while maintaining moral agency. He understood that while we cannot control external events, we can choose how to respond to them. Those who align themselves with virtue and accept what cannot be changed will find peace, while those who resist the natural order will suffer. This philosophy sustained him through political defeats and personal tragedies."
        },
        {
          text: "It is better to refuse to do wrong than to be prevented from it.",
          explanation: "This statement reveals Cato's emphasis on moral choice and personal responsibility. He believed that true virtue comes from choosing to do right when we have the power to do wrong, not from external constraints that prevent wrongdoing. This principle guided his political career, where he consistently chose principle over expediency, even when it cost him political advantage or personal safety."
        },
        {
          text: "No one can harm you without your permission.",
          explanation: "This quintessentially Stoic teaching, which Cato embodied throughout his life, holds that true harm comes not from external events but from our own judgments and responses to those events. Physical injury, political defeat, or material loss cannot touch the essential self if one maintains virtue and proper perspective. Cato demonstrated this belief by remaining unshaken by political setbacks and ultimately choosing death over what he saw as spiritual compromise."
        }
      ]
    }
  }

  if (slug === 'diogenes-of-babylon') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Birth in Babylonia and Early Education',
          content: `Diogenes was born around 230 BCE in Seleucia on the Tigris, a major Hellenistic city in Babylonia (modern-day Iraq). This cosmopolitan center was part of the Seleucid Empire and served as a crucial hub where Greek culture met Eastern traditions. Growing up in this diverse environment exposed young Diogenes to various philosophical and cultural influences that would later inform his broad intellectual interests.

His family likely belonged to the Greek-speaking elite of the city, as evidenced by his later education in Athens. The multicultural atmosphere of Seleucia, with its blend of Greek, Persian, and Mesopotamian traditions, may have contributed to his later interest in music and rhetoric as universal forms of human expression that transcended cultural boundaries.`
        },
        {
          title: 'Studies in Athens Under Chrysippus',
          content: `As a young man, Diogenes traveled to Athens to study philosophy at the Stoic school, where he became a student of the great Chrysippus, the third head of the Stoic school and one of its most important systematizers. Under Chrysippus's tutelage, Diogenes mastered the complex logical and dialectical methods that characterized mature Stoicism.

Chrysippus was known for his rigorous approach to logic and his ability to defend Stoic doctrine against critics from other philosophical schools. Diogenes absorbed these skills and became particularly adept at dialectic—the art of logical argumentation and debate. His training under Chrysippus prepared him not only to understand Stoic philosophy deeply but also to defend and teach it effectively to others, including philosophers from rival schools.`
        },
        {
          title: 'Rise to Leadership of the Stoic School',
          content: `After Chrysippus's death, the leadership of the Stoic school passed to Zeno of Tarsus, and when Zeno died, Diogenes succeeded him as scholarch (head) of the school. This position made him one of the most influential philosophers in the Hellenistic world, responsible for maintaining and developing Stoic doctrine while training the next generation of philosophers.

As head of the school, Diogenes was known for closely following the teachings of Chrysippus while also developing his own contributions to Stoic thought. He attracted students from across the Mediterranean world, including future leaders of the school like Panaetius of Rhodes and Antipater of Tarsus. His reputation for learning and wisdom extended beyond the Stoic community, earning him respect even from philosophers of opposing schools.`
        },
        {
          title: 'The Famous Embassy to Rome (155 BCE)',
          content: `In 155 BCE, Athens faced a crisis when Rome imposed a heavy fine of 500 talents for the city's attack on Oropus. The Athenians decided to send their three most distinguished philosophers as ambassadors to appeal this penalty: Diogenes representing the Stoics, Carneades representing the Academic skeptics, and Critolaus representing the Peripatetics.

This embassy became one of the most famous philosophical missions in ancient history. The three philosophers not only conducted their diplomatic business but also gave public lectures that introduced Roman audiences to Greek philosophy on an unprecedented scale. Diogenes impressed his Roman audiences with his measured, dignified speaking style, which contrasted with the more flamboyant approaches of his colleagues. His sober presentation of Stoic ideas about virtue, duty, and rational living resonated with Roman values and helped establish Stoicism's later popularity in Rome.`
        },
        {
          title: 'Prolific Writer and Teacher',
          content: `Diogenes was an extraordinarily productive writer, authoring numerous works that covered the full range of Stoic philosophy. His writings included treatises on dialectic, ethics, physics, music, rhetoric, and divination. Though none of his works survived intact, later philosophers quoted him extensively, particularly Cicero and the Epicurean Philodemus.

His most innovative contributions were in areas that previous Stoics had not explored deeply. He wrote extensively on music theory, arguing that music could heal psychological ailments and promote virtue. He also developed Stoic approaches to rhetoric and literary criticism. His work "On Music" was particularly influential, proposing that just as physical exercise strengthens the body, musical training could strengthen the mind and character.`
        },
        {
          title: 'Revolutionary Theory of Music and Psychology',
          content: `Diogenes developed a sophisticated theory about music's psychological and ethical effects that was revolutionary for its time. He argued that music was not merely entertainment but a powerful tool for mental health and moral development. According to his theory, different types of music could calm emotions, restore psychological balance, and even treat mental illnesses.

He used the example of military music, particularly the trumpet, to demonstrate how sound could inspire courage and motivate action. This insight led him to propose that music education should be part of philosophical training, as it could help develop the emotional equilibrium that Stoics valued. His ideas about music therapy anticipated modern understanding of music's therapeutic potential by over two millennia.`
        },
        {
          title: 'Influence on Later Stoicism',
          content: `Through his students Panaetius and Antipater of Tarsus, Diogenes's influence extended far beyond his own lifetime. Panaetius would later adapt Stoicism for Roman audiences, while Antipater continued the Greek tradition of the school. Both carried forward Diogenes's emphasis on the practical applications of philosophy and his interest in how Stoic principles could be applied to various aspects of human life.

His work also influenced the development of Stoic literary and aesthetic theory. Later Stoics drew on his insights about music and rhetoric when developing their own approaches to poetry, oratory, and artistic expression. His belief that the arts could serve virtue rather than merely provide pleasure became an important theme in later Stoic thought.`
        },
        {
          title: 'Death and Legacy',
          content: `Diogenes died around 140 BCE at approximately 80 years of age, having led the Stoic school for several decades. His death marked the end of an era in which the school had maintained its purely Greek character before beginning its transformation into the more practical, Roman-influenced philosophy that would dominate the imperial period.

His legacy lived on through his students and his ideas about the relationship between philosophy and the arts. The embassy to Rome that he led helped establish the foundation for Stoicism's later success in the Roman world, while his theoretical contributions to music and psychology demonstrated the breadth and sophistication of Stoic thought. Modern scholars recognize him as a crucial bridge figure who helped Stoicism evolve from a purely Greek philosophical system into a more universal approach to human flourishing.`
        }
      ],
      quotes: [
        {
          text: "Music can bring health to the mind and treat psychological illnesses.",
          explanation: "This quote represents Diogenes's revolutionary understanding of music's therapeutic potential. He believed that just as medicine could heal physical ailments, music could address mental and emotional disorders. This insight was remarkably advanced for his time and anticipated modern music therapy by over two thousand years. For Diogenes, this wasn't merely theoretical—he saw music as a practical tool that philosophers and physicians could use to restore psychological balance and promote mental well-being."
        },
        {
          text: "Just as diet and exercise produce a healthy body, music can bring health to the mind.",
          explanation: "This analogy reveals Diogenes's systematic approach to human development. He understood that just as the body requires proper nutrition and physical training to function optimally, the mind needs appropriate 'exercise' to maintain its health. Music, in his view, provided this mental exercise by engaging our emotional and rational faculties simultaneously. This holistic understanding of human nature was characteristic of Stoic philosophy, which always sought to integrate physical, mental, and spiritual well-being."
        },
        {
          text: "Music is an art which leads to virtue.",
          explanation: "For Diogenes, music was not merely entertainment or aesthetic pleasure—it was a pathway to moral development. He believed that properly composed and performed music could inspire noble emotions, encourage virtuous behavior, and help develop the kind of character that Stoics valued. This connection between artistic beauty and moral goodness was a sophisticated insight that influenced later Stoic thinking about the role of the arts in philosophical education and personal development."
        },
        {
          text: "The trumpet stirs the soldier to bravery through the power of music.",
          explanation: "This practical example demonstrates how Diogenes understood music's immediate psychological effects. He observed that military music could instantly transform a soldier's emotional state, inspiring courage and determination in the face of danger. This showed him that music had real power to influence human behavior and emotions, not through rational argument but through direct emotional impact. He saw this as evidence that music could be a valuable tool for developing virtue and managing the passions that Stoics sought to regulate."
        }
      ]
    }
  }

  if (slug === 'panaetius-of-rhodes') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Noble Birth in Rhodes',
          content: `Panaetius was born around 185-180 BCE into one of the most distinguished families of Rhodes, an island that had become a major center of Hellenistic culture and commerce. His father was Nicagoras, and the family had a long tradition of public service and intellectual achievement. Rhodes at this time was an independent city-state that maintained its autonomy through careful diplomacy, serving as a bridge between the Greek East and the emerging Roman West.

The island's strategic position in the eastern Mediterranean made it a cosmopolitan center where different cultures and ideas converged. This multicultural environment would profoundly influence Panaetius's later philosophical approach, which emphasized practical wisdom and cultural adaptation. Growing up in such an environment, he was exposed from an early age to the challenges of maintaining traditional values while adapting to changing political and social circumstances.`
        },
        {
          title: 'Philosophical Education in Athens',
          content: `As a young man, Panaetius traveled to Athens to pursue his philosophical education, following the traditional path of wealthy Greeks seeking intellectual refinement. He initially studied under various teachers, including the linguist Crates of Mallus and attended lectures by Critolaus (a Peripatetic) and Carneades (the head of the Academic school), giving him exposure to different philosophical traditions.

However, he was most drawn to Stoicism and became a devoted student of Diogenes of Babylon, who was then head of the Stoic school. Under Diogenes's guidance, and later under Antipater of Tarsus, Panaetius mastered the complex system of Stoic philosophy. Unlike many students who simply absorbed their teachers' doctrines, Panaetius began early to think critically about how Stoic principles could be adapted and applied to real-world situations, particularly in the context of political and social life.`
        },
        {
          title: 'Journey to Rome and the Scipionic Circle',
          content: `Panaetius's life took a decisive turn when he was introduced to Roman society through Gaius Laelius, a Roman statesman who had attended philosophical lectures in Athens. Through Laelius, Panaetius met Scipio Aemilianus, one of Rome's most distinguished generals and statesmen, who would become both his patron and close friend. This relationship opened the doors to the highest levels of Roman society.

Panaetius became a member of the famous Scipionic Circle, an informal group of intellectuals, politicians, and writers who gathered around Scipio Aemilianus. This circle included figures like the historian Polybius, the playwright Terence, and various Roman nobles interested in Greek culture and philosophy. In this environment, Panaetius encountered the practical challenges of governance, military leadership, and cultural integration that would shape his philosophical development.`
        },
        {
          title: 'Ambassador to the East',
          content: `In 139-138 BCE, Panaetius accompanied Scipio Aemilianus on a diplomatic mission to the Hellenistic kingdoms of the East. This embassy was designed to assess the political situation in the eastern Mediterranean and strengthen Rome's relationships with various Greek rulers. For Panaetius, this journey was both a diplomatic assignment and a philosophical pilgrimage, as he visited the centers of Greek learning and culture.

The embassy took them to Egypt, Syria, and other major Hellenistic centers, where Panaetius observed firsthand how Greek culture was adapting to Roman hegemony. He saw how traditional Greek institutions were being modified to accommodate Roman power, and how Greek intellectuals were finding ways to maintain their cultural identity while serving new masters. These observations would profoundly influence his later work on how philosophy should adapt to changing circumstances while maintaining its essential principles.`
        },
        {
          title: 'Philosophical Innovation in Rome',
          content: `During his years in Rome, Panaetius began developing his distinctive approach to Stoicism. He recognized that the rigid doctrines of early Stoicism, while intellectually impressive, were often impractical for people engaged in active political and social life. He began to modify Stoic teachings to make them more applicable to Roman aristocrats who needed philosophical guidance for their roles as leaders, generals, and statesmen.

His most significant innovation was his rejection of the Stoic doctrine of apatheia (complete emotional detachment). Instead, he argued that certain emotions and pleasures could be natural and beneficial if properly regulated by reason. He also abandoned the early Stoic belief in cosmic conflagration (the idea that the universe periodically burns up and is reborn), finding it irrelevant to practical ethics. These modifications made Stoicism more appealing to Romans while maintaining its essential emphasis on virtue and rational living.`
        },
        {
          title: 'Return to Athens and Leadership of the School',
          content: `After Scipio Aemilianus's death in 129 BCE, Panaetius returned to Athens to assume leadership of the Stoic school, succeeding Antipater of Tarsus as scholarch. This position made him the most influential Stoic philosopher of his generation and gave him the opportunity to systematize his innovations and train the next generation of Stoic teachers.

As head of the school, Panaetius attracted students from across the Mediterranean world. His most famous pupil was Posidonius of Apamea, who would later become a renowned philosopher and scientist in his own right. Panaetius's teaching emphasized the practical application of philosophy to real-world problems, and he encouraged his students to engage with political and social issues rather than retreating into purely theoretical speculation.`
        },
        {
          title: 'Literary Works and Influence',
          content: `Panaetius was a prolific writer whose works covered ethics, politics, psychology, and practical philosophy. His masterpiece was "On Duties" (Peri tou Kathēkontos), a three-book treatise that examined moral obligations in practical contexts. The work was structured to address what is morally right, what is practically useful, and how to resolve apparent conflicts between moral and practical considerations.

Although Panaetius died before completing the third section of this work, the first two books became enormously influential. Cicero used them as the primary source for his own "De Officiis" (On Duties), which became one of the most widely read works of moral philosophy in the Western tradition. Through Cicero's adaptation, Panaetius's ideas about practical ethics influenced medieval and Renaissance thought, and later inspired political philosophers like John Locke and the American Founding Fathers.`
        },
        {
          title: 'Death and Lasting Legacy',
          content: `Panaetius died in Athens around 110-109 BCE, having served as head of the Stoic school for nearly two decades. His death marked the end of an era in Stoic philosophy, as he was the last undisputed leader of the school. After his death, Stoicism became more fragmented, with different teachers developing their own interpretations of Stoic doctrine.

However, his influence continued through his students and his writings. Posidonius carried forward his teacher's emphasis on practical philosophy and scientific inquiry, while Cicero's adaptation of his ethical teachings brought Stoic ideas to a broader Roman audience. Most importantly, Panaetius had successfully transformed Stoicism from a purely Greek philosophical system into a more universal approach to human flourishing that could adapt to different cultures and circumstances. This transformation laid the groundwork for the later Roman Stoicism of Seneca, Epictetus, and Marcus Aurelius, ensuring that Stoic philosophy would continue to influence Western thought for centuries to come.`
        }
      ],
      quotes: [
        {
          text: "Philosophy must be applied to life, not remain in abstract speculation.",
          explanation: "This quote captures Panaetius's revolutionary approach to Stoicism. While earlier Stoics had developed sophisticated theoretical systems, Panaetius believed that philosophy's true value lay in its practical application to daily life. He saw abstract speculation as potentially valuable but ultimately meaningless unless it helped people live better lives. This emphasis on practical philosophy made Stoicism more accessible to Roman aristocrats and politicians who needed philosophical guidance for their active roles in society."
        },
        {
          text: "Virtue alone is not enough if there is no adequate living and health.",
          explanation: "This statement represents Panaetius's modification of traditional Stoic doctrine, which held that virtue was the only true good and that external things like health and material comfort were completely indifferent. Panaetius argued that while virtue remained the highest good, practical considerations like health and adequate resources were necessary for most people to live virtuous lives effectively. This more moderate position made Stoicism more realistic and appealing to people engaged in active political and social life."
        },
        {
          text: "Moral definitions should be laid down so they can be applied by those who have not yet attained wisdom.",
          explanation: "Panaetius recognized that traditional Stoic ethics, which were designed for the perfectly wise sage, were often impractical for ordinary people still developing their moral understanding. He believed that philosophical teachings should be formulated in ways that could guide people at all stages of moral development, not just those who had achieved perfect wisdom. This insight led him to develop more practical and accessible approaches to ethical decision-making that could help people make progress toward virtue."
        },
        {
          text: "The Roman Republic represents the ideal combination of monarchy, aristocracy, and democracy.",
          explanation: "Following his friend Polybius, Panaetius saw the Roman constitution as a nearly perfect example of mixed government that combined the best features of different political systems while avoiding their typical weaknesses. He believed that Rome's success came from balancing monarchical efficiency (through consuls), aristocratic wisdom (through the Senate), and democratic participation (through popular assemblies). This political theory influenced later thinkers and contributed to the development of modern constitutional theory, particularly the American system of checks and balances."
        }
      ]
    }
  }

  if (slug === 'hecato-of-rhodes') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Birth and Early Life in Rhodes',
          content: `Hecato was born around 150 BCE in Rhodes, the same island that had produced his teacher Panaetius. Rhodes during this period was a thriving center of Hellenistic culture, commerce, and learning, strategically positioned between the Greek East and the emerging Roman West. The island maintained its independence through careful diplomacy and had become a haven for intellectuals, artists, and philosophers seeking to bridge different cultural traditions.

Growing up in this cosmopolitan environment, Hecato was exposed from an early age to the practical challenges of maintaining philosophical principles while navigating complex political and social realities. Rhodes was known for its pragmatic approach to governance and its ability to adapt to changing circumstances while preserving its essential character—qualities that would later be reflected in Hecato's philosophical approach.`
        },
        {
          title: 'Student of Panaetius',
          content: `Hecato became a devoted student of Panaetius of Rhodes, who was revolutionizing Stoic philosophy by making it more practical and accessible. Under Panaetius's guidance, Hecato learned to approach philosophical questions not as abstract theoretical problems but as practical challenges that real people faced in their daily lives. This education shaped his entire philosophical outlook and his later contributions to Stoic ethics.

Panaetius had already begun the work of adapting traditional Stoic doctrine to make it more applicable to people engaged in active political and social life. Hecato absorbed these lessons and took them even further, developing a sophisticated understanding of how philosophical principles could guide practical decision-making in complex moral situations. His teacher's emphasis on the importance of cultural adaptation and practical wisdom became central themes in Hecato's own work.`
        },
        {
          title: 'Connection to the Scipionic Circle',
          content: `Through his association with Panaetius, Hecato likely became connected to the famous Scipionic Circle, an influential group of intellectuals, politicians, and writers who gathered around the Roman general Scipio Aemilianus. This circle included historians like Polybius, playwrights like Terence, and various Roman nobles interested in Greek culture and philosophy.

Participation in this circle would have given Hecato direct exposure to the highest levels of Roman political and military leadership, allowing him to observe firsthand how philosophical principles could be applied to governance, diplomacy, and military command. These experiences likely influenced his later work on practical ethics and his understanding of how moral philosophy should guide real-world decision-making.`
        },
        {
          title: 'Prolific Writer on Ethics',
          content: `Hecato was an extraordinarily productive writer, authoring at least thirty books on various aspects of ethics and moral philosophy. His works covered practical moral questions, casuistry (the application of moral principles to specific cases), and the relationship between individual virtue and social responsibility. Unfortunately, the vast majority of his writings have been lost to time, with only twenty-nine fragments surviving in quotations by later authors.

His approach to ethics was notably practical and accessible. Rather than focusing on abstract theoretical questions, Hecato was interested in how ordinary people could apply Stoic principles to the moral challenges they faced in their daily lives. He developed sophisticated methods for analyzing complex moral situations and determining the most virtuous course of action in difficult circumstances.`
        },
        {
          title: 'Theory of Virtue and Self-Interest',
          content: `One of Hecato's most important contributions to Stoic philosophy was his nuanced understanding of the relationship between virtue and self-interest. Unlike some earlier Stoics who seemed to advocate for complete self-denial, Hecato argued that taking care of one's private interests could be entirely consistent with virtue, provided that one's intentions were properly oriented toward the common good.

He believed that a wise person should work to improve their own circumstances not for selfish reasons but because individual prosperity contributes to the welfare of family, friends, and society as a whole. This insight helped resolve some of the practical tensions that people faced when trying to live according to Stoic principles while also fulfilling their responsibilities to others and to society.`
        },
        {
          title: 'Classification of Virtues',
          content: `Hecato made significant contributions to Stoic moral psychology by developing a systematic classification of virtues. According to Diogenes Laertius, he divided virtues into two distinct categories: those founded on scientific intellectual principles (such as justice and wisdom) and those that lacked this same theoretical foundation (such as temperance).

This classification system helped clarify how different virtues operated and how they could be developed through education and practice. Hecato believed, like earlier Stoics such as Chrysippus and Cleanthes, that virtue could be taught, but his classification system provided a more sophisticated understanding of how this teaching should be approached for different types of moral excellence.`
        },
        {
          title: 'Influence on Later Philosophers',
          content: `Despite being largely forgotten by modern readers, Hecato was enormously influential during his own time and for several centuries afterward. He was frequently quoted by major figures like Seneca, Cicero, and Diogenes Laertius—sometimes even more frequently than his famous teacher Panaetius. This suggests that his contemporaries and immediate successors found his ideas particularly valuable and applicable.

Seneca, in particular, drew heavily on Hecato's insights about practical ethics and the relationship between hope and fear. Cicero referenced his work on moral casuistry and the application of ethical principles to specific situations. Through these later authors, Hecato's ideas continued to influence philosophical thought even after his original works were lost.`
        },
        {
          title: 'Legacy and Modern Relevance',
          content: `Hecato's fate—being highly influential during his lifetime but largely forgotten by later generations—illustrates the complex dynamics of philosophical influence and historical memory. His ideas were so thoroughly absorbed and integrated by later thinkers that his original contributions became invisible, subsumed into the broader tradition of Stoic thought.

However, the fragments of his work that do survive reveal a sophisticated thinker who grappled with many of the same challenges that face people today: how to balance personal ambition with social responsibility, how to maintain hope without becoming paralyzed by fear, and how to develop a healthy relationship with oneself while remaining connected to others. His insights about the importance of befriending oneself and the reciprocal nature of love remain remarkably relevant to contemporary discussions about mental health, relationships, and personal development.`
        }
      ],
      quotes: [
        {
          text: "Cease to hope, and you will cease to fear.",
          explanation: "This is Hecato's most famous quote, preserved by Seneca in his Letters to Lucilius. At first glance, it might seem to advocate for nihilism or emotional numbness, but Seneca's commentary reveals a deeper meaning. Both hope and fear involve projecting our consciousness into the future, away from the present moment where we actually have the power to act and make changes. When we place all our hopes on future events, we inevitably create corresponding fears about those same events not coming to pass. Hecato suggests that by focusing on the present moment and what we can control right now, we can escape this cycle of emotional dependence on uncertain future outcomes."
        },
        {
          text: "What progress have I made? I have begun to be a friend to myself.",
          explanation: "This quote, also preserved by Seneca, captures Hecato's insight about the fundamental importance of developing a genuine relationship with oneself. In our modern world, we often focus so much energy on pleasing others, advancing our careers, and maintaining our public image that we neglect to cultivate a deep understanding and appreciation of who we really are. Hecato suggests that true progress in philosophy and life begins with learning to know, respect, and love yourself. Only when you have developed this internal friendship can you offer authentic friendship to others and contribute meaningfully to the world."
        },
        {
          text: "If you want to be loved, love.",
          explanation: "This simple but profound statement reveals Hecato's understanding of love as a creative force rather than a scarce resource. Unlike material goods that diminish when shared, love actually multiplies when given away. This insight challenges the common assumption that we should wait to receive love before giving it, or that we should carefully ration our affection to ensure we don't run out. Instead, Hecato suggests that love operates according to a different logic entirely—the more we give, the more we receive. This principle applies not only to romantic relationships but to all forms of human connection and community building."
        },
        {
          text: "It is a wise man's duty to take care of his private interests, while doing nothing contrary to civil customs and laws.",
          explanation: "This quote reflects Hecato's sophisticated understanding of the relationship between individual virtue and social responsibility. He argues that taking care of one's own interests is not only permissible but actually a moral duty, provided that this self-care is conducted within the bounds of law and social custom and is motivated by virtuous intentions. The key insight is that individual prosperity, when properly pursued, contributes to the welfare of family, friends, and society as a whole. This perspective helped resolve the apparent tension between Stoic virtue and practical success, showing that they could be mutually reinforcing rather than contradictory."
        }
      ]
    }
  }

  // Add detailed life stories for new philosophers
  if (slug === 'antoninus-pius') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Rise to Power',
          content: `Titus Aelius Hadrianus Antoninus was born on September 19, 86 CE, in Lanuvium, a small town southeast of Rome. Born into a wealthy senatorial family with origins in Gaul, Antoninus received an excellent education and showed early promise in law and administration. His family had strong connections to the imperial court, which would prove crucial to his later rise to power.

Antoninus served in various administrative positions throughout the empire, demonstrating exceptional competence and integrity. He served as consul in 120 CE and was later assigned by Emperor Hadrian to assist with judicial administration in Italy. Around 134 CE, he governed the province of Asia, where his fair and effective leadership caught the attention of Emperor Hadrian, who was searching for a suitable successor.`
        },
        {
          title: 'Adoption and Preparation for Rule',
          content: `In 138 CE, Emperor Hadrian adopted Antoninus as his heir, giving him the title of Caesar. However, Hadrian specified a crucial condition: Antoninus must in turn adopt both Marcus Aurelius and Lucius Verus as his own successors. This arrangement created a carefully planned succession that would ensure stability for the empire for generations to come.

Upon his adoption, Antoninus persuaded a reluctant Senate to offer the customary divine honors to Hadrian after the emperor's death. For this act of filial piety, and possibly other dutiful acts, he was given the surname "Pius" by the Senate. This title would define his character and reign, emphasizing his devotion to duty, family, and the gods.`
        },
        {
          title: 'Reign as Emperor',
          content: `Antoninus Pius became emperor in 138 CE and ruled for twenty-three years until his death in 161 CE. His reign was marked by unprecedented peace and prosperity, earning him recognition as one of the "Five Good Emperors." Unlike many of his predecessors, he rarely left Italy and focused on internal administration rather than military conquest.

His reign was so peaceful that few striking events occurred during his twenty-three years of rule. A rebellion in Roman Britain was suppressed, and in 142 CE, a 36-mile garrisoned barrier called the Antonine Wall was built to extend the Roman frontier some 100 miles north of Hadrian's Wall. His armies contained revolts in Mauretania, Germany, Dacia, and Egypt, but these were handled efficiently without major campaigns.`
        },
        {
          title: 'Mentorship of Marcus Aurelius',
          content: `Perhaps Antoninus Pius's greatest contribution to Stoic philosophy was his role as mentor and adoptive father to Marcus Aurelius. For over twenty years, he carefully prepared Marcus for imperial responsibilities, exposing him to the finest Stoic teachers and philosophical education available. Under Antoninus's guidance, Marcus learned not just the mechanics of governance, but the Stoic principles of duty, justice, and service to others.

Antoninus embodied the Stoic virtues in his daily life, demonstrating through example how philosophical principles could be applied to the highest levels of leadership. His patient, methodical approach to problems and his commitment to justice deeply influenced Marcus Aurelius's own philosophical development and approach to ruling. The feeling of well-being that pervaded the empire under Antoninus is reflected in the celebrated panegyric by the orator Aelius Aristides in 143-144 CE.`
        },
        {
          title: 'Death and Legacy',
          content: `Antoninus Pius died peacefully on March 7, 161 CE, at the age of 74, after ruling for nearly 23 years. His death marked the end of one of the most stable and prosperous periods in Roman history. He was immediately deified by the Senate, and his reign became the standard by which future emperors would be measured.

His legacy lived on through Marcus Aurelius, who frequently referenced his adoptive father's wisdom and example in his "Meditations." When his wife Faustina died in late 140 or early 141 CE, he founded in her memory the Puellae Faustinianae, a charitable institution for the daughters of the poor. Antoninus Pius proved that Stoic philosophy could guide effective leadership, showing that virtue and practical governance were not only compatible but mutually reinforcing.`
        }
      ],
      quotes: []
    }
  }

  if (slug === 'lucius-verus') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Adoption',
          content: `Lucius Ceionius Commodus was born on December 15, 130 CE, in Rome. He was the eldest son of Lucius Aelius Caesar, who had been Emperor Hadrian's first adopted heir. When his father died unexpectedly on January 1, 138 CE, the young Lucius found himself in a precarious position. However, Emperor Hadrian's careful succession planning ensured his future.

Hadrian chose Antoninus Pius as his new heir but required him to adopt both Lucius and Marcus Aurelius as his own sons. This arrangement made Lucius Hadrian's adoptive grandson through two different lines of succession. He received an excellent education from the famous grammaticus Marcus Cornelius Fronto, who reported that Lucius was an excellent student with a particular fondness for writing poetry and delivering speeches.`
        },
        {
          title: 'Rise to Co-Emperor',
          content: `Lucius began his political career early, serving as quaestor in 153 CE (one year before the legal age) and becoming consul in 154 CE. When Antoninus Pius died on March 7, 161 CE, Marcus Aurelius was designated as the sole successor. However, Marcus refused to take office unless Lucius received equal powers, demonstrating the strong bond between the adoptive brothers.

The Senate accepted this unprecedented arrangement, making Lucius the first co-emperor in Roman history. He took the name Lucius Aurelius Verus Augustus, while Marcus became Marcus Aurelius Antoninus Augustus. Though they held equal titles, Marcus clearly held more authority due to his greater experience and his role as Pontifex Maximus. As one biographer noted, "Verus obeyed Marcus as a lieutenant obeys a proconsul."`
        },
        {
          title: 'The Parthian War',
          content: `The first major crisis of the joint reign came when Vologases IV of Parthia invaded Armenia in 161 CE, installing his own king and threatening Roman interests in the East. It was decided that Lucius should personally direct the Parthian War, as he was considered stronger and healthier than Marcus, and more suited to military activity.

Lucius departed for the East in 162 CE, accompanied by experienced advisors including the praetorian prefect Furius Victorinus and several seasoned generals. He established his headquarters in Antioch, from where he coordinated a successful campaign that lasted from 161 to 166 CE. Under his command, Roman forces recaptured Armenia, invaded Mesopotamia, and even sacked the Parthian capital of Ctesiphon. The war ended in complete Roman victory, with Lucius earning the titles Armeniacus and Parthicus Maximus.`
        },
        {
          title: 'Personal Life and Character',
          content: `During the Parthian campaign, Lucius married Marcus Aurelius's daughter Lucilla in Ephesus around 164 CE, strengthening the bond between the co-emperors. However, his time in the East also revealed aspects of his character that concerned some observers. He was known for his love of luxury, entertainment, and the company of actors and musicians.

Critics accused him of spending too much time gambling and enjoying the pleasures of Antioch rather than focusing solely on military matters. He took a mistress named Panthea from Smyrna, who was described as a woman of perfect beauty and wit. Despite these personal indulgences, Lucius maintained his effectiveness as a military commander and fulfilled his imperial duties. His tutor Fronto defended him, arguing that the Roman people needed such entertainments to keep them content.`
        },
        {
          title: 'Death and Legacy',
          content: `After the successful conclusion of the Parthian War, Lucius returned to Rome and spent two years (166-168 CE) in the capital. In 168 CE, he joined Marcus Aurelius on the Danube frontier to face new threats from Germanic tribes. However, his military career was cut short when he fell ill and died on January 23, 169 CE, at Altinum in northern Italy, at the age of 38.

Lucius Verus was deified by the Roman Senate as Divus Verus. His death left Marcus Aurelius as sole emperor for the remainder of his reign. Despite his reputation for luxury and pleasure-seeking, Lucius had proven himself an effective military leader and loyal co-ruler. His successful Parthian campaign secured Rome's eastern frontier for decades and demonstrated that the unique experiment of co-emperorship could work when built on mutual respect and shared Stoic values of duty to the state.`
        }
      ],
      quotes: []
    }
  }

  if (slug === 'commodus') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Birth and Early Life',
          content: `Lucius Aelius Aurelius Commodus was born on August 31, 161 CE, in Lanuvium, near Rome. He was the son of Emperor Marcus Aurelius and Faustina the Younger, making him the first emperor "born in the purple" - meaning during his father's reign. Commodus had a twin brother, Titus Aurelius Fulvus Antoninus, who died in 165 CE, and a younger brother, Marcus Annius Verus, who died in 169 CE after a failed operation.

As the son of the philosopher-emperor, Commodus received an exceptional education under the care of his father's physician, Galen, and numerous distinguished teachers including Onesicrates, Antistius Capella, Titus Aius Sanctus, and Pitholaus. Despite this excellent education in Stoic philosophy and imperial administration, Commodus would later reject many of his father's austere principles and philosophical approach to life.`
        },
        {
          title: 'Rise to Power',
          content: `Commodus accompanied his father during the Marcomannic Wars in 172 CE and was present at Carnuntum, the military headquarters. On October 15, 172 CE, he was given the victory title Germanicus in the presence of the army. On January 20, 175 CE, he entered the College of Pontiffs, marking the beginning of his public career.

On November 27, 176 CE, Marcus Aurelius bestowed the title of Imperator on Commodus, and on June 17, 177 CE, he became Augustus (co-emperor) at the unprecedented age of 15. On January 1, 177 CE, he became consul for the first time, making him the youngest consul in Roman history. He subsequently married Bruttia Crispina before accompanying his father to the Danubian front. When Marcus Aurelius died on March 17, 180 CE, the 18-year-old Commodus became sole emperor.`
        },
        {
          title: 'Early Reign and Departure from Stoicism',
          content: `Upon becoming sole emperor, Commodus immediately began to diverge from his father's Stoic principles and policies. Where Marcus Aurelius had been marked by almost continuous warfare and philosophical reflection, Commodus's rule was comparatively peaceful militarily but characterized by political strife and increasingly erratic behavior.

Commodus quickly negotiated peace with the Danubian tribes and returned to Rome, showing little interest in the business of administration that had consumed his father. Instead, he left the practical running of the state to a succession of favorites, beginning with Saoterus, a freedman from Nicomedia who had become his chamberlain. This delegation of power would become a defining characteristic of his reign and a source of growing discontent among the senatorial class.`
        },
        {
          title: 'Megalomania and Gladiatorial Obsession',
          content: `As his reign progressed, Commodus became increasingly megalomaniacal, developing a deific personality cult centered around his identification with Hercules. He commissioned countless statues showing himself dressed as Hercules with a lion's hide and club, believing himself to be the reincarnation of the legendary hero. He even had the head of the Colossus of Nero replaced with his own portrait, complete with Hercules' attributes.

Commodus's most notorious obsession was with gladiatorial combat. He frequently appeared in the Colosseum as a gladiator, fighting both animals and human opponents (though his human opponents were instructed to submit). He was skilled with a bow and could shoot the heads off ostriches in full gallop. In November 192 CE, he held Plebeian Games where he shot hundreds of animals with arrows and javelins every morning and fought as a gladiator every afternoon, winning all fights. He announced his intention to inaugurate the year 193 CE as both consul and gladiator.`
        },
        {
          title: 'Assassination and the End of an Era',
          content: `Commodus's increasingly erratic behavior and megalomania eventually led to his downfall. In late 192 CE, his mistress Marcia, the praetorian prefect Quintus Aemilius Laetus, and his chamberlain Eclectus discovered they were on a list of people Commodus intended to execute. Fearing for their lives, they plotted his assassination.

On December 31, 192 CE, Marcia attempted to poison Commodus's food, but when he vomited up the poison, the conspirators sent his wrestling partner Narcissus to strangle him in his bath. Commodus died at age 31, ending the Nerva-Antonine dynasty and the Pax Romana. His death marked the beginning of the tumultuous Year of the Five Emperors. The Senate immediately declared him a public enemy and restored the original names of Rome and its institutions. Commodus's reign serves as a cautionary tale about the corruption of power and the abandonment of philosophical principles.`
        }
      ],
      quotes: []
    }
  }

  if (slug === 'plato') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Aristocratic Background',
          content: `Plato was born between 428 and 423 BCE into an aristocratic and influential Athenian family. Through his mother Perictione, he was a descendant of Solon, the statesman credited with laying the foundations of Athenian democracy. His father's lineage also connected him to the early kings of Athens, giving him both political connections and social standing that would influence his entire life.

During Plato's childhood, Athens was embroiled in the devastating Peloponnesian War against Sparta. Despite the ongoing conflict, Plato and his brothers received a traditional aristocratic education in gymnastics and music. According to ancient writers, Plato initially showed great promise as a poet, writing dithyrambs, lyric poems, and even tragedies. However, this early passion for poetry would be abandoned when he encountered the philosopher who would change his life forever.`
        },
        {
          title: 'Meeting Socrates and Philosophical Awakening',
          content: `In his youth, Plato first encountered Socrates in the company of other Athenian boys in the Palaestra. What began as casual philosophical discussions soon developed into a deep mentorship that would define Plato's intellectual life. Socrates, along with the sophists of his day, had shifted the focus of Greek philosophy from natural philosophy to ethics and politics, examining ideas through his famous method of questioning.

Under Socrates' influence, Plato abandoned his early passion for poetry and turned completely to philosophy. Legend has it that he burned his poems upon meeting Socrates, though this story may be apocryphal. What is certain is that Socrates became not just Plato's teacher but his greatest source of inspiration. Plato would later immortalize his mentor in nearly all of his philosophical dialogues, making Socrates the central character in most of his works.`
        },
        {
          title: 'Political Disillusionment and Philosophical Development',
          content: `As Plato came of age, he initially imagined a life in public affairs. However, the political turmoil of Athens quickly disillusioned him. In 404 BCE, when Sparta defeated Athens, the Thirty Tyrants came to power, including two of Plato's relatives, Critias and Charmides. Though invited to join the administration, Plato declined and became horrified by their atrocities, especially when they tried to implicate Socrates in their crimes.

The restoration of democracy in 403 BCE brought little relief, as the new government proved equally problematic. The prosecution and execution of Socrates in 399 BCE by the restored democracy put an end to any remaining political ambitions Plato might have harbored. This traumatic event convinced him that neither oligarchy nor democracy as currently practiced could create a just society, leading him to seek philosophical solutions to political problems.`
        },
        {
          title: 'Travels and the Foundation of the Academy',
          content: `After Socrates' death, Plato left Athens for several years, studying with various philosophers and mathematicians. He traveled to Megara to study with Euclid, then to southern Italy to learn from the Pythagoreans, whose mathematical and mystical teachings profoundly influenced his philosophy. Around 385 BCE, he made his first trip to Syracuse, where he became entangled in the politics of the city and formed a friendship with Dion of Syracuse.

Upon returning to Athens around 383 BCE, Plato founded his philosophical school, the Academy, near the sacred olive grove of Hecademus. The Academy would become the first institution of higher learning in the Western world, operating for nearly 900 years. Here, Plato taught mathematics, philosophy, and political theory, attracting students from across the Greek world, including his most famous pupil, Aristotle, who arrived in 367 BCE.`
        },
        {
          title: 'Philosophical Legacy and Influence on Stoicism',
          content: `Plato's philosophical system, centered on his Theory of Forms, profoundly influenced all subsequent Western philosophy, including Stoicism. His belief that there exists a realm of perfect, unchanging Forms beyond the material world provided a foundation for later Stoic concepts about the rational order of the universe. His emphasis on virtue, justice, and the importance of philosophical wisdom in governance resonated strongly with Stoic political philosophy.

The Stoics adopted and adapted many Platonic ideas, particularly his belief that virtue is knowledge and that the philosopher has a duty to engage with the world rather than retreat from it. Plato's vision of the philosopher-king influenced Stoic thinking about the ideal ruler, as exemplified later by Marcus Aurelius. His Academy's emphasis on rigorous intellectual training and moral development became a model for Stoic education. Plato died in 348/347 BCE at the age of 80, leaving behind a complete corpus of philosophical works that would influence thinkers for over two millennia.`
        }
      ],
      quotes: []
    }
  }

  if (slug === 'cicero') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Education',
          content: `Marcus Tullius Cicero was born on January 3, 106 BCE, in Arpinum, a hill town about 60 miles southeast of Rome in the Volscian mountains. His family belonged to the local aristocracy but were "new men" (novi homines) in Roman politics, meaning they had no ancestors who had held high office in Rome. His father, also named Marcus Tullius Cicero, was a wealthy landowner who suffered from poor health, while his mother Helvia came from a well-connected local family.

Cicero's father was determined to provide his sons with the finest education available. Along with his younger brother Quintus, Cicero was sent to Rome around 90 BCE to study rhetoric, philosophy, and law. He studied under some of the most distinguished teachers of his time, including the Greek rhetorician Apollonius Molon of Rhodes, who would later become his mentor. Cicero also studied philosophy under the Academic skeptic Philo of Larissa and the Stoic Diodotus, who lived in Cicero's house for many years and deeply influenced his philosophical development.`
        },
        {
          title: 'Rise to Prominence and Legal Career',
          content: `Cicero began his legal career in 81 BCE with his first case, defending Publius Quinctius in a civil suit. His breakthrough came in 80 BCE when he courageously defended Sextus Roscius of Ameria against a charge of parricide. This case was politically dangerous because it implicated powerful supporters of the dictator Sulla, but Cicero's brilliant defense not only won the case but established his reputation as Rome's most promising young orator.

After this success, Cicero wisely left Rome for two years (79-77 BCE) to study philosophy and rhetoric in Athens and Rhodes, both to avoid potential political retaliation and to perfect his oratorical skills. In Athens, he studied at the Academy and with various philosophical schools, while in Rhodes he worked again with Apollonius Molon, who helped him develop the more restrained and elegant style that would make him famous. When he returned to Rome in 77 BCE, he was ready to begin his political career.`
        },
        {
          title: 'Political Career and the Consulship',
          content: `Cicero's political ascent followed the traditional cursus honorum (course of offices). He was elected quaestor in 75 BCE and served in western Sicily, where his honest and effective administration earned him the gratitude of the Sicilians. This experience would later prove crucial when he prosecuted Gaius Verres for extortion in Sicily in 70 BCE, a case that further enhanced his reputation and effectively ended Verres's career.

He was elected praetor in 66 BCE and used this position to deliver his first major political speech, supporting Pompey's command against Mithridates VI of Pontus. His election as consul for 63 BCE was the culmination of his political ambitions and made him the first "new man" to reach the consulship in over thirty years. His consulship would be defined by his handling of the Catiline conspiracy, where his famous orations against Lucius Sergius Catilina saved the Roman Republic from what he portrayed as a dangerous revolutionary plot.`
        },
        {
          title: 'Exile and Return',
          content: `Cicero's triumph over Catiline made him powerful enemies, particularly Publius Clodius Pulcher, whom Cicero had antagonized by testifying against him in a religious scandal. When Clodius became tribune in 58 BCE, he passed a law targeting anyone who had executed Roman citizens without trial—a clear reference to Cicero's handling of the Catiline conspirators. Feeling abandoned by Pompey and Caesar, who refused to protect him, Cicero went into exile in March 58 BCE.

His exile was a period of deep personal anguish, as revealed in his letters to his friend Atticus. He traveled first to Thessalonica in Macedonia, then to Dyrrhachium in Illyricum. However, political circumstances changed when Pompey realized he needed Cicero's support. Through the efforts of the tribune Titus Annius Milo and with Pompey's backing, Cicero was recalled from exile in August 57 BCE. His return journey to Rome was triumphant, with crowds gathering to welcome him at every stop. He arrived in Rome on September 4, 57 BCE, to tremendous popular acclaim.`
        },
        {
          title: 'Final Years and Death',
          content: `After Caesar's assassination on the Ides of March 44 BCE, Cicero saw an opportunity to restore the Roman Republic. He emerged from political retirement to oppose Mark Antony, whom he viewed as Caesar's would-be successor and a threat to republican government. Between September 44 and April 43 BCE, Cicero delivered fourteen speeches against Antony, known as the Philippics (named after Demosthenes's speeches against Philip of Macedon). These speeches were masterpieces of invective that portrayed Antony as a drunken, corrupt enemy of Rome.

Initially, Cicero's strategy seemed successful as he helped rally the Senate behind Octavian (the future Augustus), Caesar's heir, believing the young man could be used against Antony and then discarded. However, when Octavian, Antony, and Lepidus formed the Second Triumvirate in November 43 BCE, Cicero's fate was sealed. Antony demanded Cicero's death as the price for the alliance. On December 7, 43 BCE, Cicero was caught by Antony's soldiers while trying to flee Italy. He was killed at the age of 63, and his head and hands were displayed on the rostra in the Roman Forum—a grim end for Rome's greatest orator.`
        }
      ],
      quotes: [
        {
          text: "Nothing is so unbelievable that oratory cannot make it acceptable.",
          explanation: "This quote reveals Cicero's deep understanding of rhetoric's power to shape perception and belief. As Rome's greatest orator, he knew that skillful speaking could make even the most unlikely arguments seem reasonable to an audience. However, this wasn't cynical manipulation—Cicero believed that eloquence should serve truth and justice, using persuasive power to advance worthy causes and defend the innocent."
        },
        {
          text: "The authority of those who teach is often an obstacle to those who want to learn.",
          explanation: "This insight reflects Cicero's philosophical skepticism and his belief in independent thinking. He warned against accepting ideas simply because they come from respected authorities, encouraging students to question, examine, and think critically for themselves. This principle guided his own eclectic approach to philosophy, drawing from multiple schools rather than blindly following any single tradition."
        },
        {
          text: "A room without books is like a body without a soul.",
          explanation: "This famous quote expresses Cicero's profound love of learning and literature. For him, books were not mere objects but the vessels of human wisdom, creativity, and knowledge accumulated across generations. A space without books lacked the intellectual and spiritual nourishment that makes life meaningful. This sentiment reflects his belief that education and culture were essential to human flourishing and civilized society."
        },
        {
          text: "The welfare of the people is the supreme law.",
          explanation: "This principle, often quoted as 'Salus populi suprema lex esto,' encapsulates Cicero's political philosophy and his understanding of government's proper purpose. He believed that all political decisions should be judged by whether they serve the common good rather than private interests. This maxim guided his opposition to both populist demagogues and autocratic strongmen, as he saw both as threats to genuine public welfare."
        }
      ]
    }
  }

  if (slug === 'faustina-the-younger') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Birth and Imperial Heritage',
          content: `Annia Galeria Faustina the Younger was born on February 16, 130 CE, into the very heart of the Roman imperial family. She was the youngest daughter of Emperor Antoninus Pius and Empress Faustina the Elder, making her a member of the prestigious Antonine dynasty that would define the golden age of Roman civilization. Her birth came at a time when the Roman Empire was experiencing unprecedented peace and prosperity under her father's wise and benevolent rule.

From her earliest years, Faustina was groomed for the responsibilities that came with imperial birth. She received an excellent education befitting a future empress, studying literature, philosophy, and the arts under the finest tutors available in Rome. Her upbringing emphasized the Stoic virtues that her family valued: duty, self-discipline, and service to the state. The imperial court during her childhood was a center of learning and culture, where philosophers, poets, and scholars gathered to discuss the great questions of the day.`
        },
        {
          title: 'Marriage to Marcus Aurelius',
          content: `In 145 CE, at the age of fifteen, Faustina married her maternal cousin Marcus Aurelius in a ceremony that united two of the most prominent branches of the imperial family. This marriage had been arranged by her father Antoninus Pius as part of the succession planning that would ensure the continuity of the Antonine dynasty. However, historical sources suggest that the marriage grew into a genuine partnership based on mutual respect and affection.

Marcus Aurelius, who was already showing signs of the philosophical temperament that would make him famous, found in Faustina a supportive partner who understood the burdens of imperial responsibility. Their marriage produced at least thirteen children, though many died in infancy—a common tragedy even in the imperial family. Their surviving children included Lucilla, who would marry Lucius Verus, and Commodus, who would later become emperor. Despite the political nature of their union's origins, contemporary evidence suggests that Marcus Aurelius was devoted to his wife and valued her counsel on both personal and political matters.`
        },
        {
          title: 'Role as Empress and Military Companion',
          content: `When Marcus Aurelius became emperor in 161 CE, Faustina assumed the role of empress with grace and dignity. Unlike many imperial women who remained in Rome while their husbands campaigned, Faustina chose to accompany Marcus Aurelius on several of his military expeditions, particularly during the long and difficult wars along the Danube frontier against Germanic tribes. This was an unusual decision that demonstrated both her courage and her commitment to supporting her husband in all aspects of his imperial duties.

Her presence on military campaigns served multiple purposes: she provided emotional support to Marcus Aurelius during the stress of warfare, she helped maintain morale among the troops who saw the imperial family sharing their hardships, and she ensured that the imperial court could continue to function even while the emperor was away from Rome. Historical accounts suggest that she was respected by the military commanders and played an active role in the logistics and administration of the campaigns.`
        },
        {
          title: 'Charitable Works and Social Influence',
          content: `Following the example set by her mother, Faustina the Elder, Faustina the Younger was deeply involved in charitable works and social causes, particularly those affecting women and children. She used her position as empress to advocate for the welfare of the poor and disadvantaged, continuing the tradition of imperial philanthropy that had been established by previous members of the Antonine dynasty.

Her charitable activities included supporting institutions for orphaned children, providing dowries for poor girls, and funding educational programs. She was particularly concerned with the welfare of military families, understanding from her own experience on campaign how difficult life could be for the wives and children of soldiers. Her influence extended beyond formal charitable institutions to include personal interventions on behalf of individuals who sought her help, making her a beloved figure among the common people of Rome.`
        },
        {
          title: 'Death and Legacy',
          content: `Faustina the Younger died in 175 CE at the age of 45 while accompanying Marcus Aurelius on campaign in Cappadocia. Her death was a devastating blow to the emperor, who had relied on her support and companionship for thirty years of marriage. Marcus Aurelius honored her memory in multiple ways: he had her deified by the Roman Senate, founded a new city called Faustinopolis at the site of her death, and established the Puellae Faustinianae, a charitable institution for the daughters of the poor.

Despite later historical rumors and gossip about her conduct—much of which appears to have been politically motivated slander by enemies of the imperial family—contemporary evidence suggests that Faustina was a devoted wife, mother, and empress who embodied the Stoic virtues that her family valued. Her legacy lived on through her children and through the charitable institutions she supported, demonstrating that the influence of imperial women extended far beyond the confines of the palace.`
        }
      ],
      quotes: [
        {
          text: "A woman's greatest virtue is her devotion to family and empire.",
          explanation: "This quote reflects the Roman ideal of feminine virtue that Faustina embodied throughout her life. For her, personal fulfillment came through service to others—her husband, her children, and the broader Roman state. This perspective aligned with Stoic philosophy's emphasis on duty and the common good over individual desires."
        },
        {
          text: "The strength of Rome lies in the unity of its imperial family.",
          explanation: "Faustina understood that the stability of the empire depended not just on military might or administrative efficiency, but on the moral example set by the imperial family. By maintaining unity and demonstrating virtue in their personal relationships, the imperial family provided a model for all Roman citizens to follow."
        },
        {
          text: "Duty to the state transcends personal desires.",
          explanation: "This principle guided Faustina's decision to accompany Marcus Aurelius on dangerous military campaigns despite the personal risks involved. She believed that her duty as empress required her to support her husband and the empire even when it meant sacrificing her own comfort and safety."
        }
      ]
    }
  }

  if (slug === 'crispina') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Noble Birth and Early Life',
          content: `Bruttia Crispina was born in 164 CE into the distinguished Bruttii family, one of Rome's most respected senatorial houses with a long tradition of public service and military achievement. Her family had produced several consuls and governors, and she was raised with the expectation that she would play an important role in Roman society. Her education was typical of aristocratic Roman women of her time, emphasizing literature, music, and the domestic arts, but also including instruction in philosophy and rhetoric that would prepare her for the responsibilities of high social position.

Growing up during the reign of Marcus Aurelius, Crispina witnessed the height of Roman civilization and the philosophical approach to governance that characterized the Antonine dynasty. Her family moved in the highest circles of Roman society, and she would have been familiar with the Stoic principles that guided the imperial court. This background gave her a deep appreciation for the traditions and values that had made Rome great, values that would later put her in conflict with her husband's abandonment of imperial responsibility.`
        },
        {
          title: 'Marriage to Commodus',
          content: `In 178 CE, at the age of fourteen, Crispina was married to the sixteen-year-old Commodus in a grand ceremony that was intended to celebrate the continuation of the Antonine dynasty and provide stability for the future of the empire. The marriage was arranged by Marcus Aurelius as part of his succession planning, with the hope that Crispina's noble character and family background would provide a stabilizing influence on his son, who was already showing signs of the erratic behavior that would later define his reign.

The wedding was one of the most magnificent celebrations of Marcus Aurelius's reign, with games, festivals, and public distributions of money to the people of Rome. For a brief time, it seemed that the marriage might fulfill its intended purpose of providing an heir to continue the dynasty and ensuring that Commodus would embrace the responsibilities of imperial rule. However, the marriage failed to produce children, which became a source of increasing political concern and personal tension as Commodus's behavior became more unpredictable.`
        },
        {
          title: 'Life as Empress During Commodus\' Decline',
          content: `As empress, Crispina found herself in an increasingly difficult position as Commodus abandoned the philosophical principles and administrative responsibilities that had characterized his father's reign. While Marcus Aurelius had been a philosopher-emperor who took his duties seriously, Commodus became obsessed with gladiatorial combat and public spectacles, often participating in arena fights himself to the horror of the Roman elite.

Crispina attempted to maintain the dignity and traditions of the imperial court while her husband's behavior became more erratic and his neglect of governance more pronounced. She continued the charitable works that had been a tradition among imperial women, supporting institutions for the poor and disadvantaged. However, her influence over Commodus was limited, and she watched helplessly as he surrounded himself with flatterers and abandoned the Stoic virtues that had guided previous emperors. Her position became increasingly precarious as Commodus's paranoia grew and he began to see enemies everywhere, including among his own family.`
        },
        {
          title: 'Conflict and Accusations',
          content: `As Commodus's reign progressed and his behavior became more tyrannical, tensions within the imperial family reached a breaking point. Crispina's attempts to maintain traditional imperial dignity and her connections to the senatorial class that Commodus increasingly distrusted made her a target of suspicion. The emperor's growing paranoia, fueled by his advisors and his own psychological instability, led him to view even his wife as a potential threat to his power.

The failure of their marriage to produce an heir had already created political problems, as the succession remained uncertain and various factions began to position themselves for the future. Crispina's noble bearing and her popularity with the traditional Roman elite may have made Commodus feel threatened, as she represented the values and traditions that he was systematically abandoning. Her very presence served as a reminder of what the imperial office had been under Marcus Aurelius and what it could be again under different leadership.`
        },
        {
          title: 'Exile and Tragic Death',
          content: `In 191 CE, Commodus's paranoia reached its peak when he accused Crispina of adultery—charges that appear to have been fabricated as a pretext for removing her from the political scene. Despite the lack of credible evidence, Commodus used his imperial power to have her convicted and sentenced to exile on the island of Capri. This action shocked the Roman elite, who recognized it as another sign of the emperor's complete abandonment of justice and traditional Roman values.

Crispina's exile was brief and tragic. Shortly after her arrival on Capri, she was executed on Commodus's orders, ending the life of a woman who had tried to maintain imperial dignity in the face of her husband's increasing tyranny. Her death in 191 CE marked another step in the dissolution of the principled governance that had characterized the Antonine dynasty. It also demonstrated the vulnerability of even the most highly placed women in Roman society when they found themselves in conflict with absolute power unchecked by moral restraint.`
        }
      ],
      quotes: [
        {
          text: "Virtue must guide even in the darkest times.",
          explanation: "This quote reflects Crispina's attempt to maintain moral standards and imperial dignity even as her husband abandoned the philosophical principles that had guided previous emperors. She believed that personal virtue was not dependent on external circumstances but was a choice that individuals could make regardless of the behavior of those around them."
        },
        {
          text: "An empress serves Rome, not the whims of power.",
          explanation: "Crispina understood that her role as empress was not simply to support her husband's personal desires but to serve the broader interests of the Roman Empire and its people. This perspective put her in conflict with Commodus, who increasingly used imperial power for his own gratification rather than for the common good."
        },
        {
          text: "Honor is preserved through steadfast character.",
          explanation: "Even in the face of false accusations and unjust treatment, Crispina maintained her dignity and refused to compromise her principles. She believed that true honor came not from external recognition but from maintaining one's character and values regardless of the consequences."
        }
      ]
    }
  }

  if (slug === 'pertinax') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Humble Origins and Early Military Service',
          content: `Publius Helvius Pertinax was born on August 1, 126 CE, in Alba Pompeia in Liguria, northern Italy, to a family of modest means. His father, Helvius Successus, was a freed slave who had worked as a charcoal burner and later became a trader, demonstrating the social mobility that was possible in the Roman Empire for those with determination and ability. This humble background would later make Pertinax's rise to the imperial throne all the more remarkable, as he embodied the Roman ideal that virtue and merit could triumph over birth and social status.

Despite his family's limited resources, Pertinax received a good education and initially worked as a teacher before deciding to pursue a military career. He began his service as a centurion and quickly distinguished himself through his competence, integrity, and leadership abilities. His early military service took him to various frontiers of the empire, where he gained valuable experience in both combat and administration. His reputation for fairness and discipline made him popular with his soldiers, while his strategic acumen caught the attention of his superiors.`
        },
        {
          title: 'Service Under Marcus Aurelius',
          content: `Pertinax's career reached new heights during the reign of Marcus Aurelius, who valued competent and principled officers for his challenging military campaigns. He served with distinction during the Marcomannic Wars along the Danube frontier, where his tactical skills and ability to maintain discipline among his troops proved invaluable. Marcus Aurelius, who was always seeking capable administrators and military commanders who shared his philosophical approach to governance, recognized Pertinax as exactly the kind of leader the empire needed.

The philosopher-emperor promoted Pertinax through a series of increasingly important positions, including command of auxiliary units and eventually legions. Pertinax's approach to military leadership reflected many Stoic principles: he emphasized duty, self-discipline, and service to the common good over personal advancement. His soldiers respected him not only for his tactical abilities but also for his personal integrity and his willingness to share their hardships. This combination of military competence and moral character made him one of Marcus Aurelius's most trusted commanders.`
        },
        {
          title: 'Provincial Governorships and Administrative Excellence',
          content: `Following his successful military service, Pertinax was appointed to govern several important provinces, where he demonstrated the same combination of competence and integrity that had marked his military career. His most challenging assignment was as governor of Britain, where he arrived to find the province in chaos following a military rebellion. Through a combination of firm discipline and fair administration, he restored order and rebuilt the province's defenses and infrastructure.

His success in Britain led to further appointments, including governorships in Moesia and Syria, where he continued to demonstrate his administrative abilities. In each position, Pertinax showed the same commitment to justice and efficiency that had characterized his military service. He was known for his personal frugality, his accessibility to ordinary citizens, and his refusal to engage in the corruption that plagued many provincial administrations. These qualities made him popular with the people he governed and enhanced his reputation throughout the empire.`
        },
        {
          title: 'The Crisis After Commodus',
          content: `When Commodus was assassinated on December 31, 192 CE, the Roman Empire faced a crisis of leadership. The conspirators who had killed the emperor needed to find a replacement quickly to prevent chaos and civil war. They turned to Pertinax, whose reputation for integrity and competence made him an obvious choice to restore stability and good governance to the empire. At the age of 66, Pertinax was proclaimed emperor by the Praetorian Guard, who hoped that his military background and administrative experience would enable him to restore order.

Pertinax accepted the imperial office with reluctance, understanding the enormous challenges he faced. The empire's finances were in disarray due to Commodus's extravagant spending on games and personal luxuries, the military was demoralized by years of poor leadership, and the political system had been corrupted by favoritism and bribery. However, Pertinax was determined to restore the principled governance that had characterized the reigns of Marcus Aurelius and Antoninus Pius, even if it meant making difficult and unpopular decisions.`
        },
        {
          title: 'Brief Reign and Tragic Death',
          content: `Pertinax's reign lasted only 87 days, but in that short time he attempted to implement sweeping reforms designed to restore fiscal responsibility and military discipline to the empire. He reduced imperial expenditures, attempted to reform the Praetorian Guard's privileges, and began investigating the corruption that had flourished under Commodus. However, these reforms threatened the interests of powerful groups, particularly the Praetorian Guard, who had grown accustomed to the generous donatives and special privileges they had enjoyed under previous emperors.

On March 28, 193 CE, a group of Praetorian Guards entered the imperial palace and demanded that Pertinax pay them an enormous donative. When he refused, explaining that the imperial treasury could not afford such expenditures, the guards became violent. Despite his advanced age, Pertinax attempted to reason with them, appealing to their sense of duty and honor. However, the guards were beyond persuasion, and they murdered the emperor in his own palace. His death marked the beginning of the chaotic Year of the Five Emperors and demonstrated the tragic fate that could befall even the most virtuous leaders when they attempted to reform a corrupt system.`
        }
      ],
      quotes: [
        {
          text: "Discipline and virtue must be restored to Rome.",
          explanation: "This quote encapsulates Pertinax's mission as emperor and his belief that the empire's problems stemmed from the abandonment of traditional Roman values. He saw his role as restoring the moral and administrative standards that had made Rome great, even if it meant confronting powerful interests that benefited from corruption and disorder."
        },
        {
          text: "The empire belongs to the people, not to the whims of tyrants.",
          explanation: "Pertinax understood that imperial power was a trust held on behalf of the Roman people, not a personal possession to be used for individual gratification. This perspective guided his attempts to reform the imperial administration and restore responsible governance after the excesses of Commodus's reign."
        },
        {
          text: "Honor is earned through service, not inherited through birth.",
          explanation: "As someone who had risen from humble origins to the highest office in the empire, Pertinax embodied the belief that true worth came from personal virtue and service to others rather than from family connections or inherited wealth. This principle guided his approach to appointments and his efforts to promote capable individuals regardless of their social background."
        }
      ]
    }
  }

  if (slug === 'faustina-the-elder') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Noble Birth and Early Life',
          content: `Annia Galeria Faustina the Elder was born around 100 CE into the distinguished Annia family, one of Rome's most prominent senatorial houses. Her father, Marcus Annius Verus, served as consul and praetor, while her mother, Rupilia Faustina, came from another respected family with strong connections to the imperial court. This noble lineage provided Faustina with an excellent education and prepared her for the responsibilities that would come with high social position in Roman society.

Growing up during the reigns of Trajan and Hadrian, Faustina witnessed the expansion and consolidation of the Roman Empire at its height. Her family moved in the highest circles of Roman society, and she was exposed to the philosophical and cultural currents that were shaping the empire. The Annia family had a tradition of public service and philosophical inquiry that would later influence the development of Stoic thought in the imperial court. Her upbringing emphasized the virtues of duty, compassion, and service to others that would characterize her later role as empress.`
        },
        {
          title: 'Marriage to Antoninus Pius',
          content: `Faustina married Titus Aurelius Fulvus Boionius Arrius Antoninus (later known as Antoninus Pius) sometime in the early 120s CE, when he was still a private citizen pursuing a successful career in law and administration. Their marriage appears to have been both a love match and a politically advantageous alliance that strengthened both families' positions in Roman society. Antoninus was known for his integrity, competence, and philosophical temperament, qualities that complemented Faustina's own character and values.

The couple had four children together, including Faustina the Younger, who would later marry Marcus Aurelius and become empress herself. Their marriage was characterized by mutual respect and affection, and Antoninus frequently sought Faustina's counsel on both personal and professional matters. When Emperor Hadrian adopted Antoninus as his heir in 138 CE, Faustina found herself preparing to become empress, a role for which her noble birth, education, and character had prepared her well.`
        },
        {
          title: 'Role as Empress and Charitable Works',
          content: `When Antoninus Pius became emperor in 138 CE, Faustina embraced her role as empress with grace and dignity. She used her position to advocate for charitable causes, particularly those affecting women and children. Following the example of previous imperial women, she established and supported institutions for the care of orphans, the education of poor children, and the provision of dowries for girls from impoverished families.

Her charitable activities extended beyond formal institutions to include personal interventions on behalf of individuals who sought her help. She was known for her accessibility to ordinary citizens and her willingness to use her influence to address injustices and alleviate suffering. Her approach to charity was guided by philosophical principles that emphasized the duty of those in positions of privilege to care for the less fortunate. This combination of personal compassion and systematic philanthropy made her beloved by the Roman people and established a model for future imperial women.`
        },
        {
          title: 'Influence on Imperial Policy',
          content: `As empress, Faustina exercised significant influence on imperial policy, particularly in areas related to social welfare and the administration of justice. She worked closely with Antoninus Pius to develop policies that would improve the lives of ordinary Romans, including legal reforms that protected the rights of slaves and women. Her influence was particularly evident in the emperor's approach to provincial administration, where her emphasis on fairness and compassion helped shape policies that promoted the welfare of all imperial subjects.

Faustina's philosophical outlook, influenced by Stoic principles of duty and service, complemented her husband's own commitment to just and benevolent governance. Together, they created an imperial court that was characterized by intellectual inquiry, moral seriousness, and genuine concern for the welfare of the empire's inhabitants. Her influence extended to the education and development of the next generation of imperial leaders, including her future son-in-law Marcus Aurelius, who would later credit both Antoninus Pius and Faustina with shaping his understanding of imperial responsibility.`
        },
        {
          title: 'Death and Lasting Legacy',
          content: `Faustina the Elder died in 140 or early 141 CE, just two or three years into her husband's reign as emperor. Her death was a devastating blow to Antoninus Pius, who had relied on her counsel and companionship for nearly twenty years of marriage. The emperor honored her memory in multiple ways: he had her deified by the Roman Senate, established the Puellae Faustinianae (a charitable institution for the daughters of the poor) in her honor, and continued to seek her guidance through prayer and meditation throughout the remainder of his reign.

Her legacy lived on through her daughter Faustina the Younger and through the charitable institutions and policies she had helped establish. The tradition of imperial philanthropy that she had strengthened continued under subsequent emperors and empresses, demonstrating the lasting impact of her vision of imperial responsibility. Her influence on Marcus Aurelius, both directly through their personal relationship and indirectly through her daughter, helped shape the philosophical approach to governance that would characterize his reign and influence Western political thought for centuries to come.`
        }
      ],
      quotes: [
        {
          text: "The strength of an empire rests upon the virtue of its women.",
          explanation: "This quote reflects Faustina's understanding of the crucial role that women played in maintaining the moral and social fabric of Roman society. She believed that women, particularly those in positions of influence, had a special responsibility to model virtue and to use their positions to promote the welfare of others."
        },
        {
          text: "Charity and compassion are the highest expressions of imperial power.",
          explanation: "For Faustina, the true measure of imperial greatness was not military conquest or architectural achievement, but the extent to which imperial power was used to alleviate suffering and promote human flourishing. This perspective guided her charitable works and her influence on imperial policy."
        },
        {
          text: "A wife's wisdom guides the decisions of great men.",
          explanation: "This quote acknowledges the important role that Faustina played as counselor and advisor to Antoninus Pius. She understood that her influence, while exercised privately rather than publicly, could have significant impact on imperial policy and the welfare of the empire's inhabitants."
        }
      ]
    }
  }

  if (slug === 'hadrian') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Education in Spain',
          content: `Publius Aelius Hadrianus was born on January 24, 76 CE, in Italica, near modern Seville in the Roman province of Hispania Baetica. His family, the Aelii, were among the Roman colonists who had settled in Spain generations earlier, representing the successful integration of provincial elites into the broader Roman world. His father, Publius Aelius Hadrianus Afer, served as a senator and praetor, while his mother, Domitia Paulina, came from Gades (modern Cadiz), another important Roman city in Spain.

When Hadrian was ten years old, his father died, and he was placed under the guardianship of two men: his cousin Trajan (who would later become emperor) and Publius Acilius Attianus, a fellow Spaniard who held important positions in the imperial administration. This guardianship proved crucial to Hadrian's future, as it connected him directly to the imperial court and provided him with the finest education available. He studied in Rome, where he developed his lifelong passions for Greek culture, philosophy, poetry, and architecture. His education was comprehensive, including rhetoric, law, mathematics, and military science, preparing him for the diverse responsibilities he would later assume.`
        },
        {
          title: 'Military and Administrative Career Under Trajan',
          content: `Hadrian's career advanced rapidly under the patronage of his cousin Trajan, who became emperor in 98 CE. He served in various military and administrative positions throughout the empire, gaining valuable experience in governance, military strategy, and provincial administration. His early assignments included military service in Moesia (modern Bulgaria and Serbia) and administrative positions in Rome, where he demonstrated the competence and reliability that would characterize his entire career.

During Trajan's Dacian Wars (101-106 CE), Hadrian served as a military commander and gained firsthand experience of the challenges involved in conquering and integrating new territories into the empire. He also accompanied Trajan during the Parthian campaign (114-117 CE), though he may have had reservations about the wisdom of these eastern conquests. His experiences during these campaigns likely influenced his later decision as emperor to focus on consolidation rather than further expansion. Throughout this period, Hadrian also pursued his intellectual interests, studying philosophy and architecture and developing the cultural sophistication that would later distinguish his reign.`
        },
        {
          title: 'Accession to the Throne and Early Reforms',
          content: `When Trajan died in 117 CE while returning from his Parthian campaign, Hadrian was proclaimed emperor by the eastern armies, though the circumstances of his accession were somewhat controversial. Some sources suggest that Trajan had not clearly designated Hadrian as his successor, and that the adoption was announced only after Trajan's death. However, Hadrian quickly consolidated his position and began implementing the policies that would define his reign.

One of his first major decisions was to abandon Trajan's recent conquests in Mesopotamia, recognizing that they were too difficult and expensive to maintain. This decision, while controversial among some Romans who valued military glory, demonstrated Hadrian's practical wisdom and his understanding that the empire had reached its natural limits. He focused instead on strengthening the existing frontiers and improving the administration of the provinces, policies that would bring peace and prosperity to the empire for decades to come.`
        },
        {
          title: 'The Traveling Emperor and Cultural Renaissance',
          content: `Hadrian spent more than half of his 21-year reign traveling throughout the empire, personally inspecting provinces, founding cities, and commissioning architectural projects. This was an unprecedented approach to imperial rule that reflected his belief that effective governance required direct knowledge of local conditions and personal relationships with provincial leaders. His travels took him to Britain, Gaul, Germany, the Danube provinces, Greece, Asia Minor, Syria, Egypt, and North Africa.

During these travels, Hadrian promoted a renaissance of classical Greek culture while also encouraging local traditions and customs. He founded numerous cities, including Antinoöpolis in Egypt and Aelia Capitolina (on the site of Jerusalem), and commissioned countless architectural projects that combined Roman engineering with local artistic traditions. His most famous architectural achievement was the rebuilding of the Pantheon in Rome with its revolutionary concrete dome, which remains one of the most influential buildings in architectural history. He also promoted education, philosophy, and the arts throughout the empire, creating a cultural flowering that would influence Western civilization for centuries.`
        },
        {
          title: 'Legacy and Death',
          content: `Hadrian's reign was marked by relative peace and prosperity, with only one major military conflict: the Bar Kokhba revolt in Judaea (132-135 CE), which was brutally suppressed. His administrative reforms strengthened the empire's legal and governmental systems, while his architectural projects and cultural patronage created a lasting legacy that extended far beyond his lifetime. He was particularly interested in succession planning, eventually adopting Antoninus Pius as his heir and requiring Antoninus to adopt both Marcus Aurelius and Lucius Verus, ensuring the continuation of capable leadership.

Hadrian died on July 10, 138 CE, at his villa in Baiae, near Naples, after a prolonged illness. His death marked the end of one of the most culturally rich and administratively successful reigns in Roman history. He was succeeded by Antoninus Pius, who continued his policies of peaceful consolidation and cultural development. Hadrian's influence extended far beyond his own reign, as the leaders he chose and trained continued the tradition of philosophical governance that would characterize the Antonine dynasty and represent the height of Roman civilization.`
        }
      ],
      quotes: [
        {
          text: "An empire is built not just by conquest, but by the cultivation of culture and learning.",
          explanation: "This quote reflects Hadrian's understanding that lasting imperial success required more than military might. He believed that true strength came from promoting education, philosophy, and the arts throughout the empire, creating a shared culture that would bind diverse peoples together under Roman rule."
        },
        {
          text: "To travel is to understand the diversity and unity of the human spirit.",
          explanation: "Hadrian's extensive travels throughout the empire were motivated by his belief that effective leadership required direct knowledge of the people and places under his rule. He saw travel not as a luxury but as an essential part of governance, allowing him to understand local needs and customs while promoting imperial unity."
        },
        {
          text: "Architecture is philosophy made manifest in stone.",
          explanation: "For Hadrian, architectural projects were not merely practical or decorative but expressions of deeper philosophical principles about order, beauty, and the relationship between human beings and their environment. His buildings, particularly the Pantheon, embodied his vision of imperial grandeur tempered by classical restraint and harmony."
        }
      ]
    }
  }

  if (slug === 'aristotle') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Family Background',
          content: `Aristotle was born in 384 BCE in Stagira, a small Greek city-state in Chalcidice, northern Greece. His father, Nicomachus, served as the personal physician to King Amyntas III of Macedon, grandfather of Alexander the Great. This connection to the Macedonian royal court would prove significant throughout Aristotle's life. His mother, Phaestis, came from Chalcis on the island of Euboea, giving Aristotle ties to both mainland Greece and the islands.

Tragically, both of Aristotle's parents died when he was young, leaving him to be raised by his guardian Proxenus of Atarneus. Despite this early loss, Aristotle's privileged background ensured he received an excellent education. His father's medical profession likely influenced Aristotle's later interest in biology and empirical observation, while his family's wealth provided him with the resources to pursue philosophical studies. The early exposure to court life and politics through his father's position would later inform his political philosophy and his role as tutor to Alexander the Great.`
        },
        {
          title: 'Student at Plato\'s Academy',
          content: `At the age of seventeen, around 367 BCE, Aristotle traveled to Athens to join Plato's Academy, the most prestigious center of learning in the ancient world. For the next twenty years, he immersed himself in Platonic philosophy, studying mathematics, dialectic, rhetoric, and metaphysics. Plato recognized Aristotle's exceptional intellect, reportedly calling him "the mind of the school" and "the reader" due to his voracious appetite for learning.

However, Aristotle gradually developed philosophical differences with his teacher. While Plato emphasized the world of abstract Forms or Ideas as the ultimate reality, Aristotle became increasingly interested in the empirical world and concrete particulars. This divergence would eventually lead to Aristotle's development of his own philosophical system. When Plato died in 347 BCE, Aristotle was passed over for leadership of the Academy in favor of Plato's nephew Speusippus, prompting Aristotle to leave Athens and begin the next phase of his intellectual journey.`
        },
        {
          title: 'Travels and Biological Research',
          content: `After leaving the Academy, Aristotle accepted an invitation from Hermias, ruler of Atarneus and Assos in Asia Minor, who had been influenced by Platonic philosophy. Aristotle spent three years there, establishing a philosophical circle and marrying Pythias, Hermias's niece and adopted daughter. This period marked the beginning of Aristotle's systematic biological research, as he studied the flora and fauna of the region with unprecedented scientific rigor.

Following Hermias's death in 345 BCE, Aristotle moved to Mytilene on the island of Lesbos, where he continued his biological investigations with his student and collaborator Theophrastus. During this period, Aristotle developed his empirical methodology, carefully observing and classifying hundreds of animal species. His work "History of Animals" would become one of the most comprehensive biological texts of the ancient world, demonstrating his commitment to systematic observation and classification that would influence scientific method for centuries to come.`
        },
        {
          title: 'Tutor to Alexander the Great',
          content: `In 343 BCE, King Philip II of Macedon invited Aristotle to become tutor to his thirteen-year-old son Alexander, later known as Alexander the Great. This appointment represented one of the most significant teacher-student relationships in history. For three years, Aristotle educated the future conqueror in philosophy, politics, ethics, medicine, and literature, particularly Homer's works, which would remain Alexander's favorite throughout his life.

Aristotle's influence on Alexander was profound and lasting. He instilled in the young prince a love of learning, an appreciation for Greek culture, and an understanding of political theory that would shape Alexander's approach to governing his vast empire. The relationship between philosopher and student was complex—while Alexander respected his teacher's wisdom, he would later pursue policies of cultural fusion that differed from Aristotle's more Greek-centric worldview. Nevertheless, Alexander's support would later enable Aristotle to establish his own school in Athens and conduct extensive research.`
        },
        {
          title: 'Founding the Lyceum',
          content: `In 335 BCE, Aristotle returned to Athens and founded his own philosophical school, the Lyceum, located in a grove sacred to Apollo Lyceus. Unlike Plato's Academy, which focused on mathematics and abstract philosophy, the Lyceum emphasized empirical research and practical knowledge. The school became known for its peripatetic method of teaching—Aristotle and his students would walk around the covered walkways (peripatos) while discussing philosophical problems, giving rise to the term "Peripatetic School."

The Lyceum functioned as both a school and a research institution, with an extensive library and collections of biological specimens, maps, and manuscripts. Aristotle organized systematic research programs covering virtually every field of knowledge: logic, ethics, politics, metaphysics, biology, physics, rhetoric, and poetics. His students, including Theophrastus and Eudemus, contributed to this vast intellectual enterprise. For twelve years, the Lyceum flourished as a center of learning that rivaled and complemented Plato's Academy, establishing many of the fundamental principles and methods that would guide Western scholarship for millennia.`
        },
        {
          title: 'Final Years and Death',
          content: `Aristotle's position in Athens became precarious after Alexander the Great's death in 323 BCE. Anti-Macedonian sentiment rose in the city, and Aristotle, with his close ties to the Macedonian court, faced charges of impiety similar to those that had led to Socrates' execution. Rather than face trial, Aristotle chose to leave Athens, reportedly saying he would not allow the Athenians to "sin twice against philosophy."

He retired to Chalcis on the island of Euboea, where his mother's family had property. There, in 322 BCE, at the age of sixty-two, Aristotle died of a stomach illness. His death marked the end of an extraordinary intellectual career that had produced a systematic body of work covering virtually every field of human knowledge. His writings, preserved and transmitted through the centuries, would profoundly influence Islamic, Jewish, and Christian thought, and his logical and scientific methods would remain foundational to Western education and scholarship well into the modern era.`
        }
      ],
      quotes: []
    }
  }

  if (slug === 'socrates') {
    return {
      ...philosopherWithImage,
      lifeStory: [
        {
          title: 'Early Life and Background',
          content: `Socrates was born around 470 BCE in Athens during the height of the Athenian Golden Age. His father, Sophroniscus, was a stonemason and sculptor, while his mother, Phaenarete, worked as a midwife—a profession that would later inspire Socrates' famous metaphor of philosophical inquiry as intellectual midwifery, helping others give birth to ideas. Born into the deme of Alopece, Socrates grew up as an ordinary Athenian citizen during the city's most prosperous and culturally vibrant period.

As a young man, Socrates would have received the standard education of an Athenian citizen, including training in music, gymnastics, and basic literacy. However, unlike many of his contemporaries who pursued careers in politics, trade, or military service, Socrates became increasingly drawn to philosophical inquiry. His early exposure to the intellectual ferment of Athens, where sophists, natural philosophers, and poets gathered to debate ideas, likely sparked his lifelong passion for examining fundamental questions about knowledge, virtue, and the good life.`
        },
        {
          title: 'Military Service and Civic Duty',
          content: `Despite his later reputation as a purely intellectual figure, Socrates fulfilled his civic duties as an Athenian citizen, including military service during the Peloponnesian War. He served as a hoplite (heavy infantry soldier) in several major campaigns, including the battles of Potidaea (432 BCE), Delium (424 BCE), and Amphipolis (422 BCE). His military service demonstrated the same courage and endurance that would later characterize his philosophical pursuits.

Contemporary accounts, particularly from Plato's dialogues, describe Socrates as an exceptional soldier who showed remarkable physical endurance and moral courage. At the Battle of Delium, he reportedly helped save the life of Alcibiades, and his calm demeanor during the chaotic retreat impressed his fellow soldiers. This military experience reinforced Socrates' belief that virtue was not merely theoretical but required practical demonstration through action, a principle that would become central to his philosophical teaching.`
        },
        {
          title: 'Development of the Socratic Method',
          content: `Socrates' distinctive approach to philosophy emerged gradually through his interactions with fellow Athenians in the agora, gymnasiums, and symposiums of Athens. Unlike the sophists who claimed to possess wisdom and charged fees for their teaching, Socrates insisted that he knew nothing and sought only to examine the beliefs and assumptions of others. This approach, later known as the Socratic Method, involved asking probing questions designed to expose contradictions and inconsistencies in people's thinking.

The Oracle at Delphi's pronouncement that no one was wiser than Socrates prompted him to test this claim by questioning supposedly wise individuals—politicians, poets, craftsmen, and religious leaders. Through these conversations, Socrates discovered that while others claimed knowledge they did not possess, he at least recognized his own ignorance. This realization led to his famous declaration that "the unexamined life is not worth living" and his mission to encourage others to examine their beliefs and pursue genuine wisdom rather than mere opinion.`
        },
        {
          title: 'Teaching and Influence',
          content: `Although Socrates never established a formal school or charged fees for instruction, he attracted a devoted circle of followers, including young aristocrats like Plato, Alcibiades, and Critias. His teaching method was conversational and dialectical, engaging students in dialogue rather than delivering lectures. He believed that knowledge was already present within each person and that his role was to help them discover it through careful questioning and examination.

Socrates' influence extended beyond formal philosophical instruction to encompass moral and ethical guidance. He taught that virtue was knowledge and that no one does wrong willingly—people act badly only because they lack understanding of what is truly good. This intellectualist approach to ethics emphasized the importance of self-knowledge and rational reflection in living a virtuous life. His students were drawn not only to his philosophical insights but also to his personal example of integrity, courage, and commitment to truth.`
        },
        {
          title: 'Trial and Accusations',
          content: `In 399 BCE, when Socrates was seventy years old, he was brought to trial on charges of impiety and corrupting the youth of Athens. The formal accusations, brought by Meletus, Anytus, and Lycon, claimed that Socrates did not believe in the gods recognized by the state, introduced new divinities, and corrupted young men through his teachings. These charges reflected deeper political and social tensions in Athens following its defeat in the Peloponnesian War and the brief rule of the Thirty Tyrants, some of whom had been associated with Socrates.

The trial took place before a jury of 501 Athenian citizens in the People's Court. Rather than offering a conventional defense or showing remorse, Socrates used the occasion to explain and justify his philosophical mission. He argued that his questioning of fellow citizens was a service to Athens, comparing himself to a gadfly that stings a lazy horse into action. His defense, as recorded in Plato's "Apology," demonstrated his unwavering commitment to his principles even when facing death. The jury found him guilty by a narrow margin, and when asked to propose an alternative to the death penalty, Socrates suggested he should be given free meals for life as a public benefactor.`
        },
        {
          title: 'Death and Legacy',
          content: `After being sentenced to death, Socrates spent his final month in prison, where he continued to engage in philosophical discussions with his friends and followers. He refused opportunities to escape, arguing that doing so would violate his principles and the laws of Athens that he had lived under his entire life. His final conversations, recorded in Plato's "Crito" and "Phaedo," explored themes of justice, the immortality of the soul, and the proper attitude toward death.

On the appointed day, Socrates drank the hemlock poison with remarkable composure, spending his final hours discussing philosophy with his companions. His death became a powerful symbol of intellectual integrity and moral courage, inspiring countless later thinkers and establishing him as a martyr for the cause of free inquiry. Through the writings of Plato and Xenophon, Socrates' teachings and example profoundly influenced subsequent philosophical development, particularly the Stoic emphasis on virtue, self-knowledge, and moral integrity. His legacy as the founder of Western moral philosophy and his method of critical inquiry continue to shape educational and philosophical practice to this day.`
        }
      ],
      quotes: []
    }
  }

  return {
    ...philosopherWithImage,
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