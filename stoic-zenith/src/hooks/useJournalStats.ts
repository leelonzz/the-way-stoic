import { useState, useEffect, useCallback } from 'react';
import { RealTimeJournalManager } from '@/lib/journal';
import type { JournalEntry } from '@/components/journal/types';
import { useAuthContext } from '@/components/auth/AuthProvider';

export interface JournalStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  weeklyProgress: boolean[];
}

export function useJournalStats() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<JournalStats>({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
    weeklyProgress: [false, false, false, false, false, false, false],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStreak = useCallback((entries: JournalEntry[]): number => {
    if (entries.length === 0) return 0;

    // Sort entries by date in descending order (most recent first)
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Get unique dates (one entry per day counts)
    const uniqueDates = new Set<string>();
    sortedEntries.forEach(entry => {
      const dateStr = entry.date.split('T')[0]; // Get YYYY-MM-DD part
      uniqueDates.add(dateStr);
    });

    // Convert to sorted array of dates
    const datesArray = Array.from(uniqueDates).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    if (datesArray.length === 0) return 0;

    // Check if streak is current (includes today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentEntry = new Date(datesArray[0]);
    mostRecentEntry.setHours(0, 0, 0, 0);

    // If most recent entry is not today or yesterday, streak is broken
    if (mostRecentEntry < yesterday) {
      return 0;
    }

    // Calculate consecutive days from most recent entry
    let streak = 1;
    for (let i = 1; i < datesArray.length; i++) {
      const currentDate = new Date(datesArray[i]);
      const previousDate = new Date(datesArray[i - 1]);
      
      // Set to midnight for accurate day comparison
      currentDate.setHours(0, 0, 0, 0);
      previousDate.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffInMs = previousDate.getTime() - currentDate.getTime();
      const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
      
      // If difference is exactly 1 day, continue streak
      if (diffInDays === 1) {
        streak++;
      } else {
        // Streak is broken
        break;
      }
    }

    return streak;
  }, []);

  const calculateLongestStreak = useCallback((entries: JournalEntry[]): number => {
    if (entries.length === 0) return 0;

    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Get unique dates
    const uniqueDates = new Set<string>();
    sortedEntries.forEach(entry => {
      const dateStr = entry.date.split('T')[0];
      uniqueDates.add(dateStr);
    });

    const datesArray = Array.from(uniqueDates).sort();
    if (datesArray.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < datesArray.length; i++) {
      const currentDate = new Date(datesArray[i]);
      const previousDate = new Date(datesArray[i - 1]);
      
      currentDate.setHours(0, 0, 0, 0);
      previousDate.setHours(0, 0, 0, 0);
      
      const diffInMs = currentDate.getTime() - previousDate.getTime();
      const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }, []);

  const calculateWeeklyProgress = useCallback((entries: JournalEntry[]): boolean[] => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    
    // Adjust to get Monday as start of week (0 = Sunday, 1 = Monday, etc.)
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Create a map of dates with entries
    const entryDates = new Set<string>();
    entries.forEach(entry => {
      const dateStr = entry.date.split('T')[0];
      entryDates.add(dateStr);
    });

    // Check each day of the week (Monday to Sunday)
    const weeklyProgress: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      weeklyProgress.push(entryDates.has(dateStr));
    }

    return weeklyProgress;
  }, []);

  const fetchJournalStats = useCallback(async () => {
    if (!user) {
      setStats({
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        weeklyProgress: [false, false, false, false, false, false, false],
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const manager = RealTimeJournalManager.getInstance(user.id);
      const entries = await manager.getAllEntries();

      // Calculate stats
      const totalEntries = entries.length;
      const currentStreak = calculateStreak(entries);
      const longestStreak = calculateLongestStreak(entries);
      const weeklyProgress = calculateWeeklyProgress(entries);
      
      // Get last entry date
      let lastEntryDate: string | null = null;
      if (entries.length > 0) {
        const sortedEntries = [...entries].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        lastEntryDate = sortedEntries[0].date;
      }

      setStats({
        totalEntries,
        currentStreak,
        longestStreak,
        lastEntryDate,
        weeklyProgress,
      });

      console.log('📊 Journal stats calculated:', {
        totalEntries,
        currentStreak,
        longestStreak,
        lastEntryDate,
        weeklyProgress,
      });
    } catch (err) {
      console.error('Failed to fetch journal stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch journal stats');
      setStats({
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        weeklyProgress: [false, false, false, false, false, false, false],
      });
    } finally {
      setLoading(false);
    }
  }, [user, calculateStreak, calculateLongestStreak, calculateWeeklyProgress]);

  // Fetch stats on mount and when user changes
  useEffect(() => {
    fetchJournalStats();
  }, [fetchJournalStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchJournalStats,
  };
}