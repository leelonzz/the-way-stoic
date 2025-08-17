import type { JournalEntry, JournalBlock } from '@/components/journal/types';
import { supabase } from '@/integrations/supabase/client';

// Performance monitoring interface
interface SyncMetrics {
  totalSaves: number;
  averageSaveTime: number;
  failedSaves: number;
  lastSyncTime: number;
  pendingChanges: number;
  degradationDetected: boolean;
  lastDegradationTime: number;
}

// Change buffer for batching rapid edits
export class ChangeBuffer {
  private changes: Map<string, { blocks: JournalBlock[]; timestamp: number }> = new Map();
  private flushTimeout: NodeJS.Timeout | null = null;
  private readonly flushDelay: number;
  private activeTimeouts: Set<NodeJS.Timeout> = new Set();

  constructor(flushDelay = 300) {
    this.flushDelay = flushDelay;
  }

  addChange(entryId: string, blocks: JournalBlock[]): void {
    // Cancel previous flush timeout
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.activeTimeouts.delete(this.flushTimeout);
    }

    // FIXED: Deep clone blocks to prevent mutation issues
    const deepClonedBlocks = blocks.map(block => ({
      ...block,
      text: block.text ? String(block.text) : block.text, // Ensure text is properly copied
      createdAt: new Date(block.createdAt), // Clone date objects
    }));

    this.changes.set(entryId, {
      blocks: deepClonedBlocks,
      timestamp: Date.now()
    });

    // Schedule flush with timeout tracking
    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, this.flushDelay);
    this.activeTimeouts.add(this.flushTimeout);
  }

  private flush(): void {
    // Copy changes before clearing to prevent race conditions
    const changesToProcess = new Map(this.changes);
    
    // Clear all references immediately to prevent memory leaks
    this.changes.clear();
    this.flushTimeout = null;
    this.activeTimeouts.clear();

    // Emit flush event with batched changes
    if (changesToProcess.size > 0 && this.onFlush) {
      // Use requestIdleCallback with longer timeout to prevent blocking
      const callback = this.onFlush;
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => callback(changesToProcess), { timeout: 200 });
      } else {
        // Use setTimeout with delay to prevent blocking main thread
        setTimeout(() => callback(changesToProcess), 16); // ~1 frame delay
      }
    }
  }

  onFlush?: (changes: Map<string, { blocks: JournalBlock[]; timestamp: number }>) => void;

  getPendingCount(): number {
    return this.changes.size;
  }

  clear(): void {
    // Clear all active timeouts
    this.activeTimeouts.forEach(timeout => clearTimeout(timeout));
    this.activeTimeouts.clear();
    
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    
    this.changes.clear();
  }
}

// Adaptive debouncer that adjusts timing based on user activity
export class AdaptiveDebouncer {
  private timeout: NodeJS.Timeout | null = null;
  private activityWindow: number[] = [];
  private readonly windowSizeMs = 5000; // 5 second sliding window
  private readonly baseDelay: number;
  private readonly maxDelay: number;
  private readonly minDelay: number;
  private lastCleanup = 0;

  constructor(baseDelay = 200, minDelay = 100, maxDelay = 500) {
    this.baseDelay = baseDelay;
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
  }

  debounce(callback: () => void): void {
    const now = Date.now();
    
    // Clean up activity window periodically (every 2 seconds)
    if (now - this.lastCleanup > 2000) {
      this.cleanupActivityWindow(now);
      this.lastCleanup = now;
    }
    
    // Add current activity to sliding window
    this.activityWindow.push(now);
    
    // Remove old activities outside the window
    this.cleanupActivityWindow(now);

    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Calculate adaptive delay
    const delay = this.calculateDelay();

    // Schedule callback
    this.timeout = setTimeout(() => {
      callback();
      this.timeout = null;
    }, delay);
  }

  private cleanupActivityWindow(now: number): void {
    // Remove activities older than window size
    const cutoff = now - this.windowSizeMs;
    this.activityWindow = this.activityWindow.filter(time => time > cutoff);
  }

  private calculateDelay(): number {
    const activityCount = this.activityWindow.length;
    
    // Very high activity (>8 in 5 seconds): use minimum delay but prevent thrashing
    if (activityCount > 8) {
      return Math.max(this.minDelay, 75); // At least 75ms to prevent excessive calls
    }
    
    // High activity (5-8 in 5 seconds): fast response
    if (activityCount > 5) {
      return this.minDelay;
    }
    
    // Moderate activity (2-5 in 5 seconds): normal response
    if (activityCount > 2) {
      return this.baseDelay;
    }

    // Low activity (≤2 in 5 seconds): slower response, user might be thinking
    return this.maxDelay;
  }

