-- ================================================
-- Migration Script: Add Authentication to Existing Table
-- This keeps your existing notes!
-- ================================================

-- Step 1: Add user columns if they don't exist
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Step 2: Set a default user_id for existing notes (so they're not lost)
-- Change 'anonymous_user' to any identifier you want
UPDATE notes 
SET user_id = 'anonymous_user', 
    user_email = 'anonymous@example.com' 
WHERE user_id IS NULL;

-- Step 3: Make user_id required going forward
ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop old policy if it exists
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;

-- Step 7: Create user-specific policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE
  USING (true);

-- Step 8: Create function for auto-updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Verify the migration
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Migration completed! Existing notes preserved with user_id support added.' AS status;

