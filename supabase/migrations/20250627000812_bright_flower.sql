/*
  # Quiz Results Table

  1. New Tables
    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `category` (text, quiz category)
      - `difficulty` (text, difficulty level)
      - `score` (integer, percentage score)
      - `correct_answers` (integer, number of correct answers)
      - `total_questions` (integer, total questions in quiz)
      - `xp_earned` (integer, XP points earned)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on `quiz_results` table
    - Add policies for users to manage their own quiz results
*/

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  difficulty text NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  correct_answers integer NOT NULL CHECK (correct_answers >= 0),
  total_questions integer NOT NULL CHECK (total_questions > 0),
  xp_earned integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Users can only access their own quiz results
CREATE POLICY "Users can read own quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz results"
  ON quiz_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz results"
  ON quiz_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_category ON quiz_results(category);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at DESC);