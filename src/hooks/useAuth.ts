import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, createTimeoutQuery, retryQuery } from '../lib/supabase';

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
          await // In your useAuth.ts file, around line 138
import { getOrCreateUserProfileFast } from '../lib/supabase'

// Replace the current ensureUserProfile call with:
const { data: profile, error } = await getOrCreateUserProfileFast(user)

if (error && !error.fallback) {
  console.warn('Profile creation had issues, but continuing with fallback')
}

// Continue with your auth flow using the profile data(session.user);
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
            await ensureUserProfile(session.user);
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

  const // In your useAuth.ts file, around line 138
import { getOrCreateUserProfileFast } from '../lib/supabase'

// Replace the current ensureUserProfile call with:
const { data: profile, error } = await getOrCreateUserProfileFast(user)

if (error && !error.fallback) {
  console.warn('Profile creation had issues, but continuing with fallback')
}

// Continue with your auth flow using the profile data = async (user: User) => {
    if (!isSupabaseConfigured || !user?.id) {
      console.warn('⚠️ Cannot ensure user profile - missing user ID or Supabase not configured');
      return;
    }

    try {
      console.log('🔍 Ensuring user profile exists for:', user.id);

      // Check if user profile exists with timeout and retry logic
      const profileResult = await retryQuery(async () => {
        const profilePromise = supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .limit(1)
          .maybeSingle();

        return await createTimeoutQuery(
          profilePromise,
          8000, // Reduced timeout
          'Profile check timeout'
        );
      }, 2, 1000);

      if (profileResult.error) {
        console.error('❌ Error checking user profile:', profileResult.error);
        return;
      }

      if (!profileResult.data) {
        console.log('➕ Creating new user profile for:', user.id);
        
        // Create user profile with timeout and retry
        await retryQuery(async () => {
          const insertProfilePromise = supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            });

          return await createTimeoutQuery(
            insertProfilePromise,
            8000, // Reduced timeout
            'Profile creation timeout'
          );
        }, 2, 1000);

        // Check if XP record already exists before creating
        const xpResult = await retryQuery(async () => {
          const xpCheckPromise = supabase
            .from('xp')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          return await createTimeoutQuery(xpCheckPromise, 8000, 'XP check timeout');
        }, 2, 1000);

        if (xpResult.error) {
          console.error('❌ Error checking existing XP:', xpResult.error);
        }

        // Only create XP record if it doesn't exist
        if (!xpResult.data) {
          console.log('➕ Creating initial XP record for:', user.id);
          
          await retryQuery(async () => {
            const insertXPPromise = supabase
              .from('xp')
              .insert({
                user_id: user.id,
                points: 100, // Welcome bonus
                badges: ['Welcome'],
              });

            return await createTimeoutQuery(
              insertXPPromise,
              8000, // Reduced timeout
              'XP creation timeout'
            );
          }, 2, 1000);

          console.log('✅ User profile and XP created successfully');
        } else {
          console.log('✅ User profile created, XP already exists');
        }
      } else {
        console.log('✅ User profile already exists');
      }
    } catch (error: any) {
      console.error('❌ Error ensuring user profile:', error);
      // Don't throw error here as it would break the auth flow
      // The useUserProfile hook will handle creating missing XP records
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