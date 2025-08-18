import { getAllLinkingStats, getLinkingStats } from './internalLinking'

// Analytics interfaces
export interface LinkAnalytics {
  totalPages: number
  totalLinks: number
  averageLinksPerPage: number
  mostLinkedKeywords: KeywordStats[]
  linkingTrends: LinkingTrend[]
  pagePerformance: PagePerformance[]
  topTargetPages: TargetPageStats[]
  linkingEfficiency: number
}

export interface KeywordStats {
  keyword: string
  count: number
  pages: string[]
  averagePosition: number
  urls: string[]
}

export interface LinkingTrend {
  date: string
  linksCreated: number
  pagesProcessed: number
  averageLinksPerPage: number
}

export interface PagePerformance {
  pageId: string
  totalLinks: number
  uniqueKeywords: number
  averageDistance: number
  linkDensity: number
  score: number
}

export interface TargetPageStats {
  url: string
  inboundLinks: number
  sourcePages: string[]
  keywords: string[]
  category: 'biography' | 'blog' | 'other'
}

// Generate comprehensive analytics
export function generateLinkAnalytics(): LinkAnalytics {
  const allStats = getAllLinkingStats()
  const pageIds = Object.keys(allStats)
  
  if (pageIds.length === 0) {
    return {
      totalPages: 0,
      totalLinks: 0,
      averageLinksPerPage: 0,
      mostLinkedKeywords: [],
      linkingTrends: [],
      pagePerformance: [],
      topTargetPages: [],
      linkingEfficiency: 0
    }
  }

  // Calculate basic stats
  const totalPages = pageIds.length
  const totalLinks = pageIds.reduce((sum, pageId) => sum + allStats[pageId].totalLinks, 0)
  const averageLinksPerPage = totalLinks / totalPages

  // Analyze keyword usage
  const keywordMap = new Map<string, KeywordStats>()
  const urlMap = new Map<string, TargetPageStats>()

  pageIds.forEach(pageId => {
    const stats = allStats[pageId]
    
    stats.linkHistory.forEach(link => {
      // Track keyword stats
      if (!keywordMap.has(link.keyword)) {
        keywordMap.set(link.keyword, {
          keyword: link.keyword,
          count: 0,
          pages: [],
          averagePosition: 0,
          urls: []
        })
      }
      
      const keywordStat = keywordMap.get(link.keyword)!
      keywordStat.count++
      if (!keywordStat.pages.includes(pageId)) {
        keywordStat.pages.push(pageId)
      }
      if (!keywordStat.urls.includes(link.url)) {
        keywordStat.urls.push(link.url)
      }
      keywordStat.averagePosition = (keywordStat.averagePosition + link.position) / keywordStat.count

      // Track target page stats
      if (!urlMap.has(link.url)) {
        urlMap.set(link.url, {
          url: link.url,
          inboundLinks: 0,
          sourcePages: [],
          keywords: [],
          category: categorizeUrl(link.url)
        })
      }
      
      const urlStat = urlMap.get(link.url)!
      urlStat.inboundLinks++
      if (!urlStat.sourcePages.includes(pageId)) {
        urlStat.sourcePages.push(pageId)
      }
      if (!urlStat.keywords.includes(link.keyword)) {
        urlStat.keywords.push(link.keyword)
      }
    })
  })

  // Sort and get top keywords
  const mostLinkedKeywords = Array.from(keywordMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Sort and get top target pages
  const topTargetPages = Array.from(urlMap.values())
    .sort((a, b) => b.inboundLinks - a.inboundLinks)
    .slice(0, 15)

  // Calculate page performance
  const pagePerformance: PagePerformance[] = pageIds.map(pageId => {
    const stats = allStats[pageId]
    const linkDensity = stats.totalLinks / Math.max(1, estimateContentLength(pageId))
    
    // Calculate performance score (0-100)
    const linkScore = Math.min(100, (stats.totalLinks / 10) * 100) // Max score at 10 links
    const diversityScore = Math.min(100, (stats.keywordsLinked.length / 8) * 100) // Max score at 8 unique keywords
    const distanceScore = stats.averageDistance > 50 ? 100 : (stats.averageDistance / 50) * 100
    
    const score = (linkScore + diversityScore + distanceScore) / 3

    return {
      pageId,
      totalLinks: stats.totalLinks,
      uniqueKeywords: stats.keywordsLinked.length,
      averageDistance: stats.averageDistance,
      linkDensity,
      score: Math.round(score)
    }
  }).sort((a, b) => b.score - a.score)

  // Generate linking trends (simplified - would need persistent storage for real trends)
  const linkingTrends: LinkingTrend[] = generateMockTrends()

  // Calculate linking efficiency
  const linkingEfficiency = calculateLinkingEfficiency(allStats)

  return {
    totalPages,
    totalLinks,
    averageLinksPerPage: Math.round(averageLinksPerPage * 100) / 100,
    mostLinkedKeywords,
    linkingTrends,
    pagePerformance,
    topTargetPages,
    linkingEfficiency
  }
}

// Categorize URLs
function categorizeUrl(url: string): 'biography' | 'blog' | 'other' {
  if (url.includes('/biography/')) return 'biography'
  if (url.includes('/blog/')) return 'blog'
  return 'other'
}

// Estimate content length (simplified)
function estimateContentLength(pageId: string): number {
  // This would ideally come from actual content analysis
  // For now, return a reasonable estimate based on page type
  if (pageId.includes('blog')) return 2000
  if (pageId.includes('biography')) return 1500
  return 1000
}

// Generate mock trends (in a real app, this would come from persistent storage)
function generateMockTrends(): LinkingTrend[] {
  const trends: LinkingTrend[] = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    trends.push({
      date: date.toISOString().split('T')[0],
      linksCreated: Math.floor(Math.random() * 50) + 10,
      pagesProcessed: Math.floor(Math.random() * 10) + 5,
      averageLinksPerPage: Math.round((Math.random() * 5 + 3) * 100) / 100
    })
  }
  
  return trends
}

