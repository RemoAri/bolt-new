-- Add order column to folders table
ALTER TABLE folders ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Update existing folders to have sequential order
WITH ordered_folders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_order
  FROM folders
)
UPDATE folders
SET "order" = ordered_folders.new_order
FROM ordered_folders
WHERE folders.id = ordered_folders.id; 