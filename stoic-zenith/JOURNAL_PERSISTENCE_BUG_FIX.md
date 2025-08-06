# Journal Entry Persistence Bug Fix

## Problem Description

Journal entries were disappearing from the entry list when users created new entries. The entries appeared to be saved correctly and remained visible during the current session, but were lost when the page was reloaded or the user signed out and back in. This indicated that entries were being stored in temporary/local state but not being properly persisted to the database.

## Root Cause Analysis

The issue was caused by a critical timing problem in the authentication and sync flow:

### The Bug Sequence:
1. **Page loads** → Journal manager is created without user authentication (userId = null)
2. **User creates entries** → Entries get temporary IDs (`temp-123456789`) and are added to sync queue
3. **Authentication completes** → `setUserId()` is called, which **cleared the sync queue**
4. **Entries are abandoned** → They remain in localStorage with temporary IDs but can never sync to database
5. **Page refresh** → Entries with temporary IDs are lost because they were never persisted

### Key Issues:
1. **Authentication Timing**: Journal manager created before user authentication complete
2. **Sync Queue Clearing**: `setUserId()` cleared sync queue on first authentication, abandoning entries
3. **Silent Sync Failures**: Sync process failed silently when no user context available
4. **Temporary ID Persistence**: Entries with temporary IDs remained in localStorage but weren't handled properly

## Solution Implementation

### 1. Fixed `setUserId()` Method
**File**: `src/lib/journal.ts`

```typescript
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
      // ... clear other state
    }
    
    // Update userId and storage keys
    this.userId = userId;
    this.updateStorageKeys();
    
    // Restore and retry sync for entries created before authentication
    if (userId && !previousUserId && pendingEntries.length > 0) {
      console.log(`🔄 Restoring ${pendingEntries.length} entries created before authentication`);
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
```

### 2. Improved Sync Process
**File**: `src/lib/journal.ts`

```typescript
private async syncEntry(entryId: string): Promise<void> {
  // Check if we have a valid user context before attempting sync
  if (!this.userId) {
    console.warn(`⚠️ Skipping sync for ${entryId} - no user context (will retry when auth available)`);
    // Don't remove from queue - keep for retry when auth becomes available
    return;
  }
  // ... rest of sync logic
}
```

### 3. Added Auth Sync Retry Method
**File**: `src/lib/journal.ts`

```typescript
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
```

### 4. Updated Journal Component
**File**: `src/pages/Journal.tsx`

```typescript
// If this is initial authentication (not user switching), retry sync for existing entries
if (newUserId && !userId) {
  console.log('🔐 Initial authentication detected, retrying sync for existing entries');
  setTimeout(async () => {
    try {
      await getManager().retryAuthSync();
      console.log('✅ Auth sync retry completed');
    } catch (error) {
      console.error('❌ Auth sync retry failed:', error);
    }
  }, 500);
}
```

## Testing

### Automated Test
Run the test script to verify the fix:
```bash
node test_journal_persistence_fix.js
```

### Manual Testing Steps
1. Open the journal app in a new incognito window
2. Create a new journal entry immediately (before signing in)
3. Sign in with Google
4. Verify the entry is still visible
5. Refresh the page
6. Verify the entry is still there (this was the bug!)

## Key Improvements

- ✅ **Entries created before auth are preserved**: No longer lost when authentication completes
- ✅ **Sync queue is not cleared on first authentication**: Only cleared when switching between users
- ✅ **Background sync retries when auth becomes available**: Automatic recovery for failed syncs
- ✅ **Temporary IDs are converted to permanent database IDs**: Proper persistence to database
- ✅ **Entries persist across page reloads**: No more data loss on refresh
- ✅ **Orphaned entry recovery**: Finds and syncs any temporary entries that got stuck

## Impact

This fix resolves the critical data loss issue where users would lose their journal entries after page reloads. The solution ensures that:

1. **No data is lost** during the authentication process
2. **Entries are properly synced** to the database once authentication is available
3. **The user experience is seamless** with no visible interruption
4. **Edge cases are handled** including orphaned temporary entries

The fix maintains backward compatibility and doesn't affect existing functionality for authenticated users.