  cancel(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

// Fast sync manager optimized for real-time editing
export class FastSyncManager {
  private userId: string | null = null;
  private localStorageKey: string = '';
  private changeBuffer: ChangeBuffer;
  private saveDebouncer: AdaptiveDebouncer;
  private syncDebouncer: AdaptiveDebouncer;
  private metrics: SyncMetrics = {
    totalSaves: 0,
    averageSaveTime: 0,
    failedSaves: 0,
    lastSyncTime: 0,
    pendingChanges: 0,
    degradationDetected: false,
    lastDegradationTime: 0
  };
  private recentSaveTimes: number[] = [];
  private readonly maxRecentSaves = 10;
  private readonly degradationThreshold = 200; // ms
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncQueue: Map<string, { entry: JournalEntry; timestamp: number; retryCount: number }> = new Map();
  private syncBatchTimeout: NodeJS.Timeout | null = null;
  private readonly maxRetries = 3;
  private readonly batchSize = 5;

  constructor(userId: string | null = null) {
    this.userId = userId;
    this.updateStorageKey();
    
    // Initialize components with optimized timings for better performance
    this.changeBuffer = new ChangeBuffer(200); // Increased to reduce localStorage writes
    this.saveDebouncer = new AdaptiveDebouncer(300, 150, 600); // More conservative timings
    this.syncDebouncer = new AdaptiveDebouncer(500, 250, 1000); // Longer debounce for background sync

    // Setup change buffer flush handler
    this.changeBuffer.onFlush = (changes) => {
      this.processBatchedChanges(changes);
    };

    // Setup network listeners
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners();
    }
  }

  private updateStorageKey(): void {
    this.localStorageKey = this.userId ? `journal_entries_cache_${this.userId}` : 'journal_entries_cache_anonymous';
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Main entry point for real-time updates
  async updateEntryFast(entryId: string, blocks: JournalBlock[]): Promise<void> {
    const startTime = Date.now();

    try {
      // 1. Immediate local storage update (optimistic)
      await this.saveToLocalStorageImmediate(entryId, blocks);

      // 2. Add to change buffer for batching
      this.changeBuffer.addChange(entryId, blocks);

      // 3. Update metrics with performance monitoring
      this.metrics.totalSaves++;
      const saveTime = Date.now() - startTime;
      this.metrics.averageSaveTime = (this.metrics.averageSaveTime + saveTime) / 2;
      
      // Track recent save times for degradation detection
      this.recentSaveTimes.push(saveTime);
      if (this.recentSaveTimes.length > this.maxRecentSaves) {
        this.recentSaveTimes.shift();
      }
      
      // Check for performance degradation
      this.checkPerformanceDegradation(saveTime);

      // Performance logging only in development and less frequently
      if (process.env.NODE_ENV === 'development' && this.metrics.totalSaves % 200 === 0) {
        console.log(`FastSync: ${saveTime}ms (avg: ${this.metrics.averageSaveTime.toFixed(1)}ms, saves: ${this.metrics.totalSaves}${this.metrics.degradationDetected ? ' ⚠️ DEGRADED' : ''})`);
      }

    } catch (error) {
      this.metrics.failedSaves++;
      console.error('Fast sync failed:', error);
      throw error;
    }
  }

  private async saveToLocalStorageImmediate(entryId: string, blocks: JournalBlock[]): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const existingData = localStorage.getItem(this.localStorageKey);
      const entries: JournalEntry[] = existingData ? JSON.parse(existingData) : [];

      const entryIndex = entries.findIndex(e => e.id === entryId);
      const now = new Date();

      if (entryIndex >= 0) {
        // Update existing entry
        entries[entryIndex] = {
          ...entries[entryIndex],
          blocks: [...blocks],
          updatedAt: now
        };
      } else {
        // Entry not found - create it in localStorage for FastSync to work properly
        if (process.env.NODE_ENV === 'development') {
          console.log(`FastSync: Creating entry ${entryId} in localStorage for immediate sync`);
        }
        entries.push({
          id: entryId,
          date: new Date().toISOString(),
          blocks: [...blocks],
          createdAt: now,
          updatedAt: now
        });
      }

      localStorage.setItem(this.localStorageKey, JSON.stringify(entries));
    } catch (error) {
      // Don't throw error for localStorage issues - just log and continue
      if (process.env.NODE_ENV === 'development') {
        console.warn('FastSync: localStorage save failed, continuing with background sync:', error);
      }
    }
  }

