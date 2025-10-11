-- ================================================
-- Notes App - Supabase Database Setup
-- ================================================
-- This script creates the notes table and sets up
-- the necessary permissions for your notes app.
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

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries (sorts by most recent first)
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Create index for searching by title
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);

-- Enable Row Level Security (RLS)
-- This is a security feature that controls access to rows
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
-- NOTE: This is permissive for demo purposes
-- In production with user authentication, you should restrict this
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger to auto-update updated_at on UPDATE
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
-- Uncomment the lines below to add sample notes

-- INSERT INTO notes (title, content) VALUES
--   ('Welcome to Notes App', 'This is your first note! You can create, read, and delete notes easily.'),
--   ('Getting Started', 'Try creating your own notes using the form above. Your notes are stored securely in Supabase PostgreSQL database.'),
--   ('Features', 'This app supports:\n- Create notes\n- View all notes\n- Delete notes\n- Persistent storage\n- Beautiful responsive design');

-- ================================================
-- Success Message
-- ================================================
-- If you see this message, the setup was successful!
SELECT '✅ Notes table created successfully!' AS status;

