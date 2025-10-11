const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data store (more reliable for cloud deployments)
let notesData = {
  notes: [],
  nextId: 1
};

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware (before routes)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files with explicit path
app.use('/static', express.static(path.join(__dirname, 'static')));

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', notesCount: notesData.notes.length });
});

// Get all notes
app.get('/api/notes', (req, res) => {
  try {
    console.log('GET /api/notes - Fetching all notes');
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;
    
    // Sort by created_at descending and apply pagination
    const sortedNotes = [...notesData.notes].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    const paginatedNotes = sortedNotes.slice(skip, skip + limit);
    
    console.log(`Returning ${paginatedNotes.length} notes`);
    res.json(paginatedNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get a single note
app.get('/api/notes/:id', (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    console.log(`GET /api/notes/${noteId}`);
    const note = notesData.notes.find(n => n.id === noteId);
    
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
    console.log('POST /api/notes - Creating note:', { title, content: content?.substring(0, 50) });
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    const now = new Date().toISOString();
    
    const newNote = {
      id: notesData.nextId,
      title: title.trim(),
      content: content.trim(),
      created_at: now,
      updated_at: now
    };
    
    notesData.notes.push(newNote);
    notesData.nextId += 1;
    
    console.log(`Note created with ID ${newNote.id}. Total notes: ${notesData.notes.length}`);
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
    const noteId = parseInt(req.params.id);
    console.log(`PUT /api/notes/${noteId}`);
    
    const noteIndex = notesData.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = notesData.notes[noteIndex];
    
    if (title !== undefined) {
      if (title.length > 200) {
        return res.status(400).json({ error: 'Title must be 200 characters or less' });
      }
      note.title = title.trim();
    }
    
    if (content !== undefined) {
      note.content = content.trim();
    }
    
    note.updated_at = new Date().toISOString();
    
    console.log(`Note ${noteId} updated`);
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    console.log(`DELETE /api/notes/${noteId}`);
    
    const noteIndex = notesData.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    notesData.notes.splice(noteIndex, 1);
    console.log(`Note ${noteId} deleted. Total notes: ${notesData.notes.length}`);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Serve index.html for root path (must be after static and API routes)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log('404 - Not found:', req.url);
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Notes app is running on http://localhost:${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api/notes`);
  console.log(`🗄️  Using in-memory storage (data will reset on server restart)`);
  console.log(`📁 Static files served from: ${path.join(__dirname, 'static')}`);
});
