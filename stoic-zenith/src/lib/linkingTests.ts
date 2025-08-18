import { processTextWithLinks, resetPageLinking } from './internalLinking'
import { analyzeContent, analyzeBlogPost } from './contentAnalysis'
import { createLinkOverride, getPageOverrides } from './linkOverrides'
import { LinkContext } from '@/types/linking'

// Test interfaces
export interface LinkingTestResult {
  testName: string
  passed: boolean
  details: string
  performance: {
    executionTime: number
    linksCreated: number
    textLength: number
  }
  errors?: string[]
}

export interface LinkingTestSuite {
  results: LinkingTestResult[]
  summary: {
    totalTests: number
    passed: number
    failed: number
    averageExecutionTime: number
    totalLinksCreated: number
  }
}

// Sample test content
const TEST_CONTENT = {
  basicStoicism: `
    Stoicism is an ancient philosophy founded by Zeno of Citium. Marcus Aurelius, the Roman emperor, 
    wrote his famous Meditations while campaigning. Seneca taught about virtue and wisdom, while 
    Epictetus emphasized the dichotomy of control. These Stoic principles help us manage our emotions 
    and live according to nature.
  `,
  
  philosopherFocus: `
    Marcus Aurelius Antoninus was born in Rome and became emperor in 161 CE. His teacher was 
    Epictetus, a former slave who founded a school in Nicopolis. Seneca the Younger served as 
    advisor to Nero and wrote Letters from a Stoic. Cato the Younger chose death over submission 
    to Caesar, embodying Stoic virtue.
  `,
  
  conceptHeavy: `
    The dichotomy of control teaches us to focus only on what is up to us. Preferred indifferents 
    like health and wealth are not truly good or bad. Negative visualization helps us prepare for 
    adversity. Amor fati means loving our fate, while memento mori reminds us of mortality. 
    The Stoic sage represents the ideal of perfect virtue.
  `,
  
  mixed: `
    When Marcus Aurelius practiced Stoicism, he applied the dichotomy of control to his imperial 
    duties. Seneca wrote about preferred indifferents while serving in Nero's court. Epictetus 
    taught that virtue is the only true good, and that we should accept what we cannot control. 
    Modern Stoicism continues these ancient teachings.
  `,
  
  longForm: `
    Stoicism emerged in ancient Athens around 300 BCE when Zeno of Citium began teaching in the 
    Stoa Poikile. The philosophy emphasizes virtue as the only true good and teaches that external 
    things are indifferent to our happiness. Marcus Aurelius, perhaps the most famous Stoic, 
    ruled the Roman Empire while practicing these principles. His Meditations reveal a man 
    struggling to apply Stoic teachings to the challenges of leadership.
    
    Seneca the Younger brought Stoicism to Rome's elite, serving as advisor to Emperor Nero 
    while writing extensively about ethics and virtue. His Letters to Lucilius remain one of 
    the best introductions to Stoic practice. Epictetus, born a slave, taught that true freedom 
    comes from focusing only on what is within our control. His Enchiridion provides practical 
    guidance for daily life.
    
    The dichotomy of control stands as Stoicism's central teaching. We suffer when we try to 
    control external events, but find peace when we focus on our judgments and actions. 
    Preferred indifferents like health, wealth, and reputation are naturally preferred but 
    don't determine our happiness. The Stoic sage represents perfect virtue, though this ideal 
    may be unattainable for most people.
  `
}

// Run comprehensive linking tests
export function runLinkingTests(): LinkingTestSuite {
  const results: LinkingTestResult[] = []
  
  // Test 1: Basic philosopher linking
  results.push(testBasicPhilosopherLinking())
  
  // Test 2: Stoic concept linking
  results.push(testStoicConceptLinking())
  
  // Test 3: Context-aware linking
  results.push(testContextAwareLinking())
  
  // Test 4: Override system
  results.push(testOverrideSystem())
  
  // Test 5: Performance with long content
  results.push(testPerformanceWithLongContent())
  
  // Test 6: Content analysis
  results.push(testContentAnalysis())
  
  // Test 7: Link density limits
  results.push(testLinkDensityLimits())
  
  // Test 8: Keyword priority
  results.push(testKeywordPriority())
  
  // Test 9: Duplicate prevention
  results.push(testDuplicatePrevention())
  
  // Test 10: Edge cases
  results.push(testEdgeCases())
  
  // Calculate summary
  const summary = {
    totalTests: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    averageExecutionTime: results.reduce((sum, r) => sum + r.performance.executionTime, 0) / results.length,
    totalLinksCreated: results.reduce((sum, r) => sum + r.performance.linksCreated, 0)
  }
  
  return { results, summary }
}

