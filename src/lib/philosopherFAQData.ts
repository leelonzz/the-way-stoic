export interface FAQItem {
  question: string
  answer: string
  category?: string
}

export interface PhilosopherFAQ {
  [slug: string]: FAQItem[]
}

export const philosopherFAQData: PhilosopherFAQ = {
  'marcus-aurelius': [
    {
      question: "What was Marcus Aurelius known for besides being a Roman Emperor?",
      answer: "Marcus Aurelius was known as both the last of the 'Five Good Emperors' and one of history's greatest Stoic philosophers. His personal journal, known as 'Meditations,' contains profound philosophical reflections on virtue, duty, and resilience. He's remembered as the ideal 'philosopher-king' that Plato envisioned - a ruler who combined political power with deep philosophical wisdom. His reign (161-180 CE) was marked by military campaigns, plague, and internal strife, yet he maintained his commitment to Stoic principles throughout.",
      category: "Biography"
    },
    {
      question: "What is the book 'Meditations' and why is it important?",
      answer: "The 'Meditations' is Marcus Aurelius' personal journal of philosophical reflections, written during his military campaigns. Never intended for publication, it offers intimate insights into how a powerful leader applied Stoic philosophy to real-world challenges. The work is structured as notes to himself, covering themes like mortality, virtue, duty, and finding peace amid chaos. It's considered one of the greatest works of ancient philosophy because it shows Stoicism in practice, not just theory, making it incredibly relevant for modern readers facing their own challenges.",
      category: "Philosophy"
    },
    {
      question: "How did Marcus Aurelius die and what were his final years like?",
      answer: "Marcus Aurelius died in 180 CE at age 58, likely from plague or natural causes, while on military campaign along the Danube frontier. His final years were marked by constant warfare against Germanic tribes, the devastating Antonine Plague that killed millions, and the burden of governing a vast empire. Despite these challenges, he continued writing his philosophical reflections and maintained his Stoic composure. His death marked the end of the Pax Romana and the beginning of Rome's decline, as his son Commodus proved to be a tyrannical successor.",
      category: "Biography"
    },
    {
      question: "Why did Marcus Aurelius choose Commodus as his successor despite Stoic principles?",
      answer: "This remains one of history's great puzzles. Marcus Aurelius broke the tradition of adopting the most capable successor and instead chose his biological son Commodus, who became a notorious tyrant. Several theories exist: he may have feared civil war if he passed over his son, he might have hoped Commodus would mature into a good ruler, or he may have been influenced by court pressure. Some historians suggest Marcus was increasingly isolated in his final years and may not have fully grasped Commodus' character flaws. It represents perhaps his greatest failure to live up to his own philosophical ideals.",
      category: "History"
    },
    {
      question: "How can I apply Marcus Aurelius' teachings to modern life?",
      answer: "Marcus Aurelius' teachings offer practical wisdom for modern challenges. Start with his concept of focusing on what you can control - your thoughts, actions, and responses - rather than external events. Practice morning reflection to set intentions and evening review to assess your day. Embrace obstacles as opportunities for growth ('the impediment to action advances action'). Cultivate gratitude and remember life's brevity to prioritize what truly matters. His emphasis on duty and service to the common good can guide professional and personal decisions. Most importantly, strive to be virtuous in your daily actions, regardless of how others behave.",
      category: "Practical Application"
    }
  ],

  'seneca': [
    {
      question: "How could Seneca be wealthy and still be a good Stoic philosopher?",
      answer: "This apparent contradiction has puzzled people for centuries. Seneca accumulated vast wealth as advisor to Emperor Nero, which seems to conflict with Stoic teachings about simplicity. However, Seneca argued that wealth itself isn't evil - it's our attachment to it that causes problems. He practiced 'preferred indifferents,' using wealth as a tool for good while remaining emotionally detached from it. He regularly practiced voluntary poverty, gave generously to others, and wrote extensively about the dangers of materialism. His wealth allowed him to help others and fund philosophical pursuits, demonstrating that Stoics can engage with the world while maintaining inner freedom.",
      category: "Philosophy"
    },
    {
      question: "What are Seneca's most important works for beginners?",
      answer: "'Letters from a Stoic' (Epistulae Morales) is the best starting point - these 124 letters to his friend Lucilius offer practical advice on living well. 'On the Shortness of Life' is a powerful essay about time management and priorities that resonates strongly today. 'On Anger' provides practical techniques for managing emotions and relationships. 'On Tranquility of Mind' offers guidance on finding peace and contentment. These works are more accessible than Marcus Aurelius' 'Meditations' because Seneca wrote for others, not just himself, making his advice clearer and more systematic.",
      category: "Reading Guide"
    },
    {
      question: "How did Seneca die and why was he forced to commit suicide?",
      answer: "In 65 CE, Seneca was implicated in the Pisonian conspiracy to assassinate Emperor Nero, though his actual involvement remains debated. Nero, his former student, ordered Seneca to commit suicide. Seneca faced death with remarkable Stoic composure, using his final moments to teach philosophy to his friends and family. He attempted to cut his wrists, but when that proved too slow, he drank poison and finally entered a hot bath to speed the process. His death exemplified Stoic principles about facing mortality with dignity and courage, turning even his execution into a philosophical lesson about living and dying well.",
      category: "Biography"
    },
    {
      question: "What is Seneca's advice on dealing with anger and difficult emotions?",
      answer: "Seneca wrote extensively on anger management in 'De Ira' (On Anger), calling anger 'temporary madness.' His approach involves prevention rather than cure: examine your judgments before anger arises, practice perspective-taking to understand others' motivations, and remember that anger hurts you more than its target. He recommends delaying responses when angry, using reason to examine whether your anger is justified, and focusing on what you can control. For other difficult emotions, he advocates acceptance of what cannot be changed, gratitude for what you have, and regular reflection on life's impermanence to maintain emotional equilibrium.",
      category: "Practical Application"
    },
    {
      question: "How did Seneca influence modern cognitive behavioral therapy (CBT)?",
      answer: "Seneca's psychological insights directly influenced modern CBT, particularly through his understanding that our thoughts create our emotions, not external events. His famous quote 'We suffer more often in imagination than in reality' anticipates CBT's focus on cognitive distortions. He developed techniques for examining and challenging negative thoughts, practicing exposure to feared situations, and reframing problems as opportunities. His letters describe what we now call cognitive restructuring, mindfulness, and behavioral experiments. Many CBT pioneers, including Albert Ellis and Aaron Beck, acknowledged Stoic philosophy's influence on their therapeutic approaches, making Seneca a bridge between ancient wisdom and modern psychology.",
      category: "Modern Relevance"
    }
  ],

  'epictetus': [
    {
      question: "What is the dichotomy of control and how do I practice it?",
      answer: "The dichotomy of control is Epictetus' fundamental teaching that divides everything into two categories: what is 'up to us' (our judgments, desires, actions, and responses) and what is 'not up to us' (everything else - other people, external events, outcomes). To practice it, start each day by identifying what you can and cannot control in your current challenges. Focus your energy entirely on your responses and decisions while accepting external outcomes with equanimity. When you feel stressed or upset, ask yourself: 'Is this something I can control?' If not, practice letting go. If yes, take appropriate action without attachment to results.",
      category: "Core Teaching"
    },
    {
      question: "How did Epictetus overcome being a slave to become a great teacher?",
      answer: "Epictetus was born into slavery in Phrygia (modern Turkey) and served in Rome under Epaphroditus, a freedman of Emperor Nero. Despite his physical bondage, he discovered that his mind remained free - a realization that became central to his philosophy. He studied under the Stoic teacher Musonius Rufus while still enslaved. After gaining his freedom (possibly when Emperor Domitian banished philosophers from Rome), he established a school in Nicopolis, Greece. His experience of slavery gave him unique insights into true freedom - that external circumstances cannot touch our inner liberty if we maintain control over our thoughts and judgments.",
      category: "Biography"
    },
    {
      question: "What's the difference between the Discourses and the Enchiridion?",
      answer: "The 'Discourses' are detailed records of Epictetus' classroom lectures, transcribed by his student Arrian. They provide in-depth exploration of Stoic principles with examples, dialogues, and extended reasoning - think of them as the full course. The 'Enchiridion' (meaning 'handbook' or 'manual') is a condensed summary of key teachings from the Discourses, designed as a portable guide for daily practice. The Enchiridion is perfect for beginners or quick reference, while the Discourses offer deeper understanding and more comprehensive coverage. Both were written by Arrian, not Epictetus himself, but faithfully preserve his teachings.",
      category: "Reading Guide"
    },
    {
      question: "What did Epictetus mean by 'it's not what happens to you, but how you react'?",
      answer: "This famous teaching means that external events are neutral - they become good or bad only through our judgments and responses. A job loss, illness, or criticism doesn't inherently cause suffering; our interpretation and reaction create the emotional experience. Epictetus taught that we always have a choice in how we respond, even in the worst circumstances. This doesn't mean being passive or emotionless, but rather responding thoughtfully rather than reactively. By changing our perspective and focusing on our response rather than the event itself, we maintain our freedom and can often find opportunities for growth in apparent setbacks.",
      category: "Core Teaching"
    },
    {
      question: "How can Epictetus' teachings help with anxiety and stress?",
      answer: "Epictetus' teachings are particularly effective for anxiety because they address its root cause: our attempts to control what we cannot control. Anxiety often stems from worrying about future outcomes or past events - both outside our control. His approach involves: 1) Identifying what aspects of a situation you can actually influence, 2) Accepting what you cannot change, 3) Focusing your energy on your response and preparation rather than outcomes, 4) Practicing negative visualization to reduce fear of potential losses, and 5) Regular self-examination to catch anxious thoughts early. This creates a sense of agency and peace by aligning your efforts with reality rather than fighting against it.",
      category: "Practical Application"
    }
  ],

  'zeno-of-citium': [
    {
      question: "How did Zeno of Citium found the Stoic school of philosophy?",
      answer: "Zeno founded Stoicism around 300 BCE after a life-changing shipwreck destroyed his merchant business. Stranded in Athens, he discovered philosophy through the Cynic teacher Crates and began developing his own philosophical system. He taught in the Stoa Poikile (Painted Porch) in the Athenian Agora, which gave Stoicism its name. Drawing from Cynic ethics, Heraclitean physics, and his own insights, Zeno created a comprehensive philosophy emphasizing virtue as the only true good and living in accordance with nature. His school attracted students from across the Mediterranean and became one of the most influential philosophical movements in history.",
      category: "History"
    },
    {
      question: "What are Zeno's core teachings about virtue and living according to nature?",
      answer: "Zeno taught that virtue is the only true good and that living 'according to nature' means using our rational faculty to make wise choices. He distinguished between things that are truly good (virtues like wisdom, justice, courage, and temperance), truly bad (vices), and 'indifferent' (everything else, including health, wealth, and reputation). While indifferents can be 'preferred' or 'dispreferred,' they don't determine our happiness. True flourishing (eudaimonia) comes from developing excellent character and making rational decisions aligned with our nature as reasoning beings. This creates inner freedom regardless of external circumstances.",
      category: "Core Teaching"
    },
    {
      question: "Why are none of Zeno's original writings preserved?",
      answer: "Like many ancient philosophical works, Zeno's writings were lost over time due to various factors: the fragility of ancient materials (papyrus and parchment), wars, fires, and the gradual decline of interest in preserving complete texts. However, his teachings survived through his students and successors like Cleanthes and Chrysippus, who preserved and developed his ideas. Later Stoics like Seneca, Epictetus, and Marcus Aurelius built upon his foundation. We know his teachings through fragments quoted by other authors and through the systematic development of Stoicism by his intellectual heirs. In many ways, his influence is more important than his specific words.",
      category: "History"
    },
    {
      question: "How did Zeno's background as a merchant influence his philosophy?",
      answer: "Zeno's experience as a wealthy Phoenician merchant gave him practical insights into human nature, the unpredictability of fortune, and the difference between true and apparent goods. His business background helped him understand that external success doesn't guarantee happiness - a core Stoic principle. The shipwreck that ended his merchant career became a metaphor for how apparent disasters can lead to greater goods. His commercial experience also influenced Stoicism's practical approach to ethics and its appeal to busy Romans who needed philosophy that worked in the real world of politics and business, not just academic speculation.",
      category: "Biography"
    },
    {
      question: "What is Zeno's legacy in modern philosophy and psychology?",
      answer: "Zeno's influence extends far beyond ancient philosophy. His emphasis on rational thinking and emotional regulation laid groundwork for modern cognitive behavioral therapy. The Stoic concept of focusing on what we can control influences contemporary psychology, business leadership, and self-help approaches. His idea that our judgments, not events, create our emotions is fundamental to modern therapeutic techniques. The Stoic emphasis on virtue ethics has experienced a revival in moral philosophy. His practical approach to philosophy - focusing on how to live well rather than abstract speculation - continues to attract people seeking wisdom for daily life challenges.",
      category: "Modern Relevance"
    }
  ],

  'cleanthes': [
    {
      question: "How did Cleanthes preserve and develop Zeno's Stoic teachings?",
      answer: "Cleanthes served as the second head of the Stoic school for 32 years (262-230 BCE), successfully preserving Zeno's core doctrines while adding his own contributions. Despite coming from humble origins and working as a night water-carrier to fund his studies, his dedication earned him the nickname 'the Ass' - which he embraced as a sign of his strength to bear philosophical burdens. He developed Stoic physics through his theory of 'tension' (tonos) and brought a deeply religious dimension to Stoicism. His most famous work, the 'Hymn to Zeus,' expresses Stoic theology in poetic form, showing how divine providence works through natural law.",
      category: "Philosophy"
    },
    {
      question: "What is the 'Hymn to Zeus' and why is it important?",
      answer: "The 'Hymn to Zeus' is Cleanthes' most famous surviving work, a poetic prayer that beautifully expresses Stoic theology and cosmology. In it, Zeus represents the divine rational principle (Logos) that governs the universe. The hymn asks Zeus to lead humans according to divine will and expresses the Stoic belief that everything happens according to fate and providence. The famous line 'Lead me, Zeus, and you too, Destiny, to wherever your decrees have assigned me' became a cornerstone of Stoic acceptance. The hymn is important because it shows how Stoicism incorporated religious feeling with rational philosophy, making it more than just an intellectual exercise.",
      category: "Core Teaching"
    },
    {
      question: "How did Cleanthes' humble background influence his philosophy?",
      answer: "Cleanthes came to Athens with only four drachmae and worked menial jobs to support his philosophical studies, giving him unique insights into dignity through honest labor and perseverance. His experience of poverty and hard work reinforced Stoic teachings about the irrelevance of external circumstances to true happiness. He demonstrated that philosophical wisdom isn't limited to the wealthy or privileged - anyone can develop virtue regardless of their social position. His dedication to learning despite hardship became legendary, inspiring later Stoics to value effort and persistence over natural talent or favorable circumstances.",
      category: "Biography"
    },
    {
      question: "What did Cleanthes contribute to Stoic physics and cosmology?",
      answer: "Cleanthes developed the Stoic theory of 'tension' (tonos), which explained how the divine pneuma (breath or spirit) holds the universe together through dynamic tension. He taught that this tension creates the coherence and unity we observe in nature, from individual objects to the cosmos as a whole. He also contributed to Stoic theology by emphasizing the sun as a manifestation of divine fire and reason. His cosmological ideas influenced later Stoics and helped establish the materialist foundation of Stoic physics, where even divine principles were understood as refined forms of matter rather than abstract concepts.",
      category: "Philosophy"
    }
  ],

  'chrysippus': [
    {
      question: "Why is Chrysippus called the 'Second Founder of Stoicism'?",
      answer: "Chrysippus earned this title by systematically developing and defending Stoic doctrine against critics, particularly the Academic Skeptics. He wrote over 705 works, creating comprehensive systems of logic, physics, and ethics that gave Stoicism intellectual rigor and coherence. Without his systematic approach, Stoicism might have remained a collection of insights rather than a complete philosophical system. He developed sophisticated theories about fate and free will, created an original system of propositional logic, and provided detailed responses to philosophical objections. His work was so fundamental that later Stoics said 'If there had been no Chrysippus, there would have been no Stoa.'",
      category: "Philosophy"
    },
    {
      question: "How did Chrysippus solve the problem of fate versus free will?",
      answer: "Chrysippus developed the concept of 'co-fated' events to reconcile determinism with moral responsibility. He argued that while all events are fated, our choices and actions are part of that fate - we are 'co-causes' of what happens. Using the analogy of a cylinder rolling down a hill, he explained that while external forces (fate) may set events in motion, our internal nature (character) determines how we respond. This means we're morally responsible for our actions even in a determined universe because our choices flow from our character, which we can develop through reason and practice. This sophisticated solution influenced centuries of philosophical debate about determinism and free will.",
      category: "Core Teaching"
    },
    {
      question: "What was Chrysippus' approach to emotions and their therapy?",
      answer: "In his work 'On Passions,' Chrysippus taught that emotions (pathe) are 'wrong judgments' that become overwhelming when they gather momentum. He distinguished between initial impressions (which are natural) and our assent to those impressions (which we control). Negative emotions arise when we make false judgments about what's good or bad for us. His therapeutic approach involved: 1) Recognizing emotions as judgments rather than inevitable responses, 2) Examining the beliefs underlying emotional reactions, 3) Practicing rational analysis before emotions gain momentum, and 4) Developing correct judgments about what truly matters. This cognitive approach to emotional regulation directly influenced modern psychotherapy.",
      category: "Practical Application"
    },
    {
      question: "How did Chrysippus advance Stoic logic and reasoning?",
      answer: "Chrysippus created an original system of propositional logic that wasn't surpassed until the modern era. He developed rules for valid inference, analyzed conditional statements, and created logical paradoxes that challenged conventional thinking. His logical system was more sophisticated than Aristotelian logic in some ways, particularly in handling complex conditional arguments. He used logic not just as an abstract exercise but as a practical tool for clear thinking and sound judgment. His logical innovations helped establish Stoicism as an intellectually rigorous philosophy capable of defending itself against sophisticated critics and providing reliable methods for reaching truth.",
      category: "Philosophy"
    }
  ],

  'musonius-rufus': [
    {
      question: "Why was Musonius Rufus called the 'Roman Socrates'?",
      answer: "Musonius earned this title through his commitment to practical philosophy and moral teaching, similar to Socrates' focus on ethical living over abstract speculation. Like Socrates, he believed philosophy should transform how people live, not just how they think. He faced persecution for his principles, suffering two exiles for his association with the Stoic Opposition to imperial tyranny. His teaching method emphasized dialogue and practical application, and he attracted devoted students who preserved his teachings. His unwavering commitment to virtue regardless of personal cost, combined with his influence on students like Epictetus, made him a Roman parallel to the great Athenian philosopher.",
      category: "Biography"
    },
    {
      question: "What were Musonius Rufus' revolutionary views on women's education?",
      answer: "Musonius was remarkably progressive, arguing that women should receive the same philosophical education as men because they possess equal rational faculties and capacity for virtue. He taught that both men and women need wisdom, justice, courage, and temperance to live well. He believed women could benefit from studying philosophy, mathematics, and rhetoric just as much as men. This was revolutionary in Roman society, where women's education was typically limited to domestic skills. His arguments were based on Stoic principles about human nature and rationality rather than social convention, making him one of history's earliest advocates for gender equality in education.",
      category: "Progressive Ideas"
    },
    {
      question: "How did Musonius Rufus influence his famous student Epictetus?",
      answer: "Musonius taught Epictetus the practical application of Stoic principles, emphasizing that philosophy must be lived, not just studied. From Musonius, Epictetus learned to focus on what we can control, to view obstacles as training for virtue, and to maintain dignity regardless of external circumstances. Musonius' own experience of exile and hardship provided a living example of Stoic resilience that deeply influenced Epictetus' later teachings. The emphasis on practical exercises, self-examination, and daily application of philosophical principles that characterizes Epictetus' teaching style came directly from Musonius' approach to philosophical education.",
      category: "Teaching Legacy"
    },
    {
      question: "What was Musonius Rufus' approach to simple living and asceticism?",
      answer: "Musonius advocated a simple lifestyle not as an end in itself but as training for virtue and freedom from external dependencies. He practiced vegetarianism, wore simple clothing, and lived modestly to demonstrate that happiness doesn't depend on luxury or comfort. He taught that voluntary hardship strengthens character and prepares us for involuntary difficulties. However, his asceticism was practical rather than extreme - he believed in using what we need while remaining unattached to possessions. This approach influenced later Stoics to see simple living as a form of spiritual exercise that builds resilience and clarity about what truly matters.",
      category: "Practical Application"
    }
  ],

  'cato-the-younger': [
    {
      question: "Why did Cato the Younger choose suicide over living under Caesar's rule?",
      answer: "Cato chose suicide in 46 BCE because he believed living under tyranny would compromise his principles and legitimize Caesar's destruction of the Roman Republic. As a devoted Stoic, he valued freedom and virtue above life itself. He saw Caesar's victory as the end of republican liberty and refused to accept pardons or honors from someone he considered a tyrant. His suicide in Utica was a final act of defiance - a statement that some principles are worth dying for. This dramatic end made him a martyr for republican ideals and Stoic philosophy, inspiring later generations including the American Founding Fathers.",
      category: "Biography"
    },
    {
      question: "How did Cato's political career reflect his Stoic principles?",
      answer: "Cato's political career was marked by unwavering adherence to traditional Roman values and Stoic ethics, even when it was politically costly. He consistently opposed corruption, refused bribes, and challenged powerful figures like Pompey and Caesar when they threatened republican institutions. His inflexibility sometimes hindered effective governance, but it also made him a symbol of integrity in an increasingly corrupt system. He applied Stoic teachings about virtue being the only true good to politics, prioritizing moral principles over practical outcomes. His career demonstrates both the strengths and limitations of applying philosophical ideals to political reality.",
      category: "Political Philosophy"
    },
    {
      question: "What was Cato's relationship with other Stoic philosophers?",
      answer: "Cato was more a practitioner than a theorist of Stoicism, embodying Stoic virtues in his daily life and political career rather than writing philosophical treatises. He studied Stoic texts intensively and was known for carrying philosophical works even into the Senate. His approach to Stoicism was practical and Roman rather than Greek and theoretical - he focused on applying Stoic principles to civic duty, military service, and political leadership. Later Stoics like Seneca and Marcus Aurelius admired his commitment to virtue, though they sometimes questioned whether his inflexibility served the greater good.",
      category: "Philosophy"
    },
    {
      question: "How did Cato influence the American Founding Fathers?",
      answer: "Cato became a powerful symbol for American revolutionaries who saw parallels between his resistance to Caesar and their opposition to British tyranny. His willingness to die rather than live under despotism inspired colonial leaders like Patrick Henry ('Give me liberty, or give me death!'). The 'Cato's Letters' by John Trenchard and Thomas Gordon, which drew on his legacy, were widely read in colonial America. George Washington admired Cato's virtue and had Joseph Addison's play 'Cato' performed for his troops at Valley Forge. Cato's example of principled resistance to tyranny helped shape American ideals about liberty, virtue, and the duty to resist unjust government.",
      category: "Historical Influence"
    }
  ],

  'diogenes-of-babylon': [
    {
      question: "What was Diogenes of Babylon's role in the famous embassy to Rome in 155 BCE?",
      answer: "Diogenes was one of three philosophers sent to Rome to appeal a fine imposed on Athens, alongside the Academic Carneades and the Peripatetic Critolaus. This embassy was historically significant because it introduced Roman audiences to Greek philosophy in a systematic way. Diogenes impressed Romans with his sober, temperate speaking style, contrasting with Carneades' more flamboyant rhetoric. The embassy was successful in reducing Athens' fine, but more importantly, it sparked Roman interest in philosophy and helped establish the intellectual foundations for later Roman Stoicism. This event marked a crucial moment in the transmission of Greek philosophical culture to Rome.",
      category: "History"
    },
    {
      question: "How did Diogenes develop Stoic teachings about music and psychology?",
      answer: "Diogenes made unique contributions to Stoic thought by developing theories about music's therapeutic power. He taught that just as physical exercise strengthens the body, music could heal psychological illnesses and strengthen the mind and soul. He believed music could lead to virtue by harmonizing the soul and promoting rational thinking. His theory that 'music can bring health to the mind and treat psychological illnesses' was innovative for its time and anticipated modern music therapy. He saw music as an art that could cultivate virtue, particularly courage (as when trumpet music inspires soldiers), making it a valuable tool for character development.",
      category: "Unique Contributions"
    },
    {
      question: "What was Diogenes' relationship with his teacher Chrysippus?",
      answer: "Diogenes was a devoted student of Chrysippus and closely followed his systematic approach to Stoic doctrine, particularly in dialectic and logic. He helped preserve and transmit Chrysippus' teachings during a crucial period when the Stoic school faced challenges from Academic skeptics. While he didn't innovate as dramatically as Chrysippus, Diogenes provided stability and continuity, ensuring that the sophisticated logical and physical theories developed by Chrysippus weren't lost. His role was similar to a faithful steward who maintains and carefully passes on a valuable inheritance to the next generation of philosophers.",
      category: "Philosophy"
    },
    {
      question: "Why are Diogenes of Babylon's works not preserved today?",
      answer: "Like many ancient philosophical works, Diogenes' writings were lost due to the fragility of ancient materials, wars, fires, and changing intellectual interests over centuries. Despite being a prolific writer on music, rhetoric, dialectic, and ethics, only fragments quoted by later authors survive. His works may have been considered less innovative than those of Chrysippus or less practically oriented than later Roman Stoics, leading to reduced copying and preservation efforts. However, his influence lived on through his students and through the institutional continuity he provided to the Stoic school during a critical transitional period.",
      category: "History"
    }
  ],

  'panaetius-of-rhodes': [
    {
      question: "How did Panaetius adapt Stoicism for Roman culture?",
      answer: "Panaetius revolutionized Stoicism by making it more practical and accessible to Roman aristocrats. He softened some harsh early Stoic doctrines, rejected the ideal of complete emotional detachment (apatheia), and emphasized that philosophy should guide practical life rather than remain abstract. Through his membership in the Scipionic Circle, he showed how Stoic principles could inform Roman political and social life. He made Stoicism more eclectic, incorporating insights from other philosophical schools when they served practical purposes. His approach laid the foundation for the later Roman Stoicism of Seneca, Epictetus, and Marcus Aurelius.",
      category: "Cultural Bridge"
    },
    {
      question: "What was Panaetius' influence on Cicero's 'On Duties'?",
      answer: "Panaetius' masterwork 'On Duties' became the principal source for Cicero's famous work of the same name (De Officiis). Cicero explicitly acknowledges following Panaetius' framework while adapting it for Roman audiences. Panaetius provided the theoretical foundation for understanding moral obligations in different roles - as individuals, family members, citizens, and human beings. His work influenced Cicero's analysis of the relationship between virtue and practical advantage, the nature of justice, and the duties we owe to others. Through Cicero's work, Panaetius' ideas about duty and virtue continued to influence Western moral and political thought for centuries.",
      category: "Intellectual Legacy"
    },
    {
      question: "What was the Scipionic Circle and why was it important?",
      answer: "The Scipionic Circle was an influential group of intellectuals, politicians, and writers who gathered around the Roman general Scipio Aemilianus in the 2nd century BCE. Panaetius was a key member, serving as Scipio's philosophical advisor and friend. This circle was crucial for introducing Greek philosophical ideas to Roman elite culture in a way that respected Roman values and traditions. It demonstrated how philosophy could enhance rather than threaten Roman virtues like duty, honor, and service to the state. The circle's influence helped establish the intellectual foundations for the Roman Empire's later embrace of Stoic philosophy.",
      category: "History"
    },
    {
      question: "How did Panaetius modify traditional Stoic teachings?",
      answer: "Panaetius made several significant modifications to early Stoicism: he rejected the doctrine of apatheia (complete emotional detachment), arguing that moderate emotions could be appropriate; he abandoned belief in cosmic conflagration (the periodic destruction and renewal of the universe); he emphasized practical wisdom over theoretical knowledge; and he made Stoicism more compatible with active political and social engagement. He also incorporated elements from other philosophical schools when they served practical purposes, making Stoicism more flexible and applicable to real-world situations. These changes made Stoicism more appealing to Romans while maintaining its core ethical insights.",
      category: "Philosophy"
    }
  ],

  'hecato-of-rhodes': [
    {
      question: "Why is Hecato called the 'Forgotten Stoic' despite being frequently quoted?",
      answer: "Despite being quoted more often than his teacher Panaetius by later philosophers like Seneca, Cicero, and Diogenes Laertius, Hecato has become one of Stoicism's most overlooked figures. This paradox exists because his works were lost while those of more famous Stoics survived, and because he was overshadowed by his more celebrated contemporaries and successors. His practical approach to ethics and moral casuistry was highly valued by later thinkers, but without complete works to study, modern audiences know him only through fragments. His fate illustrates how historical preservation can be arbitrary, sometimes obscuring important contributors to philosophical traditions.",
      category: "Historical Irony"
    },
    {
      question: "What did Hecato mean by 'Cease to hope, and you will cease to fear'?",
      answer: "This famous quote reflects Hecato's understanding that both hope and fear stem from projecting our consciousness away from the present moment, where actual change can occur. Hope and fear are both forms of attachment to future outcomes beyond our control - hope for positive outcomes, fear of negative ones. Both emotions can paralyze us or lead to poor decisions based on imagined futures rather than present realities. By releasing attachment to specific outcomes and focusing on what we can control right now - our actions, choices, and responses - we find peace and effectiveness. This doesn't mean being passive, but rather acting wisely without being driven by emotional projections about the future.",
      category: "Core Teaching"
    },
    {
      question: "How did Hecato contribute to Stoic ethics and moral philosophy?",
      answer: "Hecato wrote extensively on practical ethics and moral casuistry - the application of ethical principles to specific situations. He was particularly interested in how virtue could be taught and practiced in daily life. He separated virtues into two categories: those based on scientific intellectual principles (like justice and wisdom) and those without this foundation (like temperance). His approach to ethics was highly practical, focusing on real-world moral dilemmas rather than abstract theorizing. His work on self-friendship and personal development influenced later Stoic approaches to character formation and self-improvement.",
      category: "Ethics"
    },
    {
      question: "What was Hecato's concept of 'self-friendship' and why is it important?",
      answer: "Hecato's famous quote 'What progress have I made? I have begun to be a friend to myself' reflects his understanding that self-acceptance and self-compassion are foundations for virtue and happiness. Self-friendship means treating yourself with the same kindness, honesty, and support you would offer a good friend. It involves honest self-assessment without harsh self-criticism, forgiveness for mistakes while commitment to improvement, and maintaining your own well-being so you can help others effectively. This concept was revolutionary because it balanced Stoic demands for virtue with psychological realism about human nature and the importance of self-care in sustainable moral development.",
      category: "Practical Application"
    }
  ],

  'aristotle': [
    {
      question: "How did Aristotle's philosophy differ from his teacher Plato's?",
      answer: "While Plato emphasized abstract ideals and the world of Forms, Aristotle focused on empirical observation and practical wisdom. Plato believed true reality existed in a separate realm of perfect Forms, while Aristotle argued that universals exist within particular things in the physical world. Aristotle developed systematic methods for studying the natural world, founded formal logic, and emphasized the importance of experience and observation. Where Plato was more mystical and mathematical, Aristotle was more scientific and practical. This difference influenced all subsequent philosophy, with some following Plato's idealistic approach and others Aristotle's empirical methods.",
      category: "Philosophy"
    },
    {
      question: "What is Aristotle's concept of the 'Golden Mean' and how does it apply to ethics?",
      answer: "The Golden Mean is Aristotle's principle that virtue lies between extremes of excess and deficiency. For example, courage is the mean between cowardice (deficiency) and recklessness (excess). Generosity lies between stinginess and wasteful spending. This doesn't mean finding a mathematical middle, but rather finding the appropriate response for each situation based on reason and experience. The mean varies by person, circumstance, and context - what's courageous for a soldier differs from what's courageous for a civilian. This approach to ethics emphasizes practical wisdom (phronesis) and the development of good judgment through practice and experience.",
      category: "Ethics"
    },
    {
      question: "How did Aristotle influence his student Alexander the Great?",
      answer: "Aristotle tutored Alexander from age 13 to 16, providing him with a broad education in philosophy, politics, literature, and natural science. Aristotle's teachings about leadership, justice, and the nature of different forms of government influenced Alexander's approach to ruling his vast empire. The concept of the 'philosopher-king' from Plato (Aristotle's teacher) may have inspired Alexander's vision of enlightened rule. Aristotle's interest in natural science encouraged Alexander's support for scientific expeditions and the collection of specimens during his conquests. However, their relationship became strained later when Alexander adopted Persian customs, which Aristotle viewed as abandoning Greek values.",
      category: "Historical Influence"
    },
    {
      question: "What is Aristotle's contribution to logic and scientific method?",
      answer: "Aristotle essentially invented formal logic, creating the system of syllogistic reasoning that dominated Western thought for over 2,000 years. His logical works, known as the Organon, established rules for valid inference and provided tools for distinguishing sound from unsound arguments. He developed the scientific method of careful observation, hypothesis formation, and systematic investigation. His approach to classification and categorization influenced biology, psychology, and other sciences. He emphasized the importance of starting with empirical observations rather than abstract principles, laying the groundwork for modern scientific methodology.",
      category: "Logic and Science"
    },
    {
      question: "How does Aristotelian virtue ethics relate to modern moral philosophy?",
      answer: "Aristotelian virtue ethics has experienced a major revival in modern moral philosophy as an alternative to utilitarian and deontological approaches. Instead of focusing on rules (deontology) or consequences (utilitarianism), virtue ethics asks 'What kind of person should I be?' It emphasizes character development, practical wisdom, and the cultivation of virtues through practice. Modern virtue ethicists like Alasdair MacIntyre and Philippa Foot have drawn on Aristotle's insights about human flourishing (eudaimonia), the importance of community in moral development, and the role of emotions in ethical decision-making. This approach is particularly relevant for professional ethics, environmental ethics, and personal development.",
      category: "Modern Relevance"
    }
  ],

  'socrates': [
    {
      question: "What is the Socratic Method and how can it be used today?",
      answer: "The Socratic Method involves asking probing questions to expose contradictions in beliefs and encourage deeper thinking. Rather than providing answers, Socrates asked questions like 'What do you mean by that?' and 'How do you know that's true?' to help people discover the weaknesses in their own reasoning. This method is widely used today in education, therapy, and critical thinking. It helps people examine their assumptions, clarify their thoughts, and develop more reasoned positions. The key is asking genuine questions aimed at understanding and improvement, not trying to trap or embarrass others. It's particularly effective for exploring complex moral and philosophical issues where simple answers are inadequate.",
      category: "Method"
    },
    {
      question: "What did Socrates mean by 'I know that I know nothing'?",
      answer: "This famous statement reflects Socrates' intellectual humility and his understanding that true wisdom begins with recognizing the limits of our knowledge. Unlike others who claimed expertise in areas like justice, courage, or piety, Socrates realized that these concepts were far more complex than people assumed. His 'ignorance' was actually a form of wisdom - he knew enough to recognize what he didn't know. This awareness made him more open to learning and less likely to make confident claims about uncertain matters. It's a call for intellectual humility and continuous learning rather than dogmatic certainty about complex issues.",
      category: "Core Teaching"
    },
    {
      question: "Why did Socrates choose death over exile or escape?",
      answer: "Socrates chose to drink hemlock rather than flee Athens because he believed in living consistently with his principles, even unto death. He argued that escaping would validate the charges against him and undermine the legal system he had lived under for 70 years. In Plato's 'Crito,' he explains that breaking the law would harm his soul more than death could harm his body. He also believed that death might be either peaceful sleep or a chance to continue philosophical conversations in the afterlife - both preferable to living as a hypocrite. His death became a powerful example of integrity and commitment to principle over personal survival.",
      category: "Biography"
    },
    {
      question: "How did Socrates influence later philosophical schools, including Stoicism?",
      answer: "Socrates profoundly influenced virtually every subsequent philosophical school. The Stoics adopted his emphasis on virtue as the highest good, his belief that no one does wrong willingly (people act badly only from ignorance), and his focus on self-knowledge and moral integrity. His method of questioning assumptions influenced Stoic practices of self-examination. His calm acceptance of death provided a model for Stoic attitudes toward mortality. His belief that virtue is knowledge influenced Stoic ideas about wisdom and rational living. Even his lifestyle - simple living, focus on character over possessions, and commitment to truth over popularity - became central to Stoic practice.",
      category: "Philosophical Influence"
    },
    {
      question: "What is Socrates' relevance to modern psychology and self-development?",
      answer: "Socrates' insights about self-knowledge, the examined life, and the connection between thoughts and behavior anticipate many modern psychological approaches. His emphasis on questioning assumptions parallels cognitive behavioral therapy's focus on examining thought patterns. His belief that 'the unexamined life is not worth living' supports modern emphasis on self-reflection and mindfulness. His method of helping people discover their own answers rather than imposing solutions aligns with modern coaching and therapeutic techniques. His understanding that virtue requires knowledge and practice influences contemporary approaches to character development and moral education. His intellectual humility provides a model for lifelong learning and personal growth.",
      category: "Modern Relevance"
    }
  ]
}

// Helper function to get FAQ data for a specific philosopher
export function getPhilosopherFAQ(slug: string): FAQItem[] {
  return philosopherFAQData[slug] || []
}

// Helper function to generate FAQ structured data for SEO
export function generateFAQStructuredData(slug: string, philosopherName: string) {
  const faqItems = getPhilosopherFAQ(slug)

  if (faqItems.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}
