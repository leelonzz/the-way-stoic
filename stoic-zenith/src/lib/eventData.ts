import { HistoricalEvent, EventPeriod, EventsPageData } from '@/types/event'

export const historicalEvents: HistoricalEvent[] = [
  // Hellenistic Period Events
  {
    id: 'diadochi-wars',
    title: 'The Diadochi Wars: Political Chaos That Birthed Stoicism',
    slug: 'diadochi-wars-322-275-bce',
    period: 'hellenistic',
    periodName: 'Hellenistic Period',
    dateRange: '322-275 BCE',
    startYear: -322,
    endYear: -275,
    location: 'Mediterranean Basin',
    description:
      "The Diadochi Wars between Alexander the Great's successors created unprecedented political instability across the ancient world, directly leading to the development of Stoic philosophy as people sought inner peace amid external chaos.",
    significance:
      'These devastating conflicts fundamentally changed how people viewed political power and personal security, creating the intellectual climate that made Stoic philosophy not just appealing, but essential for survival.',
    stoicConnection:
      "The constant warfare and political upheaval following Alexander's death demonstrated the futility of depending on external circumstances for happiness, directly inspiring Zeno of Citium and other early Stoics to develop a philosophy focused on inner virtue and emotional resilience.",
    keyFigures: [
      'Alexander the Great',
      'Ptolemy I Soter',
      'Seleucus I Nicator',
      'Antigonus I Monophthalmus',
      'Zeno of Citium',
      'Cassander',
    ],
    relatedEvents: [
      'seleucid-empire-decline',
      'ptolemaic-egypt-rise',
      'battle-of-ipsus',
    ],
    sources: [
      'Diodorus Siculus - Bibliotheca Historica',
      'Plutarch - Lives of the Noble Greeks',
      'Arrian - Anabasis of Alexander',
      'Justin - Epitome of Pompeius Trogus',
    ],
    tags: [
      'diadochi-wars',
      'political-instability',
      'hellenistic-period',
      'stoic-origins',
      'alexander-successors',
      'ancient-warfare',
      'philosophical-development',
    ],
    seo: {
      metaTitle:
        'Diadochi Wars (322-275 BCE): How Political Chaos Created Stoicism',
      metaDescription:
        "Explore how the Diadochi Wars between Alexander's successors created the political turmoil that directly led to the birth of Stoic philosophy and inner resilience.",
      keywords: [
        'Diadochi Wars',
        'Alexander successors',
        'Stoic philosophy origins',
        'Hellenistic period',
        'ancient political chaos',
        'Zeno of Citium',
        'philosophical development',
        'inner resilience',
      ],
    },
    content: {
      overview:
        'The Diadochi Wars (322-275 BCE) were a series of devastating conflicts fought among Alexander the Great\'s generals, known as the Diadochi ("Successors"), for control of his vast empire. These wars fundamentally transformed the ancient world, creating the political instability that directly led to the development of Stoic philosophy. As traditional power structures collapsed and civic life became dangerous, intellectuals like Zeno of Citium sought new ways to find meaning and stability through inner virtue rather than external circumstances.',
      historicalContext:
        'When Alexander the Great died suddenly in Babylon in 323 BCE, he left behind an empire stretching from Macedonia to India—the largest the world had ever seen. With no clear heir and no succession plan, his generals immediately began fighting for control. The empire fragmented into competing kingdoms: the Ptolemies in Egypt, the Seleucids in Asia, the Antigonids in Macedonia, and smaller successor states. For nearly fifty years, these kingdoms waged constant war, devastating cities, displacing populations, and destroying the stability that had allowed Greek culture to flourish. Traditional Greek city-states lost their independence, becoming pawns in larger power struggles.',
      stoicInfluence:
        "The Diadochi Wars created the perfect storm for Stoic philosophy's emergence. As political participation became dangerous and traditional civic virtues meaningless, people needed a new framework for living well. The wars demonstrated that external goods—wealth, political power, even entire kingdoms—could be lost in an instant. This harsh reality made Stoic teachings about focusing on what you can control (your thoughts, actions, and responses) rather than what you cannot (external events) not just appealing, but essential for psychological survival. Zeno of Citium, who arrived in Athens around 300 BCE as the wars raged, developed Stoicism specifically to address this need for inner stability amid external chaos.",
      keyMoments: [
        {
          date: '323 BCE',
          event: 'Death of Alexander the Great in Babylon',
          significance:
            'Triggered the immediate succession crisis as his generals began competing for power, marking the end of unified Greek expansion and the beginning of the Hellenistic period',
        },
        {
          date: '322-321 BCE',
          event: 'First War of the Diadochi begins',
          significance:
            "Initial conflict over the regency and division of Alexander's empire, establishing the pattern of constant warfare that would define the next fifty years",
        },
        {
          date: '301 BCE',
          event: 'Battle of Ipsus - "The Battle of the Kings"',
          significance:
            "Decisive battle where Antigonus I was killed, permanently dividing Alexander's empire into separate Hellenistic kingdoms and ending dreams of reunification",
        },
        {
          date: '300 BCE',
          event: 'Zeno of Citium arrives in Athens',
          significance:
            'As the wars continued to devastate the Greek world, Zeno began teaching in the Stoa Poikile, developing the philosophical system that would become Stoicism',
        },
        {
          date: '281 BCE',
          event: 'Battle of Corupedium',
          significance:
            'Final major battle of the Diadochi Wars, establishing the lasting boundaries of the Hellenistic kingdoms and the new political reality',
        },
      ],
      legacy:
        'The Diadochi Wars fundamentally reshaped both the political and philosophical landscape of the ancient world. Politically, they established the Hellenistic kingdoms that would dominate the Mediterranean for centuries. Philosophically, they created the conditions that made Stoicism not just relevant, but necessary. The wars proved that external circumstances—no matter how powerful or seemingly permanent—could change instantly and catastrophically. This lesson became central to Stoic teaching: true security and happiness must come from within, from virtue and wisdom that no external force can destroy. The political instability that began with these wars continued to influence Stoic development through the Roman Republic and Empire, making Stoicism the philosophy of choice for those navigating uncertain times.',
    },
  },
  {
    id: 'seleucid-empire-decline',
    title: 'Seleucid Empire Decline',
    slug: 'seleucid-empire-decline',
    period: 'hellenistic',
    periodName: 'Hellenistic Period',
    dateRange: '250-63 BCE',
    startYear: -250,
    endYear: -63,
    location: 'Near East and Central Asia',
    description:
      "The gradual decline of the Seleucid Empire provided the context for Diogenes of Babylon's birthplace in Seleucia.",
    significance:
      "The empire's decline created cultural mixing and philosophical exchange that influenced Stoic development.",
    stoicConnection:
      'Diogenes of Babylon, a key Stoic philosopher, came from Seleucia on the Tigris, demonstrating how Stoicism spread throughout the Hellenistic world.',
    keyFigures: ['Diogenes of Babylon', 'Antiochus III', 'Seleucus I Nicator'],
    relatedEvents: ['diadochi-wars', 'ptolemaic-egypt'],
    sources: ['Appian', 'Josephus', 'Diogenes Laertius'],
    tags: [
      'seleucid-empire',
      'hellenistic-decline',
      'cultural-exchange',
      'diogenes-babylon',
    ],
    seo: {
      metaTitle:
        'Seleucid Empire Decline | Context for Stoic Philosophy Spread',
      metaDescription:
        'Learn how the decline of the Seleucid Empire created the cultural conditions for Stoic philosophy to spread, including the birthplace of Diogenes of Babylon.',
      keywords: [
        'Seleucid Empire',
        'Hellenistic decline',
        'Diogenes of Babylon',
        'Stoic philosophy spread',
        'ancient Near East',
      ],
    },
    content: {
      overview:
        "The Seleucid Empire, one of the largest successor states of Alexander's empire, gradually declined from 250 BCE onwards due to internal conflicts, external pressures, and territorial losses.",
      historicalContext:
        'Founded by Seleucus I Nicator, the empire initially stretched from Anatolia to the Indus River. However, it faced constant challenges from Ptolemaic Egypt, the Roman Republic, Parthia, and internal rebellions.',
      stoicInfluence:
        "The empire's multicultural nature and gradual decline created an environment where Greek philosophical ideas mixed with local traditions. Seleucia on the Tigris, birthplace of Diogenes of Babylon, exemplified this cultural synthesis.",
      keyMoments: [
        {
          date: '312 BCE',
          event: 'Foundation of Seleucia on the Tigris',
          significance:
            'Established the city that would later produce Diogenes of Babylon',
        },
        {
          date: '230 BCE',
          event: 'Birth of Diogenes of Babylon',
          significance:
            'Future head of the Stoic school born in the multicultural Seleucid capital',
        },
        {
          date: '190 BCE',
          event: 'Battle of Magnesia',
          significance: 'Roman victory that severely weakened Seleucid power',
        },
        {
          date: '63 BCE',
          event: "Pompey's conquest of Syria",
          significance: 'Final end of the Seleucid Empire',
        },
      ],
      legacy:
        "The Seleucid Empire's decline demonstrated the impermanence of political power, a key theme in Stoic philosophy, while its cultural diversity helped spread Stoic ideas throughout the ancient world.",
    },
  },

  // Roman Republic Crisis Events
  {
    id: 'marian-sullan-wars',
    title: 'Marian-Sullan Civil Wars',
    slug: 'marian-sullan-civil-wars-88-82-bce',
    period: 'roman-republic',
    periodName: 'Roman Republic Crisis',
    dateRange: '88-82 BCE',
    startYear: -88,
    endYear: -82,
    location: 'Roman Republic',
    description:
      'A series of civil wars that marked the beginning of the end for the Roman Republic and established Stoicism as a philosophy of political resistance.',
    significance:
      'These conflicts demonstrated the fragility of political institutions and made Stoic principles of virtue and duty increasingly relevant.',
    stoicConnection:
      'The civil wars showed the importance of personal virtue over political success, a core Stoic teaching that would influence later Roman Stoics.',
    keyFigures: ['Gaius Marius', 'Lucius Cornelius Sulla', 'Cato the Elder'],
    relatedEvents: ['catiline-conspiracy', 'caesar-gallic-wars'],
    sources: ['Plutarch', 'Appian', 'Velleius Paterculus'],
    tags: [
      'civil-war',
      'roman-republic',
      'political-resistance',
      'virtue-ethics',
    ],
    seo: {
      metaTitle:
        'Marian-Sullan Civil Wars (88-82 BCE) | Stoicism as Political Resistance',
      metaDescription:
        'Discover how the Marian-Sullan Civil Wars transformed Stoicism into a philosophy of political resistance and moral integrity in the Roman Republic.',
      keywords: [
        'Marian-Sullan Wars',
        'Roman civil wars',
        'Stoic political resistance',
        'Roman Republic crisis',
        'ancient virtue ethics',
      ],
    },
    content: {
      overview:
        'The Marian-Sullan Civil Wars were the first major internal conflicts of the Roman Republic, fought between the populares faction led by Marius and the optimates led by Sulla.',
      historicalContext:
        'These wars arose from tensions between traditional Roman aristocracy and populist politicians, exacerbated by the Social War and conflicts with foreign enemies.',
      stoicInfluence:
        'The brutality and chaos of civil war reinforced Stoic teachings about the unreliability of external goods like political power and the importance of maintaining virtue regardless of circumstances.',
      keyMoments: [
        {
          date: '88 BCE',
          event: "Sulla's first march on Rome",
          significance:
            'First time a Roman general led an army against Rome itself',
        },
        {
          date: '87 BCE',
          event: "Marius's return and proscriptions",
          significance:
            'Demonstrated the deadly consequences of political extremism',
        },
        {
          date: '82 BCE',
          event: "Sulla's dictatorship established",
          significance:
            'Showed how republican institutions could be subverted by force',
        },
      ],
      legacy:
        'These wars established the precedent for using violence in Roman politics and made Stoic principles of virtue and duty essential for maintaining moral integrity in corrupt times.',
    },
  },

  {
    id: 'catiline-conspiracy',
    title:
      "Catiline Conspiracy: Cato the Younger's Stoic Stand Against Tyranny",
    slug: 'catiline-conspiracy-63-bce',
    period: 'roman-republic',
    periodName: 'Roman Republic Crisis',
    dateRange: '63 BCE',
    startYear: -63,
    location: 'Rome',
    description:
      "The Catiline Conspiracy of 63 BCE was a pivotal moment when Cato the Younger's unwavering Stoic principles saved the Roman Republic from violent overthrow, demonstrating how philosophical virtue could triumph over political corruption and personal ambition.",
    significance:
      "This conspiracy marked the first time Stoic philosophy directly influenced major Roman political decisions, with Cato's moral courage and principled reasoning convincing the Senate to execute the conspirators and preserve republican government.",
    stoicConnection:
      "Cato the Younger's response to the Catiline Conspiracy became the definitive example of Stoic virtue in political action, showing how philosophical principles of justice, courage, and duty to the common good could guide leaders through moral crises.",
    keyFigures: [
      'Marcus Porcius Cato (Cato the Younger)',
      'Lucius Sergius Catilina',
      'Marcus Tullius Cicero',
      'Gaius Julius Caesar',
      'Gaius Antonius Hybrida',
      'Publius Cornelius Lentulus',
    ],
    relatedEvents: [
      'marian-sullan-wars',
      'caesar-gallic-wars',
      'first-triumvirate',
    ],
    sources: [
      'Cicero - Catiline Orations (In Catilinam)',
      'Sallust - The Conspiracy of Catiline',
      'Plutarch - Life of Cato the Younger',
      'Appian - Civil Wars',
    ],
    tags: [
      'catiline-conspiracy',
      'cato-younger',
      'stoic-virtue',
      'republican-integrity',
      'roman-senate',
      'political-corruption',
      'moral-courage',
      'cicero-orations',
    ],
    seo: {
      metaTitle: "Catiline Conspiracy 63 BCE: Cato's Stoic Stand Saves Rome",
      metaDescription:
        "Discover how Cato the Younger's Stoic principles defeated the Catiline Conspiracy, saving the Roman Republic through moral courage and philosophical virtue.",
      keywords: [
        'Catiline Conspiracy',
        'Cato the Younger',
        'Stoic virtue',
        'Roman Republic',
        'Cicero orations',
        'political integrity',
        'moral courage',
        '63 BCE Rome',
      ],
    },
    content: {
      overview:
        "The Catiline Conspiracy of 63 BCE was one of the most dangerous threats to the Roman Republic, a carefully planned plot by the ambitious senator Lucius Sergius Catilina to violently overthrow the government and seize power. What makes this conspiracy historically significant for Stoic philosophy is how Cato the Younger's unwavering moral principles and philosophical reasoning proved decisive in defeating it. While Cicero exposed the plot through his famous orations, it was Cato's passionate defense of justice and republican values that convinced the Senate to take the extreme step of executing Roman citizens without trial—a decision that saved the Republic but would later be used against both men.",
      historicalContext:
        'By 63 BCE, the Roman Republic was experiencing severe internal tensions. Economic inequality had reached dangerous levels, with many citizens crushed by debt while a few elites accumulated vast wealth. The traditional Roman political system was breaking down as ambitious generals like Pompey and Caesar accumulated unprecedented power. Catiline, a patrician who had been denied the consulship twice due to corruption charges, represented the frustrations of both impoverished citizens and disaffected nobles. His conspiracy attracted desperate debtors, ambitious young aristocrats, and veterans who felt abandoned by the state. The plot involved assassinating key senators, burning Rome, and establishing a new government with Catiline as dictator.',
      stoicInfluence:
        "Cato the Younger's response to the Catiline Conspiracy became the defining moment that established Stoicism as a practical political philosophy. When the Senate debated the fate of the captured conspirators, Caesar argued for life imprisonment, appealing to Roman legal traditions and mercy. Cato, however, delivered a speech that embodied core Stoic principles: he argued that true compassion meant protecting innocent citizens from future harm, that justice required punishment proportional to the crime, and that the state's survival took precedence over individual lives. His reasoning was purely philosophical—he showed no personal animosity toward the conspirators but argued from first principles about duty, justice, and the common good. This demonstration of Stoic virtue in action proved that philosophy could provide practical guidance for the most difficult political decisions.",
      keyMoments: [
        {
          date: 'October 8, 63 BCE',
          event: "Cicero's First Catiline Oration in the Senate",
          significance:
            'Cicero publicly confronted Catiline in the Senate with his famous opening "How long, Catiline, will you abuse our patience?" This dramatic moment exposed the conspiracy and forced Catiline to flee Rome.',
        },
        {
          date: 'November 63 BCE',
          event: 'Capture of Conspirators and Evidence',
          significance:
            "Roman authorities intercepted letters proving the conspiracy's scope, including plans to massacre senators and burn the city. Key conspirators including Lentulus were arrested with concrete evidence of treason.",
        },
        {
          date: 'December 5, 63 BCE',
          event: 'Senate Debate: Caesar vs. Cato',
          significance:
            "The pivotal moment when Caesar argued for imprisonment while Cato delivered his famous speech advocating execution. Cato's Stoic reasoning about justice and duty convinced the wavering senators.",
        },
        {
          date: 'December 5, 63 BCE',
          event: 'Execution of the Conspirators',
          significance:
            "Following Cato's speech, the conspirators were immediately executed in the Tullianum prison. This swift justice ended the immediate threat but created a precedent that would later be used against both Cicero and Cato.",
        },
        {
          date: 'January 62 BCE',
          event: 'Death of Catiline at Pistoria',
          significance:
            "Catiline died fighting Roman forces in northern Italy, ending the conspiracy completely and vindicating Cato's harsh but effective response.",
        },
      ],
      legacy:
        "The Catiline Conspiracy established Cato the Younger as the living embodiment of Stoic virtue in Roman politics, a reputation that would define him for the rest of his life. His principled stand showed that Stoic philosophy could provide practical guidance for the most difficult political decisions, making virtue and duty more important than personal popularity or political expediency. However, the precedent of executing citizens without trial would later be used against both Cato and Cicero by their enemies. More importantly, Cato's example inspired generations of Romans and later republicans who saw in him proof that philosophical principles could triumph over corruption and ambition. The conspiracy also demonstrated the growing instability of the late Republic, foreshadowing the civil wars that would eventually destroy the system Cato died trying to preserve.",
    },
  },

  // Early Roman Empire Events
  {
    id: 'julio-claudian-dynasty',
    title: 'Julio-Claudian Dynasty',
    slug: 'julio-claudian-dynasty-27-bce-68-ce',
    period: 'roman-empire',
    periodName: 'Early Roman Empire',
    dateRange: '27 BCE-68 CE',
    startYear: -27,
    endYear: 68,
    location: 'Roman Empire',
    description:
      'The first imperial dynasty of Rome, during which Seneca served under Nero and Stoic opposition to tyranny developed.',
    significance:
      'This period saw Stoicism adapt to imperial rule while maintaining its principles of virtue and resistance to tyranny.',
    stoicConnection:
      "Seneca's service under Nero and the Stoic opposition to imperial excesses demonstrated how Stoic philosophy could navigate the complexities of imperial power.",
    keyFigures: [
      'Augustus',
      'Tiberius',
      'Caligula',
      'Claudius',
      'Nero',
      'Seneca',
      'Thrasea Paetus',
    ],
    relatedEvents: ['flavian-dynasty', 'antonine-dynasty'],
    sources: ['Tacitus', 'Suetonius', 'Dio Cassius'],
    tags: ['julio-claudian', 'seneca', 'imperial-stoicism', 'stoic-opposition'],
    seo: {
      metaTitle:
        'Julio-Claudian Dynasty (27 BCE-68 CE) | Seneca and Imperial Stoicism',
      metaDescription:
        "Explore how Stoic philosophy adapted to imperial rule during the Julio-Claudian dynasty, including Seneca's service under Nero.",
      keywords: [
        'Julio-Claudian dynasty',
        'Seneca',
        'Nero',
        'Imperial Stoicism',
        'Roman Empire',
        'Stoic opposition',
      ],
    },
    content: {
      overview:
        "The Julio-Claudian dynasty was the first imperial dynasty of Rome, established by Augustus and ending with Nero's suicide in 68 CE.",
      historicalContext:
        'This period marked the transition from Republic to Empire, with emperors consolidating power while facing various forms of opposition and conspiracy.',
      stoicInfluence:
        'Stoic philosophers had to navigate the new reality of imperial rule, with some like Seneca serving as advisors while others formed an opposition movement based on republican values.',
      keyMoments: [
        {
          date: '27 BCE',
          event: 'Augustus becomes first emperor',
          significance:
            'Established the imperial system that Stoics would have to navigate',
        },
        {
          date: '49 CE',
          event: "Seneca becomes Nero's advisor",
          significance:
            'Brought Stoic philosophy directly into imperial government',
        },
        {
          date: '65 CE',
          event: 'Pisonian Conspiracy',
          significance:
            "Led to persecution of Stoic senators and Seneca's forced suicide",
        },
        {
          date: '68 CE',
          event: "Nero's suicide",
          significance:
            'Ended the dynasty and vindicated Stoic warnings about tyranny',
        },
      ],
      legacy:
        'The Julio-Claudian period established the tension between Stoic philosophy and imperial power that would define Roman Stoicism for centuries.',
    },
  },

  {
    id: 'antonine-dynasty',
    title: 'Antonine Dynasty: Marcus Aurelius and the Stoic Golden Age',
    slug: 'antonine-dynasty-96-192-ce',
    period: 'roman-empire',
    periodName: 'Early Roman Empire',
    dateRange: '96-192 CE',
    startYear: 96,
    endYear: 192,
    location: 'Roman Empire',
    description:
      'The Antonine Dynasty marked the absolute pinnacle of both Roman imperial power and Stoic philosophical influence, culminating in Marcus Aurelius—the only philosopher-emperor in history who successfully combined supreme political authority with profound philosophical wisdom.',
    significance:
      "This period represents the ultimate realization of Plato's ideal of the philosopher-king, demonstrating that Stoic principles could successfully guide the governance of the world's greatest empire during both prosperity and crisis.",
    stoicConnection:
      'Marcus Aurelius embodied the perfect synthesis of Stoic theory and practice, ruling the Roman Empire while writing the Meditations—personal reflections that became the most influential work of Stoic philosophy. Simultaneously, Epictetus taught the practical foundations of Stoicism that would influence Marcus and countless others.',
    keyFigures: [
      'Trajan (98-117 CE)',
      'Hadrian (117-138 CE)',
      'Antoninus Pius (138-161 CE)',
      'Marcus Aurelius (161-180 CE)',
      'Lucius Verus (161-169 CE)',
      'Epictetus (50-135 CE)',
      'Commodus (180-192 CE)',
      'Junius Rusticus',
    ],
    relatedEvents: [
      'julio-claudian-dynasty',
      'flavian-dynasty',
      'marcomannic-wars',
    ],
    sources: [
      'Marcus Aurelius - Meditations',
      'Epictetus - Discourses and Enchiridion',
      'Historia Augusta',
      'Cassius Dio - Roman History',
      'Fronto - Correspondence with Marcus Aurelius',
    ],
    tags: [
      'antonine-dynasty',
      'marcus-aurelius',
      'epictetus',
      'philosopher-emperor',
      'stoic-golden-age',
      'meditations',
      'five-good-emperors',
      'roman-empire-peak',
    ],
    seo: {
      metaTitle: 'Antonine Dynasty 96-192 CE: Marcus Aurelius Stoic Golden Age',
      metaDescription:
        'Explore the Antonine Dynasty when Marcus Aurelius ruled as philosopher-emperor, creating the golden age of Stoicism and writing the immortal Meditations.',
      keywords: [
        'Antonine Dynasty',
        'Marcus Aurelius',
        'philosopher emperor',
        'Stoic golden age',
        'Meditations',
        'Epictetus',
        'Roman Empire peak',
        'Five Good Emperors',
      ],
    },
    content: {
      overview:
        "The Antonine Dynasty (96-192 CE) represents the absolute zenith of both Roman imperial achievement and Stoic philosophical influence. This remarkable period, encompassing the reigns of Trajan, Hadrian, Antoninus Pius, and Marcus Aurelius, demonstrated that Stoic principles could successfully guide the governance of the world's greatest empire. The dynasty reached its philosophical climax with Marcus Aurelius (161-180 CE), the only ruler in history to combine supreme political power with profound philosophical wisdom. While governing an empire stretching from Britain to Mesopotamia and facing constant military crises, Marcus wrote his personal Meditations—reflections that became the most influential work of Stoic philosophy and continue to guide leaders and individuals today.",
      historicalContext:
        "The Antonine Dynasty inherited an empire at its territorial and cultural peak, but also faced unprecedented challenges. Under Trajan (98-117 CE), Rome reached its greatest extent, conquering Dacia and briefly holding Mesopotamia. Hadrian (117-138 CE) consolidated these gains, building his famous wall in Britain and traveling extensively to strengthen provincial administration. Antoninus Pius (138-161 CE) presided over a period of unprecedented peace and prosperity. However, by Marcus Aurelius's reign (161-180 CE), the empire faced mounting pressures: plague devastated the population, Germanic tribes pressed against the northern frontiers, and the Parthian Empire challenged Roman dominance in the East. These crises tested whether Stoic philosophy could provide practical guidance for imperial leadership under extreme stress.",
      stoicInfluence:
        'The Antonine period witnessed the complete integration of Stoic philosophy into Roman imperial governance. Marcus Aurelius, trained by the Stoic teacher Junius Rusticus, applied philosophical principles to every aspect of rule: he viewed his imperial duties as service to the common good, maintained emotional equilibrium during military campaigns, and treated both victories and defeats as opportunities for moral development. His Meditations, written during the Marcomannic Wars (166-180 CE), reveal how he used Stoic practices—morning reflection, evening examination of conscience, and constant awareness of mortality—to maintain virtue while wielding absolute power. Simultaneously, Epictetus (50-135 CE) was teaching the practical foundations of Stoicism in Nicopolis, emphasizing the dichotomy of control and inner freedom that would profoundly influence Marcus and countless others. This period proved that Stoicism was not merely an abstract philosophy but a practical system for ethical leadership and personal resilience.',
      keyMoments: [
        {
          date: '98 CE',
          event: 'Trajan becomes Emperor, beginning the "Five Good Emperors"',
          significance:
            'Initiated the golden age of Roman imperial governance, establishing the adoptive succession system that would bring Marcus Aurelius to power and demonstrating that merit rather than birth could determine imperial succession.',
        },
        {
          date: '93-135 CE',
          event: 'Epictetus teaches Stoicism in Nicopolis',
          significance:
            'The former slave turned philosopher established the practical foundations of Roman Stoicism, teaching the dichotomy of control and inner freedom that would profoundly influence Marcus Aurelius and generations of Stoic practitioners.',
        },
        {
          date: '138 CE',
          event: 'Antoninus Pius adopts Marcus Aurelius as heir',
          significance:
            'This adoption brought the future philosopher-emperor into the imperial family and began his intensive education in both governance and Stoic philosophy under teachers like Junius Rusticus.',
        },
        {
          date: '161 CE',
          event: 'Marcus Aurelius becomes Emperor',
          significance:
            'The philosopher-king ideal of Plato was finally realized as a trained Stoic philosopher assumed supreme power over the Roman Empire, beginning the most philosophically informed reign in history.',
        },
        {
          date: '166-180 CE',
          event:
            'Marcus Aurelius writes Meditations during the Marcomannic Wars',
          significance:
            'While commanding Roman armies against Germanic tribes, Marcus composed his personal philosophical reflections, creating the most influential work of Stoic philosophy and demonstrating how philosophical practice could sustain leadership during extreme adversity.',
        },
        {
          date: '180 CE',
          event: 'Death of Marcus Aurelius and succession of Commodus',
          significance:
            "Marcus's death marked the end of the Stoic golden age and the beginning of imperial decline, as his son Commodus abandoned philosophical principles for tyrannical excess, proving the importance of philosophical education for rulers.",
        },
      ],
      legacy:
        "The Antonine Dynasty, particularly the reign of Marcus Aurelius, provided definitive proof that Stoic philosophy could successfully guide imperial leadership and remains the supreme historical example of philosophical governance. Marcus's Meditations continue to influence leaders, entrepreneurs, and individuals seeking to apply ancient wisdom to modern challenges. The dynasty demonstrated that power and virtue could be combined, that philosophical reflection enhanced rather than hindered practical effectiveness, and that Stoic principles—duty to the common good, emotional resilience, and acceptance of mortality—were essential for ethical leadership. However, the immediate collapse of these ideals under Commodus also showed that philosophical wisdom must be actively cultivated and cannot be inherited, making Marcus's example both inspiring and cautionary for future generations seeking to combine power with virtue.",
    },
  },
]

