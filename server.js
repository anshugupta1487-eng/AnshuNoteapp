const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'notes.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('static'));

// Initialize data directory and file
function initializeDataStore() {
  const dataDir = path.join(__dirname, 'data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create notes file if it doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ notes: [], nextId: 1 }, null, 2));
  }
}

// Read data from file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { notes: [], nextId: 1 };
  }
}

// Write data to file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Initialize on startup
initializeDataStore();

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Get all notes
app.get('/api/notes', (req, res) => {
  try {
    const data = readData();
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;
    
    // Sort by created_at descending and apply pagination
    const sortedNotes = data.notes.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    const paginatedNotes = sortedNotes.slice(skip, skip + limit);
    
    res.json(paginatedNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get a single note
app.get('/api/notes/:id', (req, res) => {
  try {
    const data = readData();
    const noteId = parseInt(req.params.id);
    const note = data.notes.find(n => n.id === noteId);
    
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
    
    const data = readData();
    const now = new Date().toISOString();
    
    const newNote = {
      id: data.nextId,
      title: title.trim(),
      content: content.trim(),
      created_at: now,
      updated_at: now
    };
    
    data.notes.push(newNote);
    data.nextId += 1;
    
    if (!writeData(data)) {
      return res.status(500).json({ error: 'Failed to save note' });
    }
    
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
    const data = readData();
    
    const noteIndex = data.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = data.notes[noteIndex];
    
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
    
    if (!writeData(data)) {
      return res.status(500).json({ error: 'Failed to update note' });
    }
    
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
    const data = readData();
    
    const noteIndex = data.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    data.notes.splice(noteIndex, 1);
    
    if (!writeData(data)) {
      return res.status(500).json({ error: 'Failed to delete note' });
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Notes app is running on http://localhost:${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api/notes`);
});