  private processBatchedChanges(changes: Map<string, { blocks: JournalBlock[]; timestamp: number }>): void {
    // Process batched changes for database sync
    changes.forEach(({ blocks, timestamp }, entryId) => {
      this.scheduleBackgroundSync(entryId, blocks, timestamp);
    });
  }

  private scheduleBackgroundSync(entryId: string, blocks: JournalBlock[], timestamp: number): void {
    // Use requestIdleCallback for background operations when available
    const scheduleSync = () => {
      this.syncDebouncer.debounce(() => {
        this.performBackgroundSync(entryId, blocks, timestamp);
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(scheduleSync, { timeout: 1000 });
    } else {
      scheduleSync();
    }
  }

  private async performBackgroundSync(entryId: string, blocks: JournalBlock[], timestamp: number): Promise<void> {
    if (!this.userId || !this.isOnline) {
      // Queue for later sync
      const entry = this.getFromLocalStorage(entryId);
      if (entry) {
        this.syncQueue.set(entryId, { entry, timestamp, retryCount: 0 });
        this.scheduleBatchSync();
      }
      return;
    }

    try {
      const entry = this.getFromLocalStorage(entryId);
      if (!entry) return;

      // Check if this is a new entry that needs to be created first
      if (entryId.startsWith('temp_') || entryId.startsWith('temp-')) {
        console.log(`🆕 FastSync: Creating new entry ${entryId} in database`);

        // Create new entry in database
        const entryData = {
          user_id: this.userId,
          entry_date: entry.date,
          entry_type: 'general',
          excited_about: '',
          make_today_great: '',
          must_not_do: '',
          grateful_for: '',
          biggest_wins: [],
          tensions: [],
          rich_text_content: blocks
        };

        const { data: supabaseEntry, error: createError } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select()
          .single();

        if (createError) {
          // Handle unique constraint violation (entry already exists)
          if (createError.code === '23505') {
            console.warn('⚠️ FastSync: Entry already exists, attempting update instead');
            // Try to update instead
            await this.updateExistingEntry(entryId, blocks);
          } else {
            console.error('❌ FastSync: Failed to create entry in database:', createError);
            throw createError;
          }
        } else {
          console.log(`✅ FastSync: Successfully created entry ${entryId} → ${supabaseEntry.id}`);
          // Successfully created, update localStorage with permanent ID
          await this.updateLocalStorageWithPermanentId(entryId, supabaseEntry.id, blocks);

          // Update sync queue to use permanent ID for future operations
          this.syncQueue.delete(entryId); // Remove temp ID entry
          // No need to add permanent ID to sync queue since we just synced successfully
        }
      } else {
        console.log(`🔄 FastSync: Updating existing entry ${entryId} in database`);
        // Update existing entry
        await this.updateExistingEntry(entryId, blocks);
      }

      // Remove from sync queue on success
      this.syncQueue.delete(entryId);
      this.metrics.lastSyncTime = Date.now();

    } catch (error) {
      console.error('Background sync failed:', error);
      // Add to retry queue with exponential backoff
      const entry = this.getFromLocalStorage(entryId);
      if (entry) {
        const existing = this.syncQueue.get(entryId);
        const retryCount = existing ? existing.retryCount + 1 : 1;

        if (retryCount <= this.maxRetries) {
          // Schedule retry with exponential backoff
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
          setTimeout(() => {
            this.syncQueue.set(entryId, { entry, timestamp, retryCount });
            this.scheduleBatchSync();
          }, retryDelay);
        } else {
          // Max retries exceeded, remove from queue
          this.syncQueue.delete(entryId);
          console.warn(`Max retries exceeded for entry ${entryId}, giving up`);
        }
      }
    }
  }

  private async updateExistingEntry(entryId: string, blocks: JournalBlock[]): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .update({
        rich_text_content: blocks,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId)
      .eq('user_id', this.userId);

    if (error) {
      console.error(`❌ FastSync: Failed to update entry ${entryId}:`, error);
      throw error;
    } else {
      console.log(`✅ FastSync: Successfully updated entry ${entryId}`);
    }
  }

  private async updateLocalStorageWithPermanentId(tempId: string, permanentId: string, blocks: JournalBlock[]): Promise<void> {
    try {
      const existingData = localStorage.getItem(this.localStorageKey);
      const entries: JournalEntry[] = existingData ? JSON.parse(existingData) : [];

      const entryIndex = entries.findIndex(e => e.id === tempId);
      if (entryIndex >= 0) {
        // Update the entry with permanent ID
        entries[entryIndex] = {
          ...entries[entryIndex],
          id: permanentId,
          blocks: [...blocks],
          updatedAt: new Date()
        };

        localStorage.setItem(this.localStorageKey, JSON.stringify(entries));
        console.log(`✅ FastSync: Updated entry ${tempId} → ${permanentId} in localStorage`);
      }
    } catch (error) {
      console.warn('Failed to update localStorage with permanent ID:', error);
    }
  }

  private getFromLocalStorage(entryId: string): JournalEntry | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(this.localStorageKey);
      if (!data) return null;

      const entries: JournalEntry[] = JSON.parse(data);
      return entries.find(e => e.id === entryId) || null;
    } catch {
      return null;
    }
  }

