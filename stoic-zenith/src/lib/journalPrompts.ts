// Journal Prompts Utility Library
// Provides utilities and constants for the journal prompts system

export interface JournalPrompt {
  id: string
  prompt_text: string
  category:
    | 'reflection'
    | 'gratitude'
    | 'creative'
    | 'goals'
    | 'stoic'
    | 'mindfulness'
  genre:
    | 'personal_growth'
    | 'relationships'
    | 'career'
    | 'wellness'
    | 'philosophy'
    | 'creativity'
  difficulty_level: 1 | 2 | 3
}

// Category configurations for UI display
export const PROMPT_CATEGORIES = {
  reflection: {
    label: 'Reflection',
    description: 'Deep thinking and self-examination prompts',
    color: 'purple',
    icon: 'brain',
  },
  gratitude: {
    label: 'Gratitude',
    description: 'Appreciation and thankfulness prompts',
    color: 'pink',
    icon: 'heart',
  },
  creative: {
    label: 'Creative',
    description: 'Imagination and creative thinking prompts',
    color: 'yellow',
    icon: 'lightbulb',
  },
  goals: {
    label: 'Goals',
    description: 'Future planning and goal-setting prompts',
    color: 'blue',
    icon: 'target',
  },
  stoic: {
    label: 'Stoic',
    description: 'Philosophical and wisdom-based prompts',
    color: 'stone',
    icon: 'book',
  },
  mindfulness: {
    label: 'Mindfulness',
    description: 'Present-moment awareness prompts',
    color: 'green',
    icon: 'sunrise',
  },
} as const

// Genre configurations
export const PROMPT_GENRES = {
  personal_growth: 'Personal Growth',
  relationships: 'Relationships',
  career: 'Career',
  wellness: 'Wellness',
  philosophy: 'Philosophy',
  creativity: 'Creativity',
} as const

// Utility functions for prompt management
export class PromptUtils {
  /**
   * Format prompt text for display
   */
  static formatPromptText(text: string): string {
    // Ensure the prompt ends with appropriate punctuation
    const trimmed = text.trim()
    if (
      !trimmed.endsWith('?') &&
      !trimmed.endsWith('.') &&
      !trimmed.endsWith(':')
    ) {
      return trimmed + '?'
    }
    return trimmed
  }

  /**
   * Get category configuration
   */
  static getCategoryConfig(category: keyof typeof PROMPT_CATEGORIES) {
    return PROMPT_CATEGORIES[category]
  }

  /**
   * Get difficulty label
   */
  static getDifficultyLabel(level: 1 | 2 | 3): string {
    switch (level) {
      case 1:
        return 'Beginner'
      case 2:
        return 'Intermediate'
      case 3:
        return 'Advanced'
      default:
        return 'Unknown'
    }
  }

  /**
   * Validate prompt structure
   */
  static validatePrompt(prompt: any): prompt is JournalPrompt {
    return (
      typeof prompt === 'object' &&
      prompt !== null &&
      typeof prompt.id === 'string' &&
      typeof prompt.prompt_text === 'string' &&
      prompt.prompt_text.length > 0 &&
      [
        'reflection',
        'gratitude',
        'creative',
        'goals',
        'stoic',
        'mindfulness',
      ].includes(prompt.category) &&
      [
        'personal_growth',
        'relationships',
        'career',
        'wellness',
        'philosophy',
        'creativity',
      ].includes(prompt.genre) &&
      [1, 2, 3].includes(prompt.difficulty_level)
    )
  }

  /**
   * Filter prompts by category
   */
  static filterByCategory(
    prompts: JournalPrompt[],
    category: keyof typeof PROMPT_CATEGORIES
  ): JournalPrompt[] {
    return prompts.filter(prompt => prompt.category === category)
  }

  /**
   * Filter prompts by difficulty
   */
  static filterByDifficulty(
    prompts: JournalPrompt[],
    difficulty: 1 | 2 | 3
  ): JournalPrompt[] {
    return prompts.filter(prompt => prompt.difficulty_level === difficulty)
  }

