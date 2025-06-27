import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getUserProfile } from '../lib/supabase';

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
    if (user?.id && isSupabaseConfigured) {
      fetchUserData();
    } else {
      // Clear data when no user or Supabase not configured
      setProfile(null);
      setXP(null);
      setLoading(false);
      setError(null);
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching user profile and XP for:', user.id);

      // Use the optimized function
      const { data: profileData, error } = await getUserProfile(user.id);

      if (error) {
        console.error('Error fetching user data:', error.message);
        throw error;
      }

      // Use profile data
      if (profileData) {
        setProfile(profileData.profile);
        setXP(profileData.xp);
        console.log('User data fetched successfully');
      } else {
        // No profile found, set default values
        setProfile({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'User',
          created_at: new Date().toISOString()
        });
        
        setXP({
          id: 'default',
          user_id: user.id,
          points: 0,
          badges: []
        });
      }

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError(error.message || 'Failed to load user data');
      
      // Set default values on error to prevent app from breaking
      setProfile({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'User',
        created_at: new Date().toISOString()
      });
      
      setXP({
        id: 'default',
        user_id: user.id,
        points: 0,
        badges: []
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultXP = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('xp')
        .insert({
          user_id: userId,
          points: 100, // Welcome bonus
          badges: ['Welcome'],
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating default XP:', error);
        // Set fallback XP data
        setXP({
          id: 'fallback',
          user_id: userId,
          points: 100,
          badges: ['Welcome']
        });
      } else {
        setXP(data);
        console.log('Default XP created successfully');
      }
    } catch (error: any) {
      console.error('Error creating default XP:', error);
      // Set fallback XP data
      setXP({
        id: 'fallback',
        user_id: userId,
        points: 100,
        badges: ['Welcome']
      });
    }
  };

  const updateXP = async (pointsToAdd: number, newBadge?: string) => {
    if (!user?.id || !xp || !isSupabaseConfigured) {
      console.warn('Cannot update XP - missing user ID, XP data, or Supabase not configured');
      return null;
    }

    try {
      const newPoints = (xp.points || 0) + pointsToAdd;
      const newBadges = newBadge 
        ? [...(xp.badges || []), newBadge]
        : xp.badges;

      const { data, error } = await supabase
        .from('xp')
        .update({
          points: newPoints,
          badges: newBadges,
        })
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating XP:', error);
        return null;
      }

      setXP(data);
      return data;
    } catch (error: any) {
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