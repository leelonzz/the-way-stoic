import { LinkKeyword, LinkContext } from '@/types/linking'
import { getAllPhilosophers } from './philosopherData'
import { getKeywordsForContext, getTopicKeywords } from './linkConfig'

// Content analysis interfaces
export interface ContentAnalysisResult {
  detectedTopics: string[]
  suggestedKeywords: LinkKeyword[]
  philosopherMentions: string[]
  stoicConcepts: string[]
  readabilityScore: number
  linkingOpportunities: LinkingOpportunity[]
}

export interface LinkingOpportunity {
  keyword: string
  url: string
  context: string
  confidence: number
  position: number
  reason: string
}

// Topic detection patterns
const TOPIC_PATTERNS = {
  emotions: [
    /\b(anger|anxiety|fear|worry|stress|emotion|feeling|mood|depression|sadness)\b/gi,
    /\b(emotional|mental|psychological|mindful|calm|peace|tranquil)\b/gi
  ],
  leadership: [
    /\b(leader|leadership|manage|management|authority|power|responsibility|decision)\b/gi,
    /\b(emperor|ruler|govern|command|direct|guide|influence)\b/gi
  ],
  adversity: [
    /\b(challenge|difficult|hardship|struggle|obstacle|problem|crisis|failure)\b/gi,
    /\b(overcome|endure|persevere|resilient|tough|strong|survive)\b/gi
  ],
  mindfulness: [
    /\b(present|moment|awareness|conscious|mindful|meditation|reflection|contemplation)\b/gi,
    /\b(focus|attention|observe|notice|aware|alert|centered)\b/gi
  ],
  virtue: [
    /\b(virtue|virtuous|moral|ethical|good|right|justice|wisdom|courage|temperance)\b/gi,
    /\b(character|integrity|honor|noble|excellence|goodness)\b/gi
  ],
  death: [
    /\b(death|die|dying|mortality|mortal|finite|end|final|last)\b/gi,
    /\b(memento mori|remember death|life is short|temporary|impermanent)\b/gi
  ]
}

// Stoic concept patterns
const STOIC_CONCEPT_PATTERNS = {
  'dichotomy of control': /\b(control|cannot control|up to us|not up to us|within our control|outside our control)\b/gi,
  'virtue ethics': /\b(virtue|virtuous|moral|ethical|good|character|excellence)\b/gi,
  'preferred indifferents': /\b(indifferent|external|wealth|health|reputation|fame|money)\b/gi,
  'negative visualization': /\b(imagine|visualize|worst case|what if|prepare|anticipate)\b/gi,
  'amor fati': /\b(love fate|accept|acceptance|embrace|welcome|grateful)\b/gi,
  'memento mori': /\b(death|mortality|remember death|life is short|temporary)\b/gi,
  'premeditatio malorum': /\b(prepare|anticipate|worst|bad|negative|difficult)\b/gi
}

// Philosopher mention patterns
const PHILOSOPHER_PATTERNS = (() => {
  const philosophers = getAllPhilosophers()
  const patterns: Record<string, RegExp[]> = {}
  
  philosophers.forEach(philosopher => {
    patterns[philosopher.slug] = [
      new RegExp(`\\b${philosopher.name}\\b`, 'gi'),
      new RegExp(`\\b${philosopher.fullName}\\b`, 'gi')
    ]
    
    // Add specific variations
    if (philosopher.name === 'Marcus Aurelius') {
      patterns[philosopher.slug].push(
        /\b(emperor|philosopher emperor|meditations|antoninus)\b/gi
      )
    }
    if (philosopher.name === 'Seneca') {
      patterns[philosopher.slug].push(
        /\b(letters|epistles|younger|lucius annaeus)\b/gi
      )
    }
    if (philosopher.name === 'Epictetus') {
      patterns[philosopher.slug].push(
        /\b(enchiridion|discourses|slave|freedman)\b/gi
      )
    }
  })
  
  return patterns
})()

