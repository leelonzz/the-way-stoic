# Tab Visibility Fix for Quote Loading Issue

## Problem Description
When users opened a new tab and returned to the app, the quotes in the quote navigation and dashboard were not loading properly. This was caused by:

1. **Browser Tab Suspension**: When switching tabs, browsers may pause JavaScript execution
2. **State Management Issues**: The `useQuotes` hook didn't handle tab visibility changes
3. **Cache Invalidation**: Daily quote cache wasn't properly refreshed when returning to the tab
4. **Loading State Problems**: No proper loading indicators during refetch operations

## Solution Implemented

### 1. Tab Visibility Detection
- Added `visibilitychange` event listener to detect when tab becomes visible/hidden
- Tracks tab visibility state with `isTabVisible` state
- Monitors time since last fetch to determine if refetch is needed

### 2. Smart Refetching Logic
- Only refetches quotes if more than 5 minutes have passed since last fetch
- Prevents unnecessary API calls for short tab switches
- Uses `lastFetchTime` to track when data was last fetched

### 3. Enhanced Loading States
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

### `useQuotes.ts`
```typescript
// Added tab visibility detection
useEffect(() => {
  const handleVisibilityChange = () => {
    const wasVisible = isTabVisible;
    const isVisible = !document.hidden;
    setIsTabVisible(isVisible);
    
    // If tab becomes visible and it's been more than 5 minutes since last fetch, refetch
    if (isVisible && !wasVisible) {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceLastFetch > fiveMinutes) {
        console.log('Tab became visible, refetching quotes after', Math.round(timeSinceLastFetch / 1000), 'seconds');
        refetchQuotes();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [isTabVisible, lastFetchTime]);
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