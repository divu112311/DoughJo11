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

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Failed to get authentication session');
          setUser(null);
        } else {
          console.log('Initial session:', session?.user?.id ? 'User logged in' : 'No user');
          
          // Security check: Validate session age
          if (session?.user) {
            const sessionAge = Date.now() - new Date(session.user.created_at || 0).getTime();
            const maxSessionAge = 30 * 60 * 1000; // 30 minutes
            
            if (sessionAge > maxSessionAge) {
              console.log('Session too old, forcing logout');
              await supabase.auth.signOut();
              setUser(null);
            } else {
              setUser(session.user);
              await ensureUserProfile(session.user);
            }
          } else {
            setUser(null);
          }
        }
      } catch (err: any) {
        console.error('Session retrieval error:', err);
        setError('Authentication system unavailable');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        try {
          setUser(session?.user ?? null);
          setError(null);

          // Handle successful sign-in (including OAuth)
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in:', session.user.id);
            
            // Security: Clear any existing session data
            localStorage.removeItem('currentSessionId');
            sessionStorage.clear();
            
            await ensureUserProfile(session.user);
          }

          // Handle sign out
          if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUser(null);
            setError(null);
            
            // Security: Clear all session data
            localStorage.clear();
            sessionStorage.clear();
          }

          // Handle email confirmation
          if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
            console.log('User email confirmed');
          }
        } catch (err: any) {
          console.error('Auth state change error:', err);
          setError('Authentication error occurred');
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    if (!isSupabaseConfigured || !user?.id) {
      console.warn('Cannot ensure user profile - missing user ID or Supabase not configured');
      return;
    }

    try {
      console.log('Ensuring user profile exists for:', user.id);

      // Check if user profile exists with timeout
      const profilePromise = supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      const { data: existingProfile, error: profileError } = await createTimeoutQuery(
        profilePromise,
        15000,
        'Profile check timeout'
      );

      if (profileError) {
        console.error('Error checking user profile:', profileError);
        return;
      }

      if (!existingProfile) {
        console.log('Creating new user profile for:', user.id);
        
        // Create user profile with timeout
        const insertProfilePromise = supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          });

        await createTimeoutQuery(
          insertProfilePromise,
          15000,
          'Profile creation timeout'
        );

        // Create initial XP record with timeout
        const insertXPPromise = supabase
          .from('xp')
          .insert({
            user_id: user.id,
            points: 100, // Welcome bonus
            badges: ['Welcome'],
          });

        await createTimeoutQuery(
          insertXPPromise,
          15000,
          'XP creation timeout'
        );

        console.log('User profile and XP created successfully');
      } else {
        console.log('User profile already exists');
      }
    } catch (error: any) {
      console.error('Error ensuring user profile:', error);
      // Don't throw error here as it would break the auth flow
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }

    setError(null);
    
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

    setError(null);

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

    setError(null);

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

    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (accessToken: string, newPassword: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }

    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  };

  const signOut = async () => {
    setError(null);
    
    // Security: Clear all session data immediately
    localStorage.clear();
    sessionStorage.clear();
    
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Clear user state immediately
    setUser(null);
    
    // Force page reload to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
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