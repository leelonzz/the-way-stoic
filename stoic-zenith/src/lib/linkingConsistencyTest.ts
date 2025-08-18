import { processTextWithLinks, resetPageLinking } from './internalLinking'
import { LinkContext } from '@/types/linking'

// Test for linking consistency
export function testLinkingConsistency(): {
  passed: boolean
  details: string
  results: Array<{
    attempt: number
    linksCreated: number
    keywordsLinked: string[]
    content: string
  }>
} {
  const testContent = `
    Marcus Aurelius was a Roman emperor and Stoic philosopher. He wrote his famous 
    Meditations while campaigning. Seneca taught about virtue and wisdom, while 
    Epictetus emphasized the dichotomy of control. These Stoic principles help us 
    manage our emotions and live according to nature.
  `

  const context: LinkContext = {
    type: 'blog-to-biography'
  }

  const pageId = 'test-consistency-page'
  const results: Array<{
    attempt: number
    linksCreated: number
    keywordsLinked: string[]
    content: string
  }> = []

  // Test multiple times to check for consistency
  for (let i = 1; i <= 5; i++) {
    // Reset state before each test
    resetPageLinking(pageId)
    
    const result = processTextWithLinks(testContent, context, pageId)
    
    results.push({
      attempt: i,
      linksCreated: result.linksAdded,
      keywordsLinked: [...result.keywordsLinked],
      content: result.content.toString()
    })
  }

  // Check if all results are consistent
  const firstResult = results[0]
  const allConsistent = results.every(result => 
    result.linksCreated === firstResult.linksCreated &&
    result.keywordsLinked.length === firstResult.keywordsLinked.length &&
    result.keywordsLinked.every(keyword => firstResult.keywordsLinked.includes(keyword))
  )

  return {
    passed: allConsistent && firstResult.linksCreated > 0,
    details: allConsistent 
      ? `All ${results.length} attempts produced consistent results: ${firstResult.linksCreated} links, keywords: ${firstResult.keywordsLinked.join(', ')}`
      : `Inconsistent results detected across ${results.length} attempts`,
    results
  }
}

// Test for React component consistency simulation
export function testComponentRerenderConsistency(): {
  passed: boolean
  details: string
  renderResults: Array<{
    render: number
    linksFound: number
    hasMarkusAurelius: boolean
    hasSeneca: boolean
    hasEpictetus: boolean
  }>
} {
  const testContent = `
    Marcus Aurelius practiced Stoicism daily. Seneca wrote letters about virtue.
    Epictetus taught the dichotomy of control. These philosophers shaped Stoic thought.
  `

  const context: LinkContext = {
    type: 'blog-to-biography'
  }

  const pageId = 'test-component-consistency'
  const renderResults: Array<{
    render: number
    linksFound: number
    hasMarkusAurelius: boolean
    hasSeneca: boolean
    hasEpictetus: boolean
  }> = []

  // Simulate multiple component renders
  for (let render = 1; render <= 3; render++) {
    // Simulate component mount/unmount by resetting state
    resetPageLinking(pageId)
    
    // Process the content as the component would
    const result = processTextWithLinks(testContent, context, pageId)
    const contentStr = result.content.toString()
    
    // Count links and check for specific philosophers
    const linkMatches = contentStr.match(/<internal-link/g)
    const linksFound = linkMatches ? linkMatches.length : 0
    
    renderResults.push({
      render,
      linksFound,
      hasMarkusAurelius: contentStr.includes('Marcus Aurelius') && contentStr.includes('/biography/marcus-aurelius'),
      hasSeneca: contentStr.includes('Seneca') && contentStr.includes('/biography/seneca'),
      hasEpictetus: contentStr.includes('Epictetus') && contentStr.includes('/biography/epictetus')
    })
  }

  // Check consistency across renders
  const firstRender = renderResults[0]
  const allRenderConsistent = renderResults.every(result =>
    result.linksFound === firstRender.linksFound &&
    result.hasMarkusAurelius === firstRender.hasMarkusAurelius &&
    result.hasSeneca === firstRender.hasSeneca &&
    result.hasEpictetus === firstRender.hasEpictetus
  )

  return {
    passed: allRenderConsistent && firstRender.linksFound > 0,
    details: allRenderConsistent
      ? `All ${renderResults.length} renders produced consistent results: ${firstRender.linksFound} links`
      : `Inconsistent results across renders`,
    renderResults
  }
}

// Test for page ID consistency
export function testPageIdConsistency(): {
  passed: boolean
  details: string
  pageResults: Record<string, {
    linksCreated: number
    keywordsLinked: string[]
  }>
} {
  const testContent = `Marcus Aurelius and Seneca were both Stoic philosophers.`
  
  const context: LinkContext = {
    type: 'blog-to-biography'
  }

  const pageIds = [
    'blog-test-post-1',
    'blog-test-post-2',
    'blog-different-post'
  ]

  const pageResults: Record<string, {
    linksCreated: number
    keywordsLinked: string[]
  }> = {}

  // Test each page ID
  pageIds.forEach(pageId => {
    resetPageLinking(pageId)
    const result = processTextWithLinks(testContent, context, pageId)
    
    pageResults[pageId] = {
      linksCreated: result.linksAdded,
      keywordsLinked: [...result.keywordsLinked]
    }
  })

  // All pages should produce the same results for the same content
  const firstPageResult = pageResults[pageIds[0]]
  const allPagesConsistent = pageIds.every(pageId => {
    const result = pageResults[pageId]
    return result.linksCreated === firstPageResult.linksCreated &&
           result.keywordsLinked.length === firstPageResult.keywordsLinked.length
  })

  return {
    passed: allPagesConsistent && firstPageResult.linksCreated > 0,
    details: allPagesConsistent
      ? `All pages produced consistent results: ${firstPageResult.linksCreated} links`
      : `Inconsistent results across different page IDs`,
    pageResults
  }
}

// Run all consistency tests
export function runAllConsistencyTests(): {
  overallPassed: boolean
  summary: string
  tests: {
    linkingConsistency: ReturnType<typeof testLinkingConsistency>
    componentConsistency: ReturnType<typeof testComponentRerenderConsistency>
    pageIdConsistency: ReturnType<typeof testPageIdConsistency>
  }
} {
  const tests = {
    linkingConsistency: testLinkingConsistency(),
    componentConsistency: testComponentRerenderConsistency(),
    pageIdConsistency: testPageIdConsistency()
  }

  const allPassed = Object.values(tests).every(test => test.passed)
  const passedCount = Object.values(tests).filter(test => test.passed).length
  const totalCount = Object.keys(tests).length

  return {
    overallPassed: allPassed,
    summary: `${passedCount}/${totalCount} consistency tests passed`,
    tests
  }
}

// Quick test function for debugging
export function quickConsistencyCheck(): boolean {
  const testContent = 'Marcus Aurelius was a Stoic philosopher.'
  const context: LinkContext = { type: 'blog-to-biography' }
  const pageId = 'quick-test'

  // Test 3 times
  const results: number[] = []
  for (let i = 0; i < 3; i++) {
    resetPageLinking(pageId)
    const result = processTextWithLinks(testContent, context, pageId)
    results.push(result.linksAdded)
  }

  // All results should be the same
  return results.every(count => count === results[0]) && results[0] > 0
}
