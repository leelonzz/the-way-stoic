# Tab Visibility Fix for Quote Loading and Journal Issues

## Problem Description
When users opened a new tab and returned to the app, the following components failed to load properly:

1. **Quotes**: Not loading in quote navigation and dashboard
2. **Journal Entries**: Not appearing in the journal entry list
3. **Today's Journal Entry**: Not loading when returning to the journal page

This was caused by:

1. **Browser Tab Suspension**: When switching tabs, browsers may pause JavaScript execution
2. **State Management Issues**: Components didn't handle tab visibility changes properly
3. **Cache Invalidation**: Data wasn't properly refreshed when returning to the tab
4. **Loading State Problems**: No proper loading indicators during refetch operations
5. **Inconsistent Behavior**: Different components handled tab visibility differently

## Solution Implemented

### 1. Enhanced useQuotes Tab Visibility (IMPROVED)
- **Reduced threshold**: From 5 minutes to 30 seconds for better user experience
- **Immediate refresh**: Quotes now refresh immediately if none are loaded when returning to tab
- **Better logic**: Refetches if no quotes OR time threshold exceeded
- **Improved logging**: More detailed console logs for debugging

### 2. NEW: Journal Component Tab Visibility
- **Added tab visibility detection**: Journal now detects when tab becomes visible/hidden
- **Smart refresh logic**: Refreshes data if no entries/selected entry or after 1 minute
- **Automatic entry loading**: Attempts to reload today's entry when returning to tab
- **Coordinated refresh**: Triggers both entry list and selected entry refresh

### 3. NEW: EntryList Component Tab Visibility
- **Tab visibility handling**: Entry list refreshes when tab becomes visible
- **Time-based refresh**: Only refreshes if no entries or after 1 minute threshold
- **Prevents duplicate requests**: Coordinates with main Journal component

### 4. Enhanced Loading States (EXISTING)
- Added `isRefetching` state to distinguish between initial load and refetch
- Shows loading screen during refetch operations
- Provides user feedback via toast notifications

### 4. Improved Cache Management
- Better localStorage handling for daily quotes
- Automatic cleanup of old cached quotes (older than 7 days)
- Fallback to cached data when network is unavailable

### 5. Enhanced Prefetching
- Updated prefetch functions to handle quotes more efficiently
- Better error handling in prefetch operations
- Separate caching for daily quotes vs. all quotes

## Key Changes Made

### `useQuotes.ts` (IMPROVED)
```typescript
// Enhanced tab visibility detection with immediate refresh and shorter threshold
useEffect(() => {
  const handleVisibilityChange = (): void => {
    const wasVisible = isTabVisible;
    const isVisible = !document.hidden;
    setIsTabVisible(isVisible);

    // If tab becomes visible, check if we need to refetch
    if (isVisible && !wasVisible) {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const thirtySeconds = 30 * 1000; // Reduced from 5 minutes
      const hasNoQuotes = quotes.length === 0;

      // Refetch if:
      // 1. No quotes are currently loaded (immediate refresh)
      // 2. It's been more than 30 seconds since last fetch
      if (hasNoQuotes || timeSinceLastFetch > thirtySeconds) {
        console.log('Tab became visible, refetching quotes:', {
          hasNoQuotes,
          timeSinceLastFetch: Math.round(timeSinceLastFetch / 1000),
          reason: hasNoQuotes ? 'no quotes loaded' : 'time threshold exceeded'
        });
        refetchQuotes();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [isTabVisible, lastFetchTime, quotes.length, refetchQuotes]);
```

### `Journal.tsx` (NEW)
```typescript
// Tab visibility detection for journal data refresh
useEffect(() => {
  const handleVisibilityChange = async () => {
    const wasVisible = isTabVisible;
    const isVisible = !document.hidden;
    setIsTabVisible(isVisible);

    // If tab becomes visible, check if we need to refresh data
    if (isVisible && !wasVisible) {
      const timeSinceLastLoad = Date.now() - lastLoadTime;
      const oneMinute = 60 * 1000;
      const hasNoEntries = entries.length === 0;
      const hasNoSelectedEntry = !selectedEntry;

      // Refresh if no entries, no selected entry, or time threshold exceeded
      if (hasNoEntries || hasNoSelectedEntry || timeSinceLastLoad > oneMinute) {
        console.log('Tab became visible, refreshing journal data');
        setRefreshKey(prev => prev + 1); // Triggers EntryList refresh
        setLastLoadTime(Date.now());

        // Reload today's entry if none is selected
        if (!selectedEntry) {
          // ... entry loading logic
        }
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [isTabVisible, lastLoadTime, entries.length, selectedEntry]);
```

### `EntryList.tsx` (NEW)
```typescript
// Tab visibility detection for entry list refresh
useEffect(() => {
  const handleVisibilityChange = () => {
    const wasVisible = isTabVisible;
    const isVisible = !document.hidden;
    setIsTabVisible(isVisible);

    // If tab becomes visible, check if we need to refresh entries
    if (isVisible && !wasVisible) {
      const timeSinceLastLoad = Date.now() - lastLoadTime;
      const oneMinute = 60 * 1000;
      const hasNoEntries = entries.length === 0;

      // Refresh if no entries or time threshold exceeded
      if (hasNoEntries || timeSinceLastLoad > oneMinute) {
        console.log('Tab became visible, refreshing entry list');
        loadEntries();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [isTabVisible, lastLoadTime, entries.length, loadEntries]);
```

### `DailyStoicWisdom.tsx`
```typescript
// Added refetching state handling
const { 
  // ... other props
  isRefetching
} = useQuotes(user)

// Show loading screen for initial load or refetching
if (loading || isRefetching) {
  return <MinimalLoadingScreen />
}

// Show toast when refetching due to tab visibility
useEffect(() => {
  if (isRefetching) {
    toast({
      title: "Refreshing quotes...",
      description: "Loading latest quotes from the database",
    })
  }
}, [isRefetching, toast])
```

### `prefetch.ts`
```typescript
// Enhanced prefetch with better error handling
export const prefetchQuotes = async (queryClient: QueryClient): Promise<void> => {
  try {
    await queryClient.prefetchQuery({
      queryKey: ['quotes', 'all'],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error prefetching quotes:', error);
          throw error;
        }

        return data || [];
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000 // 30 minutes
    });
  } catch (error) {
    console.warn('Failed to prefetch quotes:', error);
  }
}
```

## Benefits

1. **Improved User Experience**: Users no longer see loading issues when switching tabs
2. **Better Performance**: Smart refetching prevents unnecessary API calls
3. **Reliable Data**: Quotes are always up-to-date when returning to the app
4. **Clear Feedback**: Users know when data is being refreshed
5. **Robust Caching**: Fallback mechanisms ensure quotes are always available

## Testing

The fix includes:
- Tab visibility event handling
- Time-based refetch logic
- Loading state management
- Cache persistence
- Error handling

To test the fix:
1. Open the quotes page
2. Switch to another tab for more than 5 minutes
3. Return to the app
4. Verify quotes load properly with a brief loading indicator

## Browser Compatibility

This fix works with all modern browsers that support:
- `document.hidden` property
- `visibilitychange` event
- `localStorage` API
- `addEventListener` method

## Future Improvements

1. **Configurable Threshold**: Make the 5-minute threshold configurable
2. **Background Sync**: Implement background sync for offline scenarios
3. **Progressive Loading**: Show cached data immediately while fetching fresh data
4. **Analytics**: Track tab visibility patterns for optimization 