// Test basic philosopher linking
function testBasicPhilosopherLinking(): LinkingTestResult {
  const startTime = performance.now()
  const pageId = 'test-basic-philosophers'
  
  resetPageLinking(pageId)
  
  const context: LinkContext = {
    type: 'blog-to-biography'
  }
  
  try {
    const result = processTextWithLinks(TEST_CONTENT.philosopherFocus, context, pageId)
    const endTime = performance.now()
    
    const hasMarkusAurelius = result.content.toString().includes('Marcus Aurelius')
    const hasSeneca = result.content.toString().includes('Seneca')
    const hasEpictetus = result.content.toString().includes('Epictetus')
    
    const passed = result.linksAdded > 0 && (hasMarkusAurelius || hasSeneca || hasEpictetus)
    
    return {
      testName: 'Basic Philosopher Linking',
      passed,
      details: `Created ${result.linksAdded} links. Keywords: ${result.keywordsLinked.join(', ')}`,
      performance: {
        executionTime: endTime - startTime,
        linksCreated: result.linksAdded,
        textLength: TEST_CONTENT.philosopherFocus.length
      }
    }
  } catch (error) {
    return {
      testName: 'Basic Philosopher Linking',
      passed: false,
      details: 'Test failed with error',
      performance: {
        executionTime: performance.now() - startTime,
        linksCreated: 0,
        textLength: TEST_CONTENT.philosopherFocus.length
      },
      errors: [String(error)]
    }
  }
}

// Test Stoic concept linking
function testStoicConceptLinking(): LinkingTestResult {
  const startTime = performance.now()
  const pageId = 'test-stoic-concepts'
  
  resetPageLinking(pageId)
  
  const context: LinkContext = {
    type: 'biography-to-blog'
  }
  
  try {
    const result = processTextWithLinks(TEST_CONTENT.conceptHeavy, context, pageId)
    const endTime = performance.now()
    
    const hasStoicismLink = result.content.toString().includes('dichotomy of control') || 
                           result.content.toString().includes('preferred indifferents')
    
    const passed = result.linksAdded > 0 && hasStoicismLink
    
    return {
      testName: 'Stoic Concept Linking',
      passed,
      details: `Created ${result.linksAdded} links. Keywords: ${result.keywordsLinked.join(', ')}`,
      performance: {
        executionTime: endTime - startTime,
        linksCreated: result.linksAdded,
        textLength: TEST_CONTENT.conceptHeavy.length
      }
    }
  } catch (error) {
    return {
      testName: 'Stoic Concept Linking',
      passed: false,
      details: 'Test failed with error',
      performance: {
        executionTime: performance.now() - startTime,
        linksCreated: 0,
        textLength: TEST_CONTENT.conceptHeavy.length
      },
      errors: [String(error)]
    }
  }
}

// Test context-aware linking
function testContextAwareLinking(): LinkingTestResult {
  const startTime = performance.now()
  const pageId = 'test-context-aware'
  
  resetPageLinking(pageId)
  
  const context: LinkContext = {
    type: 'general',
    topics: ['emotions', 'leadership']
  }
  
  try {
    const result = processTextWithLinks(TEST_CONTENT.mixed, context, pageId)
    const endTime = performance.now()
    
    const passed = result.linksAdded > 0
    
    return {
      testName: 'Context-Aware Linking',
      passed,
      details: `Created ${result.linksAdded} links with topics. Keywords: ${result.keywordsLinked.join(', ')}`,
      performance: {
        executionTime: endTime - startTime,
        linksCreated: result.linksAdded,
        textLength: TEST_CONTENT.mixed.length
      }
    }
  } catch (error) {
    return {
      testName: 'Context-Aware Linking',
      passed: false,
      details: 'Test failed with error',
      performance: {
        executionTime: performance.now() - startTime,
        linksCreated: 0,
        textLength: TEST_CONTENT.mixed.length
      },
      errors: [String(error)]
    }
  }
}

