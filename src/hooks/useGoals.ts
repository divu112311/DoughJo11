import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, createTimeoutQuery } from '../lib/supabase';

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
    if (user) {
      fetchGoals();
    } else {
      setLoading(false);
      setGoals([]);
      setError(null);
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) {
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
        8000,
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
    if (!user) return;

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
        5000,
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
    if (!user) return;

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
        5000,
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
    if (!user) return;

    try {
      const queryPromise = supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      const { error } = await createTimeoutQuery(
        queryPromise,
        5000,
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