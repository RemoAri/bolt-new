/*
  # Add folder support
  
  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)
      - `icon` (text, optional)
      - `color` (text, optional)

  2. Changes
    - Add `folder_id` to prompts table
    - Add foreign key constraint
    
  3. Security
    - Enable RLS on folders table
    - Add policies for user access
*/

CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  icon TEXT,
  color TEXT
);

-- Add folder_id to prompts
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Policies for folders
CREATE POLICY "Users can manage their own folders"
  ON folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- For MVP demo
CREATE POLICY "Allow anonymous access to folders"
  ON folders
  FOR ALL
  TO anon
  USING (true);