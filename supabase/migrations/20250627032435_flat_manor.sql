/*
  # Fix Bank Accounts RLS Policies

  This migration fixes the Row Level Security policies for the bank_accounts table
  by using the correct auth.uid() function instead of uid().

  ## Changes
  1. Drop existing policies with incorrect uid() function
  2. Create new policies with correct auth.uid() function
  3. Ensure proper access control for authenticated users

  ## Manual Application Required
  Since Supabase CLI is not connected, run this SQL directly in Supabase Dashboard:
  1. Go to supabase.com/dashboard
  2. Select your project
  3. Navigate to SQL Editor
  4. Copy and paste this SQL
  5. Click "Run"
*/

-- Drop existing policies that may use incorrect uid() function
DROP POLICY IF EXISTS "Users can delete own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can insert own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can read own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can update own bank accounts" ON public.bank_accounts;

-- Create new policies with correct auth.uid() function
CREATE POLICY "Users can read own bank accounts"
  ON public.bank_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON public.bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON public.bank_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON public.bank_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);