import { QueryClient } from '@tanstack/react-query'

// Prefetch strategies for different sections
export const prefetchQuotes = async (queryClient: QueryClient) => {
  // Prefetch quotes data
  await queryClient.prefetchQuery({
    queryKey: ['daily-stoic-wisdom'],
    queryFn: async () => {
      // This should match the actual fetch function used in DailyStoicWisdom
      return null // Placeholder
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

export const prefetchCalendar = async (queryClient: QueryClient, userId?: string) => {
  if (!userId) return
  
  // Prefetch calendar preferences
  await queryClient.prefetchQuery({
    queryKey: ['life-calendar', 'preferences', userId],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client')
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

export const prefetchJournal = async (queryClient: QueryClient, userId?: string) => {
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
) => {
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
  }
}