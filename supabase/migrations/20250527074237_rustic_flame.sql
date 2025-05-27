/*
  # Add default folders

  1. New Data
    - Add "Work" and "Life" default folders
    - Set default folder for existing prompts
*/

-- Insert default folders
INSERT INTO folders (name, icon, color)
VALUES 
  ('Work', 'briefcase', 'blue'),
  ('Life', 'heart', 'rose')
ON CONFLICT (name) DO NOTHING;

-- Update existing prompts to use "Life" folder by default
UPDATE prompts
SET folder_id = (SELECT id FROM folders WHERE name = 'Life')
WHERE folder_id IS NULL;