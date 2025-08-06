# Journal Data Persistence Fix

## Problem Description

The Stoic journal application was experiencing data persistence issues where journal entries would disappear after:
1. Browser page refreshes
2. User sign out and sign back in
3. Browser session changes

Entries were being saved to localStorage but not properly syncing with the Supabase database, and the loading mechanism wasn't retrieving entries from the database on page load.

## Root Cause Analysis

### 1. Missing Database Loading Method
- The code called `this.loadFromDatabase()` but this method didn't exist
- This caused errors in the sync process and prevented proper database loading

### 2. Insufficient Database Loading on Page Load
- The `getAllEntries()` method only did background sync via `syncFromDatabase()`
- It didn't wait for database sync to complete before returning localStorage data
- For new sessions, localStorage would be empty and database entries weren't loaded

### 3. Authentication Context Issues
- Journal manager instances weren't properly updated when users changed
- The manager didn't have the correct userId when authentication state changed
- User context wasn't properly established before loading entries

### 4. Race Conditions in Auth State Changes
- When users signed out and back in, the old manager instance was still being used
- Auth state changes weren't properly clearing and recreating the manager

## Solution Implemented

### 1. Added Missing `getAllFromDatabase()` Method

```typescript
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
```

### 2. Enhanced `getAllEntries()` with Database-First Loading

**Before:**
```typescript
// Background sync from database
if (this.isOnline) {
  this.syncFromDatabase().catch(error => {
    console.warn('Background sync failed:', error);
  });
}
```

**After:**
```typescript
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
}
```

### 3. Fixed Journal Manager User Context

**Enhanced manager creation:**
```typescript
const getManager = useCallback(() => {
  if (!journalManagerRef.current || journalManagerRef.current !== getJournalManager(userId)) {
    journalManagerRef.current = getJournalManager(userId);
    // Ensure the manager has the correct userId
    if (journalManagerRef.current && userId) {
      journalManagerRef.current.setUserId(userId);
    }
  }
  return journalManagerRef.current;
}, [userId]);
```

### 4. Improved Auth State Change Handling

**Enhanced auth state change listener:**
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  const newUserId = session?.user?.id || null;
  console.log(`🔄 Auth state changed: ${event}, newUserId: ${newUserId}, currentUserId: ${userId}`);
  
  if (newUserId !== userId) {
    console.log('🔄 User changed, switching journal for:', newUserId || 'anonymous');
    
    // Clear old data immediately
    setEntries([]);
    setSelectedEntry(null);
    setSyncStatus('pending');
    
    // Update user ID
    setUserId(newUserId);
    
    // Clear the current manager reference to force recreation with new userId
    journalManagerRef.current = null;
    
    // Reload entries with new manager after a short delay
    setTimeout(async () => {
      try {
        console.log('🔄 Reloading entries for new user...');
        await loadEntries();
        setSyncStatus('synced');
        console.log('✅ Journal reloaded for new user');
      } catch (error) {
        console.error('Failed to reload entries for new user:', error);
        setSyncStatus('error');
      }
    }, 200);
  }
});
```

## Files Modified

1. **`src/lib/journal.ts`**:
   - Added missing `getAllFromDatabase()` method
   - Enhanced `getAllEntries()` to wait for database sync for authenticated users
   - Fixed reference to non-existent `loadFromDatabase()` method

2. **`src/pages/Journal.tsx`**:
   - Enhanced journal manager creation with proper userId setting
   - Improved auth state change handling with manager recreation
   - Added proper cleanup and reload logic for user changes

## Database Verification

The database contains properly structured journal entries:
- Entries are correctly associated with user IDs
- Rich text content is stored as JSONB arrays
- Entries have proper timestamps and metadata

## Testing

A comprehensive test script (`test_persistence_fix.js`) was created to verify:

1. **Authentication Status**: Verifies user is properly authenticated
2. **Database Entries**: Checks that entries exist in the database
3. **LocalStorage Entries**: Verifies localStorage has correct user-specific keys
4. **Journal Manager Loading**: Tests that the manager loads entries properly
5. **Entry Creation**: Tests creating new entries and verifying persistence
6. **Page Reload Simulation**: Instructions for testing persistence across reloads

## Expected Behavior After Fix

- ✅ Journal entries persist across browser page refreshes
- ✅ Entries are properly loaded from database when user signs back in
- ✅ User-specific localStorage keys prevent data mixing between accounts
- ✅ Authentication state changes properly reload entries for the correct user
- ✅ Database sync happens on page load for authenticated users
- ✅ Entries are properly saved to both localStorage and database

## Verification Steps

1. **Create Journal Entries**: Create several journal entries with content
2. **Refresh Page**: Reload the browser page - entries should still be visible
3. **Sign Out and Back In**: Sign out, then sign back in - entries should be restored
4. **Check Database**: Verify entries exist in the Supabase database
5. **Run Test Script**: Execute `testJournalPersistence()` in browser console
6. **Cross-Session Test**: Open in different browser/incognito - entries should load

## Prevention Measures

The fix implements multiple layers of persistence:

1. **Database-First Loading**: Authenticated users always sync from database on page load
2. **User-Specific Storage**: LocalStorage keys are user-specific to prevent data mixing
3. **Proper Auth Handling**: Auth state changes properly recreate managers with correct context
4. **Sync Verification**: Database operations include proper error handling and logging
5. **Manager Lifecycle**: Journal managers are properly created/destroyed based on user context

This comprehensive fix ensures that journal entries persist reliably across all user session scenarios.
