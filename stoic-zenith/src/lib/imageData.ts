import { PlaceImage } from '@/types/place'

// High-quality Unsplash image URLs for philosophical places (simplified URLs)
export const placeImages = {
  'ancient-athens': {
    hero: {
      src: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1920&h=1080&fit=crop',
      alt: 'Ancient Athens Parthenon temple on the Acropolis, birthplace of Western philosophy',
      width: 1920,
      height: 1080,
      caption:
        'The Parthenon on the Acropolis - symbol of ancient Athens philosophical heritage',
    } as PlaceImage,
    og: {
      src: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=630&fit=crop',
      alt: 'Ancient Athens Parthenon - The Philosophical Capital of the Classical World',
      width: 1200,
      height: 630,
    } as PlaceImage,
  },

  rhodes: {
    hero: {
      src: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?w=1920&h=1080&fit=crop',
      alt: 'Rhodes medieval harbor and ancient city, center of Hellenistic philosophy and rhetoric',
      width: 1920,
      height: 1080,
      caption: 'Rhodes harbor - where Roman elites studied Stoic philosophy',
    } as PlaceImage,
    og: {
      src: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?w=1200&h=630&fit=crop',
      alt: 'Rhodes - Island of Philosophers and Ancient Learning',
      width: 1200,
      height: 630,
    } as PlaceImage,
  },

  'ancient-rome': {
    hero: {
      src: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop',
      alt: 'Roman Forum ancient ruins where Stoic philosophers like Seneca and Marcus Aurelius governed',
      width: 1920,
      height: 1080,
      caption: 'The Roman Forum - imperial center of Stoic philosophy',
    } as PlaceImage,
    og: {
      src: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=630&fit=crop',
      alt: 'Ancient Rome - Imperial Center of Stoicism',
      width: 1200,
      height: 630,
    } as PlaceImage,
  },

  citium: {
    hero: {
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop',
      alt: 'Larnaca Cyprus ancient Citium archaeological site, birthplace of Zeno founder of Stoicism',
      width: 1920,
      height: 1080,
      caption:
        'Ancient Citium archaeological site - birthplace of Stoic philosophy',
    } as PlaceImage,
    og: {
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=630&fit=crop',
      alt: 'Citium, Cyprus - Birthplace of Zeno and Stoic Philosophy',
      width: 1200,
      height: 630,
    } as PlaceImage,
  },

  'seleucia-tigris': {
    hero: {
      src: 'https://images.unsplash.com/photo-1578662996442-6aa4ea3d2e6b?w=1920&h=1080&fit=crop',
      alt: 'Mesopotamian archaeological ruins Seleucia on Tigris ancient Hellenistic philosophy center',
      width: 1920,
      height: 1080,
      caption: 'Mesopotamian ruins - site of ancient Seleucia on Tigris',
    } as PlaceImage,
    og: {
      src: 'https://images.unsplash.com/photo-1578662996442-6aa4ea3d2e6b?w=1200&h=630&fit=crop',
      alt: 'Seleucia on Tigris - Cosmopolitan Birthplace of Diogenes of Babylon',
      width: 1200,
      height: 630,
    } as PlaceImage,
  },

  hierapolis: {
    hero: {
      src: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1920&h=1080&fit=crop',
      alt: 'Hierapolis Pamukkale Turkey ancient Roman theater and travertine terraces birthplace of Epictetus',
      width: 1920,
      height: 1080,
      caption:
        'Hierapolis ancient theater with Pamukkale travertines - birthplace of Epictetus',
    } as PlaceImage,
    og: {
      src: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&h=630&fit=crop',
      alt: 'Hierapolis - Birthplace of Epictetus the Stoic Philosopher',
      width: 1200,
      height: 630,
    } as PlaceImage,
  },

  cordoba: {
    hero: {
      src: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&h=1080&fit=crop',
      alt: 'Córdoba Spain Roman bridge over Guadalquivir river ancient Corduba capital of Baetica',
      width: 1920,
      height: 1080,
      caption: 'Roman bridge of Córdoba - gateway to ancient Corduba',
    } as PlaceImage,
    og: {
      src: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=630&fit=crop',
      alt: "Córdoba - Capital of Roman Baetica and Seneca's Birthplace",
      width: 1200,
      height: 630,
    } as PlaceImage,
  },
}
