/*
  # Fix Bank Accounts RLS Policies

  1. Security Updates
    - Drop existing policies with incorrect uid() function
    - Create new policies with correct auth.uid() function
    - Ensure proper user isolation for bank accounts

  This fixes the timeout errors when fetching bank accounts by using the correct
  authentication function in RLS policies.
*/

-- Drop existing policies that use incorrect uid() function
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