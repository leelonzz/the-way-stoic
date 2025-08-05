# Tab Visibility Fix Implementation

## Problem Description

The application was experiencing issues where quotes and journal entries would fail to load when users returned to the tab after navigating away. This was caused by multiple components each implementing their own `visibilitychange` event listeners, leading to:

1. **Race Conditions**: Multiple listeners firing simultaneously
2. **Redundant API Calls**: Multiple components triggering data fetches at the same time
3. **State Inconsistency**: Different components having different ideas about tab visibility state
4. **Performance Issues**: Multiple simultaneous refetch operations

## Root Cause Analysis

The issue was identified in these components:
- `useQuotes.ts` - Had its own visibility change listener
- `Journal.tsx` - Had its own visibility change listener  
- `EntryList.tsx` - Had its own visibility change listener

Each component was adding its own `document.addEventListener('visibilitychange', ...)` which created conflicts.

## Solution: Centralized Tab Visibility Management

### Critical Fix for Inconsistent Behavior

**Issue Found**: The tab visibility refresh worked on the first tab switch but failed on subsequent attempts due to stale state management.

**Root Cause**: The `wasHiddenDuration` value was persisting between tab switches, causing the refresh logic to use outdated information from previous visibility changes.

**Fixes Applied**:
1. **State Reset Logic**: `wasHiddenDuration` now properly resets to 0 when tab becomes hidden
2. **Improved State Synchronization**: Simplified the state sync mechanism to prevent race conditions
3. **Post-Callback Reset**: After refresh callbacks complete, state is reset to prevent stale data
4. **Enhanced Logging**: Added detailed logging to track state changes and refresh decisions

### 1. Created `useTabVisibility.ts` Hook

A centralized hook that:
- Manages a **single global event listener** for `visibilitychange`
- Allows multiple components to **register callbacks** without conflicts
- Provides **intelligent refresh logic** based on time thresholds and hidden duration
- Prevents **race conditions** and redundant API calls
- Includes comprehensive **logging** for debugging

Key features:
```typescript
interface UseTabVisibilityReturn {
  isVisible: boolean;
  lastVisibilityChange: number;
  wasHiddenDuration: number;
  registerCallbacks: (id: string, callbacks: TabVisibilityCallbacks) => void;
  unregisterCallbacks: (id: string) => void;
  shouldRefresh: (lastRefreshTime: number) => boolean;
}
```

### 2. Updated Components

**useQuotes.ts**:
- Removed individual `visibilitychange` listener
- Uses `tabVisibility.registerCallbacks()` for quote data refresh
- 2-second refresh threshold + immediate refresh when returning to tab

**Journal.tsx**:
- Removed individual `visibilitychange` listener
- Uses `tabVisibility.registerCallbacks()` for journal data refresh
- 2-second refresh threshold + immediate refresh when returning to tab

**EntryList.tsx**:
- Removed individual `visibilitychange` listener
- Uses `tabVisibility.registerCallbacks()` for entry list refresh
- 2-second refresh threshold + immediate refresh when returning to tab

## Benefits

1. **Single Event Listener**: Only one `visibilitychange` listener for the entire app
2. **Coordinated Refresh**: All components refresh in a coordinated manner
3. **No Race Conditions**: Callbacks are executed sequentially
4. **Intelligent Thresholds**: Different refresh thresholds for different components
5. **Better Logging**: Centralized logging for debugging
6. **Performance**: Eliminates redundant API calls

## Testing

### Manual Testing Steps

1. **Open the application** in a browser tab
2. **Navigate to quotes page** - verify quotes load
3. **Navigate to journal page** - verify journal entries load
4. **Perform MULTIPLE tab switches**:
   - Switch to another tab/application
   - Wait a few seconds
   - Return to the original tab
   - **Repeat this process 3-5 times**
5. **Verify**: Quotes and journal entries should reload **immediately** on EVERY return, not just the first time

### Automated Testing

Use the provided test script:

```javascript
// In browser console, load the test script:
// Copy contents of tab-visibility-test.js and paste in console

// Then run:
tabVisibilityTest.run()
```

### Console Monitoring

Look for these log messages when tab becomes visible:
```
🔍 [TabVisibility] Global visibility change: {...}
🔍 [useQuotes] Tab became visible, checking refresh conditions: {...}
🔍 [Journal] Tab became visible, checking refresh conditions: {...}
🔍 [EntryList] Tab became visible, checking refresh conditions: {...}
```

## Configuration

### Refresh Thresholds

- **Quotes**: 2 seconds (`refreshThreshold: 2000`) + **immediate refresh** when returning to tab
- **Journal**: 2 seconds (`refreshThreshold: 2000`) + **immediate refresh** when returning to tab
- **Entry List**: 2 seconds (`refreshThreshold: 2000`) + **immediate refresh** when returning to tab

**Note**: The system now refreshes **immediately** whenever you return to the tab after being away for any amount of time, providing the fastest possible response.

### Customization

To adjust refresh behavior, modify the `useTabVisibility` options:

```typescript
const tabVisibility = useTabVisibility({
  refreshThreshold: 2000, // 2 seconds (but immediate refresh is default)
  enableLogging: true
});
```

## Troubleshooting

### If quotes/journal still don't load:

1. **Check console logs** for error messages
2. **Verify network requests** are being made
3. **Check localStorage/sessionStorage** for cached data
4. **Ensure authentication** is working properly

### Common Issues:

- **Browser tab throttling**: Some browsers throttle background tabs
- **Network connectivity**: Check if API calls are failing
- **Authentication expiry**: User might need to re-authenticate

## Files Modified

1. `src/hooks/useTabVisibility.ts` - **NEW** centralized hook
2. `src/hooks/useQuotes.ts` - Updated to use centralized system
3. `src/pages/Journal.tsx` - Updated to use centralized system
4. `src/components/journal/EntryList.tsx` - Updated to use centralized system

## Backward Compatibility

The fix maintains full backward compatibility:
- All existing functionality preserved
- No breaking changes to component APIs
- Improved reliability and performance

## Future Improvements

1. **Add unit tests** for the tab visibility hook
2. **Implement retry logic** for failed refresh attempts
3. **Add user preferences** for refresh behavior
4. **Monitor performance metrics** for refresh operations
