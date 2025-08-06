# Journal Persistence Testing Guide

## Pre-Test Setup

1. **Apply the database migration:**
   ```bash
   ./fix_journal_persistence.sh
   ```

2. **Clear browser storage:**
   - Open DevTools → Application → Storage
   - Clear all localStorage data
   - Clear all session storage

## Test Cases

### Test 1: Multiple Entries Per Day
**Objective:** Verify multiple journal entries can be created on the same day

**Steps:**
1. Create a journal entry for today
2. Create another journal entry for the same day
3. Verify both entries appear in the list
4. Reload the page
5. Verify both entries persist after reload

**Expected Result:** ✅ Both entries should persist

### Test 2: Authentication Context Persistence
**Objective:** Verify entries persist across authentication state changes

**Steps:**
1. Sign in to your account
2. Create a journal entry
3. Sign out
4. Sign back in
5. Check if the entry is still visible

**Expected Result:** ✅ Entry should persist after sign out/in

### Test 3: Cross-Session Persistence
**Objective:** Verify entries persist across browser sessions

**Steps:**
1. Create a journal entry
2. Close the browser completely
3. Reopen the browser and navigate to the journal
4. Sign in if needed
5. Check if the entry is visible

**Expected Result:** ✅ Entry should be visible in new session

### Test 4: Sync Queue Recovery
**Objective:** Verify sync queue handles network issues gracefully

**Steps:**
1. Disconnect from internet
2. Create a journal entry (should save locally)
3. Reconnect to internet
4. Wait 10 seconds for background sync
5. Reload the page
6. Verify entry persists

**Expected Result:** ✅ Entry should sync and persist

## Debugging Tools

### Console Monitoring
Watch for these log messages:
- `✅ Entry created successfully: [id]`
- `💾 Creating entry in database for user [userId]`
- `🔄 User changed, switching journal for: [userId]`
- `⚠️ Journal manager requested without userId`

### Sync Status Check
Add this to browser console to check sync status:
```javascript
// Get the current journal manager
const manager = window.journalManager || RealTimeJournalManager.getInstance();
console.log('Sync Status:', manager.getSyncStatus());
```

### Database Verification
Check entries in Supabase dashboard:
```sql
SELECT id, user_id, entry_date, entry_type, created_at 
FROM journal_entries 
ORDER BY created_at DESC 
LIMIT 10;
```

## Common Issues & Solutions

### Issue: "User not authenticated" errors
**Solution:** Check authentication state:
```javascript
supabase.auth.getUser().then(({data: {user}}) => console.log('User:', user));
```

### Issue: Entries disappear after reload
**Possible Causes:**
1. Sync queue not processing (check network)
2. Authentication context lost (check user ID consistency)
3. Database constraint violations (check console errors)

### Issue: Multiple entries not allowed
**Solution:** Verify the UNIQUE constraint was removed:
```sql
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'journal_entries'::regclass;
```

## Success Criteria

All tests should pass with:
- ✅ Multiple entries per day allowed
- ✅ Entries persist across page reloads
- ✅ Entries persist across authentication changes
- ✅ Entries persist across browser sessions
- ✅ No console errors related to authentication
- ✅ Sync queue processes successfully
