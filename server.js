const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
let useDatabase = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    useDatabase = true;
    console.log('✅ Supabase client initialized - using database storage');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    console.log('⚠️  Falling back to in-memory storage');
  }
} else {
  console.log('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY not set - using in-memory storage');
}

// Fallback in-memory storage
let notesData = {
  notes: [],
  nextId: 1
};

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Routes

// Health check
app.get('/health', async (req, res) => {
  if (useDatabase) {
    try {
      const { count, error } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      res.json({ 
        status: 'healthy', 
        storage: 'database',
        notesCount: count 
      });
    } catch (error) {
      res.json({ 
        status: 'healthy', 
        storage: 'database',
        error: error.message 
      });
    }
  } else {
    res.json({ 
      status: 'healthy', 
      storage: 'in-memory',
      notesCount: notesData.notes.length 
    });
  }
});

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    console.log('GET /api/notes - Fetching all notes');
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;
    
    if (useDatabase) {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Returning ${data.length} notes from database`);
      res.json(data);
    } else {
      // Use in-memory storage
      const sortedNotes = [...notesData.notes].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      const paginatedNotes = sortedNotes.slice(skip, skip + limit);
      
      console.log(`Returning ${paginatedNotes.length} notes from memory`);
      res.json(paginatedNotes);
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
  }
});

// Get a single note
app.get('/api/notes/:id', async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    console.log(`GET /api/notes/${noteId}`);
    
    if (useDatabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Note not found' });
        }
        throw error;
      }
      
      res.json(data);
    } else {
      const note = notesData.notes.find(n => n.id === noteId);
      
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json(note);
    }
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note', details: error.message });
  }
});

// Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log('POST /api/notes - Creating note:', { title, content: content?.substring(0, 50) });
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    if (useDatabase) {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('notes')
        .insert([
          { 
            title: title.trim(), 
            content: content.trim() 
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log(`Note created with ID ${data.id} in database`);
      res.status(201).json(data);
    } else {
      // Use in-memory storage
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
      
      console.log(`Note created with ID ${newNote.id} in memory. Total: ${notesData.notes.length}`);
      res.status(201).json(newNote);
    }
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note', details: error.message });
  }
});

// Update a note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const noteId = parseInt(req.params.id);
    console.log(`PUT /api/notes/${noteId}`);
    
    if (title && title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    if (useDatabase) {
      // Update in Supabase
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', noteId)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Note not found' });
        }
        throw error;
      }
      
      console.log(`Note ${noteId} updated in database`);
      res.json(data);
    } else {
      // Use in-memory storage
      const noteIndex = notesData.notes.findIndex(n => n.id === noteId);
      if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      const note = notesData.notes[noteIndex];
      
      if (title !== undefined) note.title = title.trim();
      if (content !== undefined) note.content = content.trim();
      note.updated_at = new Date().toISOString();
      
      console.log(`Note ${noteId} updated in memory`);
      res.json(note);
    }
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note', details: error.message });
  }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    console.log(`DELETE /api/notes/${noteId}`);
    
    if (useDatabase) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log(`Note ${noteId} deleted from database`);
      res.status(204).send();
    } else {
      const noteIndex = notesData.notes.findIndex(n => n.id === noteId);
      if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      notesData.notes.splice(noteIndex, 1);
      console.log(`Note ${noteId} deleted from memory. Total: ${notesData.notes.length}`);
      
      res.status(204).send();
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note', details: error.message });
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// 404 handler
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
  console.log(`🗄️  Storage: ${useDatabase ? 'Supabase (PostgreSQL)' : 'In-memory (ephemeral)'}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, 'static')}`);
});
