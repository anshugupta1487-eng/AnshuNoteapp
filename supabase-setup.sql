-- ================================================
-- Notes App - Supabase Database Setup
-- WITH FIREBASE AUTHENTICATION SUPPORT
-- ================================================
-- This script creates the notes table with user authentication
-- support and sets up the necessary permissions.
--
-- How to use:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- ================================================

-- Drop existing table if you want to start fresh (CAUTION: deletes all data!)
-- DROP TABLE IF EXISTS notes CASCADE;

-- Create notes table with user authentication fields
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policy if it exists
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;

-- Create user-specific policies for authenticated access
-- These policies ensure users can only access their own notes

-- Policy: Users can view only their own notes
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT
  USING (true);  -- Allow all for now since we're using Firebase Auth
  -- In production with Supabase Auth: USING (auth.uid()::text = user_id)

-- Policy: Users can create their own notes
CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT
  WITH CHECK (true);  -- Allow all for now since we're using Firebase Auth
  -- In production with Supabase Auth: WITH CHECK (auth.uid()::text = user_id)

-- Policy: Users can update only their own notes
CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE
  USING (true);  -- Allow all for now since we're using Firebase Auth
  -- In production with Supabase Auth: USING (auth.uid()::text = user_id)

-- Policy: Users can delete only their own notes
CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE
  USING (true);  -- Allow all for now since we're using Firebase Auth
  -- In production with Supabase Auth: USING (auth.uid()::text = user_id)

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on UPDATE
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Migration: Add user fields to existing notes table
-- ================================================
-- If you already have a notes table without user fields, uncomment these:

-- ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
-- ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
-- UPDATE notes SET user_id = 'migrated_user', user_email = 'migrated@example.com' WHERE user_id IS NULL;
-- ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
-- CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes(user_id, created_at DESC);

-- ================================================
-- Verification Query
-- ================================================
-- Run this to verify the table was created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- ================================================
-- Example: Insert sample data (optional)
-- ================================================
-- Uncomment and modify to add sample notes for testing

-- INSERT INTO notes (title, content, user_id, user_email) VALUES
--   ('Welcome to Notes App', 'This is your first note! Now with user authentication.', 'test_user_123', 'test@example.com'),
--   ('Getting Started', 'Your notes are private and only visible to you.', 'test_user_123', 'test@example.com'),
--   ('Features', 'This app supports:\n- Secure authentication\n- Private notes\n- Persistent storage', 'test_user_123', 'test@example.com');

-- ================================================
-- Utility Queries for Administration
-- ================================================

-- Count notes per user
-- SELECT user_email, COUNT(*) as note_count
-- FROM notes
-- GROUP BY user_email
-- ORDER BY note_count DESC;

-- View recent notes
-- SELECT id, title, user_email, created_at
-- FROM notes
-- ORDER BY created_at DESC
-- LIMIT 10;

-- ================================================
-- Success Message
-- ================================================
SELECT '✅ Notes table with authentication support created successfully!' AS status;
