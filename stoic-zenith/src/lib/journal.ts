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
  private static instances: Map<string, RealTimeJournalManager> = new Map();
  private userId: string | null = null;
  private localStorageKey: string;
  private deletedEntriesKey: string;
  private syncQueue: Map<string, { entry: JournalEntry; timestamp: number; retryCount: number }> = new Map();
  private activelyEditedEntries: Map<string, number> = new Map(); // entryId -> lastEditTime
  private contentIntegrityLog: Map<string, { timestamp: number; charCount: number; blockCount: number }[]> = new Map();
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;
  private pendingSaves: Set<string> = new Set();
  private entryCreationInProgress: Set<string> = new Set(); // Track entries being created to prevent duplicates
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second
  private editProtectionWindow = 10000; // 10 seconds protection window

  private constructor(userId: string | null = null) {
    this.userId = userId;
    this.updateStorageKeys();
    
    // Only setup network listeners on client side
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners();
      this.startBackgroundSync();
      this.migrateOldData();
    }
  }

  static getInstance(userId?: string | null): RealTimeJournalManager {
    // Always require explicit userId - no anonymous fallback for journal entries
    if (!userId) {
      console.warn('⚠️ Journal manager requested without userId - this may cause persistence issues');
    }

    const key = userId || 'anonymous';

    if (!RealTimeJournalManager.instances.has(key)) {
      RealTimeJournalManager.instances.set(key, new RealTimeJournalManager(userId || null));
    }

    const instance = RealTimeJournalManager.instances.get(key)!;

    // Ensure the instance has the correct userId
    if (userId && instance.userId !== userId) {
      console.log(`🔄 Updating journal manager userId from ${instance.userId} to ${userId}`);
      instance.setUserId(userId);
    }

    return instance;
  }

  // Update storage keys based on current userId
  private updateStorageKeys(): void {
    if (this.userId) {
      this.localStorageKey = `journal_entries_cache_${this.userId}`;
      this.deletedEntriesKey = `journal_deleted_entries_${this.userId}`;
    } else {
      // For anonymous users, use a different prefix to avoid mixing with legacy data
      this.localStorageKey = 'journal_entries_cache_anonymous';
      this.deletedEntriesKey = 'journal_deleted_entries_anonymous';
    }
  }

  // Update userId when user logs in/out
  public setUserId(userId: string | null): void {
    if (this.userId !== userId) {
      const previousUserId = this.userId;
      const hadPendingEntries = this.syncQueue.size > 0;

      // Store pending entries before clearing (for first-time auth)
      const pendingEntries = hadPendingEntries && !previousUserId ?
        Array.from(this.syncQueue.entries()) : [];

      // Clear any pending operations for the old user (but preserve for first-time auth)
      if (previousUserId !== null) {
        // Only clear when switching between actual users, not on first auth
        this.syncQueue.clear();
        this.activelyEditedEntries.clear();
        this.contentIntegrityLog.clear();
        this.pendingSaves.clear();
        this.entryCreationInProgress.clear();
      }

      // Update userId and storage keys
      this.userId = userId;
      this.updateStorageKeys();

      // Migrate data if needed
      if (typeof window !== 'undefined') {
        this.migrateOldData();
      }

      // Restore and retry sync for entries created before authentication
      if (userId && !previousUserId && pendingEntries.length > 0) {
        console.log(`🔄 Restoring ${pendingEntries.length} entries created before authentication`);
        pendingEntries.forEach(([entryId, queueItem]) => {
          this.syncQueue.set(entryId, queueItem);
        });

        // Trigger immediate sync for restored entries
        setTimeout(() => {
          console.log(`🚀 Triggering sync for restored entries`);
          this.syncPendingChanges();
        }, 100);
      }
    }
  }

  // Migrate old non-user-specific data
  private migrateOldData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if old keys exist
      const oldEntries = localStorage.getItem('journal_entries_cache');
      const oldDeleted = localStorage.getItem('journal_deleted_entries');
      
      if (oldEntries || oldDeleted) {
        console.log('🔄 Migrating old journal data to user-specific storage...');
        
        // Clear old data to prevent sharing between users
        localStorage.removeItem('journal_entries_cache');
        localStorage.removeItem('journal_deleted_entries');
        localStorage.removeItem('journal_entries_cache_backup');
        
        console.log('✅ Old shared journal data cleared for security');
      }
    } catch (error) {
      console.warn('Failed to migrate old journal data:', error);
    }
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
  async createEntryImmediately(date: string, _type: 'morning' | 'evening' | 'general' = 'general'): Promise<JournalEntry> {
    const now = new Date();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Mark entry creation as in progress to prevent race conditions
    this.entryCreationInProgress.add(tempId);

    try {
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
      this.syncQueue.set(tempId, { entry: newEntry, timestamp: Date.now(), retryCount: 0 });

      console.log(`✅ Entry created successfully: ${tempId}`);

      // Return immediately - no waiting
      return newEntry;
    } finally {
      // Clear the creation flag after a short delay to allow for any immediate updates
      setTimeout(() => {
        this.entryCreationInProgress.delete(tempId);
        console.log(`🧹 Cleared creation flag for: ${tempId}`);
      }, 200);
    }
  }

  // INSTANT ENTRY DELETION (immediate UI feedback)
  async deleteEntryImmediately(entryId: string): Promise<void> {
    console.log(`🗑️ Deleting entry immediately: ${entryId}`);

    // Add to deleted entries list to prevent reappearing from database sync
    this.addToDeletedEntries(entryId);
    console.log(`✅ Added to deleted entries list: ${entryId}`);

    // Remove from localStorage immediately
    this.removeFromLocalStorage(entryId);
    console.log(`✅ Removed from localStorage: ${entryId}`);

    // Remove from sync queue (important for temp entries)
    this.syncQueue.delete(entryId);
    console.log(`✅ Removed from sync queue: ${entryId}`);

    // Only attempt database deletion for non-temporary entries
    if (this.isOnline && !entryId.startsWith('temp-')) {
      console.log(`🔄 Attempting database deletion for: ${entryId}`);
      this.deleteFromDatabase(entryId).then(() => {
        // Remove from deleted entries list after successful database deletion
        this.removeFromDeletedEntries(entryId);
        console.log(`✅ Database deletion successful, removed from deleted list: ${entryId}`);
      }).catch(error => {
        console.warn(`❌ Database deletion failed for ${entryId}:`, error);
        // Keep in deleted entries list to prevent reappearing
      });
    } else if (entryId.startsWith('temp-')) {
      console.log(`⚡ Skipping database deletion for temporary entry: ${entryId}`);
      // For temp entries, we can remove from deleted list immediately since they don't exist in database
      setTimeout(() => {
        this.removeFromDeletedEntries(entryId);
      }, 5000); // Keep for 5 seconds to prevent any race conditions
    }

    console.log(`✅ Entry deletion completed: ${entryId}`);
  }

  // REAL-TIME AUTO-SAVE (as users type)
  async updateEntryImmediately(entryId: string, blocks: JournalBlock[]): Promise<void> {
    const now = new Date();
    const totalChars = blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);

    console.log(`💾 updateEntryImmediately called: ${entryId}, ${blocks.length} blocks, ${totalChars} chars`);

    // Log content state before processing
    this.logContentState(entryId, blocks, 'INPUT');

    // Mark entry as actively being edited to protect from sync overwrites
    this.markAsActivelyEdited(entryId);

    // CRITICAL FIX: Only update existing entries, NEVER create new ones
    // New entries should ONLY be created through createEntryImmediately
    let entry = this.getFromLocalStorage(entryId);
    if (!entry) {
      // Check if entry creation is in progress (race condition handling)
      if (this.entryCreationInProgress.has(entryId)) {
        console.log(`⏳ Entry creation in progress for ${entryId}, waiting briefly...`);
        // Wait a short time for the creation to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        entry = this.getFromLocalStorage(entryId);
      }

      if (!entry) {
        console.error(`🚨 CRITICAL ERROR: Entry ${entryId} not found in localStorage!`);
        console.error(`🚨 updateEntryImmediately should only be called on existing entries.`);
        console.error(`🚨 Use createEntryImmediately to create new entries first.`);
        console.error(`🚨 Available entries:`, this.getAllFromLocalStorage().map(e => e.id));
        console.error(`🚨 Entry creation in progress:`, Array.from(this.entryCreationInProgress));

        // Throw an error to prevent silent failures and help debug the issue
        throw new Error(`Entry ${entryId} not found. Entries must be created with createEntryImmediately before updating.`);
      }
    }

    console.log(`📝 Updating existing entry: ${entryId}, previous blocks: ${entry.blocks.length}`);
    // Log previous state for comparison
    this.logContentState(entryId, entry.blocks, 'PREVIOUS');

    // Update entry immediately
    const updatedEntry: JournalEntry = {
      ...entry,
      blocks,
      updatedAt: now
    };

    // CRITICAL: Multiple save attempts with verification
    let saveAttempts = 0;
    const maxSaveAttempts = 3;
    let saveSuccessful = false;

    while (saveAttempts < maxSaveAttempts && !saveSuccessful) {
      saveAttempts++;
      console.log(`💾 Save attempt ${saveAttempts}/${maxSaveAttempts} for ${entryId}`);

      // Save to localStorage immediately (no delay)
      this.saveToLocalStorage(updatedEntry);

      // Immediate verification
      const verifyEntry = this.getFromLocalStorage(entryId);
      if (verifyEntry) {
        const verifyChars = verifyEntry.blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);
        console.log(`🔍 Verification attempt ${saveAttempts}: ${entryId} has ${verifyEntry.blocks.length} blocks, ${verifyChars} chars`);

        if (verifyChars === totalChars && verifyEntry.blocks.length === blocks.length) {
          saveSuccessful = true;
          console.log(`✅ Save verified successfully on attempt ${saveAttempts}: ${entryId}`);
          this.logContentState(entryId, verifyEntry.blocks, 'SAVED');
        } else {
          console.error(`🚨 SAVE VERIFICATION FAILED (attempt ${saveAttempts}): Expected ${totalChars} chars/${blocks.length} blocks, got ${verifyChars} chars/${verifyEntry.blocks.length} blocks`);

          if (saveAttempts < maxSaveAttempts) {
            // Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      } else {
        console.error(`🚨 SAVE FAILED (attempt ${saveAttempts}): Could not retrieve entry ${entryId} after saving`);
      }
    }

    if (!saveSuccessful) {
      console.error(`🚨 CRITICAL: Failed to save ${entryId} after ${maxSaveAttempts} attempts!`);
      throw new Error(`Failed to save entry ${entryId} - content may be lost`);
    }

    // Final integrity check
    this.verifyContentIntegrity(entryId, blocks);

    // Clear entry creation tracking since save was successful
    this.entryCreationInProgress.delete(entryId);

    // Add to sync queue for background database update
    this.syncQueue.set(entryId, { entry: updatedEntry, timestamp: Date.now(), retryCount: 0 });

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

  // Get all entries with database-first loading for authenticated users
  async getAllEntries(): Promise<JournalEntry[]> {
    // Get from localStorage first for instant access
    let localEntries = this.getAllFromLocalStorage();

    // Remove duplicates based on ID (keep the most recent one)
    localEntries = this.removeDuplicateEntries(localEntries);

    // For authenticated users, ensure we load from database on first access
    if (this.isOnline && this.userId) {
      try {
        console.log(`🔄 Loading entries from database for user: ${this.userId}`);
        await this.syncFromDatabase();

        // Get updated entries after sync
        localEntries = this.getAllFromLocalStorage();
        localEntries = this.removeDuplicateEntries(localEntries);
        console.log(`✅ Loaded ${localEntries.length} entries from database`);
      } catch (error) {
        console.warn('Database sync failed, using localStorage only:', error);
      }
    } else if (!this.userId) {
      console.log('📝 No user authenticated, using localStorage only');
    }

    return localEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Remove duplicate entries (keep the most recent one for each ID)
  private removeDuplicateEntries(entries: JournalEntry[]): JournalEntry[] {
    const uniqueEntries = new Map<string, JournalEntry>();

    entries.forEach(entry => {
      const existing = uniqueEntries.get(entry.id);
      if (!existing || new Date(entry.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        uniqueEntries.set(entry.id, entry);
      }
    });

    const deduplicatedEntries = Array.from(uniqueEntries.values());

    // If we removed duplicates, update localStorage
    if (deduplicatedEntries.length < entries.length) {
      console.log(`🧹 Removed ${entries.length - deduplicatedEntries.length} duplicate entries by ID`);
      localStorage.setItem(this.localStorageKey, JSON.stringify(deduplicatedEntries));
    }

    // Also remove entries with very similar content (likely duplicates from the bug)
    const contentDeduplicatedEntries = this.removeSimilarContentEntries(deduplicatedEntries);

    return contentDeduplicatedEntries;
  }

  // Remove entries with very similar content (likely duplicates from the bug)
  private removeSimilarContentEntries(entries: JournalEntry[]): JournalEntry[] {
    const contentGroups = new Map<string, JournalEntry[]>();

    // Group entries by similar content
    entries.forEach(entry => {
      const text = entry.blocks[0]?.text?.trim().toLowerCase() || '';
      if (text.length > 0) {
        if (!contentGroups.has(text)) {
          contentGroups.set(text, []);
        }
        contentGroups.get(text)!.push(entry);
      }
    });

    const cleanedEntries: JournalEntry[] = [];
    let duplicatesRemoved = 0;

    // For each content group, keep only the most recent entry
    contentGroups.forEach((groupEntries, content) => {
      if (groupEntries.length > 1) {
        // Sort by updatedAt and keep the most recent
        groupEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        cleanedEntries.push(groupEntries[0]);
        duplicatesRemoved += groupEntries.length - 1;
        console.log(`🧹 Removed ${groupEntries.length - 1} duplicate entries with content: "${content.substring(0, 30)}..."`);
      } else {
        cleanedEntries.push(groupEntries[0]);
      }
    });

    // Add entries with empty content (don't deduplicate empty entries)
    entries.forEach(entry => {
      const text = entry.blocks[0]?.text?.trim() || '';
      if (text.length === 0) {
        cleanedEntries.push(entry);
      }
    });

    if (duplicatesRemoved > 0) {
      console.log(`🧹 Removed ${duplicatesRemoved} duplicate entries by content similarity`);
      localStorage.setItem(this.localStorageKey, JSON.stringify(cleanedEntries));
    }

    return cleanedEntries;
  }

  // Local storage operations with backup mechanism
  private saveToLocalStorage(entry: JournalEntry): void {
    if (typeof window === 'undefined') return;

    const backupKey = `${this.localStorageKey}_backup`;

    try {
      // Get current entries
      const entries = this.getAllFromLocalStorage();
      const existingIndex = entries.findIndex(e => e.id === entry.id);

      // Create backup before modifying
      try {
        localStorage.setItem(backupKey, JSON.stringify(entries));
      } catch (backupError) {
        console.warn('Backup creation failed:', backupError);
      }

      // Update entries
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      // Primary save attempt
      localStorage.setItem(this.localStorageKey, JSON.stringify(entries));

      // Verify the save immediately
      const verification = localStorage.getItem(this.localStorageKey);
      if (!verification) {
        throw new Error('Save verification failed - no data found');
      }

      const parsedVerification = JSON.parse(verification);
      const savedEntry = parsedVerification.find((e: JournalEntry) => e.id === entry.id);
      if (!savedEntry) {
        throw new Error('Save verification failed - entry not found');
      }

      const expectedChars = entry.blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);
      const savedChars = savedEntry.blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);

      if (savedChars !== expectedChars) {
        throw new Error(`Save verification failed - character count mismatch: expected ${expectedChars}, got ${savedChars}`);
      }

      console.log(`✅ localStorage save verified: ${entry.id}, ${savedChars} chars`);

    } catch (error) {
      console.error('🚨 CRITICAL: LocalStorage save failed:', error);

      // Attempt recovery from backup
      try {
        const backupData = localStorage.getItem(backupKey);
        if (backupData) {
          const backupEntries = JSON.parse(backupData);
          console.log('🔄 Attempting recovery from backup...');

          // Try to save again with backup data + new entry
          const existingIndex = backupEntries.findIndex((e: JournalEntry) => e.id === entry.id);
          if (existingIndex >= 0) {
            backupEntries[existingIndex] = entry;
          } else {
            backupEntries.push(entry);
          }

          localStorage.setItem(this.localStorageKey, JSON.stringify(backupEntries));
          console.log('✅ Recovery successful');
        }
      } catch (recoveryError) {
        console.error('🚨 CRITICAL: Recovery failed:', recoveryError);
        throw new Error(`Failed to save entry ${entry.id}: ${error.message}`);
      }
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

  // Background sync operations with retry logic
  private async syncEntry(entryId: string): Promise<void> {
    const queueItem = this.syncQueue.get(entryId);
    if (!queueItem) return;

    // Check if we have a valid user context before attempting sync
    if (!this.userId) {
      console.warn(`⚠️ Skipping sync for ${entryId} - no user context (will retry when auth available)`);
      // Don't remove from queue - keep for retry when auth becomes available
      return;
    }

    try {
      const { entry } = queueItem;

      if (entry.id.startsWith('temp-')) {
        // Check if the temp entry was deleted while syncing
        if (this.isEntryDeleted(entryId)) {
          console.log(`🗑️ Temp entry ${entryId} was deleted during sync, skipping database creation`);
          this.syncQueue.delete(entryId);
          return;
        }

        // CRITICAL: Check if a similar entry already exists in database to prevent duplicates
        const existingEntries = await this.getAllFromDatabase();
        const duplicateEntry = existingEntries?.find(dbEntry =>
          dbEntry.entry_date === entry.date &&
          Math.abs(new Date(dbEntry.created_at).getTime() - entry.createdAt.getTime()) < 5000 // Within 5 seconds
        );

        if (duplicateEntry) {
          console.log(`🚫 Duplicate entry detected in database, skipping creation: ${entryId}`);
          // Remove the temp entry and use the existing database entry
          this.removeFromLocalStorage(entryId);
          const convertedEntry = this.convertSupabaseToEntry(duplicateEntry);
          this.saveToLocalStorage(convertedEntry);
          this.syncQueue.delete(entryId);
          return;
        }

        // Create new entry in database
        const supabaseEntry = await this.createInDatabase(entry);

        // Check again if entry was deleted after database creation
        if (this.isEntryDeleted(entryId)) {
          console.log(`🗑️ Temp entry ${entryId} was deleted after database creation, deleting from database`);
          this.deleteFromDatabase(supabaseEntry.id).catch(error => {
            console.warn(`Failed to delete newly created entry ${supabaseEntry.id}:`, error);
          });
          this.syncQueue.delete(entryId);
          return;
        }

        // Remove the old temp entry from localStorage
        this.removeFromLocalStorage(entryId);

        // Add the new entry with permanent ID to localStorage
        const updatedEntry = { ...entry, id: supabaseEntry.id };
        this.saveToLocalStorage(updatedEntry);

        // Remove from sync queue
        this.syncQueue.delete(entryId);
        console.log(`✅ Successfully synced new entry ${entryId} -> ${supabaseEntry.id}`);
      } else {
        // Update existing entry
        await this.updateInDatabase(entry);
        this.syncQueue.delete(entryId);
        console.log(`✅ Successfully synced updated entry ${entryId}`);
      }
    } catch (error) {
      const { retryCount } = queueItem;
      console.warn(`❌ Sync failed for entry ${entryId} (attempt ${retryCount + 1}):`, error);

      if (retryCount < this.maxRetries) {
        // Increment retry count and keep in queue
        this.syncQueue.set(entryId, {
          ...queueItem,
          retryCount: retryCount + 1,
          timestamp: Date.now() + (this.retryDelay * Math.pow(2, retryCount)) // Exponential backoff
        });
        console.log(`🔄 Will retry sync for entry ${entryId} in ${this.retryDelay * Math.pow(2, retryCount)}ms`);
      } else {
        // Max retries reached, remove from queue but keep in localStorage
        this.syncQueue.delete(entryId);
        console.error(`💥 Max retries reached for entry ${entryId}, giving up sync`);
      }
    }
  }

  private async syncPendingChanges(): Promise<void> {
    const promises = Array.from(this.syncQueue.keys()).map(entryId =>
      this.syncEntry(entryId)
    );

    await Promise.allSettled(promises);
  }

  // Public method to get sync status
  public getSyncStatus(): { pending: number; hasErrors: boolean; isOnline: boolean } {
    const pending = this.syncQueue.size;
    const hasErrors = Array.from(this.syncQueue.values()).some(item => item.retryCount >= this.maxRetries);

    return {
      pending,
      hasErrors,
      isOnline: this.isOnline
    };
  }

  // Public method to force sync
  public async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.syncPendingChanges();
  }

  // Public method to retry sync for entries that failed due to missing auth
  public async retryAuthSync(): Promise<void> {
    if (!this.userId) {
      console.warn('Cannot retry auth sync - no user context available');
      return;
    }

    // Check for orphaned temporary entries in localStorage that aren't in sync queue
    const localEntries = this.getAllFromLocalStorage();
    const tempEntries = localEntries.filter(entry => entry.id.startsWith('temp-'));

    tempEntries.forEach(entry => {
      if (!this.syncQueue.has(entry.id)) {
        console.log(`🔄 Found orphaned temp entry, adding to sync queue: ${entry.id}`);
        this.syncQueue.set(entry.id, {
          entry,
          timestamp: Date.now(),
          retryCount: 0
        });
      }
    });

    const pendingCount = this.syncQueue.size;
    if (pendingCount > 0) {
      console.log(`🔄 Retrying sync for ${pendingCount} entries after authentication`);
      await this.syncPendingChanges();
    }
  }

  // Public method to check if entry exists (for debugging)
  public entryExists(entryId: string): boolean {
    const entries = this.getAllFromLocalStorage();
    return entries.some(entry => entry.id === entryId);
  }

  // Deleted entries management
  private addToDeletedEntries(entryId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const deletedEntries = this.getDeletedEntries();
      deletedEntries.add(entryId);
      localStorage.setItem(this.deletedEntriesKey, JSON.stringify(Array.from(deletedEntries)));
    } catch (error) {
      console.warn('Failed to add to deleted entries:', error);
    }
  }

  private removeFromDeletedEntries(entryId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const deletedEntries = this.getDeletedEntries();
      deletedEntries.delete(entryId);
      localStorage.setItem(this.deletedEntriesKey, JSON.stringify(Array.from(deletedEntries)));
    } catch (error) {
      console.warn('Failed to remove from deleted entries:', error);
    }
  }

  private getDeletedEntries(): Set<string> {
    if (typeof window === 'undefined') return new Set();

    try {
      const stored = localStorage.getItem(this.deletedEntriesKey);
      if (stored) {
        const deletedArray = JSON.parse(stored) as string[];
        return new Set(deletedArray);
      }
    } catch (error) {
      console.warn('Failed to get deleted entries:', error);
    }

    return new Set();
  }

  private isEntryDeleted(entryId: string): boolean {
    const deletedEntries = this.getDeletedEntries();
    return deletedEntries.has(entryId);
  }

  // Active editing protection
  private markAsActivelyEdited(entryId: string): void {
    this.activelyEditedEntries.set(entryId, Date.now());
    console.log(`📝 Marked entry as actively edited: ${entryId}`);
  }

  private isActivelyEdited(entryId: string): boolean {
    const lastEditTime = this.activelyEditedEntries.get(entryId);
    if (!lastEditTime) return false;

    const timeSinceEdit = Date.now() - lastEditTime;
    const isActive = timeSinceEdit < this.editProtectionWindow;

    if (!isActive) {
      // Clean up old entries
      this.activelyEditedEntries.delete(entryId);
    }

    return isActive;
  }

  private clearActiveEdit(entryId: string): void {
    this.activelyEditedEntries.delete(entryId);
    console.log(`📝 Cleared active edit protection: ${entryId}`);
  }

  // Content integrity monitoring
  private logContentState(entryId: string, blocks: JournalBlock[], operation: string): void {
    const charCount = blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);
    const blockCount = blocks.length;
    const timestamp = Date.now();

    // Initialize log for entry if it doesn't exist
    if (!this.contentIntegrityLog.has(entryId)) {
      this.contentIntegrityLog.set(entryId, []);
    }

    const log = this.contentIntegrityLog.get(entryId)!;
    log.push({ timestamp, charCount, blockCount });

    // Keep only last 20 entries to prevent memory bloat
    if (log.length > 20) {
      log.splice(0, log.length - 20);
    }

    console.log(`📊 Content integrity log [${operation}]: ${entryId} - ${blockCount} blocks, ${charCount} chars`);

    // Check for content loss
    if (log.length > 1) {
      const previous = log[log.length - 2];
      const current = log[log.length - 1];

      if (current.charCount < previous.charCount - 10) { // Allow for minor variations
        console.error(`🚨 CONTENT LOSS DETECTED: ${entryId} lost ${previous.charCount - current.charCount} characters!`);
        console.error(`🚨 Previous: ${previous.charCount} chars, Current: ${current.charCount} chars`);
        console.error(`🚨 Time difference: ${current.timestamp - previous.timestamp}ms`);
      }
    }
  }

  private verifyContentIntegrity(entryId: string, expectedBlocks: JournalBlock[]): boolean {
    const savedEntry = this.getFromLocalStorage(entryId);
    if (!savedEntry) {
      console.error(`🚨 INTEGRITY FAIL: Entry ${entryId} not found in localStorage`);
      return false;
    }

    const expectedChars = expectedBlocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);
    const savedChars = savedEntry.blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);

    if (expectedChars !== savedChars) {
      console.error(`🚨 INTEGRITY FAIL: ${entryId} - Expected ${expectedChars} chars, saved ${savedChars} chars`);
      return false;
    }

    console.log(`✅ INTEGRITY PASS: ${entryId} - ${savedChars} chars verified`);
    return true;
  }

  // Database operations
  private async createInDatabase(entry: JournalEntry): Promise<JournalEntryResponse> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ Database create failed: User not authenticated');
      throw new Error('User not authenticated - cannot save to database');
    }

    // Validate that the manager's userId matches the authenticated user
    if (this.userId && this.userId !== user.id) {
      console.error(`❌ User ID mismatch: manager has ${this.userId}, auth has ${user.id}`);
      throw new Error('User ID mismatch - please refresh and try again');
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

    console.log(`💾 Creating entry in database for user ${user.id}, date ${entry.date}`);

    const { data: supabaseEntry, error } = await supabase
      .from('journal_entries')
      .insert(entryData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);

      // Handle specific constraint violations
      if (error.code === '23505') { // Unique constraint violation
        console.warn('⚠️ Unique constraint violation - entry may already exist');
        throw new Error(`Entry already exists for this date: ${error.message}`);
      }

      throw new Error(`Failed to create journal entry: ${error.message}`);
    }

    console.log(`✅ Entry created in database with ID: ${supabaseEntry.id}`);
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

  private async getAllFromDatabase(): Promise<JournalEntryResponse[]> {
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

    return (entries || []) as JournalEntryResponse[];
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
    const dbEntries = (entries || []).map(entry => this.convertSupabaseToEntry(entry as JournalEntryResponse));

    // Filter out entries that have been deleted locally
    const nonDeletedDbEntries = dbEntries.filter(entry => !this.isEntryDeleted(entry.id));
    console.log(`🔄 Syncing ${nonDeletedDbEntries.length} entries from database (filtered out ${dbEntries.length - nonDeletedDbEntries.length} deleted entries)`);

    // Merge and deduplicate, but protect actively edited entries
    const mergedEntries = [...localEntries];
    nonDeletedDbEntries.forEach(dbEntry => {
      const existingIndex = mergedEntries.findIndex(e => e.id === dbEntry.id);

      if (existingIndex >= 0) {
        // Don't overwrite actively edited entries
        if (this.isActivelyEdited(dbEntry.id)) {
          console.log(`🔒 Protecting actively edited entry from sync overwrite: ${dbEntry.id}`);
          return;
        }

        // Only update if database entry is newer
        const localUpdatedAt = new Date(mergedEntries[existingIndex].updatedAt).getTime();
        const dbUpdatedAt = new Date(dbEntry.updatedAt).getTime();

        if (dbUpdatedAt > localUpdatedAt) {
          mergedEntries[existingIndex] = dbEntry;
          console.log(`📥 Updated entry from database: ${dbEntry.id}`);
        }
      } else {
        mergedEntries.push(dbEntry);
        console.log(`📥 Added database entry to localStorage: ${dbEntry.id}`);
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

// Export the manager getter for direct access
// Note: This returns the anonymous instance. For user-specific access, 
// call RealTimeJournalManager.getInstance(userId) with the current user's ID
export const getJournalManager = (userId?: string | null) => RealTimeJournalManager.getInstance(userId);

// Legacy export for backward compatibility - will use anonymous instance
export const journalManager = RealTimeJournalManager.getInstance();