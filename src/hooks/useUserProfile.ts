import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, createTimeoutQuery, isSupabaseConfigured } from '../lib/supabase';

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
  }, [user?.id]); // Only depend on user.id to avoid unnecessary re-fetches

  const fetchUserData = async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

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

      // Fetch user XP with timeout - use maybeSingle to handle no records gracefully
      const xpPromise = supabase
        .from('xp')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      const [profileResult, xpResult] = await Promise.allSettled([
        createTimeoutQuery(profilePromise, 20000, 'Profile query timeout'),
        createTimeoutQuery(xpPromise, 20000, 'XP query timeout')
      ]);

      // Handle profile result
      if (profileResult.status === 'fulfilled') {
        if (profileResult.value.error) {
          console.error('Profile fetch error:', profileResult.value.error);
          throw new Error(`Failed to load profile: ${profileResult.value.error.message}`);
        }
        setProfile(profileResult.value.data);
      } else {
        console.error('Profile fetch failed:', profileResult.reason);
        throw new Error('Failed to load user profile');
      }

      // Handle XP result - create default XP if none exists
      if (xpResult.status === 'fulfilled') {
        if (xpResult.value.error) {
          console.error('XP fetch error:', xpResult.value.error);
          throw new Error(`Failed to load XP data: ${xpResult.value.error.message}`);
        }
        
        // If no XP record exists, create one
        if (!xpResult.value.data) {
          console.log('No XP record found, creating default XP for user:', user.id);
          await createDefaultXP(user.id);
        } else {
          setXP(xpResult.value.data);
        }
      } else {
        console.error('XP fetch failed:', xpResult.reason);
        // Create default XP on fetch failure
        console.log('XP fetch failed, creating default XP for user:', user.id);
        await createDefaultXP(user.id);
      }

      console.log('User data fetched successfully');
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
      const insertXPPromise = supabase
        .from('xp')
        .insert({
          user_id: userId,
          points: 100, // Welcome bonus
          badges: ['Welcome'],
        })
        .select()
        .single();

      const { data, error } = await createTimeoutQuery(
        insertXPPromise,
        15000,
        'XP creation timeout'
      );

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