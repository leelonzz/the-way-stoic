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
