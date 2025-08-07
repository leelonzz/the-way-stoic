import { supabase } from '@/integrations/supabase/client';
import type { JournalEntry, JournalBlock } from '@/components/journal/types';
import { FastSyncManager } from './fastSync';

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

// Real-time journal manager with optimized sync
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
  private updateMutex: Map<string, Promise<void>> = new Map(); // Mutex for preventing concurrent updates
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second
  private editProtectionWindow = 10000; // 10 seconds protection window

  // Fast sync manager for optimized real-time editing
  private fastSyncManager: FastSyncManager | null = null;
  private useFastSync = true; // Enable fast sync by default
  private creationMutex: Set<string> = new Set();
  private metrics = { totalSaves: 0 }; // Track save count for logging
  private lastCleanup: number = 0; // Track when we last cleaned up deleted entries

  private constructor(userId: string | null = null) {
    this.userId = userId;
    this.updateStorageKeys();

    // Initialize fast sync manager for optimized performance
    if (this.useFastSync) {
      try {
        this.fastSyncManager = new FastSyncManager(userId);
      } catch (error) {
        this.useFastSync = false;
      }
    }

    // Only setup network listeners on client side
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners();
      this.startBackgroundSync();
      this.migrateOldData();
      // Validate deleted entries integrity on initialization
      this.validateDeletedEntriesIntegrity();
    }
  }

  static getInstance(userId?: string | null): RealTimeJournalManager {
    // Always require explicit userId - no anonymous fallback for journal entries

    const key = userId || 'anonymous';

    if (!RealTimeJournalManager.instances.has(key)) {
      RealTimeJournalManager.instances.set(key, new RealTimeJournalManager(userId || null));
    }

    const instance = RealTimeJournalManager.instances.get(key)!;

    // Ensure the instance has the correct userId
    if (userId && instance.userId !== userId) {
      instance.setUserId(userId);
    }

    return instance;
  }

  // Validate user context before critical operations
  private validateUserContext(operation: string): void {
    if (!this.userId) {
      console.error(`❌ ${operation} attempted without user context - this will cause data loss!`);
      throw new Error(`Cannot ${operation} without authenticated user context. Please ensure user is logged in.`);
    }
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

      // Log user context change for debugging
      console.log(`🔄 User context change: ${previousUserId || 'anonymous'} → ${userId || 'anonymous'}`);

      // Preserve deleted entries across user context changes
      let preservedDeletedEntries: Record<string, number> = {};
      if (previousUserId && userId) {
        // When switching between authenticated users, preserve deleted entries
        preservedDeletedEntries = this.getDeletedEntriesWithTimestamps();
        console.log(`💾 Preserving ${Object.keys(preservedDeletedEntries).length} deleted entries across user switch`);
      }

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

      // Restore preserved deleted entries after storage key update
      if (Object.keys(preservedDeletedEntries).length > 0) {
        try {
          localStorage.setItem(this.deletedEntriesKey, JSON.stringify(preservedDeletedEntries));
          console.log(`✅ Restored ${Object.keys(preservedDeletedEntries).length} deleted entries for new user context`);
        } catch (error) {
          console.warn('Failed to restore deleted entries:', error);
        }
      }

      // Update fast sync manager with new userId
      if (this.fastSyncManager) {
        this.fastSyncManager.setUserId(userId);
      }

      // Migrate data if needed
      if (typeof window !== 'undefined') {
        this.migrateOldData();
      }

      // Restore and retry sync for entries created before authentication
      if (userId && !previousUserId && pendingEntries.length > 0) {
        pendingEntries.forEach(([entryId, queueItem]) => {
          this.syncQueue.set(entryId, queueItem);
        });

        // Trigger immediate sync for restored entries
        setTimeout(() => {
          this.syncPendingChanges();
        }, 100);
      }
    }
  }

  // Migrate old non-user-specific data and anonymous entries
  private migrateOldData(): void {
    if (typeof window === 'undefined') return;

    try {
      // Check if old keys exist
      const oldEntries = localStorage.getItem('journal_entries_cache');
      const oldDeleted = localStorage.getItem('journal_deleted_entries');

      if (oldEntries || oldDeleted) {
        // Clear old data to prevent sharing between users
        localStorage.removeItem('journal_entries_cache');
        localStorage.removeItem('journal_deleted_entries');
        localStorage.removeItem('journal_entries_cache_backup');
      }

      // Migrate anonymous entries to user-specific storage when user logs in
      if (this.userId) {
        const anonymousEntries = localStorage.getItem('journal_entries_cache_anonymous');
        const anonymousDeleted = localStorage.getItem('journal_deleted_entries_anonymous');

        if (anonymousEntries) {
          // Parse anonymous entries
          try {
            const entries = JSON.parse(anonymousEntries) as JournalEntry[];
            const currentUserEntries = this.getAllFromLocalStorage();

            // Merge anonymous entries with user entries, avoiding duplicates
            const mergedEntries = [...currentUserEntries];
            entries.forEach(anonymousEntry => {
              const exists = mergedEntries.some(userEntry =>
                userEntry.date === anonymousEntry.date &&
                Math.abs(new Date(userEntry.createdAt).getTime() - new Date(anonymousEntry.createdAt).getTime()) < 60000 // Within 1 minute
              );

              if (!exists) {
                mergedEntries.push(anonymousEntry);
              }
            });

            // Save merged entries to user-specific storage
            localStorage.setItem(this.localStorageKey, JSON.stringify(mergedEntries));

            // Clear anonymous storage after successful migration
            localStorage.removeItem('journal_entries_cache_anonymous');
          } catch (parseError) {
            console.warn('Failed to parse anonymous entries for migration:', parseError);
          }
        }

        if (anonymousDeleted) {
          try {
            const deletedEntries = JSON.parse(anonymousDeleted) as string[];
            const currentDeleted = this.getDeletedEntries();

            // Merge deleted entries
            const mergedDeleted = new Set([...currentDeleted, ...deletedEntries]);
            localStorage.setItem(this.deletedEntriesKey, JSON.stringify([...mergedDeleted]));

            // Clear anonymous deleted entries
            localStorage.removeItem('journal_deleted_entries_anonymous');
          } catch (parseError) {
            console.warn('Failed to parse anonymous deleted entries for migration:', parseError);
          }
        }
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
    
    // Skip immediate cleanup on startup to preserve recently deleted entries
    // The periodic cleanup will handle truly old entries (>24h)
    
    // Sync every 5 seconds in background
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.size > 0) {
        this.syncPendingChanges();
      }
      
      // Clean up old deleted entries every 30 minutes (less aggressive cleanup)
      const now = Date.now();
      if (!this.lastCleanup || (now - this.lastCleanup > 30 * 60 * 1000)) {
        this.cleanupOldDeletedEntries();
        this.lastCleanup = now;
      }
    }, 5000);
  }

  // INSTANT ENTRY CREATION (0ms delay) - FIXED: No async delays, atomic creation
  createEntryImmediately(date: string, _type: 'morning' | 'evening' | 'general' = 'general'): JournalEntry {
    // Validate user context for critical create operations
    this.validateUserContext('create journal entry');

    // Generate unique ID with microsecond precision to prevent duplicates
    const now = new Date();
    const microTime = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const tempId = `temp-${microTime}-${Math.random().toString(36).substring(2, 11)}`;

    // CRITICAL: Check if creation is already in progress using stronger mutex
    if (this.creationMutex.size > 0) {
      // Return most recent entry instead of creating duplicate
      const existingEntries = this.getAllFromLocalStorage();
      if (existingEntries.length > 0) {
        const mostRecent = existingEntries.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        return mostRecent;
      }
    }

    // Add to mutex BEFORE any operations
    this.creationMutex.add(tempId);

    try {
      // Mark entry creation as in progress immediately
      this.entryCreationInProgress.add(tempId);

      // Create entry object
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

      // ATOMIC: Save to localStorage immediately - no delays
      this.saveToLocalStorage(newEntry);

      // Verify save was successful immediately
      const verifyEntry = this.getFromLocalStorage(tempId);
      if (!verifyEntry) {
        throw new Error(`Entry creation failed - not found in localStorage after save`);
      }

      // Add to sync queue for background database creation
      this.syncQueue.set(tempId, { entry: newEntry, timestamp: Date.now(), retryCount: 0 });

      return newEntry;

    } catch (error) {
      console.error(`🚨 Entry creation failed: ${tempId}`, error);
      throw error;
    } finally {
      // Clear mutex immediately after creation
      this.creationMutex.delete(tempId);
      
      // Clear creation flag after brief delay for any pending saves
      setTimeout(() => {
        this.entryCreationInProgress.delete(tempId);
      }, 100); // Reduced from 500ms to 100ms
    }
  }

  // INSTANT ENTRY DELETION (immediate UI feedback)
  async deleteEntryImmediately(entryId: string): Promise<void> {

    // Validate user context before deletion
    this.validateUserContext('delete journal entry');

    // DEBUG: Check if entry exists before deletion
    const entriesBeforeDeletion = this.getAllFromLocalStorageUnfiltered();
    const entryExists = entriesBeforeDeletion.some(e => e.id === entryId);

    // Add to deleted entries list with timestamp to prevent reappearing from database sync
    this.addToDeletedEntries(entryId);
    console.log(`✅ DELETION STEP 1: Added to deleted entries list: ${entryId} (user: ${this.userId})`);

    // Remove from localStorage immediately
    this.removeFromLocalStorage(entryId);
    console.log(`✅ DELETION STEP 2: Removed from localStorage: ${entryId}`);

    // DEBUG: Verify removal
    const entriesAfterDeletion = this.getAllFromLocalStorageUnfiltered();
    const entryStillExists = entriesAfterDeletion.some(e => e.id === entryId);
    console.log(`🔍 DELETION VERIFY: Entry ${entryId} still exists after removal: ${entryStillExists} (${entriesAfterDeletion.length} total entries)`);

    // Remove from sync queue (important for temp entries)
    this.syncQueue.delete(entryId);
    console.log(`✅ DELETION STEP 3: Removed from sync queue: ${entryId}`);

    // Only attempt database deletion for non-temporary entries
    if (this.isOnline && !entryId.startsWith('temp-')) {
      console.log(`🔄 Attempting database deletion for: ${entryId}`);
      try {
        await this.deleteFromDatabase(entryId);
        console.log(`✅ Database deletion successful: ${entryId}`);
        // Keep in deleted entries list for 7 days to handle database replication delays
        // The cleanup will happen automatically via cleanupOldDeletedEntries
      } catch (error) {
        console.warn(`❌ Database deletion failed for ${entryId}:`, error);
        // Keep in deleted entries list to prevent reappearing
        console.log(`🛡️ Entry ${entryId} will remain in deleted list to prevent reappearing from database sync`);
      }
    } else if (entryId.startsWith('temp-')) {
      console.log(`⚡ Skipping database deletion for temporary entry: ${entryId}`);
      // For temp entries, keep in deleted list briefly to prevent race conditions
    }

    // Verify deletion was properly recorded
    const isStillDeleted = this.isEntryDeleted(entryId);
    if (!isStillDeleted) {
      console.error(`❌ CRITICAL: Entry ${entryId} not found in deleted list after deletion!`);
      // Re-add to deleted entries as a safety measure
      this.addToDeletedEntries(entryId);
    }

    console.log(`✅ Entry deletion completed: ${entryId} (deleted status: ${isStillDeleted})`);
  }

  // INSTANT SAVE (Google Docs style) - no blocking, no mutex
  async updateEntryImmediately(entryId: string, blocks: JournalBlock[]): Promise<void> {
    // Validate user context for critical save operations
    this.validateUserContext('save journal entry');

    // Simple immediate save without blocking
    await this.performSimpleUpdate(entryId, blocks);
  }

  // Simple update method without mutex or complex verification
  private async performSimpleUpdate(entryId: string, blocks: JournalBlock[]): Promise<void> {
    const now = new Date();

    // Get entry from localStorage
    let entry = this.getFromLocalStorage(entryId);
    if (!entry) {
      throw new Error(`Entry ${entryId} not found`);
    }

    // Update entry
    const updatedEntry: JournalEntry = {
      ...entry,
      blocks,
      updatedAt: now
    };

    // Save to localStorage immediately
    this.saveToLocalStorage(updatedEntry);

    // Add to sync queue for background database update (non-blocking)
    this.syncQueue.set(entryId, { entry: updatedEntry, timestamp: Date.now(), retryCount: 0 });
  }

  // Extracted update logic to separate method for mutex handling
  private async performUpdate(entryId: string, blocks: JournalBlock[]): Promise<void> {
    const now = new Date();
    const totalChars = blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);

    // Log content state in development only
    if (process.env.NODE_ENV === 'development' && (!this.useFastSync || !this.fastSyncManager)) {
      this.logContentState(entryId, blocks, 'INPUT');
    }

    // Mark entry as actively being edited to protect from sync overwrites
    this.markAsActivelyEdited(entryId);

    // CRITICAL FIX: Only update existing entries, NEVER create new ones
    // New entries should ONLY be created through createEntryImmediately
    let entry = this.getFromLocalStorage(entryId);
    if (!entry) {
      // Check if entry creation is in progress (race condition handling)
      if (this.entryCreationInProgress.has(entryId)) {
        // Wait a short time for the creation to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        entry = this.getFromLocalStorage(entryId);
      }

      if (!entry) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Entry ${entryId} not found in localStorage. Available entries:`, this.getAllFromLocalStorage().map(e => e.id));
        }
        throw new Error(`Entry ${entryId} not found. Entries must be created with createEntryImmediately before updating.`);
      }
    }

    // Log previous state for comparison
    this.logContentState(entryId, entry.blocks, 'PREVIOUS');

    // Update entry immediately
    const updatedEntry: JournalEntry = {
      ...entry,
      blocks,
      updatedAt: now
    };

    // Simplified save with basic verification
    this.saveToLocalStorage(updatedEntry);

    // Simple verification - only check if entry exists for fast sync
    if (this.useFastSync && this.fastSyncManager) {
      const verifyEntry = this.getFromLocalStorage(entryId);
      if (!verifyEntry) {
        // One retry attempt
        await new Promise(resolve => setTimeout(resolve, 10));
        this.saveToLocalStorage(updatedEntry);
        
        const retryVerifyEntry = this.getFromLocalStorage(entryId);
        if (!retryVerifyEntry) {
          throw new Error(`Failed to save entry ${entryId}`);
        }
      }
    }

    // Final integrity check only in development
    if (process.env.NODE_ENV === 'development') {
      this.verifyContentIntegrity(entryId, blocks);
    }

    // Clear entry creation tracking since save was successful
    this.entryCreationInProgress.delete(entryId);

    // Add to sync queue for background database update
    this.syncQueue.set(entryId, { entry: updatedEntry, timestamp: Date.now(), retryCount: 0 });
    if (process.env.NODE_ENV === 'development') {
      console.log('Added entry to sync queue. Queue size:', this.syncQueue.size);
    }

    // Trigger immediate sync for small changes
    if (blocks.length < 10) {
      console.log('🚀 Triggering immediate sync for small change');
      setTimeout(() => this.syncEntry(entryId), 100);
    } else {
      console.log('⏳ Large change - will sync in background');
    }
  }

  // FAST REAL-TIME UPDATE (optimized for performance)
  async updateEntryFast(entryId: string, blocks: JournalBlock[]): Promise<void> {
    // Use fast sync manager if available, otherwise fall back to regular method
    if (this.fastSyncManager && this.useFastSync) {
      try {
        // Increment save counter
        this.metrics.totalSaves++;
        
        // Reduce logging frequency to minimize performance impact
        if (this.metrics.totalSaves % 200 === 0) {
          console.log(`🚀 FastSync active: ${this.metrics.totalSaves} saves completed`);
        }
        await this.fastSyncManager.updateEntryFast(entryId, blocks);
        return;
      } catch (error) {
        console.warn('⚠️ Fast sync error (will retry without recovery):', error);
        // Don't attempt recovery - it's too slow and causes the degradation
        // Instead, just retry the FastSync operation once more
        try {
          await this.fastSyncManager.updateEntryFast(entryId, blocks);
          return;
        } catch (retryError) {
          // Only fall back to legacy sync if retry also fails
          console.warn('⚠️ Fast sync retry failed, using legacy sync for this save only');
        }
      }
    } else {
      console.log(`🐌 FastSync not available (manager: ${!!this.fastSyncManager}, enabled: ${this.useFastSync})`);
    }

    // Fallback to regular update method for this save only
    // Don't permanently disable FastSync
    return this.updateEntryImmediately(entryId, blocks);
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
        await this.syncFromDatabase();

        // Get updated entries after sync
        localEntries = this.getAllFromLocalStorage();
        localEntries = this.removeDuplicateEntries(localEntries);
      } catch (error) {
        console.warn('Database sync failed, using localStorage only:', error);
      }
    }

    return localEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // ENHANCED: Remove duplicate entries (keep the most recent one for each ID)
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
      localStorage.setItem(this.localStorageKey, JSON.stringify(deduplicatedEntries));
    }

    // ENHANCED: Remove timestamp-based duplicates (entries created within same second)
    const timestampDeduplicatedEntries = this.removeTimestampDuplicates(deduplicatedEntries);

    // Also remove entries with very similar content (likely duplicates from the bug)
    const contentDeduplicatedEntries = this.removeSimilarContentEntries(timestampDeduplicatedEntries);

    return contentDeduplicatedEntries;
  }

  // NEW: Remove entries created within the same second (likely rapid-click duplicates)
  private removeTimestampDuplicates(entries: JournalEntry[]): JournalEntry[] {
    const timestampGroups = new Map<number, JournalEntry[]>();

    // Group entries by creation timestamp (rounded to seconds)
    entries.forEach(entry => {
      const timestampSeconds = Math.floor(new Date(entry.createdAt).getTime() / 1000);
      if (!timestampGroups.has(timestampSeconds)) {
        timestampGroups.set(timestampSeconds, []);
      }
      timestampGroups.get(timestampSeconds)!.push(entry);
    });

    const cleanedEntries: JournalEntry[] = [];
    let duplicatesRemoved = 0;

    // For each timestamp group, keep only the most recent entry
    timestampGroups.forEach((groupEntries, timestamp) => {
      if (groupEntries.length > 1) {
        // Sort by creation time (microseconds) and keep the most recent
        groupEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        cleanedEntries.push(groupEntries[0]);
        duplicatesRemoved += groupEntries.length - 1;
      } else {
        cleanedEntries.push(groupEntries[0]);
      }
    });

    if (duplicatesRemoved > 0) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(cleanedEntries));
    }

    return cleanedEntries;
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
      localStorage.setItem(this.localStorageKey, JSON.stringify(cleanedEntries));
    }

    return cleanedEntries;
  }

  // ENHANCED: Local storage operations with comprehensive error recovery
  saveToLocalStorage(entry: JournalEntry): void {
    if (typeof window === 'undefined') return;

    const backupKey = `${this.localStorageKey}_backup`;
    const maxRetries = 3;
    let retryCount = 0;

    const attemptSave = (): void => {
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

        // Deep clone entry to prevent mutations during save
        const entryToSave: JournalEntry = {
          ...entry,
          blocks: entry.blocks.map(block => ({
            ...block,
            text: block.text ? String(block.text) : block.text,
            createdAt: new Date(block.createdAt)
          })),
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        };

        // Update entries
        if (existingIndex >= 0) {
          entries[existingIndex] = entryToSave;
        } else {
          entries.push(entryToSave);
        }

        // Primary save attempt with retry logic
        localStorage.setItem(this.localStorageKey, JSON.stringify(entries));

        // ENHANCED: Immediate verification with detailed checks
        const verification = localStorage.getItem(this.localStorageKey);
        if (!verification) {
          throw new Error('Save verification failed - no data found');
        }

        const parsedVerification = JSON.parse(verification);
        const savedEntry = parsedVerification.find((e: JournalEntry) => e.id === entry.id);
        if (!savedEntry) {
          throw new Error('Save verification failed - entry not found');
        }

        // Comprehensive content verification
        const expectedChars = entry.blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);
        const savedChars = savedEntry.blocks.reduce((sum, block) => sum + (block.text?.length || 0), 0);
        const expectedBlocks = entry.blocks.length;
        const savedBlocks = savedEntry.blocks.length;

        if (savedChars !== expectedChars || savedBlocks !== expectedBlocks) {
          throw new Error(`Save verification failed - content mismatch: expected ${expectedChars} chars/${expectedBlocks} blocks, got ${savedChars} chars/${savedBlocks} blocks`);
        }

        // Content integrity check
        const contentMatch = JSON.stringify(entry.blocks) === JSON.stringify(savedEntry.blocks);
        if (!contentMatch) {
          throw new Error('Save verification failed - block content mismatch');
        }

      } catch (error) {
        console.error(`🚨 Save attempt ${retryCount + 1} failed:`, error);

        // Retry logic
        if (retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`🔄 Retrying save (attempt ${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => attemptSave(), 100 * retryCount); // Exponential backoff
          return;
        }

        // Final failure - attempt recovery from backup
        console.error('🚨 CRITICAL: All save attempts failed, attempting recovery');
        this.attemptBackupRecovery(backupKey, entry);
        throw error;
      }
    };

    attemptSave();
  }

  // NEW: Backup recovery mechanism
  private attemptBackupRecovery(backupKey: string, failedEntry: JournalEntry): void {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (backupData) {
        const backupEntries = JSON.parse(backupData);
        console.log('🔄 Attempting recovery from backup...');

        // Try to save again with backup data + new entry
        const existingIndex = backupEntries.findIndex((e: JournalEntry) => e.id === failedEntry.id);
        if (existingIndex >= 0) {
          backupEntries[existingIndex] = failedEntry;
        } else {
          backupEntries.push(failedEntry);
        }

        localStorage.setItem(this.localStorageKey, JSON.stringify(backupEntries));
        console.log('✅ Recovery successful');
      } else {
        console.warn('🚨 No backup data available for recovery');
      }
    } catch (recoveryError) {
      console.error('🚨 CRITICAL: Recovery failed:', recoveryError);
      throw new Error(`Failed to save entry ${failedEntry.id} and recovery failed: ${recoveryError.message}`);
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
      const entries = data ? JSON.parse(data) : [];
      
      // Get deleted entries list for filtering
      const deletedEntries = this.getDeletedEntriesWithTimestamps();
      const deletedIds = Object.keys(deletedEntries);
      
      if (deletedIds.length > 0) {
      }
      
      // Filter out any entries that are marked as deleted (extra safety)
      const nonDeletedEntries = entries.filter((entry: JournalEntry) => {
        const isDeleted = this.isEntryDeleted(entry.id);
        if (isDeleted) {
          const deletedAt = deletedEntries[entry.id];
          const deletedTime = deletedAt ? new Date(deletedAt).toISOString() : 'unknown';
        }
        return !isDeleted;
      });
      
      return nonDeletedEntries;
    } catch (error) {
      console.warn('LocalStorage getAll failed:', error);
      return [];
    }
  }

  private getAllFromLocalStorageUnfiltered(): JournalEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.localStorageKey);
      const entries = data ? JSON.parse(data) : [];
      return entries;
    } catch (error) {
      console.error('Error reading unfiltered journal entries from localStorage:', error);
      return [];
    }
  }

  private removeFromLocalStorage(entryId: string): void {
    if (typeof window === 'undefined') return;

    try {
      // CRITICAL FIX: Use unfiltered entries to ensure we can actually remove deleted entries
      const entries = this.getAllFromLocalStorageUnfiltered();
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      const removedCount = entries.length - filteredEntries.length;

      localStorage.setItem(this.localStorageKey, JSON.stringify(filteredEntries));

      if (removedCount === 0) {
        console.warn(`⚠️ Entry ${entryId} was not found in localStorage for removal`);
      }
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
    }
  }

  // Background sync operations with retry logic
  private async syncEntry(entryId: string): Promise<void> {
    console.log('🔄 syncEntry called for:', entryId);
    const queueItem = this.syncQueue.get(entryId);
    if (!queueItem) {
      console.log('⚠️ No queue item found for:', entryId);
      return;
    }

    // Check if we have a valid user context before attempting sync
    if (!this.userId) {
      console.warn(`⚠️ Skipping sync for ${entryId} - no user context (will retry when auth available)`);
      // Don't remove from queue - keep for retry when auth becomes available
      return;
    }

    // Check network connectivity
    if (!this.isOnline) {
      console.log(`📱 Offline - queuing sync for ${entryId}`);
      return;
    }

    console.log('🚀 Starting database sync for:', entryId);
    try {
      const { entry } = queueItem;

      if (entry.id.startsWith('temp-')) {
        // Check if the temp entry was deleted while syncing
        if (this.isEntryDeleted(entryId)) {
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
      } else {
        // Update existing entry
        await this.updateInDatabase(entry);
        this.syncQueue.delete(entryId);
      }
    } catch (error) {
      const { retryCount } = queueItem;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log detailed error information
      console.error(`❌ Sync failed for entry ${entryId} (attempt ${retryCount + 1}/${this.maxRetries}):`, errorMessage);

      // Check if it's a network error vs authentication error
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout');
      const isAuthError = errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('403') || errorMessage.includes('401');

      if (retryCount < this.maxRetries && !isAuthError) {
        // Increment retry count and keep in queue with exponential backoff
        const backoffDelay = this.retryDelay * Math.pow(2, retryCount);
        const nextRetryTime = Date.now() + backoffDelay;
        
        console.log(`🔄 Will retry sync for ${entryId} in ${Math.round(backoffDelay / 1000)}s`);
        
        this.syncQueue.set(entryId, {
          ...queueItem,
          retryCount: retryCount + 1,
          timestamp: nextRetryTime
        });

        // For network errors, also mark as offline temporarily
        if (isNetworkError) {
          this.isOnline = false;
          // Re-check online status after delay
          setTimeout(() => {
            this.isOnline = navigator.onLine;
          }, backoffDelay);
        }
      } else {
        // Max retries reached or auth error - remove from queue but keep in localStorage
        console.error(`🚨 Giving up on sync for entry ${entryId} after ${retryCount + 1} attempts`);
        this.syncQueue.delete(entryId);
        
        // For auth errors, clear all pending syncs until re-auth
        if (isAuthError) {
          console.warn('🔐 Authentication error - clearing sync queue until re-auth');
          this.syncQueue.clear();
        }
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
  public getSyncStatus(): { pending: number; hasErrors: boolean; isOnline: boolean; queueEntries: string[] } {
    const pending = this.syncQueue.size;
    const hasErrors = Array.from(this.syncQueue.values()).some(item => item.retryCount >= this.maxRetries);

    return {
      pending,
      hasErrors,
      isOnline: this.isOnline,
      queueEntries: Array.from(this.syncQueue.keys())
    };
  }

  // Get sync queue size for debugging
  public getSyncQueueSize(): number {
    return this.syncQueue.size;
  }

  // Public method to force sync
  public async forcSync(): Promise<void> {
    console.log('🔄 Force sync requested. Queue size:', this.syncQueue.size);

    if (!this.isOnline) {
      console.error('❌ Cannot sync while offline');
      throw new Error('Cannot sync while offline');
    }

    if (this.syncQueue.size === 0) {
      console.log('✅ No entries to sync');
      return;
    }

    const queueEntries = Array.from(this.syncQueue.keys());
    console.log('🚀 Force syncing entries:', queueEntries);

    await this.syncPendingChanges();

    console.log('✅ Force sync completed. Remaining queue size:', this.syncQueue.size);
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
        this.syncQueue.set(entry.id, {
          entry,
          timestamp: Date.now(),
          retryCount: 0
        });
      }
    });

    const pendingCount = this.syncQueue.size;
    if (pendingCount > 0) {
      await this.syncPendingChanges();
    }
  }

  // Public method to check if entry exists (for debugging)
  public entryExists(entryId: string): boolean {
    const entries = this.getAllFromLocalStorage();
    return entries.some(entry => entry.id === entryId);
  }

  // Deleted entries management with timestamps
  private addToDeletedEntries(entryId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const deletedEntries = this.getDeletedEntriesWithTimestamps();
      deletedEntries[entryId] = Date.now();
      localStorage.setItem(this.deletedEntriesKey, JSON.stringify(deletedEntries));
    } catch (error) {
      console.warn('Failed to add to deleted entries:', error);
    }
  }

  private removeFromDeletedEntries(entryId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const deletedEntries = this.getDeletedEntriesWithTimestamps();
      delete deletedEntries[entryId];
      localStorage.setItem(this.deletedEntriesKey, JSON.stringify(deletedEntries));
    } catch (error) {
      console.warn('Failed to remove from deleted entries:', error);
    }
  }

  private getDeletedEntriesWithTimestamps(): Record<string, number> {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(this.deletedEntriesKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Handle both old array format and new timestamp format
        if (Array.isArray(parsed)) {
          // Convert old array format to timestamp format
          const timestamped: Record<string, number> = {};
          parsed.forEach((entryId: string) => {
            timestamped[entryId] = Date.now();
          });
          // Update storage with new format
          localStorage.setItem(this.deletedEntriesKey, JSON.stringify(timestamped));
          return timestamped;
        } else if (typeof parsed === 'object' && parsed !== null) {
          const deletedEntries = parsed as Record<string, number>;
          return deletedEntries;
        }
      } else {
      }
    } catch (error) {
      console.warn('Failed to get deleted entries:', error);
    }

    return {};
  }

  // Backward compatibility - returns Set for existing code
  private getDeletedEntries(): Set<string> {
    const deletedEntries = this.getDeletedEntriesWithTimestamps();
    return new Set(Object.keys(deletedEntries));
  }

  private isEntryDeleted(entryId: string): boolean {
    const deletedEntries = this.getDeletedEntriesWithTimestamps();
    return entryId in deletedEntries;
  }

  // Validate and repair deleted entries list integrity
  private validateDeletedEntriesIntegrity(): void {
    if (typeof window === 'undefined') return;

    try {
      const deletedEntries = this.getDeletedEntriesWithTimestamps();
      const deletedIds = Object.keys(deletedEntries);

      if (deletedIds.length === 0) {
        return;
      }


      let repairedCount = 0;
      const now = Date.now();

      // Validate timestamps and repair invalid entries
      Object.keys(deletedEntries).forEach(entryId => {
        const timestamp = deletedEntries[entryId];

        if (!timestamp || typeof timestamp !== 'number' || timestamp > now) {
          console.warn(`🔧 Repairing invalid timestamp for deleted entry: ${entryId} (was: ${timestamp})`);
          deletedEntries[entryId] = now;
          repairedCount++;
        }
      });

      if (repairedCount > 0) {
        localStorage.setItem(this.deletedEntriesKey, JSON.stringify(deletedEntries));
      }

    } catch (error) {
      console.warn('Failed to validate deleted entries integrity:', error);
    }
  }

  // Clean up old deleted entries (older than 7 days)
  private cleanupOldDeletedEntries(): void {
    if (typeof window === 'undefined') return;

    try {
      const deletedEntries = this.getDeletedEntriesWithTimestamps();
      const now = Date.now();
      const cutoffTime = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      let cleanedCount = 0;


      Object.keys(deletedEntries).forEach(entryId => {
        const deletedAt = deletedEntries[entryId];
        const deletedDate = new Date(deletedAt).toISOString();

        if (deletedAt < cutoffTime) {
          delete deletedEntries[entryId];
          cleanedCount++;
        } else {
        }
      });

      if (cleanedCount > 0) {
        localStorage.setItem(this.deletedEntriesKey, JSON.stringify(deletedEntries));
      } else {
      }
    } catch (error) {
      console.warn('Failed to cleanup old deleted entries:', error);
    }
  }

  // Active editing protection
  private markAsActivelyEdited(entryId: string): void {
    this.activelyEditedEntries.set(entryId, Date.now());
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

    return supabaseEntry as JournalEntryResponse;
  }

  private async updateInDatabase(entry: JournalEntry): Promise<JournalEntryResponse> {
    console.log('📤 updateInDatabase called for entry:', entry.id, 'with', entry.blocks.length, 'blocks');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ User not authenticated in updateInDatabase');
      throw new Error('User not authenticated');
    }

    console.log('🔄 Updating database entry:', entry.id, 'for user:', user.id);
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
      console.error('❌ Database update failed for entry:', entry.id, 'Error:', error);
      throw new Error(`Failed to update journal entry: ${error.message}`);
    }

    console.log('✅ Successfully updated entry in database:', entry.id);
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
      console.error(`❌ Database delete failed: User not authenticated for entry ${entryId}`);
      throw new Error('User not authenticated');
    }

    console.log(`🗑️ Attempting database deletion for entry: ${entryId} by user: ${user.id}`);

    const { data, error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id)
      .select(); // Return deleted rows to verify deletion

    if (error) {
      console.error(`❌ Database delete failed for ${entryId}:`, error);
      throw new Error(`Failed to delete journal entry: ${error.message}`);
    }

    // Verify deletion was successful
    if (!data || data.length === 0) {
      console.warn(`⚠️ No rows deleted for entry ${entryId} - entry may not exist in database`);
    } else {
      console.log(`✅ Database deletion confirmed for entry: ${entryId} (${data.length} row(s) deleted)`);
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
    // CRITICAL: Use unfiltered entries for merge comparison to properly track deleted entries
    const localEntriesUnfiltered = this.getAllFromLocalStorageUnfiltered();
    const dbEntries = (entries || []).map(entry => this.convertSupabaseToEntry(entry as JournalEntryResponse));

    // Filter out entries that have been deleted locally - CRITICAL for preventing restore
    // Validate deleted entries integrity before sync
    this.validateDeletedEntriesIntegrity();

    const deletedEntries = this.getDeletedEntriesWithTimestamps();
    const deletedIds = Object.keys(deletedEntries);


    const nonDeletedDbEntries = dbEntries.filter(entry => {
      const isDeleted = this.isEntryDeleted(entry.id);
      if (isDeleted) {
        const deletedAt = deletedEntries[entry.id];
        const deletedTime = deletedAt ? new Date(deletedAt).toISOString() : 'unknown';
        const daysSinceDeleted = deletedAt ? Math.floor((Date.now() - deletedAt) / (24 * 60 * 60 * 1000)) : 'unknown';
      }
      return !isDeleted;
    });

    const filteredCount = dbEntries.length - nonDeletedDbEntries.length;

    // Warn if we're filtering out a lot of entries (potential issue)
    if (filteredCount > 10) {
      console.warn(`⚠️ High number of deleted entries filtered (${filteredCount}). This might indicate a sync issue.`);
    }

    // Merge and deduplicate using UNFILTERED local entries for proper comparison
    // This ensures deleted entries are recognized and not treated as "new"
    const mergedEntries = [...localEntriesUnfiltered];
    nonDeletedDbEntries.forEach(dbEntry => {
      const existingIndex = mergedEntries.findIndex(e => e.id === dbEntry.id);

      if (existingIndex >= 0) {
        // Don't overwrite actively edited entries
        if (this.isActivelyEdited(dbEntry.id)) {
          return;
        }

        // Only update if database entry is newer
        const localUpdatedAt = new Date(mergedEntries[existingIndex].updatedAt).getTime();
        const dbUpdatedAt = new Date(dbEntry.updatedAt).getTime();

        if (dbUpdatedAt > localUpdatedAt) {
          mergedEntries[existingIndex] = dbEntry;
        }
      } else {
        mergedEntries.push(dbEntry);
      }
    });

    // CRITICAL: Filter out deleted entries from final merged result before saving
    const finalEntries = mergedEntries.filter(entry => {
      const isDeleted = this.isEntryDeleted(entry.id);
      if (isDeleted) {
        const deletedEntries = this.getDeletedEntriesWithTimestamps();
        const deletedAt = deletedEntries[entry.id];
        const deletedTime = deletedAt ? new Date(deletedAt).toISOString() : 'unknown';
      }
      return !isDeleted;
    });

    const excludedCount = mergedEntries.length - finalEntries.length;

    localStorage.setItem(this.localStorageKey, JSON.stringify(finalEntries));
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

  // Enable/disable fast sync for A/B testing
  setFastSyncEnabled(enabled: boolean): void {
    console.log(`🔧 Setting FastSync to: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    if (enabled && !this.fastSyncManager) {
      this.fastSyncManager = new FastSyncManager(this.userId);
      this.useFastSync = true;
      console.log(`✅ FastSync initialized for user: ${this.userId}`);
    } else if (!enabled && this.fastSyncManager) {
      this.fastSyncManager.destroy();
      this.fastSyncManager = null;
      this.useFastSync = false;
      console.log(`❌ FastSync disabled`);
    }
  }

  // Check if fast sync is currently active
  isFastSyncActive(): boolean {
    return !!(this.fastSyncManager && this.useFastSync);
  }

  // Get performance metrics for monitoring
  getPerformanceMetrics() {
    if (this.fastSyncManager) {
      return {
        fastSync: this.fastSyncManager.getMetrics(),
        syncQueueSize: this.syncQueue.size,
        activeEdits: this.activelyEditedEntries.size,
        pendingSaves: this.pendingSaves.size,
        fastSyncEnabled: this.useFastSync
      };
    }

    return {
      fastSync: null,
      syncQueueSize: this.syncQueue.size,
      activeEdits: this.activelyEditedEntries.size,
      pendingSaves: this.pendingSaves.size,
      fastSyncEnabled: this.useFastSync
    };
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Clean up fast sync manager
    if (this.fastSyncManager) {
      this.fastSyncManager.destroy();
      this.fastSyncManager = null;
    }
  }
}

// Legacy functions for backward compatibility - DEPRECATED: Use RealTimeJournalManager directly with userId
export async function createJournalEntry(data: CreateJournalEntryData, userId?: string): Promise<JournalEntryResponse> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated - cannot create journal entry without user context');
    }
    userId = user.id;
  }

  const manager = RealTimeJournalManager.getInstance(userId);
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
    user_id: userId,
    entry_date: syncedEntry.date,
    entry_type: data.entry_type,
    created_at: syncedEntry.createdAt.toISOString(),
    updated_at: syncedEntry.updatedAt.toISOString(),
    excited_about: data.excited_about || '',
    make_today_great: data.make_today_great || '',
    must_not_do: data.must_not_do || '',
    grateful_for: data.grateful_for || '',
    biggest_wins: data.biggest_wins || [],
    tensions: data.tensions || [],
    mood_rating: undefined,
    tags: []
  };
  return response;
}

export async function getJournalEntries(limit: number = 10, userId?: string): Promise<JournalEntryResponse[]> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated - cannot get journal entries without user context');
    }
    userId = user.id;
  }

  const manager = RealTimeJournalManager.getInstance(userId);
  const entries = await manager.getAllEntries();

  return entries.slice(0, limit).map(entry => ({
    id: entry.id,
    user_id: userId,
    entry_date: entry.date,
    entry_type: 'general',
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString()
  })) as JournalEntryResponse[];
}

export async function getJournalEntryByDate(date: string, type?: 'morning' | 'evening', userId?: string): Promise<JournalEntryResponse | null> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated - cannot get journal entry without user context');
    }
    userId = user.id;
  }

  const manager = RealTimeJournalManager.getInstance(userId);
  const entry = await manager.getEntry(date, type);

  if (!entry) return null;

  return {
    id: entry.id,
    user_id: userId,
    entry_date: entry.date,
    entry_type: type || 'general',
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString()
  } as JournalEntryResponse;
}

export async function updateJournalEntry(id: string, data: Partial<CreateJournalEntryData> & { rich_text_content?: JournalBlock[] }, userId?: string): Promise<JournalEntryResponse> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated - cannot update journal entry without user context');
    }
    userId = user.id;
  }

  const manager = RealTimeJournalManager.getInstance(userId);

  if (data.rich_text_content) {
    await manager.updateEntryImmediately(id, data.rich_text_content);
  }

  const entry = manager.getFromLocalStorage(id);
  if (!entry) {
    throw new Error('Entry not found');
  }

  return {
    id: entry.id,
    user_id: userId,
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

export function convertSupabaseToBlocks(entry: JournalEntryResponse & { rich_text_content?: JournalBlock[] }, userId?: string | null): JournalBlock[] {
  const manager = RealTimeJournalManager.getInstance(userId);
  return manager.convertSupabaseToBlocks(entry);
}

export async function updateJournalEntryFromBlocks(id: string, blocks: JournalBlock[], userId?: string): Promise<JournalEntryResponse> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated - cannot update journal entry without user context');
    }
    userId = user.id;
  }

  const manager = RealTimeJournalManager.getInstance(userId);
  await manager.updateEntryImmediately(id, blocks);

  const entry = manager.getFromLocalStorage(id);
  if (!entry) {
    throw new Error('Entry not found');
  }

  return {
    id: entry.id,
    user_id: userId,
    entry_date: entry.date,
    entry_type: 'general',
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString()
  } as JournalEntryResponse;
}

export async function safeUpdateJournalEntry(id: string, blocks: JournalBlock[], userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated - cannot update journal entry without user context');
      }
      userId = user.id;
    }

    const manager = RealTimeJournalManager.getInstance(userId);
    await manager.updateEntryImmediately(id, blocks);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function getJournalEntryAsRichText(date: string, userId?: string): Promise<JournalEntry | null> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated - cannot get journal entry without user context');
    }
    userId = user.id;
  }

  const manager = RealTimeJournalManager.getInstance(userId);
  return await manager.getEntry(date);
}

export async function deleteJournalEntry(id: string, userId?: string): Promise<void> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated - cannot delete journal entry without user context');
    }
    userId = user.id;
  }

  const manager = RealTimeJournalManager.getInstance(userId);
  await manager.deleteEntryImmediately(id);
}

export async function getJournalStats(userId?: string | null): Promise<{
  totalEntries: number;
  morningEntries: number;
  eveningEntries: number;
  currentStreak: number;
}> {
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  }
  
  const manager = RealTimeJournalManager.getInstance(userId);
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

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).RealTimeJournalManager = RealTimeJournalManager;
  (window as any).getJournalManager = getJournalManager;
}

// Legacy export removed - use getJournalManager(userId) instead
// export const journalManager = RealTimeJournalManager.getInstance();