export const eventPeriods: EventPeriod[] = [
  {
    id: 'hellenistic',
    name: 'Hellenistic Period',
    slug: 'hellenistic-period',
    dateRange: '323-146 BCE',
    description:
      "The era following Alexander the Great's death, characterized by political fragmentation and the rise of personal philosophy.",
    significance:
      "This period of uncertainty and cultural mixing created the conditions for Stoicism's emergence and early development.",
    events: historicalEvents.filter(event => event.period === 'hellenistic'),
  },
  {
    id: 'roman-republic',
    name: 'Roman Republic Crisis',
    slug: 'roman-republic-crisis',
    dateRange: '133-27 BCE',
    description:
      'The final century of the Roman Republic, marked by civil wars and political upheaval.',
    significance:
      'Stoicism became a philosophy of political resistance and moral integrity during this turbulent period.',
    events: historicalEvents.filter(event => event.period === 'roman-republic'),
  },
  {
    id: 'roman-empire',
    name: 'Early Roman Empire',
    slug: 'early-roman-empire',
    dateRange: '27 BCE-180 CE',
    description:
      'The establishment and golden age of the Roman Empire, when Stoicism reached its peak influence.',
    significance:
      'Stoicism became the dominant philosophy of Roman elites and produced its greatest practitioners.',
    events: historicalEvents.filter(event => event.period === 'roman-empire'),
  },
]

export function getAllEvents(): HistoricalEvent[] {
  return historicalEvents
}

export function getEventBySlug(slug: string): HistoricalEvent | undefined {
  return historicalEvents.find(event => event.slug === slug)
}

export function getEventsByPeriod(period: string): HistoricalEvent[] {
  return historicalEvents.filter(event => event.period === period)
}

export function getRelatedEvents(
  eventId: string,
  limit: number = 3
): HistoricalEvent[] {
  const event = historicalEvents.find(e => e.id === eventId)
  if (!event) return []

  const related = historicalEvents.filter(
    e =>
      e.id !== eventId &&
      (e.relatedEvents.includes(eventId) ||
        event.relatedEvents.includes(e.id) ||
        e.period === event.period)
  )

  return related.slice(0, limit)
}

export function getFeaturedEvents(): HistoricalEvent[] {
  return historicalEvents.slice(0, 6) // Return first 6 events as featured
}

export function getEventsPageData(): EventsPageData {
  return {
    periods: eventPeriods,
    featuredEvents: getFeaturedEvents(),
  }
}