  /**
   * Get random prompts with diversity
   */
  static getRandomDiversePrompts(
    prompts: JournalPrompt[],
    count: number = 3
  ): JournalPrompt[] {
    if (prompts.length === 0) return []
    if (prompts.length <= count) return [...prompts]

    const categories = Object.keys(
      PROMPT_CATEGORIES
    ) as (keyof typeof PROMPT_CATEGORIES)[]
    const selectedPrompts: JournalPrompt[] = []
    const usedCategories = new Set<string>()

    // Try to get one prompt from different categories first
    for (let i = 0; i < count && selectedPrompts.length < count; i++) {
      const availableCategories = categories.filter(cat => {
        if (usedCategories.has(cat)) return false
        return prompts.some(
          p => p.category === cat && !selectedPrompts.includes(p)
        )
      })

      if (availableCategories.length === 0) {
        // If no unused categories, get from any category
        const remaining = prompts.filter(p => !selectedPrompts.includes(p))
        if (remaining.length > 0) {
          const randomIndex = Math.floor(Math.random() * remaining.length)
          selectedPrompts.push(remaining[randomIndex])
        }
      } else {
        const randomCategory =
          availableCategories[
            Math.floor(Math.random() * availableCategories.length)
          ]
        const categoryPrompts = prompts.filter(
          p => p.category === randomCategory && !selectedPrompts.includes(p)
        )

        if (categoryPrompts.length > 0) {
          const randomIndex = Math.floor(Math.random() * categoryPrompts.length)
          selectedPrompts.push(categoryPrompts[randomIndex])
          usedCategories.add(randomCategory)
        }
      }
    }

    return selectedPrompts
  }

  /**
   * Generate cache key for daily prompts
   */
  static getDailyCacheKey(date?: Date): string {
    const targetDate = date || new Date()
    const dateStr = targetDate.toISOString().split('T')[0] // YYYY-MM-DD
    return `journal-prompts-daily-${dateStr}`
  }

  /**
   * Check if prompts are suitable for current user context
   */
  static filterByUserContext(
    prompts: JournalPrompt[],
    userPreferences?: {
      preferredCategories?: string[]
      maxDifficulty?: number
      excludeGenres?: string[]
    }
  ): JournalPrompt[] {
    if (!userPreferences) return prompts

    return prompts.filter(prompt => {
      // Filter by preferred categories
      if (
        userPreferences.preferredCategories &&
        userPreferences.preferredCategories.length > 0
      ) {
        if (!userPreferences.preferredCategories.includes(prompt.category)) {
          return false
        }
      }

      // Filter by difficulty
      if (
        userPreferences.maxDifficulty &&
        prompt.difficulty_level > userPreferences.maxDifficulty
      ) {
        return false
      }

      // Exclude certain genres
      if (
        userPreferences.excludeGenres &&
        userPreferences.excludeGenres.includes(prompt.genre)
      ) {
        return false
      }

      return true
    })
  }
}

// Default fallback prompts for offline use
export const FALLBACK_PROMPTS: JournalPrompt[] = [
  {
    id: 'fallback-1',
    prompt_text: 'What are three things you learned about yourself today?',
    category: 'reflection',
    genre: 'personal_growth',
    difficulty_level: 1,
  },
  {
    id: 'fallback-2',
    prompt_text:
      'Describe something beautiful you noticed today that others might have missed.',
    category: 'gratitude',
    genre: 'wellness',
    difficulty_level: 1,
  },
  {
    id: 'fallback-3',
    prompt_text:
      'If you could have a conversation with your future self, what would you ask?',
    category: 'creative',
    genre: 'personal_growth',
    difficulty_level: 2,
  },
]

// Constants for API and caching
export const PROMPTS_CONFIG = {
  DAILY_PROMPT_COUNT: 3,
  CACHE_DURATION_HOURS: 24,
  API_ENDPOINT: '/api/journal-prompts/daily',
  FALLBACK_TIMEOUT_MS: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const