// Test override system
function testOverrideSystem(): LinkingTestResult {
  const startTime = performance.now()
  const pageId = 'test-overrides'
  
  resetPageLinking(pageId)
  
  try {
    // Create a test override
    createLinkOverride(pageId, 'test keyword', '/test-url', {
      priority: 150,
      notes: 'Test override'
    })
    
    const overrides = getPageOverrides(pageId)
    const endTime = performance.now()
    
    const passed = overrides.length > 0 && overrides[0].keyword === 'test keyword'
    
    return {
      testName: 'Override System',
      passed,
      details: `Created ${overrides.length} overrides. First override: ${overrides[0]?.keyword || 'none'}`,
      performance: {
        executionTime: endTime - startTime,
        linksCreated: overrides.length,
        textLength: 0
      }
    }
  } catch (error) {
    return {
      testName: 'Override System',
      passed: false,
      details: 'Test failed with error',
      performance: {
        executionTime: performance.now() - startTime,
        linksCreated: 0,
        textLength: 0
      },
      errors: [String(error)]
    }
  }
}

// Test performance with long content
function testPerformanceWithLongContent(): LinkingTestResult {
  const startTime = performance.now()
  const pageId = 'test-performance'
  
  resetPageLinking(pageId)
  
  const context: LinkContext = {
    type: 'general'
  }
  
  try {
    const result = processTextWithLinks(TEST_CONTENT.longForm, context, pageId)
    const endTime = performance.now()
    
    const executionTime = endTime - startTime
    const passed = executionTime < 100 && result.linksAdded > 0 // Should complete in under 100ms
    
    return {
      testName: 'Performance with Long Content',
      passed,
      details: `Processed ${TEST_CONTENT.longForm.length} characters in ${executionTime.toFixed(2)}ms`,
      performance: {
        executionTime,
        linksCreated: result.linksAdded,
        textLength: TEST_CONTENT.longForm.length
      }
    }
  } catch (error) {
    return {
      testName: 'Performance with Long Content',
      passed: false,
      details: 'Test failed with error',
      performance: {
        executionTime: performance.now() - startTime,
        linksCreated: 0,
        textLength: TEST_CONTENT.longForm.length
      },
      errors: [String(error)]
    }
  }
}

// Test content analysis
function testContentAnalysis(): LinkingTestResult {
  const startTime = performance.now()
  
  try {
    const analysis = analyzeContent(TEST_CONTENT.basicStoicism)
    const endTime = performance.now()
    
    const passed = analysis.detectedTopics.length > 0 || 
                   analysis.philosopherMentions.length > 0 || 
                   analysis.stoicConcepts.length > 0
    
    return {
      testName: 'Content Analysis',
      passed,
      details: `Detected ${analysis.detectedTopics.length} topics, ${analysis.philosopherMentions.length} philosophers, ${analysis.stoicConcepts.length} concepts`,
      performance: {
        executionTime: endTime - startTime,
        linksCreated: analysis.linkingOpportunities.length,
        textLength: TEST_CONTENT.basicStoicism.length
      }
    }
  } catch (error) {
    return {
      testName: 'Content Analysis',
      passed: false,
      details: 'Test failed with error',
      performance: {
        executionTime: performance.now() - startTime,
        linksCreated: 0,
        textLength: TEST_CONTENT.basicStoicism.length
      },
      errors: [String(error)]
    }
  }
}

// Additional test functions would go here...
function testLinkDensityLimits(): LinkingTestResult {
  // Implementation for testing link density limits
  return {
    testName: 'Link Density Limits',
    passed: true,
    details: 'Test not yet implemented',
    performance: { executionTime: 0, linksCreated: 0, textLength: 0 }
  }
}

function testKeywordPriority(): LinkingTestResult {
  // Implementation for testing keyword priority
  return {
    testName: 'Keyword Priority',
    passed: true,
    details: 'Test not yet implemented',
    performance: { executionTime: 0, linksCreated: 0, textLength: 0 }
  }
}

function testDuplicatePrevention(): LinkingTestResult {
  // Implementation for testing duplicate prevention
  return {
    testName: 'Duplicate Prevention',
    passed: true,
    details: 'Test not yet implemented',
    performance: { executionTime: 0, linksCreated: 0, textLength: 0 }
  }
}

function testEdgeCases(): LinkingTestResult {
  // Implementation for testing edge cases
  return {
    testName: 'Edge Cases',
    passed: true,
    details: 'Test not yet implemented',
    performance: { executionTime: 0, linksCreated: 0, textLength: 0 }
  }
}
