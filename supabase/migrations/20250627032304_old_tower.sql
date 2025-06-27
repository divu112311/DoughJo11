/*
  # Fix Bank Accounts RLS Policies

  1. Security Updates
    - Drop existing RLS policies that use incorrect `uid()` function
    - Create new policies using correct `auth.uid()` function
    - Ensure authenticated users can properly access their own bank account data

  2. Policy Changes
    - SELECT: Users can read their own bank accounts
    - INSERT: Users can insert their own bank accounts  
    - UPDATE: Users can update their own bank accounts
    - DELETE: Users can delete their own bank accounts

  This fixes the timeout issue by ensuring RLS policies work correctly with Supabase auth.
*/

-- Drop existing policies that use incorrect uid() function
DROP POLICY IF EXISTS "Users can delete own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can read own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update own bank accounts" ON bank_accounts;

-- Create new policies with correct auth.uid() function
CREATE POLICY "Users can read own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);