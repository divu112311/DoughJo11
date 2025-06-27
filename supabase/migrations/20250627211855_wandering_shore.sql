/*
  # Enable Row Level Security Fix

  This migration enables RLS on all tables that have RLS policies but don't have RLS enabled.
  This fixes the query timeout issues caused by RLS policy mismatches.

  ## Changes Made
  1. Enable RLS on users table
  2. Enable RLS on goals table  
  3. Enable RLS on chat_logs table
  4. Enable RLS on quiz_results table
  5. Enable RLS on bank_accounts table

  ## Security
  - All existing RLS policies will now be properly enforced
  - Users can only access their own data as intended by the policies
*/

-- Enable RLS on users table (has policies but RLS not enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on goals table (has policies but RLS not enabled)  
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_logs table (has policies but RLS not enabled)
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quiz_results table (has policies but RLS not enabled)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bank_accounts table (has policies but RLS not enabled)
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on all tables with policies
DO $$
BEGIN
  -- Check if all tables have RLS enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
    AND c.relname IN ('users', 'goals', 'chat_logs', 'quiz_results', 'bank_accounts', 'xp')
    AND c.relrowsecurity = true
    GROUP BY c.relrowsecurity
    HAVING COUNT(*) = 6
  ) THEN
    RAISE EXCEPTION 'RLS not properly enabled on all required tables';
  END IF;
  
  RAISE NOTICE 'RLS successfully enabled on all tables with policies';
END $$;