  private scheduleBatchSync(): void {
    if (this.syncBatchTimeout) return;
    
    this.syncBatchTimeout = setTimeout(() => {
      this.processSyncBatch();
      this.syncBatchTimeout = null;
    }, 500); // Batch sync every 500ms
  }

  private async processSyncBatch(): Promise<void> {
    if (!this.isOnline || this.syncQueue.size === 0) return;

    // Process in batches to prevent overwhelming the database
    const entries = Array.from(this.syncQueue.entries()).slice(0, this.batchSize);
    const promises = entries.map(([entryId, { entry, timestamp }]) =>
      this.performBackgroundSync(entryId, entry.blocks, timestamp)
    );

    await Promise.allSettled(promises);
    
    // If more entries remain, schedule another batch
    if (this.syncQueue.size > 0) {
      this.scheduleBatchSync();
    }
  }

  private async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.syncQueue.size === 0) return;

    // Process all pending changes in batches
    while (this.syncQueue.size > 0) {
      await this.processSyncBatch();
    }
  }

  // Public API methods
  setUserId(userId: string): void {
    this.userId = userId;
    this.updateStorageKey();
  }

  getMetrics(): SyncMetrics {
    return {
      ...this.metrics,
      pendingChanges: this.changeBuffer.getPendingCount() + this.syncQueue.size
    };
  }

  // Performance degradation detection and auto-adjustment
  private checkPerformanceDegradation(currentSaveTime: number): void {
    const now = Date.now();
    
    // Check if current save time exceeds threshold
    if (currentSaveTime > this.degradationThreshold) {
      if (!this.metrics.degradationDetected) {
        this.metrics.degradationDetected = true;
        this.metrics.lastDegradationTime = now;
        console.warn(`⚠️ FastSync performance degradation detected: ${currentSaveTime}ms (threshold: ${this.degradationThreshold}ms)`);
        this.adjustForDegradation();
      }
    } else if (this.metrics.degradationDetected && this.recentSaveTimes.length >= 5) {
      // Check if performance has recovered (last 5 saves under threshold)
      const recentAvg = this.recentSaveTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
      if (recentAvg < this.degradationThreshold * 0.7) {
        this.metrics.degradationDetected = false;
        console.log(`✅ FastSync performance recovered: ${recentAvg.toFixed(1)}ms average`);
      }
    }
  }

  private adjustForDegradation(): void {
    // Increase flush delays to reduce system load
    if (this.changeBuffer instanceof ChangeBuffer) {
      // Force a flush to clear pending changes
      this.changeBuffer['flush']?.();
    }
    
    // Clear sync queue to reduce background load
    const queueSize = this.syncQueue.size;
    if (queueSize > 5) {
      console.log(`🔧 Clearing ${queueSize} pending sync operations to improve performance`);
      this.syncQueue.clear();
    }
  }

  destroy(): void {
    this.changeBuffer.clear();
    this.saveDebouncer.cancel();
    this.syncDebouncer.cancel();
    
    // Clear batch sync timeout
    if (this.syncBatchTimeout) {
      clearTimeout(this.syncBatchTimeout);
      this.syncBatchTimeout = null;
    }
  }
}
