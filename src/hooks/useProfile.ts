import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  journalEntries: number;
  savedQuotes: number;
  goalsCompleted: number;
  daysSinceJoined: number;
  currentStreak: number;
}

// Simple cache for profiles
const profileCache = new Map<string, { data: UserProfile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utility function to clear profile cache
export function clearProfileCache(userId?: string): void {
  if (userId) {
    const cacheKey = `profile_${userId}`;
    profileCache.delete(cacheKey);
    // Also clear localStorage cache if it exists
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey);
    }
  } else {
    // Clear all profile cache
    profileCache.clear();
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profile_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}

export function useProfile(user: User | null): {
  profile: UserProfile | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (isRetry?: boolean, forceRefresh?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => Promise<boolean>;
  updateEmail: (newEmail: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
} {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProfile = useCallback(async (isRetry = false, forceRefresh = false) => {
    if (!user) return;

    // Check cache first
    const cacheKey = `profile_${user.id}`;
    const cached = profileCache.get(cacheKey);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      // Using cached profile
      setProfile(cached.data);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }
      
      console.log('🔄 Fetching profile for user:', user.id);
      
      // Add timeout and retry logic
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as { data: Tables<'profiles'> | null; error: { message?: string } | null };

      if (error) throw error;
      
      console.log('✅ Profile fetched:', data);
      setProfile(data);
      setRetryCount(0); // Reset retry count on success
      
      // Cache the result
      if (data) {
        profileCache.set(cacheKey, { data, timestamp: now });
      }
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
      
      // Retry logic for network issues
      if (!isRetry && retryCount < 2 && (err instanceof Error && 
          (err.message.includes('timeout') || err.message.includes('network') || err.message.includes('fetch')))) {
        console.log(`🔄 Retrying profile fetch... Attempt ${retryCount + 1}/2`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchProfile(true), 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [user, retryCount]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Calculate days since joined
      const joinedDate = new Date(user.created_at);
      const now = new Date();
      const daysSinceJoined = Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

      // For now, set placeholder values (in a real app, you'd calculate these from database)
      setStats({
        journalEntries: 0,
        savedQuotes: 0,
        goalsCompleted: 0,
        daysSinceJoined,
        currentStreak: 0
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Clear cache and refresh profile
      const cacheKey = `profile_${user.id}`;
      profileCache.delete(cacheKey);
      await fetchProfile(false, true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  const updateEmail = async (newEmail: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
      return false;
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      return false;
    }
  };

  const deleteAccount = async () => {
    if (!user) return false;

    try {
      // Delete user data first (cascading deletes will handle related data)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Sign out and delete auth user (this requires admin privileges in a real app)
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };

    loadData();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile, fetchStats]);

  return {
    profile,
    stats,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    refetch: async (): Promise<void> => {
      await fetchProfile();
      if (profile) await fetchStats();
    },
    retry: async (): Promise<void> => {
      await fetchProfile(true);
    }
  };
}