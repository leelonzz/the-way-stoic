import { supabase } from '@/integrations/supabase/client';
import type { JournalEntry } from '@/components/journal/types';

export interface CreateJournalEntryData {
  entry_date: string;
  entry_type: 'morning' | 'evening';
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
  entry_type: 'morning' | 'evening';
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
}

export async function createJournalEntry(data: CreateJournalEntryData): Promise<JournalEntryResponse> {
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
    throw new Error(`Failed to create journal entry: ${error.message}`);
  }

  return entry;
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

  return entries || [];
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

  return entry;
}

export async function updateJournalEntry(id: string, data: Partial<CreateJournalEntryData>): Promise<JournalEntryResponse> {
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

  return entry;
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