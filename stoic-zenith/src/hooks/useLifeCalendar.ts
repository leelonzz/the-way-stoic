import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigationCachedQuery } from '@/hooks/useCacheAwareQuery';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { getTimeouts, exponentialBackoff } from '@/lib/environment';
// import type { Tables } from '@/integrations/supabase/types';

export interface LifeCalendarPreferences {
  id: string;
  user_id: string;
  birth_date: string;
  life_expectancy: number;
  created_at: string;
  updated_at: string;
}

export interface LifeCalendarData {
  birthDate: Date | null;
  lifeExpectancy: number;
  weeksLived: number;
  totalWeeks: number;
  yearsLived: number;
  yearsRemaining: number;
  percentageLived: number;
  daysLived: number;
  daysRemaining: number;
}

// Query keys for React Query
const QUERY_KEYS = {
  preferences: (userId: string) => ['life-calendar', 'preferences', userId],
  all: (userId: string) => ['life-calendar', userId],
} as const;

// Local storage backup
const getStoredPreferences = (userId: string): LifeCalendarPreferences | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`life_calendar_prefs_${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredPreferences = (userId: string, prefs: LifeCalendarPreferences): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`life_calendar_prefs_${userId}`, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
};

// Fetch preferences function with retry logic
const fetchPreferences = async (userId: string): Promise<LifeCalendarPreferences | null> => {
  console.log('🔄 Fetching life calendar preferences for user:', userId);
  
  return exponentialBackoff(
    async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is normal for new users
          console.log('📝 No preferences found for user, will create on first setup');
          return null;
        }
        throw error;
      }

      console.log('✅ Preferences fetched successfully:', data);
      return data;
    },
    {
      maxRetries: 2,
      shouldRetry: (error) => {
        // Don't retry on 404 (not found) or auth errors
        if (error?.code === 'PGRST116' || 
            error?.message?.includes('401') || 
            error?.message?.includes('403')) {
          return false;
        }
        return true;
      }
    }
  ).catch(err => {
    console.error('❌ Error fetching preferences after retries:', err);
    
    // Try to get from localStorage as fallback
    const stored = getStoredPreferences(userId);
    if (stored) {
      console.log('💾 Using stored preferences as fallback');
      return stored;
    }
    
    // Don't throw for network errors - return null to allow app to continue
    if (!err?.message?.includes('401') && !err?.message?.includes('403')) {
      return null;
    }
    
    throw err;
  });
};

// Update preferences function using regular upsert
const updatePreferencesMutation = async ({ 
  userId, 
  birthDate, 
  lifeExpectancy 
}: { 
  userId: string; 
  birthDate: Date; 
  lifeExpectancy: number; 
}): Promise<LifeCalendarPreferences> => {
  console.log('🔄 Updating preferences for user:', userId);
  
  try {
    // Use regular upsert to avoid 409 conflicts
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        birth_date: birthDate.toISOString().split('T')[0],
        life_expectancy: lifeExpectancy
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Preferences updated successfully:', data);
    return data as LifeCalendarPreferences;
  } catch (err) {
    console.error('❌ Failed to update preferences:', err);
    throw err;
  }
};

export function useLifeCalendar(user: User | null) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Cache-aware query for fetching preferences
  const {
    data: preferences,
    isLoading: loading,
    error: queryError,
    refetch
  } = useNavigationCachedQuery(
    QUERY_KEYS.preferences(user?.id || ''),
    () => {
      if (!user?.id) {
        throw new Error('No user ID available for calendar preferences')
      }

      const timeouts = getTimeouts();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<LifeCalendarPreferences | null>((resolve) => {
        setTimeout(() => {
          console.warn('⏱️ Calendar preferences fetch timeout - continuing without data');
          // Don't reject - resolve with null to allow app to continue
          resolve(null);
        }, timeouts.calendarFetch)
      })

      return Promise.race([
        fetchPreferences(user.id),
        timeoutPromise
      ])
    },
    {
      enabled: !!user?.id,
      cacheThreshold: 10 * 60 * 1000, // 10 minutes cache threshold for calendar navigation
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404 (no preferences found)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
          return false;
        }
        // Don't retry on auth errors
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string
          if (message.includes('401') || 
              message.includes('403') || 
              message.includes('unauthorized') || 
              message.includes('No user ID')) {
            return false
          }
        }
        // Allow retry for network/timeout errors
        return failureCount < 3;
      }
    }
  );

  // Handle query errors and success
  useEffect(() => {
    if (queryError) {
      console.error('❌ Query error:', queryError);
      setError(queryError instanceof Error ? queryError.message : 'Failed to fetch preferences');
    } else if (preferences && user) {
      setError(null);
      setStoredPreferences(user.id, preferences);
    }
  }, [queryError, preferences, user]);

  // Mutation for updating preferences
  const updateMutation = useMutation({
    mutationFn: updatePreferencesMutation,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(QUERY_KEYS.preferences(user?.id || ''), data);
      
      // Store in localStorage
      if (user) {
        setStoredPreferences(user.id, data);
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(user?.id || '') });
      
      setError(null);
      // Preferences updated and cache refreshed
    },
    onError: (err) => {
      console.error('❌ Update mutation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  });

  // Calculate life calendar data
  const lifeCalendarData: LifeCalendarData = useMemo(() => {
    const now = new Date();
    const birthDate = preferences?.birth_date ? new Date(preferences.birth_date) : null;
    const lifeExpectancy = preferences?.life_expectancy || 80;

    if (!birthDate) {
      return {
        birthDate: null,
        lifeExpectancy,
        weeksLived: 0,
        totalWeeks: lifeExpectancy * 52,
        yearsLived: 0,
        yearsRemaining: lifeExpectancy,
        percentageLived: 0,
        daysLived: 0,
        daysRemaining: lifeExpectancy * 365
      };
    }

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerYear = 365.25 * msPerDay;

    const ageInMs = now.getTime() - birthDate.getTime();
    const weeksLived = Math.floor(ageInMs / msPerWeek);
    const daysLived = Math.floor(ageInMs / msPerDay);
    const yearsLived = ageInMs / msPerYear;

    const totalWeeks = lifeExpectancy * 52;
    const totalDays = lifeExpectancy * 365;
    const yearsRemaining = Math.max(0, lifeExpectancy - yearsLived);
    const daysRemaining = Math.max(0, totalDays - daysLived);
    const percentageLived = Math.min(100, (weeksLived / totalWeeks) * 100);

    return {
      birthDate,
      lifeExpectancy,
      weeksLived: Math.max(0, weeksLived),
      totalWeeks,
      yearsLived: Math.floor(yearsLived),
      yearsRemaining: Math.floor(yearsRemaining),
      percentageLived: Math.round(percentageLived * 10) / 10,
      daysLived: Math.max(0, daysLived),
      daysRemaining: Math.floor(daysRemaining)
    };
  }, [preferences]);

  // Update preferences function
  const updatePreferences = useCallback(async (birthDate: Date, lifeExpectancy: number): Promise<boolean> => {
    if (!user) return false;

    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        birthDate,
        lifeExpectancy
      });
      return true;
    } catch (err) {
      console.error('❌ Failed to update preferences:', err);
      return false;
    }
  }, [user, updateMutation]);

  // Helper functions
  const getWeekData = useCallback((weekIndex: number): { 
    isLived: boolean; 
    yearNumber: number; 
    weekInYear: number; 
    isCurrentWeek: boolean; 
  } => {
    const isLived = weekIndex < lifeCalendarData.weeksLived;
    const yearNumber = Math.floor(weekIndex / 52);
    const weekInYear = weekIndex % 52;
    
    return {
      isLived,
      yearNumber,
      weekInYear,
      isCurrentWeek: weekIndex === lifeCalendarData.weeksLived
    };
  }, [lifeCalendarData.weeksLived]);

  const getMotivationalMessage = useCallback((): string => {
    const { percentageLived } = lifeCalendarData;
    
    if (percentageLived < 25) {
      return "Your life is just beginning. Make every day count.";
    } else if (percentageLived < 50) {
      return "You're in the prime of your life. Pursue what matters most.";
    } else if (percentageLived < 75) {
      return "Wisdom comes with experience. Share your knowledge with others.";
    } else {
      return "Every moment is precious. Cherish the time you have.";
    }
  }, [lifeCalendarData.percentageLived]);

  // Preload calendar data when user is authenticated
  useEffect(() => {
    if (user && !loading && !preferences) {
      // Preload the calendar data
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.preferences(user.id),
        queryFn: () => fetchPreferences(user.id),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
      });
    }
  }, [user, loading, preferences, queryClient]);

  return {
    preferences,
    lifeCalendarData,
    loading: loading || updateMutation.isPending,
    error: error || (queryError instanceof Error ? queryError.message : null),
    updatePreferences,
    getWeekData,
    getMotivationalMessage,
    refetch,
    isUpdating: updateMutation.isPending
  };
}