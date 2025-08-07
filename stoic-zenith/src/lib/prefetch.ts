import { QueryClient } from '@tanstack/react-query'

// Prefetch strategies for different sections
export const prefetchQuotes = async (queryClient: QueryClient): Promise<void> => {
  // Prefetch quotes data with better error handling
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

    // Also prefetch daily quote
    await queryClient.prefetchQuery({
      queryKey: ['daily-quote'],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error prefetching daily quote:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          return null;
        }

        // Calculate daily quote
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return data[dayOfYear % data.length];
      },
      staleTime: 24 * 60 * 60 * 1000, // 24 hours (daily quote)
      gcTime: 24 * 60 * 60 * 1000
    });
  } catch (error) {
    console.warn('Failed to prefetch quotes:', error);
  }
}

export const prefetchCalendar = async (queryClient: QueryClient, userId?: string): Promise<void> => {
  if (!userId) return
  
  // Prefetch calendar preferences
  await queryClient.prefetchQuery({
    queryKey: ['life-calendar', 'preferences', userId],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching life calendar preferences:', error);
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

export const prefetchJournal = async (queryClient: QueryClient, userId?: string): Promise<void> => {
  if (!userId) return
  
  // Prefetch today's journal entry
  const today = new Date().toISOString().split('T')[0]
  await queryClient.prefetchQuery({
    queryKey: ['journal-entry', today],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client')
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for journal entries
    gcTime: 5 * 60 * 1000
  })
}

// Navigation prefetch handler
export const handleNavigationPrefetch = (
  href: string,
  queryClient: QueryClient,
  userId?: string
): void => {
  // Use setTimeout to avoid blocking the main thread
  setTimeout(() => {
    switch (true) {
      case href.includes('/quotes'):
        prefetchQuotes(queryClient)
        break
      case href.includes('/calendar'):
        prefetchCalendar(queryClient, userId)
        break
      case href.includes('/journal'):
        prefetchJournal(queryClient, userId)
        break
      case href === '/': // Home page
        // Prefetch home page data (quotes for daily quote)
        prefetchQuotes(queryClient)
        break
      case href.includes('/mentors'):
        // Mentors page is mostly static, no specific prefetch needed
        break
    }
  }, 0)
}

// Prefetch all critical pages on app initialization
export const prefetchCriticalPages = async (
  queryClient: QueryClient,
  userId?: string
): Promise<void> => {
  // Prefetch the most commonly accessed pages
  const prefetchPromises = [
    prefetchQuotes(queryClient), // For home and quotes pages
  ]

  if (userId) {
    prefetchPromises.push(
      prefetchJournal(queryClient, userId),
      prefetchCalendar(queryClient, userId)
    )
  }

  // Run all prefetches in parallel but don't block app initialization
  Promise.allSettled(prefetchPromises).catch(error => {
    console.warn('Some prefetch operations failed:', error)
  })
}