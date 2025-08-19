// Configuration for external book links to Goodreads
export interface BookLink {
  title: string
  author: string
  goodreadsUrl: string
  description?: string
}

// Essential Stoic readings with Goodreads links
export const ESSENTIAL_STOIC_BOOKS: BookLink[] = [
  {
    title: 'Letters from a Stoic',
    author: 'Seneca',
    goodreadsUrl: 'https://www.goodreads.com/book/show/97411.Letters_from_a_Stoic',
    description: 'A collection of moral epistles by the Roman Stoic philosopher Seneca'
  },
  {
    title: 'Enchiridion',
    author: 'Epictetus',
    goodreadsUrl: 'https://www.goodreads.com/book/show/24615.The_Enchiridion',
    description: 'A short manual of key Stoic ideas and practices'
  },
  {
    title: 'A Guide to the Good Life',
    author: 'William B. Irvine',
    goodreadsUrl: 'https://www.goodreads.com/book/show/5617966-a-guide-to-the-good-life',
    description: 'Modern introduction to Stoic philosophy and practical techniques'
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    goodreadsUrl: 'https://www.goodreads.com/book/show/30659.Meditations',
    description: 'Personal reflections of the Roman Emperor and Stoic philosopher'
  },
  {
    title: 'Discourses',
    author: 'Epictetus',
    goodreadsUrl: 'https://www.goodreads.com/book/show/17407.Discourses',
    description: 'Recorded teachings of the former slave turned Stoic teacher'
  }
]

// Function to find a book link by title (case-insensitive, partial match)
export function findBookByTitle(title: string): BookLink | undefined {
  const normalizedTitle = title.toLowerCase().trim()
  
  return ESSENTIAL_STOIC_BOOKS.find(book => {
    const bookTitle = book.title.toLowerCase()
    return bookTitle.includes(normalizedTitle) || normalizedTitle.includes(bookTitle)
  })
}

// Function to get all book titles for pattern matching
export function getAllBookTitles(): string[] {
  return ESSENTIAL_STOIC_BOOKS.map(book => book.title)
}

// Function to create a Goodreads link with proper attributes
export function createGoodreadsLink(book: BookLink): string {
  return `<a href="${book.goodreadsUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors" title="View on Goodreads">${book.title}</a>`
}