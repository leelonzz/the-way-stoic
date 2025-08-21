export interface WritingPrompt {
  id: string
  text: string
  category: 'reflection' | 'gratitude' | 'creativity' | 'goals' | 'relationships' | 'mindfulness' | 'growth'
}

export interface DailyPrompts {
  date: string
  prompts: [WritingPrompt, WritingPrompt, WritingPrompt]
}

// Comprehensive collection of writing prompts organized by category
const WRITING_PROMPTS: WritingPrompt[] = [
  // Reflection prompts
  {
    id: 'ref_001',
    text: 'What lesson did you learn today that you want to remember?',
    category: 'reflection'
  },
  {
    id: 'ref_002', 
    text: 'Describe a moment today when you felt most like yourself.',
    category: 'reflection'
  },
  {
    id: 'ref_003',
    text: 'What would you tell your younger self about the challenges you face now?',
    category: 'reflection'
  },
  {
    id: 'ref_004',
    text: 'How have your priorities changed in the last year?',
    category: 'reflection'
  },
  {
    id: 'ref_005',
    text: 'What pattern in your thinking would you like to change?',
    category: 'reflection'
  },

  // Gratitude prompts
  {
    id: 'grat_001',
    text: 'Write about three small things that brought you joy today.',
    category: 'gratitude'
  },
  {
    id: 'grat_002',
    text: 'Who in your life are you most grateful for and why?',
    category: 'gratitude'
  },
  {
    id: 'grat_003',
    text: 'What skill or ability do you have that you often take for granted?',
    category: 'gratitude'
  },
  {
    id: 'grat_004',
    text: 'Describe a place that makes you feel peaceful and grateful.',
    category: 'gratitude'
  },
  {
    id: 'grat_005',
    text: 'What challenge from your past are you now grateful for?',
    category: 'gratitude'
  },

  // Creativity prompts
  {
    id: 'crea_001',
    text: 'If you could design your perfect day, what would it look like?',
    category: 'creativity'
  },
  {
    id: 'crea_002',
    text: 'Write about a world where one common thing works completely differently.',
    category: 'creativity'
  },
  {
    id: 'crea_003',
    text: 'What would you create if you knew you couldn\'t fail?',
    category: 'creativity'
  },
  {
    id: 'crea_004',
    text: 'Describe your life as if it were a story. What genre would it be?',
    category: 'creativity'
  },
  {
    id: 'crea_005',
    text: 'If you could have a conversation with any object, what would you choose and why?',
    category: 'creativity'
  },

  // Goals prompts
  {
    id: 'goal_001',
    text: 'What small step can you take tomorrow toward a bigger goal?',
    category: 'goals'
  },
  {
    id: 'goal_002',
    text: 'What would success look like for you in five years?',
    category: 'goals'
  },
  {
    id: 'goal_003',
    text: 'What habit would have the biggest positive impact on your life?',
    category: 'goals'
  },
  {
    id: 'goal_004',
    text: 'What are you avoiding that you know you should address?',
    category: 'goals'
  },
  {
    id: 'goal_005',
    text: 'How do you want to grow as a person this year?',
    category: 'goals'
  },

  // Relationships prompts
  {
    id: 'rel_001',
    text: 'Write a letter to someone who has positively impacted your life.',
    category: 'relationships'
  },
  {
    id: 'rel_002',
    text: 'What quality do you most admire in your closest friend?',
    category: 'relationships'
  },
  {
    id: 'rel_003',
    text: 'How do you show love and care to the people in your life?',
    category: 'relationships'
  },
  {
    id: 'rel_004',
    text: 'What relationship in your life needs more attention?',
    category: 'relationships'
  },
  {
    id: 'rel_005',
    text: 'Describe a time when someone\'s kindness surprised you.',
    category: 'relationships'
  },

  // Mindfulness prompts
  {
    id: 'mind_001',
    text: 'What are you noticing about your surroundings right now?',
    category: 'mindfulness'
  },
  {
    id: 'mind_002',
    text: 'How does your body feel in this moment?',
    category: 'mindfulness'
  },
  {
    id: 'mind_003',
    text: 'What emotions are you experiencing today without judgment?',
    category: 'mindfulness'
  },
  {
    id: 'mind_004',
    text: 'When did you last feel completely present and engaged?',
    category: 'mindfulness'
  },
  {
    id: 'mind_005',
    text: 'What sounds, smells, or textures are you aware of right now?',
    category: 'mindfulness'
  },

  // Growth prompts
  {
    id: 'grow_001',
    text: 'What mistake taught you the most valuable lesson?',
    category: 'growth'
  },
  {
    id: 'grow_002',
    text: 'How have you changed in the past six months?',
    category: 'growth'
  },
  {
    id: 'grow_003',
    text: 'What fear would you like to overcome?',
    category: 'growth'
  },
  {
    id: 'grow_004',
    text: 'What new perspective have you gained recently?',
    category: 'growth'
  },
  {
    id: 'grow_005',
    text: 'What would you do if you were 10% braver?',
    category: 'growth'
  }
]

// Simple hash function to generate consistent daily selections
function hashDate(dateString: string): number {
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Select 3 prompts for a given date, ensuring variety across categories
export function getDailyPrompts(date?: string): DailyPrompts {
  const dateString = date || getTodayDateString()
  const hash = hashDate(dateString)
  
  // Group prompts by category
  const promptsByCategory = WRITING_PROMPTS.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = []
    }
    acc[prompt.category].push(prompt)
    return acc
  }, {} as Record<string, WritingPrompt[]>)
  
  const categories = Object.keys(promptsByCategory)
  const selectedPrompts: WritingPrompt[] = []
  
  // Select one prompt from each of 3 different categories
  for (let i = 0; i < 3; i++) {
    const categoryIndex = (hash + i * 7) % categories.length
    const category = categories[categoryIndex]
    const categoryPrompts = promptsByCategory[category]
    const promptIndex = (hash + i * 11) % categoryPrompts.length
    
    selectedPrompts.push(categoryPrompts[promptIndex])
    
    // Remove this category to ensure variety
    categories.splice(categoryIndex, 1)
  }
  
  return {
    date: dateString,
    prompts: selectedPrompts as [WritingPrompt, WritingPrompt, WritingPrompt]
  }
}

// Get category display name with proper formatting
export function getCategoryDisplayName(category: WritingPrompt['category']): string {
  const categoryNames = {
    reflection: 'Reflection',
    gratitude: 'Gratitude', 
    creativity: 'Creativity',
    goals: 'Goals',
    relationships: 'Relationships',
    mindfulness: 'Mindfulness',
    growth: 'Growth'
  }
  
  return categoryNames[category]
}
