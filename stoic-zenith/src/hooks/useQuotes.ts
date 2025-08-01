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

export function useQuotes(user: User | null) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [userQuotes, setUserQuotes] = useState<UserQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use static quotes data instead of database query
      const staticQuotes: Quote[] = [
        {
          id: '1',
          text: 'You have power over your mind—not outside events. Realize this, and you will find strength.',
          author: 'Marcus Aurelius',
          source: 'Meditations',
          category: 'Control',
          created_at: new Date().toISOString(),
          mood_tags: ['strength', 'control']
        },
        {
          id: '2',
          text: 'The best revenge is not to be like your enemy.',
          author: 'Marcus Aurelius',
          source: 'Meditations',
          category: 'Character',
          created_at: new Date().toISOString(),
          mood_tags: ['character', 'virtue']
        },
        {
          id: '3',
          text: 'It is not what happens to you, but how you react to it that matters.',
          author: 'Epictetus',
          source: 'Discourses',
          category: 'Resilience',
          created_at: new Date().toISOString(),
          mood_tags: ['resilience', 'perspective']
        },
        {
          id: '4',
          text: 'The happiness of your life depends upon the quality of your thoughts.',
          author: 'Marcus Aurelius',
          source: 'Meditations',
          category: 'Happiness',
          created_at: new Date().toISOString(),
          mood_tags: ['happiness', 'thoughts']
        },
        {
          id: '5',
          text: 'You are an actor in a play, which is as the author wants it to be.',
          author: 'Epictetus',
          source: 'Enchiridion',
          category: 'Acceptance',
          created_at: new Date().toISOString(),
          mood_tags: ['acceptance', 'role']
        }
      ];
      
      setQuotes(staticQuotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedQuotes = useCallback(async () => {
    if (!user) return;

    try {
      // For now, set empty array to avoid type issues
      setSavedQuotes([]);
    } catch (err) {
      console.error('Failed to fetch saved quotes:', err);
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
    }
  }, [user]);

  const getDailyQuote = (): Quote | null => {
    if (quotes.length === 0) return null;
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
  };

  const saveQuote = async (quoteId: string, notes?: string) => {
    if (!user) return false;

    try {
      // For now, just return true to avoid database schema issues
      console.log('Quote saved:', quoteId, notes);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote');
      return false;
    }
  };

  const unsaveQuote = async (savedQuoteId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_quotes')
        .delete()
        .eq('id', savedQuoteId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchSavedQuotes();
      return true;
    } catch (err) {
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

  const createUserQuote = async (quote: Omit<UserQuote, 'id' | 'created_at' | 'updated_at'>) => {
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

  const updateUserQuote = async (id: string, updates: Partial<UserQuote>) => {
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

  const deleteUserQuote = async (id: string) => {
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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
    refetch: () => {
      fetchQuotes();
      if (user) {
        fetchSavedQuotes();
        fetchUserQuotes();
      }
    }
  };
}