// Client-safe philosopher data for internal linking
export interface PhilosopherBasic {
  name: string
  fullName: string
  slug: string
}

// Static philosopher data for client-side use
const PHILOSOPHERS_DATA: PhilosopherBasic[] = [
  {
    name: "Marcus Aurelius",
    fullName: "Marcus Aurelius Antoninus",
    slug: "marcus-aurelius"
  },
  {
    name: "Seneca",
    fullName: "Lucius Annaeus Seneca",
    slug: "seneca"
  },
  {
    name: "Epictetus",
    fullName: "Epictetus",
    slug: "epictetus"
  },
  {
    name: "Zeno of Citium",
    fullName: "Zeno of Citium",
    slug: "zeno-of-citium"
  },
  {
    name: "Musonius Rufus",
    fullName: "Gaius Musonius Rufus",
    slug: "musonius-rufus"
  },
  {
    name: "Cato the Younger",
    fullName: "Marcus Porcius Cato",
    slug: "cato-the-younger"
  },
  {
    name: "Cleanthes",
    fullName: "Cleanthes of Assos",
    slug: "cleanthes"
  },
  {
    name: "Chrysippus",
    fullName: "Chrysippus of Soli",
    slug: "chrysippus"
  },
  {
    name: "Antoninus Pius",
    fullName: "Antoninus Pius",
    slug: "antoninus-pius"
  },
  {
    name: "Lucius Verus",
    fullName: "Lucius Verus",
    slug: "lucius-verus"
  },
  {
    name: "Commodus",
    fullName: "Commodus",
    slug: "commodus"
  },
  {
    name: "Faustina the Younger",
    fullName: "Faustina the Younger",
    slug: "faustina-the-younger"
  },
  {
    name: "Posidonius",
    fullName: "Posidonius of Apameia",
    slug: "posidonius"
  },
  {
    name: "Panaetius",
    fullName: "Panaetius of Rhodes",
    slug: "panaetius"
  },
  {
    name: "Aristo of Chios",
    fullName: "Aristo of Chios",
    slug: "aristo-of-chios"
  },
  {
    name: "Herillus",
    fullName: "Herillus of Carthage",
    slug: "herillus"
  },
  {
    name: "Dionysius of Heraclea",
    fullName: "Dionysius of Heraclea",
    slug: "dionysius-of-heraclea"
  },
  {
    name: "Persaeus",
    fullName: "Persaeus of Citium",
    slug: "persaeus"
  },
  {
    name: "Sphaerus",
    fullName: "Sphaerus of Borysthenes",
    slug: "sphaerus"
  },
  {
    name: "Apollodorus of Seleucia",
    fullName: "Apollodorus of Seleucia",
    slug: "apollodorus-of-seleucia"
  }
]

export function getAllPhilosophers(): PhilosopherBasic[] {
  return PHILOSOPHERS_DATA
}

export function getPhilosopherBySlug(slug: string): PhilosopherBasic | undefined {
  return PHILOSOPHERS_DATA.find(p => p.slug === slug)
}

export function getPhilosopherByName(name: string): PhilosopherBasic | undefined {
  return PHILOSOPHERS_DATA.find(p => 
    p.name.toLowerCase() === name.toLowerCase() || 
    p.fullName.toLowerCase() === name.toLowerCase()
  )
}
