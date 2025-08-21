export interface PhilosophicalSchool {
  id: string
  name: string
  founder: string
  foundedYear: number
  philosophy: string
  keyTeachings: string[]
  notableMembers: string[]
  location: string
  description: string
}

export interface HistoricalSite {
  id: string
  name: string
  type: 'school' | 'agora' | 'temple' | 'library' | 'garden' | 'stoa'
  period: string
  coordinates?: {
    lat: number
    lng: number
  }
  description: string
  significance: string
  currentStatus: string
  visitingInfo?: {
    accessible: boolean
    museumNearby?: string
    tourAvailable?: boolean
  }
}

export interface PlaceImage {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
}

export interface PhilosophicalPlace {
  id: string
  name: string
  slug: string
  city: string
  country: string
  region: string
  period: 'classical' | 'hellenistic' | 'roman'
  periodName: string
  dateRange: string
  startYear: number
  endYear?: number
  coordinates: {
    lat: number
    lng: number
  }
  description: string
  significance: string
  philosophicalImportance: string
  schools: PhilosophicalSchool[]
  sites: HistoricalSite[]
  keyFigures: string[]
  relatedPlaces: string[]
  modernRelevance: string
  images: {
    hero: PlaceImage
    og: PlaceImage
  }
  visitingInfo: {
    accessible: boolean
    bestTimeToVisit: string
    nearbyMuseums: string[]
    guidedTours: boolean
    archaeologicalSites: string[]
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    featuredSnippet?: string
  }
  content: {
    introduction: string
    historicalContext: string
    philosophicalSignificance: string
    majorSchools: string
    keyLocations: string
    modernDay: string
    legacy: string
  }
}

export interface PlaceCategory {
  id: string
  name: string
  slug: string
  description: string
  places: PhilosophicalPlace[]
}

export interface PlacesPageData {
  categories: PlaceCategory[]
  featuredPlaces: PhilosophicalPlace[]
}
