import { supabase } from '@/integrations/supabase/client';
import type { JournalEntry, JournalBlock } from '@/components/journal/types';

export interface CreateJournalEntryData {
  entry_date: string;
  entry_type?: 'morning' | 'evening' | 'general';
  excited_about?: string;
  make_today_great?: string;
  must_not_do?: string;
  grateful_for?: string;
  biggest_wins?: string[];
  tensions?: string[];
  mood_rating?: number;
  tags?: string[];
}

export interface JournalEntryResponse {
  id: string;
  user_id: string;
  entry_date: string;
  entry_type: 'morning' | 'evening' | 'general';
  created_at: string;
  updated_at: string;
  excited_about?: string;
  make_today_great?: string;
  must_not_do?: string;
  grateful_for?: string;
  biggest_wins?: string[];
  tensions?: string[];
  mood_rating?: number;
  tags?: string[];
  rich_text_content?: JournalBlock[];
}

export async function createJournalEntry(data: CreateJournalEntryData): Promise<JournalEntryResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Generate unique entry with timestamp-based identification
  const now = new Date();
  const entryData = {
    user_id: user.id,
    entry_date: data.entry_date,
    entry_type: data.entry_type || 'general', // Default to 'general' instead of 'morning'
    excited_about: data.excited_about || `Entry created at ${now.toLocaleTimeString()}`,
    make_today_great: data.make_today_great || '',
    must_not_do: data.must_not_do || '',
    grateful_for: data.grateful_for || '',
    biggest_wins: data.biggest_wins || [],
    tensions: data.tensions || [],
    mood_rating: data.mood_rating,
    tags: data.tags || []
  };

  // Always create a new entry - multiple entries per day are now allowed
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert(entryData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create journal entry: ${error.message}`);
  }

  return entry as JournalEntryResponse;
}

export async function getJournalEntries(limit: number = 10): Promise<JournalEntryResponse[]> {
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
    throw new Error(`Failed to fetch journal entries: ${error.message}`);
  }

  return (entries || []) as JournalEntryResponse[];
}

export async function getJournalEntryByDate(date: string, type?: 'morning' | 'evening'): Promise<JournalEntryResponse | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', date);

  if (type) {
    query = query.eq('entry_type', type);
  }

  const { data: entry, error } = await query.single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch journal entry: ${error.message}`);
  }

  return entry as JournalEntryResponse;
}

export async function updateJournalEntry(id: string, data: Partial<CreateJournalEntryData> & { rich_text_content?: JournalBlock[] }): Promise<JournalEntryResponse> {
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
    throw new Error(`Failed to update journal entry: ${error.message}`);
  }

  return entry as JournalEntryResponse;
}

// Convert rich text blocks to Supabase format
export function convertBlocksToSupabaseFormat(blocks: JournalBlock[]): Partial<CreateJournalEntryData> & { rich_text_content: JournalBlock[] } {
  const textContent = blocks
    .filter(block => block.text && block.text.trim() !== '')
    .map(block => block.text)
    .join('\n\n');

  // Store rich text blocks in the new rich_text_content field
  // Also maintain backward compatibility with excited_about field
  return {
    excited_about: textContent || '',
    make_today_great: '', // Could be parsed from blocks if needed
    must_not_do: '',
    grateful_for: '',
    rich_text_content: blocks // Store the actual rich text blocks
  };
}

// Convert Supabase entry to rich text blocks
export function convertSupabaseToBlocks(entry: JournalEntryResponse & { rich_text_content?: JournalBlock[] }): JournalBlock[] {
  // First, try to use the rich_text_content if it exists and has content
  if (entry.rich_text_content && Array.isArray(entry.rich_text_content) && entry.rich_text_content.length > 0) {
    // Ensure each block has a stable ID based on the entry ID
    return entry.rich_text_content.map((block, index) => ({
      ...block,
      id: block.id || `${entry.id}-block-${index}`, // Stable ID based on entry ID
      createdAt: block.createdAt ? new Date(block.createdAt) : new Date(entry.created_at)
    }));
  }

  // Fallback to converting from legacy structured fields
  const blocks: JournalBlock[] = [];

  // Convert different fields to blocks with stable IDs
  if (entry.excited_about && entry.excited_about.trim()) {
    const lines = entry.excited_about.split('\n\n');
    lines.forEach((line, index) => {
      if (line.trim()) {
        blocks.push({
          id: `${entry.id}-excited-${index}`, // Stable ID
          type: 'paragraph',
          text: line.trim(),
          createdAt: new Date(entry.created_at)
        });
      }
    });
  }

  if (entry.make_today_great && entry.make_today_great.trim()) {
    blocks.push({
      id: `${entry.id}-make-great`, // Stable ID
      type: 'paragraph',
      text: entry.make_today_great.trim(),
      createdAt: new Date(entry.created_at)
    });
  }

  // If no content, create an empty block with stable ID
  if (blocks.length === 0) {
    blocks.push({
      id: `${entry.id}-empty-block`,
      type: 'paragraph',
      text: '',
      createdAt: new Date(entry.created_at)
    });
  }

  return blocks;
}

// Update journal entry with rich text blocks
export async function updateJournalEntryFromBlocks(
  id: string, 
  blocks: JournalBlock[]
): Promise<JournalEntryResponse> {
  const supabaseData = convertBlocksToSupabaseFormat(blocks);
  return updateJournalEntry(id, supabaseData);
}

// Get journal entry and convert to rich text format
export async function getJournalEntryAsRichText(date: string): Promise<JournalEntry | null> {
  const supabaseEntry = await getJournalEntryByDate(date);
  
  if (!supabaseEntry) {
    return null;
  }
  
  const blocks = convertSupabaseToBlocks(supabaseEntry);
  
  return {
    id: supabaseEntry.id,
    date: supabaseEntry.entry_date,
    blocks,
    createdAt: new Date(supabaseEntry.created_at),
    updatedAt: new Date(supabaseEntry.updated_at)
  };
}

export async function deleteJournalEntry(id: string): Promise<void> {
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
    throw new Error(`Failed to delete journal entry: ${error.message}`);
  }
}

export async function getJournalStats(): Promise<{
  totalEntries: number;
  morningEntries: number;
  eveningEntries: number;
  currentStreak: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('entry_type, entry_date')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch journal stats: ${error.message}`);
  }

  const totalEntries = entries?.length || 0;
  const morningEntries = entries?.filter(e => e.entry_type === 'morning').length || 0;
  const eveningEntries = entries?.filter(e => e.entry_type === 'evening').length || 0;

  let currentStreak = 0;
  if (entries && entries.length > 0) {
    const uniqueDates = [...new Set(entries.map(e => e.entry_date))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);
    
    for (const dateStr of uniqueDates) {
      const entryDate = new Date(dateStr);
      const diffTime = checkDate.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak++;
        checkDate = new Date(entryDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    totalEntries,
    morningEntries,
    eveningEntries,
    currentStreak
  };
}