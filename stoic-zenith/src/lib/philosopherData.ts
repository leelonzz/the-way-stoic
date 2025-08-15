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
      ...philosopher,
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
      ...philosopher,
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
      ...philosopher,
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