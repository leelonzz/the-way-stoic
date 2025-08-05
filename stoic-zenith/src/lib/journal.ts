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

// Real-time journal manager with optimistic updates
export class RealTimeJournalManager {
  private static instance: RealTimeJournalManager;
  private localStorageKey = 'journal_entries_cache';
  private syncQueue: Map<string, { entry: JournalEntry; timestamp: number }> = new Map();
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;
  private pendingSaves: Set<string> = new Set();

  private constructor() {
    // Only setup network listeners on client side
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners();
      this.startBackgroundSync();
    }
  }

  static getInstance(): RealTimeJournalManager {
    if (!RealTimeJournalManager.instance) {
      RealTimeJournalManager.instance = new RealTimeJournalManager();
    }
    return RealTimeJournalManager.instance;
  }

  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      this.syncPendingChanges();
    });
  }

  private startBackgroundSync(): void {
    if (typeof window === 'undefined') return;
    
    // Sync every 5 seconds in background
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.size > 0) {
        this.syncPendingChanges();
      }
    }, 5000);
  }

  // INSTANT ENTRY CREATION (0ms delay)
  async createEntryImmediately(date: string, type: 'morning' | 'evening' | 'general' = 'general'): Promise<JournalEntry> {
    const now = new Date();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Create entry immediately in memory and localStorage
    const newEntry: JournalEntry = {
      id: tempId,
      date,
      blocks: [{
        id: `${tempId}-initial`,
        type: 'paragraph',
        text: '',
        createdAt: now
      }],
      createdAt: now,
      updatedAt: now
    };

    // Save to localStorage immediately
    this.saveToLocalStorage(newEntry);
    
    // Add to sync queue for background database creation
    this.syncQueue.set(tempId, { entry: newEntry, timestamp: Date.now() });
    
    // Return immediately - no waiting
    return newEntry;
  }

  // INSTANT ENTRY DELETION (immediate UI feedback)
  async deleteEntryImmediately(entryId: string): Promise<void> {
    // Remove from localStorage immediately
    this.removeFromLocalStorage(entryId);
    
    // Remove from sync queue
    this.syncQueue.delete(entryId);
    
    // Background database deletion
    if (this.isOnline) {
      this.deleteFromDatabase(entryId).catch(error => {
        console.warn('Background deletion failed:', error);
        // Re-add to sync queue for retry
        this.syncQueue.set(entryId, { 
          entry: { id: entryId, date: '', blocks: [], createdAt: new Date(), updatedAt: new Date() }, 
          timestamp: Date.now() 
        });
      });
    }
  }

  // REAL-TIME AUTO-SAVE (as users type)
  async updateEntryImmediately(entryId: string, blocks: JournalBlock[]): Promise<void> {
    const now = new Date();
    
    // Get current entry from localStorage or create new
    let entry = this.getFromLocalStorage(entryId);
    if (!entry) {
      entry = {
        id: entryId,
        date: new Date().toISOString().split('T')[0],
        blocks: [],
        createdAt: now,
        updatedAt: now
      };
    }

    // Update entry immediately
    const updatedEntry: JournalEntry = {
      ...entry,
      blocks,
      updatedAt: now
    };

    // Save to localStorage immediately (no delay)
    this.saveToLocalStorage(updatedEntry);
    
    // Add to sync queue for background database update
    this.syncQueue.set(entryId, { entry: updatedEntry, timestamp: Date.now() });
    
    // Trigger immediate sync for small changes
    if (blocks.length < 10) {
      setTimeout(() => this.syncEntry(entryId), 100);
    }
  }

  // Get entry with fallback to localStorage
  async getEntry(date: string, type?: 'morning' | 'evening' | 'general'): Promise<JournalEntry | null> {
    // First check localStorage for instant access
    const localEntries = this.getAllFromLocalStorage();
    const localEntry = localEntries.find(entry => 
      entry.date === date && (!type || entry.id.includes(type))
    );
    
    if (localEntry) {
      return localEntry;
    }

    // Fallback to database
    try {
      const supabaseEntry = await this.getFromDatabase(date, type);
      if (supabaseEntry) {
        const entry = this.convertSupabaseToEntry(supabaseEntry);
        this.saveToLocalStorage(entry);
        return entry;
      }
    } catch (error) {
      console.warn('Database fetch failed, using localStorage only:', error);
    }

    return null;
  }

  // Get all entries with localStorage priority
  async getAllEntries(): Promise<JournalEntry[]> {
    // Get from localStorage first for instant access
    const localEntries = this.getAllFromLocalStorage();
    
    // Background sync from database
    if (this.isOnline) {
      this.syncFromDatabase().catch(error => {
        console.warn('Background sync failed:', error);
      });
    }
    
    return localEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Local storage operations
  private saveToLocalStorage(entry: JournalEntry): void {
    if (typeof window === 'undefined') return;
    
    try {
      const entries = this.getAllFromLocalStorage();
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(entries));
    } catch (error) {
      console.warn('LocalStorage save failed:', error);
    }
  }

  public getFromLocalStorage(entryId: string): JournalEntry | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const entries = this.getAllFromLocalStorage();
      return entries.find(entry => entry.id === entryId) || null;
    } catch (error) {
      console.warn('LocalStorage read failed:', error);
      return null;
    }
  }

  private getAllFromLocalStorage(): JournalEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.localStorageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('LocalStorage getAll failed:', error);
      return [];
    }
  }

  private removeFromLocalStorage(entryId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const entries = this.getAllFromLocalStorage();
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      localStorage.setItem(this.localStorageKey, JSON.stringify(filteredEntries));
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
    }
  }

  // Background sync operations
  private async syncEntry(entryId: string): Promise<void> {
    const queueItem = this.syncQueue.get(entryId);
    if (!queueItem) return;

    try {
      const { entry } = queueItem;
      
      if (entry.id.startsWith('temp-')) {
        // Create new entry in database
        const supabaseEntry = await this.createInDatabase(entry);
        // Update localStorage with real ID
        const updatedEntry = { ...entry, id: supabaseEntry.id };
        this.saveToLocalStorage(updatedEntry);
        this.syncQueue.delete(entryId);
      } else {
        // Update existing entry
        await this.updateInDatabase(entry);
        this.syncQueue.delete(entryId);
      }
    } catch (error) {
      console.warn(`Sync failed for entry ${entryId}:`, error);
      // Keep in queue for retry
    }
  }

  private async syncPendingChanges(): Promise<void> {
    const promises = Array.from(this.syncQueue.keys()).map(entryId => 
      this.syncEntry(entryId)
    );
    
    await Promise.allSettled(promises);
  }

  // Database operations
  private async createInDatabase(entry: JournalEntry): Promise<JournalEntryResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const entryData = {
    user_id: user.id,
      entry_date: entry.date,
      entry_type: 'general',
      excited_about: '',
      make_today_great: '',
      must_not_do: '',
      grateful_for: '',
      biggest_wins: [],
      tensions: [],
      rich_text_content: entry.blocks
    };

    const { data: supabaseEntry, error } = await supabase
    .from('journal_entries')
    .insert(entryData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create journal entry: ${error.message}`);
  }

    return supabaseEntry as JournalEntryResponse;
}

  private async updateInDatabase(entry: JournalEntry): Promise<JournalEntryResponse> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

    const { data: supabaseEntry, error } = await supabase
    .from('journal_entries')
      .update({
        rich_text_content: entry.blocks,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id)
    .eq('user_id', user.id)
      .select()
      .single();

  if (error) {
      throw new Error(`Failed to update journal entry: ${error.message}`);
  }

    return supabaseEntry as JournalEntryResponse;
}

  private async getFromDatabase(date: string, type?: 'morning' | 'evening' | 'general'): Promise<JournalEntryResponse | null> {
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

  private async deleteFromDatabase(entryId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

    const { error } = await supabase
    .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id);

  if (error) {
      throw new Error(`Failed to delete journal entry: ${error.message}`);
    }
  }

  private async syncFromDatabase(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to fetch journal entries: ${error.message}`);
    }

    // Update localStorage with database entries
    const localEntries = this.getAllFromLocalStorage();
    const dbEntries = (entries || []).map(entry => this.convertSupabaseToEntry(entry as any));
    
    // Merge and deduplicate
    const mergedEntries = [...localEntries];
    dbEntries.forEach(dbEntry => {
      const existingIndex = mergedEntries.findIndex(e => e.id === dbEntry.id);
      if (existingIndex >= 0) {
        mergedEntries[existingIndex] = dbEntry;
      } else {
        mergedEntries.push(dbEntry);
      }
    });

    localStorage.setItem(this.localStorageKey, JSON.stringify(mergedEntries));
  }

  private convertSupabaseToEntry(supabaseEntry: JournalEntryResponse): JournalEntry {
    const blocks = this.convertSupabaseToBlocks(supabaseEntry);
    
  return {
      id: supabaseEntry.id,
      date: supabaseEntry.entry_date,
      blocks,
      createdAt: new Date(supabaseEntry.created_at),
      updatedAt: new Date(supabaseEntry.updated_at)
    };
  }

  public convertSupabaseToBlocks(entry: JournalEntryResponse & { rich_text_content?: JournalBlock[] }): JournalBlock[] {
  if (entry.rich_text_content && Array.isArray(entry.rich_text_content) && entry.rich_text_content.length > 0) {
    return entry.rich_text_content.map((block, index) => ({
      ...block,
        id: block.id || `${entry.id}-block-${index}`,
      createdAt: block.createdAt ? new Date(block.createdAt) : new Date(entry.created_at)
    }));
  }

  const blocks: JournalBlock[] = [];

  if (entry.excited_about && entry.excited_about.trim()) {
    const lines = entry.excited_about.split('\n\n');
    lines.forEach((line, index) => {
      if (line.trim()) {
        blocks.push({
            id: `${entry.id}-excited-${index}`,
          type: 'paragraph',
          text: line.trim(),
          createdAt: new Date(entry.created_at)
        });
      }
    });
  }

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

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Legacy functions for backward compatibility
export async function createJournalEntry(data: CreateJournalEntryData): Promise<JournalEntryResponse> {
  const manager = RealTimeJournalManager.getInstance();
  const entry = await manager.createEntryImmediately(data.entry_date, data.entry_type);
  
  // Wait for background sync to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return the synced entry
  const syncedEntry = await manager.getEntry(data.entry_date, data.entry_type);
  if (!syncedEntry) {
    throw new Error('Failed to create journal entry');
  }
  
  const response: JournalEntryResponse = {
    id: syncedEntry.id,
    user_id: 'temp',
    entry_date: syncedEntry.date,
    entry_type: 'general',
    created_at: syncedEntry.createdAt.toISOString(),
    updated_at: syncedEntry.updatedAt.toISOString(),
    excited_about: '',
    make_today_great: '',
    must_not_do: '',
    grateful_for: '',
    biggest_wins: [],
    tensions: [],
    mood_rating: undefined,
    tags: []
  };
  return response;
}

export async function getJournalEntries(limit: number = 10): Promise<JournalEntryResponse[]> {
  const manager = RealTimeJournalManager.getInstance();
  const entries = await manager.getAllEntries();
  
  return entries.slice(0, limit).map(entry => ({
    id: entry.id,
    user_id: 'temp',
    entry_date: entry.date,
    entry_type: 'general',
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString()
  })) as JournalEntryResponse[];
}

export async function getJournalEntryByDate(date: string, type?: 'morning' | 'evening'): Promise<JournalEntryResponse | null> {
  const manager = RealTimeJournalManager.getInstance();
  const entry = await manager.getEntry(date, type);
  
  if (!entry) return null;
  
  return {
    id: entry.id,
    user_id: 'temp',
    entry_date: entry.date,
    entry_type: 'general',
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString()
  } as JournalEntryResponse;
}

export async function updateJournalEntry(id: string, data: Partial<CreateJournalEntryData> & { rich_text_content?: JournalBlock[] }): Promise<JournalEntryResponse> {
  const manager = RealTimeJournalManager.getInstance();
  
  if (data.rich_text_content) {
    await manager.updateEntryImmediately(id, data.rich_text_content);
  }
  
  const entry = manager.getFromLocalStorage(id);
  if (!entry) {
    throw new Error('Entry not found');
  }
  
  return {
    id: entry.id,
    user_id: 'temp',
    entry_date: entry.date,
    entry_type: 'general',
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString()
  } as JournalEntryResponse;
}

export function convertBlocksToSupabaseFormat(blocks: JournalBlock[]): Partial<CreateJournalEntryData> & { rich_text_content: JournalBlock[] } {
  const textContent = blocks
    .filter(block => block.text && block.text.trim() !== '')
    .map(block => block.text)
    .join('\n\n');

  return {
    excited_about: textContent || '',
    make_today_great: '',
    must_not_do: '',
    grateful_for: '',
    rich_text_content: blocks
  };
}

export function convertSupabaseToBlocks(entry: JournalEntryResponse & { rich_text_content?: JournalBlock[] }): JournalBlock[] {
  const manager = RealTimeJournalManager.getInstance();
  return manager.convertSupabaseToBlocks(entry);
}

export async function updateJournalEntryFromBlocks(id: string, blocks: JournalBlock[]): Promise<JournalEntryResponse> {
  const manager = RealTimeJournalManager.getInstance();
  await manager.updateEntryImmediately(id, blocks);
  
  const entry = manager.getFromLocalStorage(id);
  if (!entry) {
    throw new Error('Entry not found');
  }
  
  return {
    id: entry.id,
    user_id: 'temp',
    entry_date: entry.date,
    entry_type: 'general',
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString()
  } as JournalEntryResponse;
}

export async function safeUpdateJournalEntry(id: string, blocks: JournalBlock[]): Promise<{ success: boolean; error?: string }> {
  try {
    const manager = RealTimeJournalManager.getInstance();
    await manager.updateEntryImmediately(id, blocks);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function getJournalEntryAsRichText(date: string): Promise<JournalEntry | null> {
  const manager = RealTimeJournalManager.getInstance();
  return await manager.getEntry(date);
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const manager = RealTimeJournalManager.getInstance();
  await manager.deleteEntryImmediately(id);
}

export async function getJournalStats(): Promise<{
  totalEntries: number;
  morningEntries: number;
  eveningEntries: number;
  currentStreak: number;
}> {
  const manager = RealTimeJournalManager.getInstance();
  const entries = await manager.getAllEntries();
  
  const totalEntries = entries.length;
  const morningEntries = entries.filter(e => e.id.includes('morning')).length;
  const eveningEntries = entries.filter(e => e.id.includes('evening')).length;

  let currentStreak = 0;
  if (entries.length > 0) {
    const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse();
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

// Export the manager for direct access
export const journalManager = RealTimeJournalManager.getInstance();