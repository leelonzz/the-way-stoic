import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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

export function useLifeCalendar(user: User | null) {
  const [preferences, setPreferences] = useState<LifeCalendarPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching life calendar preferences for user:', user.id);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching preferences:', error);
        throw error;
      }

      console.log('✅ Preferences fetched:', data);
      setPreferences(data);
    } catch (err) {
      console.error('❌ Failed to fetch preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  }, [user]);

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