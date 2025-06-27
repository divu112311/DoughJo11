/*
  # Fix Bank Accounts RLS Policies

  1. Security Updates
    - Drop existing policies that use incorrect uid() function
    - Create new policies with correct auth.uid() function
    - Ensure proper row-level security for bank_accounts table

  2. Changes Made
    - Updated all RLS policies to use auth.uid() instead of uid()
    - Maintained same security model: users can only access their own bank accounts
    - Added proper WITH CHECK clauses for INSERT and UPDATE operations
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