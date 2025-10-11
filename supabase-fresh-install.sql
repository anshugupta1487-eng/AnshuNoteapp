-- ================================================
-- Fresh Install: Drop and Recreate Notes Table
-- WARNING: This will DELETE ALL existing notes!
-- ================================================

-- Drop everything related to notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS notes CASCADE;

-- Create notes table with user authentication fields
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_notes_title ON notes(title);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create user-specific policies
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

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on UPDATE
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT '✅ Notes table created successfully with authentication support!' AS status;

