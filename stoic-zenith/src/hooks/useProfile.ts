import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

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

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get saved quotes count
      const { count: savedQuotesCount } = await supabase
        .from('saved_quotes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get completed goals count
      const { count: completedGoalsCount } = await supabase
        .from('user_goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true);

      // Calculate days since joined
      const daysSinceJoined = profile 
        ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      setStats({
        journalEntries: 0, // TODO: Implement when journal is ready
        savedQuotes: savedQuotesCount || 0,
        goalsCompleted: completedGoalsCount || 0,
        daysSinceJoined,
        currentStreak: 0 // TODO: Implement streak tracking
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => {
    if (!user || !profile) return false;

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
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

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