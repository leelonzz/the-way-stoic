import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useTabVisibility } from './useTabVisibility';
import { usePathname } from 'next/navigation';
import { useNavigationCachedQuery } from './useCacheAwareQuery';

export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  category: string;
  created_at: string;
  mood_tags?: string[];
}

export interface SavedQuote {
  id: string;
  quote_id: string;
  notes?: string;
  created_at: string;
  quote: Quote;
}

export interface UserQuote {
  id: string;
  text: string;
  author: string;
  source?: string;
  category: string;
  mood_tags: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Fallback quotes in case database is unavailable
const FALLBACK_QUOTES: Quote[] = [
  {
    id: 'fallback-1',
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    source: "Discourses",
    category: "perspective",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'fallback-2',
    text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "mindset",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'fallback-3',
    text: "Wealth consists in not having great possessions, but in having few wants.",
    author: "Epictetus",
    source: "Discourses",
    category: "wealth",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'fallback-4',
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "suffering",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'fallback-5',
    text: "The best revenge is not to be like your enemy.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "virtue",
    created_at: new Date().toISOString(),
    mood_tags: []
  }
];

export function useQuotes(user: User | null): {
  quotes: Quote[];
  savedQuotes: SavedQuote[];
  userQuotes: UserQuote[];
  loading: boolean;
  error: string | null;
  getDailyQuote: () => Quote | null;
  saveQuote: (quoteId: string, notes?: string) => Promise<boolean>;
  unsaveQuote: (quoteId: string) => Promise<boolean>;
  isQuoteSaved: (quoteId: string) => boolean;
  getQuotesByCategory: (category: string) => Quote[];
  searchQuotes: (searchTerm: string) => Quote[];
  createUserQuote: (quote: Omit<UserQuote, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateUserQuote: (id: string, updates: Partial<UserQuote>) => Promise<boolean>;
  deleteUserQuote: (id: string) => Promise<boolean>;
  refetch: () => void;
  refreshDailyQuote: () => Quote | null;
  reloadCount: number;
  maxReloads: number;
  canReload: boolean;
  debugCacheStatus: () => void;
  isRefetching: boolean;
  forceRefresh: () => Promise<void>;
} {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [userQuotes, setUserQuotes] = useState<UserQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionShownQuotes, setSessionShownQuotes] = useState<string[]>([]);
  const [reloadCount, setReloadCount] = useState(0);
  const [cachedDailyQuote, setCachedDailyQuote] = useState<Quote | null>(null);
  const [cachedDate, setCachedDate] = useState<string>('');
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Use centralized tab visibility management with longer threshold
  const tabVisibility = useTabVisibility({ refreshThreshold: 30000 }); // 30 seconds

  // Track navigation to trigger refetch on quote pages
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState<string>('');

  // Add mutex/lock mechanism to prevent overlapping refetch operations
  const refetchLockRef = useRef<boolean>(false);
  const lastRefetchTimeRef = useRef<number>(0);
  const REFETCH_DEBOUNCE_MS = 2000; // 2 seconds minimum between refetches

  // Add loading timeout to prevent stuck loading states
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_LOADING_TIME = 10000; // 10 seconds max loading time
  
  const maxReloads = 10;
  const canReload = reloadCount < maxReloads;



  // Cleanup old cached quotes from localStorage
  const cleanupOldCachedQuotes = useCallback((): void => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    try {
      const today = new Date();
      
      // Remove cached quotes older than 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i - 1); // Start from yesterday
        const dateString = date.toISOString().split('T')[0];
        const key = `daily-quote-${dateString}`;
        
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log('Cleaned up old cached quote for:', dateString);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup old cached quotes:', error);
    }
  }, []);

  // Quota management helpers
  const getQuotaKey = useCallback((): string => {
    const today = new Date().toISOString().split('T')[0];
    const userId = user?.id || 'guest';
    return `quote-reload-quota-${userId}-${today}`;
  }, [user?.id]);

