import { supabase } from '@/integrations/supabase/client'
import type { JournalEntry, JournalBlock } from '@/components/journal/types'

export interface RichTextJournalEntry {
  id: string
  user_id: string
  entry_date: string
  entry_type: 'morning' | 'evening'
  created_at: string
  updated_at: string
  excited_about?: string
  make_today_great?: string
  must_not_do?: string
  grateful_for?: string
  biggest_wins?: string[]
  tensions?: string[]
  mood_rating?: number
  tags?: string[]
}

export interface CreateRichTextJournalEntryData {
  entry_date: string
  entry_type: 'morning' | 'evening'
  excited_about?: string
  make_today_great?: string
  must_not_do?: string
  grateful_for?: string
  biggest_wins?: string[]
  tensions?: string[]
  mood_rating?: number
  tags?: string[]
}

export async function createRichTextJournalEntry(
  data: CreateRichTextJournalEntryData
): Promise<RichTextJournalEntry> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      ...data,
    })
    .select()
    .single()

  if (error) {
    throw new Error(
      `Failed to create rich text journal entry: ${error.message}`
    )
  }

  return entry as RichTextJournalEntry
}

export async function updateRichTextJournalEntry(
  id: string,
  data: Partial<CreateRichTextJournalEntryData>
): Promise<RichTextJournalEntry> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(
      `Failed to update rich text journal entry: ${error.message}`
    )
  }

  return entry as RichTextJournalEntry
}

export async function getRichTextJournalEntries(
  limit: number = 10
): Promise<RichTextJournalEntry[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(
      `Failed to fetch rich text journal entries: ${error.message}`
    )
  }

  return (entries as RichTextJournalEntry[]) || []
}

export async function getRichTextJournalEntryByDate(
  date: string
): Promise<RichTextJournalEntry | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', date)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch rich text journal entry: ${error.message}`)
  }

  return entry as RichTextJournalEntry | null
}

export async function deleteRichTextJournalEntry(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(
      `Failed to delete rich text journal entry: ${error.message}`
    )
  }
}

// Helper function to convert between local JournalEntry and RichTextJournalEntry
export function convertToJournalEntry(
  richTextEntry: RichTextJournalEntry
): JournalEntry {
  // Convert database fields to rich text blocks
  const blocks: JournalBlock[] = []

  if (richTextEntry.excited_about) {
    blocks.push({
      id: `excited-${richTextEntry.id}`,
      type: 'paragraph',
      text: richTextEntry.excited_about,
      createdAt: new Date(richTextEntry.created_at),
    })
  }

  if (richTextEntry.make_today_great) {
    blocks.push({
      id: `great-${richTextEntry.id}`,
      type: 'paragraph',
      text: richTextEntry.make_today_great,
      createdAt: new Date(richTextEntry.created_at),
    })
  }

  if (richTextEntry.grateful_for) {
    blocks.push({
      id: `grateful-${richTextEntry.id}`,
      type: 'paragraph',
      text: richTextEntry.grateful_for,
      createdAt: new Date(richTextEntry.created_at),
    })
  }

  // If no content, create empty block
  if (blocks.length === 0) {
    blocks.push({
      id: `empty-${richTextEntry.id}`,
      type: 'paragraph',
      text: '',
      createdAt: new Date(richTextEntry.created_at),
    })
  }

  return {
    id: richTextEntry.id,
    date: richTextEntry.entry_date,
    blocks,
    createdAt: new Date(richTextEntry.created_at),
    updatedAt: new Date(richTextEntry.updated_at),
  }
}

export function convertFromJournalEntry(
  journalEntry: JournalEntry
): CreateRichTextJournalEntryData {
  // Convert rich text blocks to database fields
  const textContent = journalEntry.blocks
    .filter(block => block.text && block.text.trim() !== '')
    .map(block => block.text)
    .join('\n\n')

  return {
    entry_date: journalEntry.date,
    entry_type: 'morning', // Default to morning
    excited_about: textContent || '',
    make_today_great: '',
    grateful_for: '',
  }
}
