import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, ensureUserProfile } from '../lib/supabase';

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
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setError('Failed to get authentication session');
          setUser(null);
        } else if (session?.user?.id) {
          console.log('✅ User found in session:', session.user.id);
          setUser(session.user);
          await handleUserProfile(session.user);
        } else {
          console.log('ℹ️ No active session found');
          setUser(null);
        }
      } catch (err: any) {
        console.error('❌ Session retrieval error:', err);
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
        console.log('🔄 Auth event:', event, session?.user?.id ? `User: ${session.user.id}` : 'No user');
        
        try {
          setError(null);

          // Handle successful sign-in (including OAuth)
          if (event === 'SIGNED_IN' && session?.user?.id) {
            console.log('✅ User signed in:', session.user.id);
            setUser(session.user);
            await handleUserProfile(session.user);
          }

          // Handle sign out
          if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            setUser(null);
            setError(null);
          }

          // Handle token refresh
          if (event === 'TOKEN_REFRESHED' && session?.user?.id) {
            console.log('🔄 Token refreshed for user:', session.user.id);
            setUser(session.user);
          }

          // Handle general session updates
          if (session?.user?.id) {
            setUser(session.user);
          } else if (!session) {
            setUser(null);
          }

        } catch (err: any) {
          console.error('❌ Auth state change error:', err);
          setError('Authentication error occurred');
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await ensureUserProfile(user);

      if (error) {
        if (error.fallback) {
          console.log('Using fallback profile due to database issues');
        } else {
          console.error('Critical profile error:', error);
        }
      }

      if (profile) {
        console.log('✅ User profile ensured successfully');
      }
    } catch (error: any) {
      console.error('❌ Error handling user profile:', error);
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