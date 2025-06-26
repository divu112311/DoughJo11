/*
  # Add bank accounts table for Plaid integration

  1. New Tables
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `plaid_account_id` (text, unique identifier from Plaid)
      - `plaid_access_token` (text, encrypted access token)
      - `name` (text, account name)
      - `type` (text, account type: depository, credit, etc.)
      - `subtype` (text, account subtype: checking, savings, etc.)
      - `balance` (numeric, current balance)
      - `institution_name` (text, bank name)
      - `institution_id` (text, Plaid institution ID)
      - `mask` (text, last 4 digits of account)
      - `last_updated` (timestamp, when balance was last synced)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `bank_accounts` table
    - Add policies for users to manage their own accounts only
*/

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plaid_account_id text NOT NULL,
  plaid_access_token text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  subtype text,
  balance numeric DEFAULT 0,
  institution_name text NOT NULL,
  institution_id text NOT NULL,
  mask text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, plaid_account_id)
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own bank accounts
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
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_plaid_account_id ON bank_accounts(plaid_account_id);