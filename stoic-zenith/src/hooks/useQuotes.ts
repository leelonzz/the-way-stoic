import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useTabVisibility } from './useTabVisibility';

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
  isRefetching: boolean;
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

  // Use centralized tab visibility management
  const tabVisibility = useTabVisibility({ refreshThreshold: 2000 }); // 2 seconds
  
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
    if (isRefetching) {
      console.log('🔍 [useQuotes] Refetch already in progress, skipping');
      return; // Prevent multiple simultaneous refetches
    }

    try {
      setIsRefetching(true);
      console.log('🔄 [useQuotes] Starting refetch due to tab visibility change...');

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
      setIsRefetching(false);
      console.log('🔍 [useQuotes] Refetch process finished');
    }
  }, [isRefetching, fetchQuotes, fetchSavedQuotes, fetchUserQuotes, user]);

  // Register tab visibility callbacks with centralized system
  useEffect(() => {
    const callbackId = 'useQuotes';

    tabVisibility.registerCallbacks(callbackId, {
      onVisible: async (state) => {
        const hasNoQuotes = quotes.length === 0;
        const shouldRefreshData = tabVisibility.shouldRefresh(lastFetchTime);

        console.log('🔍 [useQuotes] Tab became visible, checking refresh conditions:', {
          hasNoQuotes,
          shouldRefreshData,
          wasHiddenDuration: Math.round(state.wasHiddenDuration / 1000),
          quotesLength: quotes.length,
          lastFetchTime: new Date(lastFetchTime).toLocaleTimeString()
        });

        // Refetch if:
        // 1. No quotes are currently loaded (immediate refresh)
        // 2. shouldRefresh logic determines it's needed based on time thresholds
        if (hasNoQuotes || shouldRefreshData) {
          console.log('✅ [useQuotes] TRIGGERING REFETCH:', {
            hasNoQuotes,
            shouldRefreshData,
            reason: hasNoQuotes ? 'no quotes loaded' : 'time threshold exceeded'
          });
          await refetchQuotes();
        } else {
          console.log('⏭️ [useQuotes] No refetch needed:', {
            quotesCount: quotes.length,
            wasHiddenDuration: Math.round(state.wasHiddenDuration / 1000)
          });
        }
      },
      onHidden: () => {
        console.log('🔍 [useQuotes] Tab became hidden');
      }
    });

    return () => {
      tabVisibility.unregisterCallbacks(callbackId);
    };
  }, [tabVisibility, quotes.length, lastFetchTime, refetchQuotes]);



  // Memoized daily quote calculation
  const dailyQuote = useMemo(() => {
    // If no quotes available, return the first fallback quote
    if (quotes.length === 0) {
      console.log('No quotes available for daily quote, using fallback');
      return FALLBACK_QUOTES[0];
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Check if we have a cached quote for today
    if (cachedDailyQuote && cachedDate === todayString) {
      console.log('Using cached daily quote for today:', cachedDate);
      return cachedDailyQuote;
    }
    
    // Check localStorage for cached quote
    if (typeof window !== 'undefined') {
      try {
        const storedQuoteData = localStorage.getItem(`daily-quote-${todayString}`);
        if (storedQuoteData) {
          const storedQuote = JSON.parse(storedQuoteData);
          console.log('Using localStorage cached daily quote for today:', todayString);
          setCachedDailyQuote(storedQuote);
          setCachedDate(todayString);
          return storedQuote;
        }
      } catch (error) {
        console.warn('Failed to load cached quote from localStorage:', error);
      }
    }
    
    // Calculate new daily quote
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const selectedQuote = quotes[dayOfYear % quotes.length];
    
    // Cache the quote and date in both state and localStorage
    setCachedDailyQuote(selectedQuote);
    setCachedDate(todayString);
    
    // Store in localStorage for persistence across sessions
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`daily-quote-${todayString}`, JSON.stringify(selectedQuote));
      } catch (error) {
        console.warn('Failed to cache quote in localStorage:', error);
      }
    }
    
    console.log('New daily quote calculated and cached:', {
      dayOfYear,
      totalQuotes: quotes.length,
      selectedQuoteIndex: dayOfYear % quotes.length,
      quote: selectedQuote,
      date: todayString
    });
    
    return selectedQuote;
  }, [quotes, cachedDailyQuote, cachedDate]);

  const getDailyQuote = (): Quote | null => {
    console.log('getDailyQuote called - returning cached quote:', dailyQuote?.id);
    return dailyQuote;
  };

  const saveQuote = async (quoteId: string, notes?: string): Promise<boolean> => {
    if (!user) return false;

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

      const { error } = await supabase
        .from('saved_quotes')
        .insert({
          user_id: user.id,
          quote_text: quote.text,
          author: quote.author,
          source: quote.source,
          tags: quote.mood_tags || [],
          personal_note: notes,
          is_favorite: false
        });

      if (error) throw error;
      
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
      
      // Only show loading if we don't have any quotes yet
      if (quotes.length === 0) {
        setLoading(true);
      }
      
      await fetchQuotes();
      if (user) {
        await fetchSavedQuotes();
        await fetchUserQuotes();
      }
      setLoading(false);
    };

    loadData();
  }, [user, fetchQuotes, fetchSavedQuotes, fetchUserQuotes, cleanupOldCachedQuotes]);

  // Load quota on mount and when user changes
  useEffect(() => {
    const currentQuota = loadQuotaFromStorage();
    setReloadCount(currentQuota);
  }, [loadQuotaFromStorage]);

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
    reloadCount,
    maxReloads,
    canReload,
    isRefetching
  };
}
