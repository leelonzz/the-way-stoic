export interface HistoricalEvent {
  id: string
  title: string
  slug: string
  period: 'hellenistic' | 'roman-republic' | 'roman-empire'
  periodName: string
  dateRange: string
  startYear: number
  endYear?: number
  location: string
  description: string
  significance: string
  stoicConnection: string
  keyFigures: string[]
  relatedEvents: string[]
  sources: string[]
  tags: string[]
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  content: {
    overview: string
    historicalContext: string
    stoicInfluence: string
    keyMoments: Array<{
      date: string
      event: string
      significance: string
    }>
    legacy: string
  }
}

export interface EventPeriod {
  id: string
  name: string
  slug: string
  dateRange: string
  description: string
  significance: string
  events: HistoricalEvent[]
}

export interface EventsPageData {
  periods: EventPeriod[]
  featuredEvents: HistoricalEvent[]
}