// Calculate linking efficiency
function calculateLinkingEfficiency(allStats: Record<string, any>): number {
  const pageIds = Object.keys(allStats)
  if (pageIds.length === 0) return 0

  let totalEfficiency = 0
  let validPages = 0

  pageIds.forEach(pageId => {
    const stats = allStats[pageId]
    if (stats.totalLinks > 0) {
      // Efficiency based on link distribution and keyword diversity
      const linkDistribution = stats.averageDistance > 30 ? 1 : stats.averageDistance / 30
      const keywordDiversity = Math.min(1, stats.keywordsLinked.length / stats.totalLinks)
      const linkDensity = Math.min(1, stats.totalLinks / 15) // Optimal around 15 links
      
      const pageEfficiency = (linkDistribution + keywordDiversity + linkDensity) / 3
      totalEfficiency += pageEfficiency
      validPages++
    }
  })

  return validPages > 0 ? Math.round((totalEfficiency / validPages) * 100) : 0
}

// Get analytics for a specific page
export function getPageAnalytics(pageId: string): {
  stats: ReturnType<typeof getLinkingStats>
  performance: PagePerformance
  recommendations: string[]
} {
  const stats = getLinkingStats(pageId)
  
  // Calculate performance
  const linkDensity = stats.totalLinks / Math.max(1, estimateContentLength(pageId))
  const linkScore = Math.min(100, (stats.totalLinks / 10) * 100)
  const diversityScore = Math.min(100, (stats.keywordsLinked.length / 8) * 100)
  const distanceScore = stats.averageDistance > 50 ? 100 : (stats.averageDistance / 50) * 100
  const score = (linkScore + diversityScore + distanceScore) / 3

  const performance: PagePerformance = {
    pageId,
    totalLinks: stats.totalLinks,
    uniqueKeywords: stats.keywordsLinked.length,
    averageDistance: stats.averageDistance,
    linkDensity,
    score: Math.round(score)
  }

  // Generate recommendations
  const recommendations: string[] = []
  
  if (stats.totalLinks < 3) {
    recommendations.push('Consider adding more internal links to improve SEO and user navigation')
  }
  
  if (stats.totalLinks > 15) {
    recommendations.push('Too many links may overwhelm readers - consider reducing link density')
  }
  
  if (stats.averageDistance < 30) {
    recommendations.push('Links are too close together - spread them out for better readability')
  }
  
  if (stats.keywordsLinked.length < stats.totalLinks * 0.7) {
    recommendations.push('Diversify your linking keywords to cover more topics')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Great job! Your linking strategy looks well-balanced')
  }

  return {
    stats,
    performance,
    recommendations
  }
}

// Export analytics data for external use
export function exportAnalyticsData(): {
  analytics: LinkAnalytics
  rawData: Record<string, any>
  exportDate: string
} {
  return {
    analytics: generateLinkAnalytics(),
    rawData: getAllLinkingStats(),
    exportDate: new Date().toISOString()
  }
}
