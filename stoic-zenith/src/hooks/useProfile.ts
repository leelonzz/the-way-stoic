import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
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

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

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

      setProfile(prev => prev ? { ...prev, ...updates } : null);
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
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    refetch: () => {
      fetchProfile();
      if (profile) fetchStats();
    }
  };
}