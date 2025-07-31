import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  category: string;
  created_at: string;
}

export interface SavedQuote {
  id: string;
  quote_id: string;
  notes?: string;
  created_at: string;
  quote: Quote;
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
    }
  };

  const fetchSavedQuotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_quotes')
        .select(`
          id,
          quote_id,
          notes,
          created_at,
          quotes:quote_id (
            id,
            text,
            author,
            source,
            category,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        id: item.id,
        quote_id: item.quote_id,
        notes: item.notes,
        created_at: item.created_at,
        quote: item.quotes as Quote
      })) || [];
      
      setSavedQuotes(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved quotes');
    }
  };

  const getDailyQuote = (): Quote | null => {
    if (quotes.length === 0) return null;
    
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % quotes.length;
    
    return quotes[index];
  };

  const saveQuote = async (quoteId: string, notes?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_quotes')
        .insert({
          user_id: user.id,
          quote_id: quoteId,
          notes: notes || null
        });

      if (error) throw error;
      
      await fetchSavedQuotes();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote');
      return false;
    }
  };

  const unsaveQuote = async (quoteId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_quotes')
        .delete()
        .eq('user_id', user.id)
        .eq('quote_id', quoteId);

      if (error) throw error;
      
      await fetchSavedQuotes();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsave quote');
      return false;
    }
  };

  const isQuoteSaved = (quoteId: string): boolean => {
    return savedQuotes.some(sq => sq.quote_id === quoteId);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchQuotes();
      if (user) {
        await fetchSavedQuotes();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    quotes,
    savedQuotes,
    loading,
    error,
    getDailyQuote,
    saveQuote,
    unsaveQuote,
    isQuoteSaved,
    getQuotesByCategory,
    searchQuotes,
    refetch: () => {
      fetchQuotes();
      if (user) fetchSavedQuotes();
    }
  };
}