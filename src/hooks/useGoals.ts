import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, createTimeoutQuery, isSupabaseConfigured } from '../lib/supabase';

interface Goal {
  id: string;
  user_id: string | null;
  name: string | null;
  target_amount: number | null;
  saved_amount: number | null;
  deadline: string | null;
  created_at: string | null;
}

export const useGoals = (user: User | null) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && isSupabaseConfigured) {
      fetchGoals();
    } else {
      // Clear goals when no user or Supabase not configured
      setLoading(false);
      setGoals([]);
      setError(null);
    }
  }, [user?.id]); // Only depend on user.id

  const fetchGoals = async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching goals for user:', user.id);
      
      const queryPromise = supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await createTimeoutQuery(
        queryPromise,
        20000,
        'Goals query timeout - please check your connection'
      );

      if (fetchError) {
        console.error('Error fetching goals:', fetchError);
        throw new Error(`Failed to load goals: ${fetchError.message}`);
      }

      console.log('Goals fetched successfully:', data?.length || 0);
      setGoals(data || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      setError(error.message || 'Failed to load financial goals');
      // Set empty goals on error so UI doesn't stay in loading state
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user?.id || !isSupabaseConfigured) {
      console.warn('Cannot create goal - missing user ID or Supabase not configured');
      return null;
    }

    try {
      const queryPromise = supabase
        .from('goals')
        .insert({
          user_id: user.id,
          ...goal,
        })
        .select()
        .single();

      const { data, error } = await createTimeoutQuery(
        queryPromise,
        10000,
        'Create goal timeout'
      );

      if (error) {
        console.error('Error creating goal:', error);
        return null;
      }

      setGoals(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user?.id || !isSupabaseConfigured) {
      console.warn('Cannot update goal - missing user ID or Supabase not configured');
      return null;
    }

    try {
      const queryPromise = supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      const { data, error } = await createTimeoutQuery(
        queryPromise,
        10000,
        'Update goal timeout'
      );

      if (error) {
        console.error('Error updating goal:', error);
        return null;
      }

      setGoals(prev => prev.map(goal => goal.id === id ? data : goal));
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      return null;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user?.id || !isSupabaseConfigured) {
      console.warn('Cannot delete goal - missing user ID or Supabase not configured');
      return false;
    }

    try {
      const queryPromise = supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      const { error } = await createTimeoutQuery(
        queryPromise,
        10000,
        'Delete goal timeout'
      );

      if (error) {
        console.error('Error deleting goal:', error);
        return false;
      }

      setGoals(prev => prev.filter(goal => goal.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  };

  const clearError = () => setError(null);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
    clearError,
  };
};