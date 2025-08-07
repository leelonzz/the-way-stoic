# Debugging Slow Sync After Initial Fast Performance

## Issue Description
The journal starts with fast performance for the first few words, then becomes slow again. This suggests the FastSync system is working initially but then falling back to the legacy sync method.

## Debugging Steps

### 1. Check Console Logs
Open browser DevTools (F12) → Console tab and look for these messages:

**Fast Sync Working:**
- `🚀 Using FastSync for entry [entryId]`
- `🚀 FastSync: [time]ms (avg: [time]ms, saves: [count])`

**Fast Sync Failing:**
- `🐌 Fast sync failed, falling back to regular sync:`
- `🔄 Attempting to recover FastSync...`
- `❌ FastSync recovery failed:`
- `🐌 Using legacy sync for entry [entryId]`

**Mutex Blocking (Bad):**
- `⏳ Update already in progress for [entryId], waiting...`

**Fast Sync Non-Blocking (Good):**
- `⚡ Fast sync: concurrent update for [entryId], continuing without blocking`

### 2. Enable Performance Monitor
1. Press `Ctrl+Shift+P` to show performance monitor
2. Check if Fast Sync shows as `ON 🚀` or `OFF 🐌`
3. Watch the metrics while typing:
   - **Total Saves** should increment
   - **Avg Save Time** should stay low (< 50ms)
   - **Failed Saves** should remain 0
   - **Pending Changes** should be low (< 5)

### 3. Test Fast Sync Toggle
1. With performance monitor open, toggle Fast Sync OFF
2. Type some text - should feel slower
3. Toggle Fast Sync ON
4. Type again - should feel faster

### 4. Check for Common Issues

#### Issue A: FastSyncManager Not Initialized
**Symptoms:** Console shows `🐌 FastSync not available`
**Solution:** Check if user is logged in and FastSyncManager is properly initialized

#### Issue B: localStorage Errors
**Symptoms:** Console shows `FastSync: localStorage save failed`
**Solution:** Check browser storage quota and permissions

#### Issue C: Entry Not Found Errors
**Symptoms:** Console shows `FastSync: Entry [id] not found in localStorage`
**Solution:** This is normal during initialization, should resolve after first save

#### Issue D: Mutex Blocking
**Symptoms:** Console shows `⏳ Update already in progress`
**Solution:** Fast sync should show `⚡ Fast sync: concurrent update` instead

### 5. Manual Recovery Steps

If Fast Sync stops working:

1. **Refresh the page** - This reinitializes the FastSyncManager
2. **Toggle Fast Sync OFF then ON** in performance monitor
3. **Check browser console** for specific error messages
4. **Clear localStorage** if needed: `localStorage.clear()` in console

### 6. Expected Behavior

**Normal Fast Sync Operation:**
```
🚀 Using FastSync for entry temp-1234567890-abc
🚀 FastSync: 15ms (avg: 18.5ms, saves: 10)
⚡ Fast sync: concurrent update for temp-1234567890-abc, continuing without blocking
```

**Problem Indicators:**
```
🐌 Fast sync failed, falling back to regular sync: Error: ...
⏳ Update already in progress for temp-1234567890-abc, waiting...
🚨 SAVE VERIFICATION FAILED (attempt 1): Expected 50 chars/2 blocks, got 45 chars/2 blocks
```

### 7. Performance Comparison

**Fast Sync (Working):**
- Save Time: 10-50ms
- UI Response: Instant
- Console: `🚀 Using FastSync`

**Legacy Sync (Fallback):**
- Save Time: 200-1000ms
- UI Response: Noticeable delay
- Console: `🐌 Using legacy sync`

### 8. Troubleshooting Commands

Run these in browser console to debug:

```javascript
// Check if FastSync is active
window.journalManager?.isFastSyncActive()

// Get performance metrics
window.journalManager?.getPerformanceMetrics()

// Force enable FastSync
window.journalManager?.setFastSyncEnabled(true)

// Check localStorage entries
Object.keys(localStorage).filter(key => key.includes('journal'))
```

### 9. Common Fixes

1. **Refresh the page** - Simplest solution
2. **Clear browser cache** - Ctrl+Shift+R
3. **Check network connectivity** - FastSync needs online status
4. **Verify user authentication** - FastSync requires valid userId
5. **Check browser storage** - Ensure localStorage is available

### 10. When to Report Issues

Report if you see:
- FastSync consistently failing after 2-3 operations
- Error messages in console that persist after refresh
- Performance monitor showing high failed save counts
- Mutex blocking messages when FastSync is enabled

The system should maintain fast performance throughout the entire editing session, not just for the first few operations.
