import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, createTimeoutQuery } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
}

interface UserXP {
  id: string;
  user_id: string | null;
  points: number | null;
  badges: string[] | null;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [xp, setXP] = useState<UserXP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setProfile(null);
      setXP(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching user profile and XP for:', user.id);

      // Fetch user profile with timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch user XP with timeout
      const xpPromise = supabase
        .from('xp')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const [profileResult, xpResult] = await Promise.all([
        createTimeoutQuery(profilePromise, 20000, 'Profile query timeout'),
        createTimeoutQuery(xpPromise, 20000, 'XP query timeout')
      ]);

      if (profileResult.error) {
        console.error('Profile fetch error:', profileResult.error);
        throw new Error(`Failed to load profile: ${profileResult.error.message}`);
      }

      if (xpResult.error) {
        console.error('XP fetch error:', xpResult.error);
        throw new Error(`Failed to load XP data: ${xpResult.error.message}`);
      }

      console.log('User data fetched successfully');
      setProfile(profileResult.data);
      setXP(xpResult.data);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const updateXP = async (pointsToAdd: number, newBadge?: string) => {
    if (!user || !xp) return;

    try {
      const newPoints = (xp.points || 0) + pointsToAdd;
      const newBadges = newBadge 
        ? [...(xp.badges || []), newBadge]
        : xp.badges;

      const updatePromise = supabase
        .from('xp')
        .update({
          points: newPoints,
          badges: newBadges,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      const { data, error } = await createTimeoutQuery(
        updatePromise,
        15000,
        'XP update timeout'
      );

      if (error) {
        console.error('Error updating XP:', error);
        return;
      }

      setXP(data);
      return data;
    } catch (error) {
      console.error('Error updating XP:', error);
      return null;
    }
  };

  const clearError = () => setError(null);

  return {
    profile,
    xp,
    loading,
    error,
    updateXP,
    refetch: fetchUserData,
    clearError,
  };
};