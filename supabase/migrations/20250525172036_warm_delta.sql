/*
  # Create prompts table

  1. New Tables
    - `prompts`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `title` (text, required)
      - `content` (text, required)
      - `user_id` (uuid, foreign key to auth.users)
  
  2. Security
    - Enable RLS on `prompts` table
    - Add policy to allow all operations for users on their own prompts
    - Add policy to allow anonymous access for public prompts (temporarily for demo)
*/

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own prompts
CREATE POLICY "Users can manage their own prompts"
  ON prompts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- For the MVP, allow anonymous access (would be removed in production)
CREATE POLICY "Allow anonymous access"
  ON prompts
  FOR ALL
  TO anon
  USING (true);