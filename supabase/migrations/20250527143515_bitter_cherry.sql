/*
  # Simplify folder implementation

  1. Changes
    - Add `folder` column to prompts table as text
    - Set default folder to 'Life' for existing prompts
    - Remove folder_id column and its foreign key constraint
    - Drop folders table as it's no longer needed
  
  2. Notes
    - Simplifying to use a text field instead of relationships
    - Maintaining data by setting default folder
*/

-- Add folder column
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS folder text DEFAULT 'Life';

-- Update any null folders to 'Life'
UPDATE prompts SET folder = 'Life' WHERE folder IS NULL;

-- Remove the folder_id column and its constraint
ALTER TABLE prompts DROP COLUMN IF EXISTS folder_id;

-- Drop the folders table if it exists
DROP TABLE IF EXISTS folders;