// Analyze content and detect topics
export function analyzeContent(content: string): ContentAnalysisResult {
  const detectedTopics: string[] = []
  const philosopherMentions: string[] = []
  const stoicConcepts: string[] = []
  const linkingOpportunities: LinkingOpportunity[] = []
  
  // Detect topics
  for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
    let topicScore = 0
    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches) {
        topicScore += matches.length
      }
    }
    
    if (topicScore >= 2) { // Threshold for topic detection
      detectedTopics.push(topic)
    }
  }
  
  // Detect Stoic concepts
  for (const [concept, pattern] of Object.entries(STOIC_CONCEPT_PATTERNS)) {
    const matches = content.match(pattern)
    if (matches && matches.length >= 1) {
      stoicConcepts.push(concept)
    }
  }
  
  // Detect philosopher mentions
  for (const [slug, patterns] of Object.entries(PHILOSOPHER_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        philosopherMentions.push(slug)
        break // Only add once per philosopher
      }
    }
  }
  
  // Generate suggested keywords based on analysis
  const suggestedKeywords = generateSuggestedKeywords(detectedTopics, philosopherMentions, stoicConcepts)
  
  // Find linking opportunities
  const opportunities = findLinkingOpportunities(content, suggestedKeywords)
  linkingOpportunities.push(...opportunities)
  
  // Calculate readability score (simple implementation)
  const readabilityScore = calculateReadabilityScore(content)
  
  return {
    detectedTopics,
    suggestedKeywords,
    philosopherMentions,
    stoicConcepts,
    readabilityScore,
    linkingOpportunities
  }
}

// Generate suggested keywords based on analysis
function generateSuggestedKeywords(
  topics: string[], 
  philosophers: string[], 
  concepts: string[]
): LinkKeyword[] {
  const keywords: LinkKeyword[] = []
  
  // Add topic-specific keywords
  const topicKeywords = getTopicKeywords(topics)
  keywords.push(...topicKeywords)
  
  // Add philosopher keywords for mentioned philosophers
  const allPhilosophers = getAllPhilosophers()
  philosophers.forEach(slug => {
    const philosopher = allPhilosophers.find(p => p.slug === slug)
    if (philosopher) {
      keywords.push({
        keyword: philosopher.name,
        url: `/biography/${philosopher.slug}`,
        priority: 90,
        wholeWordOnly: true
      })
      
      if (philosopher.fullName !== philosopher.name) {
        keywords.push({
          keyword: philosopher.fullName,
          url: `/biography/${philosopher.slug}`,
          priority: 95,
          wholeWordOnly: true
        })
      }
    }
  })
  
  // Add concept-specific keywords
  concepts.forEach(concept => {
    keywords.push({
      keyword: concept,
      url: '/blog/stoicism-complete-guide',
      priority: 80,
      wholeWordOnly: true
    })
  })
  
  return keywords
}

// Find specific linking opportunities in content
function findLinkingOpportunities(content: string, keywords: LinkKeyword[]): LinkingOpportunity[] {
  const opportunities: LinkingOpportunity[] = []
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    let match
    
    while ((match = regex.exec(content)) !== null) {
      const position = match.index
      const contextStart = Math.max(0, position - 50)
      const contextEnd = Math.min(content.length, position + keyword.keyword.length + 50)
      const context = content.slice(contextStart, contextEnd)
      
      opportunities.push({
        keyword: keyword.keyword,
        url: keyword.url,
        context: context.trim(),
        confidence: keyword.priority / 100,
        position,
        reason: `Found "${keyword.keyword}" in content`
      })
    }
  })
  
  return opportunities.sort((a, b) => b.confidence - a.confidence)
}

// Simple readability score calculation
function calculateReadabilityScore(content: string): number {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = content.split(/\s+/).filter(w => w.trim().length > 0)
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)
  
  if (sentences.length === 0 || words.length === 0) return 0
  
  // Simplified Flesch Reading Ease formula
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  return Math.max(0, Math.min(100, score))
}

// Count syllables in a word (simple approximation)
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  const vowels = word.match(/[aeiouy]+/g)
  let count = vowels ? vowels.length : 1
  
  if (word.endsWith('e')) count--
  if (word.endsWith('le') && word.length > 2) count++
  
  return Math.max(1, count)
}

// Get content analysis for a blog post
export function analyzeBlogPost(content: string, context: LinkContext): {
  analysis: ContentAnalysisResult
  enhancedContext: LinkContext
} {
  const analysis = analyzeContent(content)
  
  // Enhance the linking context with detected topics
  const enhancedContext: LinkContext = {
    ...context,
    topics: analysis.detectedTopics,
    maxLinksPerPage: Math.min(15, Math.max(5, Math.floor(content.length / 500))) // Dynamic link limit
  }
  
  return {
    analysis,
    enhancedContext
  }
}
