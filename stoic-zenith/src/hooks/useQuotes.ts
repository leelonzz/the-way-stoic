import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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
} {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [userQuotes, setUserQuotes] = useState<UserQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const getDailyQuote = (): Quote | null => {
    // If no quotes available, return the first fallback quote
    if (quotes.length === 0) {
      console.log('No quotes available for daily quote, using fallback');
      return FALLBACK_QUOTES[0];
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const _todayString = today.toISOString().split('T')[0];
    
    // Try to get a specific daily quote for today first
    // For now, use the day-based algorithm as fallback
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const selectedQuote = quotes[dayOfYear % quotes.length];
    
    console.log('Daily quote selected:', {
      dayOfYear,
      totalQuotes: quotes.length,
      selectedQuoteIndex: dayOfYear % quotes.length,
      quote: selectedQuote
    });
    
    return selectedQuote;
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
      const alreadySaved = savedQuotes.some(saved => saved.quote_id === quoteId);
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
      // Find the saved quote by quote_id (which is the original quote's ID)
      const savedQuote = savedQuotes.find(saved => saved.quote_id === quoteId);
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
    return savedQuotes.some(saved => saved.quote_id === quoteId);
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
  }, [user, fetchQuotes, fetchSavedQuotes, fetchUserQuotes]);

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
    refreshDailyQuote: (): Quote | null => {
      // Force a refresh of the daily quote by clearing cache or using different logic
      const newQuote = getDailyQuote();
      return newQuote;
    }
  };
}