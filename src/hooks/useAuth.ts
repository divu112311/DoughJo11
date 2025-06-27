import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, createTimeoutQuery } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - auth will not work');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setError('Failed to get authentication session');
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);

        // Handle successful sign-in (including OAuth)
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user profile exists, create if not
          await ensureUserProfile(session.user);
        }

        // Handle email confirmation
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          console.log('User email confirmed');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    if (!isSupabaseConfigured) return;

    try {
      // Check if user profile exists
      const profilePromise = supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      const { data: existingProfile } = await createTimeoutQuery(
        profilePromise,
        10000,
        'Profile check timeout'
      );

      if (!existingProfile) {
        // Create user profile
        const insertProfilePromise = supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          });

        await createTimeoutQuery(
          insertProfilePromise,
          10000,
          'Profile creation timeout'
        );

        // Create initial XP record
        const insertXPPromise = supabase
          .from('xp')
          .insert({
            user_id: user.id,
            points: 100, // Welcome bonus
            badges: ['Welcome'],
          });

        await createTimeoutQuery(
          insertXPPromise,
          10000,
          'XP creation timeout'
        );
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    });

    if (error) throw error;

    // Profile will be created after email confirmation via auth state change
    return data;
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if email is verified (only for email/password signups)
    if (data.user && !data.user.email_confirmed_at && data.user.app_metadata?.provider === 'email') {
      throw new Error('Please verify your email before signing in');
    }

    return data;
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw new Error('Google sign-in is not configured. Please contact support or use email/password login.');
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (accessToken: string, newPassword: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const clearError = () => setError(null);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    signOut,
    clearError,
  };
};