/*
  # Add tags column to prompts table

  1. Changes
    - Add `tags` column to `prompts` table as a text array
    - Update existing rows to have empty tags array
  
  2. Notes
    - Using native PostgreSQL array type for better performance and type safety
    - Defaults to empty array to prevent null issues
*/

ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';