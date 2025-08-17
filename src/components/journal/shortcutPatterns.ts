import { JournalBlock } from './types'

export interface ShortcutPattern {
  pattern: RegExp
  type: JournalBlock['type']
  level?: 1 | 2 | 3
  description: string
  example: string
}

export const MARKDOWN_SHORTCUTS: ShortcutPattern[] = [
  {
    pattern: /^# $/,
    type: 'heading',
    level: 1,
    description: 'Heading 1',
    example: '# ',
  },
  {
    pattern: /^## $/,
    type: 'heading',
    level: 2,
    description: 'Heading 2',
    example: '## ',
  },
  {
    pattern: /^### $/,
    type: 'heading',
    level: 3,
    description: 'Heading 3',
    example: '### ',
  },
  {
    pattern: /^- $/,
    type: 'bullet-list',
    description: 'Bullet List',
    example: '- ',
  },
  {
    pattern: /^\* $/,
    type: 'bullet-list',
    description: 'Bullet List',
    example: '* ',
  },
  {
    pattern: /^1\. $/,
    type: 'numbered-list',
    description: 'Numbered List',
    example: '1. ',
  },
  {
    pattern: /^\d+\. $/,
    type: 'numbered-list',
    description: 'Numbered List',
    example: '2. ',
  },
  {
    pattern: /^> $/,
    type: 'quote',
    description: 'Quote',
    example: '> ',
  },
  {
    pattern: /^``` $/,
    type: 'code',
    description: 'Code Block',
    example: '``` ',
  },
]

export function detectShortcutPattern(text: string): ShortcutPattern | null {
  for (const shortcut of MARKDOWN_SHORTCUTS) {
    if (shortcut.pattern.test(text)) {
      return shortcut
    }
  }
  return null
}

export function shouldTriggerAutoConversion(
  text: string,
  key: string
): boolean {
  return key === ' ' && detectShortcutPattern(text + ' ') !== null
}

// Enhanced function for line-based pattern detection
export function detectLineShortcutPattern(lineText: string): ShortcutPattern | null {
  // Trim the line text to handle any leading/trailing whitespace
  const trimmedLine = lineText.trim()
  
  // Check if the line matches any markdown pattern
  for (const shortcut of MARKDOWN_SHORTCUTS) {
    if (shortcut.pattern.test(trimmedLine)) {
      return shortcut
    }
  }
  return null
}

// Check if a line will trigger conversion after adding a space
export function shouldTriggerLineConversion(lineText: string): boolean {
  return detectLineShortcutPattern(lineText + ' ') !== null
}

// Test function to verify all markdown shortcuts work correctly
export function testMarkdownShortcuts(): boolean {
  const testCases = [
    { input: '# ', expected: 'heading', level: 1 },
    { input: '## ', expected: 'heading', level: 2 },
    { input: '### ', expected: 'heading', level: 3 },
    { input: '- ', expected: 'bullet-list' },
    { input: '* ', expected: 'bullet-list' },
    { input: '1. ', expected: 'numbered-list' },
    { input: '2. ', expected: 'numbered-list' },
    { input: '> ', expected: 'quote' },
    { input: '``` ', expected: 'code' },
  ]

  let allPassed = true
  
  for (const testCase of testCases) {
    const result = detectShortcutPattern(testCase.input)
    
    if (!result) {
      console.error(`❌ Test failed: "${testCase.input}" should detect ${testCase.expected}`)
      allPassed = false
      continue
    }
    
    if (result.type !== testCase.expected) {
      console.error(`❌ Test failed: "${testCase.input}" detected ${result.type}, expected ${testCase.expected}`)
      allPassed = false
      continue
    }
    
    if (testCase.level && result.level !== testCase.level) {
      console.error(`❌ Test failed: "${testCase.input}" detected level ${result.level}, expected ${testCase.level}`)
      allPassed = false
      continue
    }
    
    console.log(`✅ Test passed: "${testCase.input}" → ${result.type}${result.level ? ` level ${result.level}` : ''}`)
  }
  
  if (allPassed) {
    console.log('🎉 All markdown shortcut tests passed!')
  }
  
  return allPassed
}
