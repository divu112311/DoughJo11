import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string | null;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string | null;
          name: string | null;
          target_amount: number | null;
          saved_amount: number | null;
          deadline: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name?: string | null;
          target_amount?: number | null;
          saved_amount?: number | null;
          deadline?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string | null;
          target_amount?: number | null;
          saved_amount?: number | null;
          deadline?: string | null;
          created_at?: string | null;
        };
      };
      chat_logs: {
        Row: {
          id: string;
          user_id: string | null;
          message: string | null;
          sender: string | null;
          timestamp: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          message?: string | null;
          sender?: string | null;
          timestamp?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          message?: string | null;
          sender?: string | null;
          timestamp?: string | null;
        };
      };
      xp: {
        Row: {
          id: string;
          user_id: string | null;
          points: number | null;
          badges: string[] | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          points?: number | null;
          badges?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          points?: number | null;
          badges?: string[] | null;
        };
      };
    };
  };
}