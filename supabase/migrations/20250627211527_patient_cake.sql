/*
  # Fix XP table duplicate records

  1. Data Cleanup
    - Remove duplicate XP records, keeping only the most recent one per user
    - Consolidate points and badges from duplicates before deletion
  
  2. Schema Changes
    - Add unique constraint on user_id to prevent future duplicates
    - Add index for better query performance
  
  3. Security
    - Maintain existing RLS policies
*/

-- First, let's consolidate duplicate XP records
-- Create a temporary table to store the consolidated data
CREATE TEMP TABLE consolidated_xp AS
SELECT 
  user_id,
  SUM(COALESCE(points, 0)) as total_points,
  array_agg(DISTINCT badge) FILTER (WHERE badge IS NOT NULL) as all_badges
FROM xp, unnest(COALESCE(badges, ARRAY[]::text[])) as badge
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- Update consolidated badges to remove any null values and duplicates
UPDATE consolidated_xp 
SET all_badges = array_remove(all_badges, NULL);

-- Delete all existing XP records
DELETE FROM xp WHERE user_id IS NOT NULL;

-- Insert the consolidated records back
INSERT INTO xp (user_id, points, badges)
SELECT 
  user_id,
  total_points,
  CASE 
    WHEN all_badges IS NULL OR array_length(all_badges, 1) IS NULL THEN ARRAY[]::text[]
    ELSE all_badges
  END
FROM consolidated_xp;

-- Add unique constraint to prevent future duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'xp_user_id_unique' 
    AND table_name = 'xp'
  ) THEN
    ALTER TABLE xp ADD CONSTRAINT xp_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Add index for better performance if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_xp_user_id_unique'
  ) THEN
    CREATE INDEX idx_xp_user_id_unique ON xp (user_id);
  END IF;
END $$;

-- Ensure RLS is enabled (it should already be, but let's be safe)
ALTER TABLE xp ENABLE ROW LEVEL SECURITY;