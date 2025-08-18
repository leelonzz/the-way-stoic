// Simple test to verify internal linking logic
import { processTextWithLinks } from './stoic-zenith/src/lib/internalLinking.ts'

// Mock philosopher data
const mockPhilosophers = [
  {
    name: 'Marcus Aurelius',
    fullName: 'Marcus Aurelius Antoninus Augustus',
    slug: 'marcus-aurelius'
  },
  {
    name: 'Seneca',
    fullName: 'Lucius Annaeus Seneca',
    slug: 'seneca'
  },
  {
    name: 'Epictetus',
    fullName: 'Epictetus',
    slug: 'epictetus'
  }
]

// Test text from the blog post
const testText = `
Marcus Aurelius ruled the Roman Empire during its height while facing constant wars, political betrayals, and a devastating plague. His book "Meditations" wasn't meant for publication—it was his private journal where he reminded himself of Stoic principles during the darkest moments of his reign.

Seneca the Younger was a wealthy advisor to emperors, who wrote letters and essays about ethics and daily life. Despite his immense wealth and political power, Seneca faced exile, false accusations, and eventually forced suicide.

Epictetus experienced firsthand what it meant to have no external freedom. Yet he became one of philosophy's greatest teachers, establishing a school that attracted students from across the empire.
`

// Test bidirectional linking
console.log('Testing Blog to Biography linking:')
const blogContext = { type: 'blog-to-biography' }
const blogResult = processTextWithLinks(testText, blogContext, 'test-blog')
console.log('Result:', blogResult.content)
console.log('Keywords linked:', blogResult.keywordsLinked)
console.log('Links added:', blogResult.linksAdded)

console.log('\n\nTesting Biography to Blog linking:')
const biographyText = `Marcus Aurelius was deeply influenced by Stoicism and its teachings. He applied Stoic principles throughout his reign as emperor. The Stoic philosophy helped him navigate the challenges of leadership.`

const biographyContext = { type: 'biography-to-blog' }
const biographyResult = processTextWithLinks(biographyText, biographyContext, 'test-biography')
console.log('Result:', biographyResult.content)
console.log('Keywords linked:', biographyResult.keywordsLinked)
console.log('Links added:', biographyResult.linksAdded)