  const loadQuotaFromStorage = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const quotaData = localStorage.getItem(getQuotaKey());
      return quotaData ? parseInt(quotaData, 10) : 0;
    } catch {
      return 0;
    }
  }, [getQuotaKey]);

  const saveQuotaToStorage = useCallback((count: number) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getQuotaKey(), count.toString());
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, [getQuotaKey]);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching quotes from Supabase...');
      
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Quotes fetched successfully:', data?.length || 0, 'quotes');
      
      // If no quotes from database, use fallback quotes
      if (!data || data.length === 0) {
        console.log('No quotes from database, using fallback quotes');
        setQuotes(FALLBACK_QUOTES);
      } else {
        setQuotes(data);
      }
      
      setError(null); // Clear any previous errors on successful fetch
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
      console.log('Using fallback quotes due to error');
      setQuotes(FALLBACK_QUOTES);
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedQuotes = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_quotes')
        .select(`
          id,
          quote_text,
          author,
          source,
          tags,
          saved_at,
          personal_note,
          collection_name,
          is_favorite,
          date_saved,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      // Transform to match SavedQuote interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        quote_id: item.id, // Using same id for quote_id since we're storing quote data directly
        notes: item.personal_note,
        created_at: item.created_at,
        quote: {
          id: item.id,
          text: item.quote_text,
          author: item.author,
          source: item.source,
          category: 'general', // Default category
          created_at: item.created_at,
          mood_tags: item.tags || []
        }
      }));

      setSavedQuotes(transformedData);
    } catch (err) {
      console.error('Failed to fetch saved quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved quotes');
    }
  }, [user]);

  const fetchUserQuotes = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserQuotes(data || []);
    } catch (err) {
      console.error('Failed to fetch user quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user quotes');
    }
  }, [user]);

  const refetchQuotes = useCallback(async () => {
    // Check if refetch is already in progress using ref-based lock
    if (refetchLockRef.current) {
      console.log('⏭️ [useQuotes] Refetch already in progress (ref lock), skipping...');
      return;
    }

    // Check debounce timing
    const now = Date.now();
    const timeSinceLastRefetch = now - lastRefetchTimeRef.current;
    if (timeSinceLastRefetch < REFETCH_DEBOUNCE_MS) {
      console.log(`⏭️ [useQuotes] Refetch debounced, ${REFETCH_DEBOUNCE_MS - timeSinceLastRefetch}ms remaining`);
      return;
    }

    try {
      // Set both locks
      refetchLockRef.current = true;
      lastRefetchTimeRef.current = now;
      setIsRefetching(true);

      // Set loading timeout to prevent stuck states
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ [useQuotes] Loading timeout reached, forcing reset');
        refetchLockRef.current = false;
        setIsRefetching(false);
        setLoading(false);
      }, MAX_LOADING_TIME);

      console.log('🔄 [useQuotes] Starting refetch with mutex lock...');

      await fetchQuotes();
      console.log('✅ [useQuotes] fetchQuotes completed');

      if (user) {
        await fetchSavedQuotes();
        console.log('✅ [useQuotes] fetchSavedQuotes completed');
        await fetchUserQuotes();
        console.log('✅ [useQuotes] fetchUserQuotes completed');
      }

      console.log('🎉 [useQuotes] All refetch operations completed successfully');
    } catch (error) {
      console.error('❌ [useQuotes] Error during refetch:', error);
    } finally {
      // Clear timeout and release both locks
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      refetchLockRef.current = false;
      setIsRefetching(false);
      console.log('🔍 [useQuotes] Refetch process finished, locks released');
    }
  }, [fetchQuotes, fetchSavedQuotes, fetchUserQuotes, user]); // Removed isRefetching from dependencies

  // Create refs to avoid dependency issues in callbacks
  const quotesRef = useRef(quotes);
  const lastFetchTimeRef2 = useRef(lastFetchTime);

  // Update refs when values change
  useEffect(() => {
    quotesRef.current = quotes;
  }, [quotes]);

  useEffect(() => {
    lastFetchTimeRef2.current = lastFetchTime;
  }, [lastFetchTime]);

  // Register tab visibility callbacks with centralized system (prevent duplicates)
  useEffect(() => {
    // Use single, consistent callback ID to prevent multiple registrations
    const callbackId = 'useQuotes-main';

    tabVisibility.registerCallbacks(callbackId, {
      onVisible: async (state) => {
        // Use refs to get current values without causing dependency issues
        const hasNoQuotes = quotesRef.current.length === 0;
        const timeSinceLastFetch = Date.now() - lastFetchTimeRef2.current;
        const dataIsStale = timeSinceLastFetch > 300000; // 5 minutes
        const wasHiddenLongEnough = state.wasHiddenDuration > 30000; // 30 seconds
        const isQuotePage = pathname === '/' || pathname === '/quotes';

        console.log('🔍 [useQuotes] Tab became visible, checking refresh conditions:', {
          callbackId,
          pathname,
          hasNoQuotes,
          dataIsStale,
          wasHiddenLongEnough,
          isQuotePage,
          wasHiddenDuration: Math.round(state.wasHiddenDuration / 1000),
          dataAgeMinutes: Math.round(timeSinceLastFetch / 60000),
          quotesLength: quotesRef.current.length
        });

        // Only refetch if no quotes are loaded
        if (hasNoQuotes) {
          console.log('✅ [useQuotes] TRIGGERING REFETCH: no quotes loaded');
          await refetchQuotes();
        }
        // Only refetch if on quote page, data is stale AND was hidden for significant time
        else if (isQuotePage && dataIsStale && wasHiddenLongEnough) {
          console.log('✅ [useQuotes] TRIGGERING REFETCH: quote page with stale data after 30+ seconds');
          await refetchQuotes();
        } else {
          console.log('⏭️ [useQuotes] No refetch needed:', {
            quotesCount: quotesRef.current.length,
            wasHiddenDuration: Math.round(state.wasHiddenDuration / 1000),
            dataAgeMinutes: Math.round(timeSinceLastFetch / 60000),
            isQuotePage,
            reason: !hasNoQuotes && (!isQuotePage ? 'Not quote page' : !dataIsStale ? 'Data fresh' : 'Short hide duration')
          });
        }
      },
      onHidden: () => {
        console.log('🔍 [useQuotes] Tab became hidden');
      }
      // Removed onNavigationReturn to prevent duplicate refetch triggers
    });

    return () => {
      tabVisibility.unregisterCallbacks(callbackId);
    };
  }, [tabVisibility, pathname, refetchQuotes]); // Only essential dependencies



  // Memoized daily quote calculation with improved caching
  const dailyQuote = useMemo(() => {
    // Get today's date in YYYY-MM-DD format first
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Always check localStorage FIRST for today's quote
    if (typeof window !== 'undefined') {
      try {
        const storedQuoteData = localStorage.getItem(`daily-quote-${todayString}`);
        if (storedQuoteData) {
          const storedQuote = JSON.parse(storedQuoteData);
          console.log('✅ Using cached daily quote from localStorage:', todayString);
          
          // Update state cache to match localStorage
          if (cachedDate !== todayString) {
            setCachedDailyQuote(storedQuote);
            setCachedDate(todayString);
          }
          
          return storedQuote;
        }
      } catch (error) {
        console.warn('Failed to load cached quote from localStorage:', error);
      }
    }
    
    // Check if we have a cached quote for today in state
    if (cachedDailyQuote && cachedDate === todayString) {
      console.log('✅ Using state cached daily quote for today:', cachedDate);
      return cachedDailyQuote;
    }
    
    // If no quotes available, return the first fallback quote
    if (quotes.length === 0) {
      console.log('No quotes available for daily quote, using fallback');
      return FALLBACK_QUOTES[0];
    }
    
    // Calculate new daily quote only when needed
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const selectedQuote = quotes[dayOfYear % quotes.length];
    
    // Cache the quote and date in both state and localStorage immediately
    setCachedDailyQuote(selectedQuote);
    setCachedDate(todayString);
    
    // Store in localStorage with 24-hour persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`daily-quote-${todayString}`, JSON.stringify(selectedQuote));
        console.log('💾 Daily quote cached to localStorage for 24h persistence');
      } catch (error) {
        console.warn('Failed to cache quote in localStorage:', error);
      }
    }
    
    console.log('🆕 New daily quote calculated and cached:', {
      dayOfYear,
      totalQuotes: quotes.length,
      selectedQuoteIndex: dayOfYear % quotes.length,
      quote: selectedQuote,
      date: todayString
    });
    
    return selectedQuote;
  }, [quotes, cachedDailyQuote, cachedDate]);

  const getDailyQuote = (): Quote | null => {
    return dailyQuote;
  };

  // Debug function to check cache status
  const debugCacheStatus = (): void => {
    // Debug function removed - no longer needed
  };

  const saveQuote = async (quoteId: string, notes?: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    // Validate user ID format (should be a valid UUID)
    if (!user.id || typeof user.id !== 'string' || user.id.length < 10) {
      setError('Invalid user session. Please log out and log back in.');
      return false;
    }

    try {
      // First, find the quote by ID
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) {
        setError('Quote not found');
        return false;
      }

      // Check if already saved
      const alreadySaved = isQuoteSaved(quoteId);
      if (alreadySaved) {
        setError('Quote already saved');
        return false;
      }

      console.log('Saving quote with user ID:', user.id);

      // Use the extended schema that matches the current database structure
      const { error } = await supabase
        .from('saved_quotes')
        .insert({
          user_id: user.id,
          quote_text: quote.text,
          author: quote.author,
          source: quote.source,
          tags: quote.mood_tags || [],
          personal_note: notes,
          is_favorite: false,
          saved_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database error when saving quote:', error);

        // Handle specific foreign key constraint error
        if (error.message.includes('Key is not present in table') ||
            error.message.includes('violates foreign key constraint')) {
          setError('User session is invalid. Please log out and log back in.');
          return false;
        }

        throw error;
      }

      await fetchSavedQuotes();
      setError(null); // Clear any previous errors on successful save
      return true;
    } catch (err) {
      console.error('Failed to save quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to save quote');
      return false;
    }
  };

  const unsaveQuote = async (quoteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Find the saved quote by matching the quote text and author
      // Since we store quote data directly, we need to find by content
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) {
        setError('Quote not found');
        return false;
      }

      const savedQuote = savedQuotes.find(saved => 
        saved.quote.text === quote.text && saved.quote.author === quote.author
      );
      
      if (!savedQuote) {
        setError('Saved quote not found');
        return false;
      }

      const { error } = await supabase
        .from('saved_quotes')
        .delete()
        .eq('id', savedQuote.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchSavedQuotes();
      setError(null); // Clear any previous errors on successful unsave
      return true;
    } catch (err) {
      console.error('Failed to unsave quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsave quote');
      return false;
    }
  };

  const isQuoteSaved = (quoteId: string): boolean => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return false;
    
    return savedQuotes.some(saved => 
      saved.quote.text === quote.text && saved.quote.author === quote.author
    );
  };

  const getQuotesByCategory = (category: string): Quote[] => {
    return quotes.filter(quote => quote.category === category);
  };

  const searchQuotes = (searchTerm: string): Quote[] => {
    const term = searchTerm.toLowerCase();
    return quotes.filter(quote =>
      quote.text.toLowerCase().includes(term) ||
      quote.author.toLowerCase().includes(term) ||
      quote.source?.toLowerCase().includes(term)
    );
  };

  const createUserQuote = async (quote: Omit<UserQuote, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_quotes')
        .insert({
          user_id: user.id,
          ...quote
        });

      if (error) throw error;
      await fetchUserQuotes();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
      return false;
    }
  };

  const updateUserQuote = async (id: string, updates: Partial<UserQuote>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_quotes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchUserQuotes();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote');
      return false;
    }
  };

  const deleteUserQuote = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_quotes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchUserQuotes();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quote');
      return false;
    }
  };

  useEffect((): void => {
    const loadData = async (): Promise<void> => {
      // Cleanup old cached quotes first
      cleanupOldCachedQuotes();
      
      // Only fetch if we don't have quotes yet
      if (quotes.length === 0) {
        setLoading(true);
        await fetchQuotes();
        setLoading(false);
      }
      
      // Always fetch user-specific data when user changes
      if (user) {
        await fetchSavedQuotes();
        await fetchUserQuotes();
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user changes to prevent unnecessary refetches

  // Load quota on mount and when user changes
  useEffect(() => {
    const currentQuota = loadQuotaFromStorage();
    setReloadCount(currentQuota);
  }, [loadQuotaFromStorage]);

  // Handle navigation to quote pages with reduced aggression
  useEffect(() => {
    // Skip on initial mount or if we're already loading
    if (!lastPathname || loading) {
      setLastPathname(pathname);
      return;
    }
    
    const isQuotePage = pathname === '/' || pathname === '/quotes';
    const wasQuotePage = lastPathname === '/' || lastPathname === '/quotes';
    
    // Only check for refetch if actually navigating (not initial mount)
    if (isQuotePage && pathname !== lastPathname) {
      // Only refetch if navigating to a quote page with no quotes loaded
      if (quotes.length === 0 && !loading) {
        console.log('🔍 [useQuotes] Navigating to quote page with no quotes, triggering refetch');
        refetchQuotes();
      }
      // Only refetch if navigating to quote page and data is genuinely old (5+ minutes)
      else if (!wasQuotePage && quotes.length > 0) {
        const timeSinceLastFetch = Date.now() - lastFetchTime;
        if (timeSinceLastFetch > 300000) { // 5 minutes
          console.log('🔍 [useQuotes] Navigating to quote page with 5+ minute old data, triggering refetch');
          refetchQuotes();
        } else {
          console.log('🔍 [useQuotes] Navigation to quote page - data is fresh, skipping refetch');
        }
      }
    }
    
    setLastPathname(pathname);
  }, [pathname, lastPathname, quotes.length, lastFetchTime, loading, refetchQuotes]);

  const refreshDailyQuote = (): Quote | null => {
    if (!canReload) {
      console.log('Daily reload quota exceeded');
      return getDailyQuote();
    }

    if (quotes.length === 0) {
      console.log('No quotes available for reload');
      return getDailyQuote();
    }

    // Find quotes not shown in current session
    const availableQuotes = quotes.filter(quote => !sessionShownQuotes.includes(quote.id));
    
    let selectedQuote: Quote;
    
    if (availableQuotes.length === 0) {
      // If all quotes shown, reset session and pick randomly
      console.log('All quotes shown in session, resetting and picking randomly');
      selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setSessionShownQuotes([selectedQuote.id]);
    } else {
      // Pick randomly from available quotes
      selectedQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
      setSessionShownQuotes(prev => [...prev, selectedQuote.id]);
    }

    // Update quota
    const newCount = reloadCount + 1;
    setReloadCount(newCount);
    saveQuotaToStorage(newCount);

    // Update cache with new quote
    const todayString = new Date().toISOString().split('T')[0];
    setCachedDailyQuote(selectedQuote);
    setCachedDate(todayString);

    // Update localStorage cache
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`daily-quote-${todayString}`, JSON.stringify(selectedQuote));
      } catch (error) {
        console.warn('Failed to update cached quote in localStorage:', error);
      }
    }

    console.log('Daily quote reloaded:', {
      selectedQuote: selectedQuote.id,
      reloadCount: newCount,
      sessionShownQuotes: sessionShownQuotes.length + 1
    });

    return selectedQuote;
  };

  // Cleanup effect to prevent memory leaks and stuck states
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      // Reset locks
      refetchLockRef.current = false;
    };
  }, []);

  return {
    quotes,
    savedQuotes,
    userQuotes,
    loading,
    error,
    getDailyQuote,
    saveQuote,
    unsaveQuote,
    isQuoteSaved,
    getQuotesByCategory,
    searchQuotes,
    createUserQuote,
    updateUserQuote,
    deleteUserQuote,
    refetch: (): void => {
      fetchQuotes();
      if (user) {
        fetchSavedQuotes();
        fetchUserQuotes();
      }
    },
    refreshDailyQuote: refreshDailyQuote,
    debugCacheStatus,
    reloadCount,
    maxReloads,
    canReload,
    isRefetching,
    forceRefresh: async (): Promise<void> => {
      console.log('🔄 [useQuotes] Force refresh triggered');
      setLoading(true);
      setError(null);
      await refetchQuotes();
      setLoading(false);
    }
  };
}
