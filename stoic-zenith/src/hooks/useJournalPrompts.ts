import { useState, useEffect, useCallback } from 'react'

interface JournalPrompt {
  id: string
  prompt_text: string
  category: string
  genre: string
  difficulty_level: number
}

interface UseJournalPromptsResult {
  prompts: JournalPrompt[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isStale: boolean
}

// Hardcoded prompts for reliable functionality
const ALL_PROMPTS: JournalPrompt[] = [
  // Reflection prompts
  {
    id: '1',
    prompt_text: 'What moment today made you feel most alive?',
    category: 'reflection',
    genre: 'personal_growth',
    difficulty_level: 1,
  },
  {
    id: '2',
    prompt_text:
      'If you could have a conversation with your past self from one year ago, what would you tell them?',
    category: 'reflection',
    genre: 'personal_growth',
    difficulty_level: 2,
  },
  {
    id: '3',
    prompt_text: 'What belief about yourself are you ready to let go of?',
    category: 'reflection',
    genre: 'personal_growth',
    difficulty_level: 2,
  },
  {
    id: '4',
    prompt_text:
      'Describe a time when you surprised yourself with your own strength.',
    category: 'reflection',
    genre: 'personal_growth',
    difficulty_level: 1,
  },
  {
    id: '5',
    prompt_text: 'What would you do if you knew you could not fail?',
    category: 'reflection',
    genre: 'personal_growth',
    difficulty_level: 1,
  },

  // Gratitude prompts
  {
    id: '6',
    prompt_text:
      "Write about someone who believed in you when you didn't believe in yourself.",
    category: 'gratitude',
    genre: 'relationships',
    difficulty_level: 1,
  },
  {
    id: '7',
    prompt_text:
      'What ordinary moment from this week deserves more appreciation?',
    category: 'gratitude',
    genre: 'wellness',
    difficulty_level: 1,
  },
  {
    id: '8',
    prompt_text: 'Describe a challenge that ultimately led to growth.',
    category: 'gratitude',
    genre: 'personal_growth',
    difficulty_level: 2,
  },
  {
    id: '9',
    prompt_text:
      'What skill or ability do you have that you often take for granted?',
    category: 'gratitude',
    genre: 'personal_growth',
    difficulty_level: 1,
  },
  {
    id: '10',
    prompt_text:
      'Write about a place that brings you peace and why it matters to you.',
    category: 'gratitude',
    genre: 'wellness',
    difficulty_level: 1,
  },

  // Creative prompts
  {
    id: '11',
    prompt_text:
      'If your current mood was a weather pattern, describe the forecast.',
    category: 'creative',
    genre: 'creativity',
    difficulty_level: 1,
  },
  {
    id: '12',
    prompt_text: 'Write a letter to your future self 10 years from now.',
    category: 'creative',
    genre: 'personal_growth',
    difficulty_level: 2,
  },
  {
    id: '13',
    prompt_text: 'Describe your ideal day without mentioning any technology.',
    category: 'creative',
    genre: 'wellness',
    difficulty_level: 1,
  },
  {
    id: '14',
    prompt_text:
      'If you could add one room to your home, what would it be and why?',
    category: 'creative',
    genre: 'creativity',
    difficulty_level: 1,
  },
  {
    id: '15',
    prompt_text: 'Write about a decision you made that changed everything.',
    category: 'creative',
    genre: 'personal_growth',
    difficulty_level: 2,
  },

  // Goals prompts
  {
    id: '16',
    prompt_text:
      'What small action could you take today that your future self will thank you for?',
    category: 'goals',
    genre: 'personal_growth',
    difficulty_level: 1,
  },
  {
    id: '17',
    prompt_text:
      "Describe what your life looks like when you're living your values fully.",
    category: 'goals',
    genre: 'personal_growth',
    difficulty_level: 2,
  },
  {
    id: '18',
    prompt_text: 'What skill would you love to develop and why?',
    category: 'goals',
    genre: 'career',
    difficulty_level: 1,
  },
  {
    id: '19',
    prompt_text:
      'How do you want to be remembered by the people you care about?',
    category: 'goals',
    genre: 'relationships',
    difficulty_level: 2,
  },
  {
    id: '20',
    prompt_text:
      'What would you attempt if you had all the support you needed?',
    category: 'goals',
    genre: 'personal_growth',
    difficulty_level: 1,
  },

  // Stoic prompts
  {
    id: '21',
    prompt_text: 'What is within your control today, and what must you accept?',
    category: 'stoic',
    genre: 'philosophy',
    difficulty_level: 1,
  },
  {
    id: '22',
    prompt_text:
      "How can you practice virtue in a challenging situation you're facing?",
    category: 'stoic',
    genre: 'philosophy',
    difficulty_level: 2,
  },
  {
    id: '23',
    prompt_text: 'What would Marcus Aurelius say about your current worries?',
    category: 'stoic',
    genre: 'philosophy',
    difficulty_level: 2,
  },
  {
    id: '24',
    prompt_text: 'Describe how you can turn an obstacle into an opportunity.',
    category: 'stoic',
    genre: 'philosophy',
    difficulty_level: 1,
  },
  {
    id: '25',
    prompt_text: 'What does living according to nature mean to you?',
    category: 'stoic',
    genre: 'philosophy',
    difficulty_level: 2,
  },

  // Mindfulness prompts
  {
    id: '26',
    prompt_text: 'Describe your current physical sensations without judgment.',
    category: 'mindfulness',
    genre: 'wellness',
    difficulty_level: 1,
  },
  {
    id: '27',
    prompt_text:
      'What emotions are you experiencing right now and where do you feel them in your body?',
    category: 'mindfulness',
    genre: 'wellness',
    difficulty_level: 1,
  },
  {
    id: '28',
    prompt_text:
      'Write about something you usually do on autopilot, but with full attention.',
    category: 'mindfulness',
    genre: 'wellness',
    difficulty_level: 1,
  },
  {
    id: '29',
    prompt_text: 'How can you bring more awareness to your daily routines?',
    category: 'mindfulness',
    genre: 'wellness',
    difficulty_level: 1,
  },
  {
    id: '30',
    prompt_text:
      'Describe the sounds, smells, and textures around you right now.',
    category: 'mindfulness',
    genre: 'wellness',
    difficulty_level: 1,
  },
]

// Get today's date string in YYYY-MM-DD format
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// Generate seed based on date for consistent daily prompts
function getDateSeed(date: Date): number {
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Seeded random number generator for consistent daily selection
function seededRandom(seed: number): () => number {
  let currentSeed = seed
  return function (): number {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }
}

// Select 3 diverse prompts ensuring variety across categories
function getDailyPrompts(date: Date = new Date()): JournalPrompt[] {
  const seed = getDateSeed(date)
  const random = seededRandom(seed)

  // Group prompts by category
  const categories = [
    'reflection',
    'gratitude',
    'creative',
    'goals',
    'stoic',
    'mindfulness',
  ]
  const promptsByCategory: Record<string, JournalPrompt[]> = {}

  ALL_PROMPTS.forEach(prompt => {
    if (!promptsByCategory[prompt.category]) {
      promptsByCategory[prompt.category] = []
    }
    promptsByCategory[prompt.category].push(prompt)
  })

  const selectedPrompts: JournalPrompt[] = []
  const usedCategories = new Set<string>()

  // Try to get one prompt from different categories
  for (let i = 0; i < 3; i++) {
    const availableCategories = categories.filter(
      cat => !usedCategories.has(cat) && promptsByCategory[cat]?.length > 0
    )

    if (availableCategories.length === 0) {
      // If no unused categories, use any category
      const allAvailableCategories = categories.filter(
        cat => promptsByCategory[cat]?.length > 0
      )
      if (allAvailableCategories.length === 0) break

      const randomCat =
        allAvailableCategories[
          Math.floor(random() * allAvailableCategories.length)
        ]
      const categoryPrompts = promptsByCategory[randomCat]
      const randomPrompt =
        categoryPrompts[Math.floor(random() * categoryPrompts.length)]
      selectedPrompts.push(randomPrompt)
    } else {
      const randomCat =
        availableCategories[Math.floor(random() * availableCategories.length)]
      const categoryPrompts = promptsByCategory[randomCat]
      const randomPrompt =
        categoryPrompts[Math.floor(random() * categoryPrompts.length)]
      selectedPrompts.push(randomPrompt)
      usedCategories.add(randomCat)
    }
  }

  return selectedPrompts
}

export function useJournalPrompts(): UseJournalPromptsResult {
  const [prompts, setPrompts] = useState<JournalPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)

  const fetchPrompts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Use hardcoded prompts with date-based selection
      const dailyPrompts = getDailyPrompts()

      // Simulate a short loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 100))

      setPrompts(dailyPrompts)
      setIsStale(false)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load prompts'
      console.error('Error loading journal prompts:', err)
      setError(errorMessage)

      // Fallback to basic prompts
      const fallbackPrompts = ALL_PROMPTS.slice(0, 3)
      setPrompts(fallbackPrompts)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async (): Promise<void> => {
    await fetchPrompts()
  }, [fetchPrompts])

  // Initial load
  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  // Check if we need to refresh prompts at midnight
  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date()
      const currentDate = getTodayString()

      // If it's a new day, refresh prompts
      const lastDate = localStorage.getItem('journal-prompts-last-date')
      if (lastDate !== currentDate) {
        localStorage.setItem('journal-prompts-last-date', currentDate)
        fetchPrompts()
      }
    }

    // Check every hour
    const interval = setInterval(checkForNewDay, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchPrompts])

  return {
    prompts,
    loading,
    error,
    refetch,
    isStale,
  }
}
