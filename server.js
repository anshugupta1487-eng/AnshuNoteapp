const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('static'));

// Initialize SQLite database
const db = new Database('notes.db');

// Create notes table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Prepared statements
const insertNote = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)');
const selectAllNotes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC LIMIT ? OFFSET ?');
const selectNoteById = db.prepare('SELECT * FROM notes WHERE id = ?');
const deleteNoteById = db.prepare('DELETE FROM notes WHERE id = ?');
const updateNoteById = db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Get all notes
app.get('/api/notes', (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;
    const notes = selectAllNotes.all(limit, skip);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get a single note
app.get('/api/notes/:id', (req, res) => {
  try {
    const note = selectNoteById.get(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create a new note
app.post('/api/notes', (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    const result = insertNote.run(title, content);
    const newNote = selectNoteById.get(result.lastInsertRowid);
    
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
app.put('/api/notes/:id', (req, res) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;
    
    const existingNote = selectNoteById.get(noteId);
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const newTitle = title || existingNote.title;
    const newContent = content || existingNote.content;
    
    if (newTitle.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    updateNoteById.run(newTitle, newContent, noteId);
    const updatedNote = selectNoteById.get(noteId);
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const result = deleteNoteById.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Notes app is running on http://localhost:${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api/notes`);
});

