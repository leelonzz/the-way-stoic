import { supabase } from '@/integrations/supabase/client';
import type { JournalEntry, JournalBlock } from '@/components/journal/types';

export interface RichTextJournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  title?: string;
  content: {
    blocks: JournalBlock[];
  };
  created_at: string;
  updated_at: string;
}

export interface CreateRichTextJournalEntryData {
  entry_date: string;
  title?: string;
  content: {
    blocks: JournalBlock[];
  };
}

export async function createRichTextJournalEntry(data: CreateRichTextJournalEntryData): Promise<RichTextJournalEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      ...data
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create rich text journal entry: ${error.message}`);
  }

  return entry as any; // Type conversion for compatibility
}

export async function updateRichTextJournalEntry(id: string, data: Partial<CreateRichTextJournalEntryData>): Promise<RichTextJournalEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update rich text journal entry: ${error.message}`);
  }

  return entry as any; // Type conversion for compatibility
}

export async function getRichTextJournalEntries(limit: number = 10): Promise<RichTextJournalEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch rich text journal entries: ${error.message}`);
  }

  return entries as any || []; // Type conversion for compatibility
}

export async function getRichTextJournalEntryByDate(date: string): Promise<RichTextJournalEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch rich text journal entry: ${error.message}`);
  }

  return entry as any; // Type conversion for compatibility
}

export async function deleteRichTextJournalEntry(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete rich text journal entry: ${error.message}`);
  }
}

// Helper function to convert between local JournalEntry and RichTextJournalEntry
export function convertToJournalEntry(richTextEntry: RichTextJournalEntry): JournalEntry {
  return {
    id: richTextEntry.id,
    date: richTextEntry.entry_date,
    blocks: richTextEntry.content.blocks || [],
    createdAt: new Date(richTextEntry.created_at),
    updatedAt: new Date(richTextEntry.updated_at)
  };
}

export function convertFromJournalEntry(journalEntry: JournalEntry): CreateRichTextJournalEntryData {
  return {
    entry_date: journalEntry.date,
    content: {
      blocks: journalEntry.blocks
    }
  };
}
