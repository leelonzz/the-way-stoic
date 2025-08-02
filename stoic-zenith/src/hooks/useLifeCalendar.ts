import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

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

// Enhanced cache for preferences with circuit breaker
const preferencesCache = new Map<string, { data: LifeCalendarPreferences; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Circuit breaker for database calls
const circuitBreaker = {
  failureCount: 0,
  lastFailureTime: 0,
  maxFailures: 3,
  cooldownPeriod: 30000, // 30 seconds
  isOpen() {
    if (this.failureCount >= this.maxFailures) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      return timeSinceLastFailure < this.cooldownPeriod;
    }
    return false;
  },
  recordSuccess() {
    this.failureCount = 0;
  },
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }
};

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

const setStoredPreferences = (userId: string, prefs: LifeCalendarPreferences) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`life_calendar_prefs_${userId}`, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
};

export function useLifeCalendar(user: User | null) {
  const [preferences, setPreferences] = useState<LifeCalendarPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPreferences = useCallback(async (isRetry = false, forceRefresh = false) => {
    if (!user) return;

    // Check cache first
    const cacheKey = `preferences_${user.id}`;
    const cached = preferencesCache.get(cacheKey);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('📦 Using cached preferences');
      setPreferences(cached.data);
      return;
    }

    // Check localStorage backup if no cache
    if (!forceRefresh && !cached) {
      const stored = getStoredPreferences(user.id);
      if (stored) {
        console.log('💾 Using stored preferences from localStorage');
        setPreferences(stored);
        // Don't return, still try to fetch fresh data
      }
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }
      
      console.log('🔄 Fetching life calendar preferences for user:', user.id);
      
      // Check circuit breaker before making request
      if (circuitBreaker.isOpen()) {
        console.log('🚫 Circuit breaker is open, using fallback');
        const stored = getStoredPreferences(user.id);
        if (stored) {
          setPreferences(stored);
          return;
        }
        // If no stored preferences, set null and let UI handle setup
        setPreferences(null);
        return;
      }
      
      // Reduced timeout for faster feedback
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000) // Reduced to 5 seconds
      );
      
      const fetchPromise = supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as { data: Tables<'user_preferences'> | null; error: { code?: string; message?: string } | null };

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching preferences:', error);
        throw error;
      }

      console.log('✅ Preferences fetched:', data);
      setPreferences(data);
      setRetryCount(0); // Reset retry count on success
      circuitBreaker.recordSuccess(); // Reset circuit breaker on success
      
      // Cache the result and store in localStorage
      if (data) {
        preferencesCache.set(cacheKey, { data, timestamp: now });
        setStoredPreferences(user.id, data);
      }
    } catch (err) {
      console.error('❌ Failed to fetch preferences:', err);
      circuitBreaker.recordFailure(); // Record failure for circuit breaker
      
      // Retry logic for network issues
      if (!isRetry && retryCount < 2 && (err instanceof Error && 
          (err.message.includes('timeout') || err.message.includes('network') || err.message.includes('fetch')))) {
        console.log(`🔄 Retrying... Attempt ${retryCount + 1}/2`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchPreferences(true), 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Better fallback handling - try localStorage first
      const stored = getStoredPreferences(user.id);
      if (stored) {
        console.log('💾 Using stored preferences as fallback');
        setPreferences(stored);
        return;
      }
      
      // If no fallback available, set null for setup flow
      if (err instanceof Error && (err.message === 'Request timeout' || err.message.includes('network'))) {
        console.log('⚠️ Network issue - setting up for default flow');
        setPreferences(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [user, retryCount]);

  const updatePreferences = async (birthDate: Date, lifeExpectancy: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          birth_date: birthDate.toISOString().split('T')[0],
          life_expectancy: lifeExpectancy
        });
      
      if (error) throw error;
      
      // Clear cache and refresh preferences after update
      const cacheKey = `preferences_${user.id}`;
      preferencesCache.delete(cacheKey);
      await fetchPreferences(false, true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    }
  };

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

  const getWeekData = (weekIndex: number) => {
    const isLived = weekIndex < lifeCalendarData.weeksLived;
    const yearNumber = Math.floor(weekIndex / 52);
    const weekInYear = weekIndex % 52;
    
    return {
      isLived,
      yearNumber,
      weekInYear,
      isCurrentWeek: weekIndex === lifeCalendarData.weeksLived
    };
  };

  const getMotivationalMessage = (): string => {
    const { percentageLived, daysRemaining, yearsRemaining } = lifeCalendarData;
    
    if (percentageLived < 25) {
      return "Your life is just beginning. Make every day count.";
    } else if (percentageLived < 50) {
      return "You're in the prime of your life. Pursue what matters most.";
    } else if (percentageLived < 75) {
      return "Wisdom comes with experience. Share your knowledge with others.";
    } else {
      return "Every moment is precious. Cherish the time you have.";
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    lifeCalendarData,
    loading,
    error,
    updatePreferences,
    getWeekData,
    getMotivationalMessage,
    refetch: fetchPreferences
  };
}