const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin
let firebaseInitialized = false;
const firebaseConfig = process.env.FIREBASE_SERVICE_ACCOUNT;

if (firebaseConfig) {
  try {
    const serviceAccount = JSON.parse(firebaseConfig);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized - authentication enabled');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    console.log('⚠️  Running without authentication');
  }
} else {
  console.log('⚠️  FIREBASE_SERVICE_ACCOUNT not set - running without authentication');
}

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

// Authentication middleware
async function authenticate(req, res, next) {
  if (!firebaseInitialized) {
    // Skip authentication if Firebase is not configured
    req.user = { uid: 'anonymous', email: 'anonymous@example.com' };
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

// Routes

// Health check (no auth required)
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
        authentication: firebaseInitialized ? 'enabled' : 'disabled',
        notesCount: count 
      });
    } catch (error) {
      res.json({ 
        status: 'healthy', 
        storage: 'database',
        authentication: firebaseInitialized ? 'enabled' : 'disabled',
        error: error.message 
      });
    }
  } else {
    res.json({ 
      status: 'healthy', 
      storage: 'in-memory',
      authentication: firebaseInitialized ? 'enabled' : 'disabled',
      notesCount: notesData.notes.length 
    });
  }
});

// Get current user info (requires auth)
app.get('/api/user', authenticate, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name,
    picture: req.user.picture
  });
});

// Get all notes for authenticated user
app.get('/api/notes', authenticate, async (req, res) => {
  try {
    console.log(`GET /api/notes - User: ${req.user.email}`);
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;
    
    if (useDatabase) {
      // Fetch from Supabase filtered by user_id
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', req.user.uid)
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Returning ${data.length} notes from database`);
      res.json(data);
    } else {
      // Use in-memory storage filtered by user_id
      const userNotes = notesData.notes.filter(n => n.user_id === req.user.uid);
      const sortedNotes = userNotes.sort((a, b) => 
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

// Get a single note (requires auth and ownership)
app.get('/api/notes/:id', authenticate, async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    console.log(`GET /api/notes/${noteId} - User: ${req.user.email}`);
    
    if (useDatabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', req.user.uid)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Note not found' });
        }
        throw error;
      }
      
      res.json(data);
    } else {
      const note = notesData.notes.find(n => n.id === noteId && n.user_id === req.user.uid);
      
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

// Create a new note (requires auth)
app.post('/api/notes', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log(`POST /api/notes - User: ${req.user.email}, Title: ${title}`);
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    if (useDatabase) {
      // Insert into Supabase with user_id
      const { data, error } = await supabase
        .from('notes')
        .insert([
          { 
            title: title.trim(), 
            content: content.trim(),
            user_id: req.user.uid,
            user_email: req.user.email
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log(`Note created with ID ${data.id} for user ${req.user.email}`);
      res.status(201).json(data);
    } else {
      // Use in-memory storage
      const now = new Date().toISOString();
      
      const newNote = {
        id: notesData.nextId,
        title: title.trim(),
        content: content.trim(),
        user_id: req.user.uid,
        user_email: req.user.email,
        created_at: now,
        updated_at: now
      };
      
      notesData.notes.push(newNote);
      notesData.nextId += 1;
      
      console.log(`Note created with ID ${newNote.id} for user ${req.user.email}`);
      res.status(201).json(newNote);
    }
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note', details: error.message });
  }
});

// Update a note (requires auth and ownership)
app.put('/api/notes/:id', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    const noteId = parseInt(req.params.id);
    console.log(`PUT /api/notes/${noteId} - User: ${req.user.email}`);
    
    if (title && title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    if (useDatabase) {
      // Update in Supabase (only if owned by user)
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', noteId)
        .eq('user_id', req.user.uid)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Note not found or access denied' });
        }
        throw error;
      }
      
      console.log(`Note ${noteId} updated by user ${req.user.email}`);
      res.json(data);
    } else {
      // Use in-memory storage
      const noteIndex = notesData.notes.findIndex(n => n.id === noteId && n.user_id === req.user.uid);
      if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
      
      const note = notesData.notes[noteIndex];
      
      if (title !== undefined) note.title = title.trim();
      if (content !== undefined) note.content = content.trim();
      note.updated_at = new Date().toISOString();
      
      console.log(`Note ${noteId} updated by user ${req.user.email}`);
      res.json(note);
    }
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note', details: error.message });
  }
});

// Delete a note (requires auth and ownership)
app.delete('/api/notes/:id', authenticate, async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    console.log(`DELETE /api/notes/${noteId} - User: ${req.user.email}`);
    
    if (useDatabase) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', req.user.uid);
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log(`Note ${noteId} deleted by user ${req.user.email}`);
      res.status(204).send();
    } else {
      const noteIndex = notesData.notes.findIndex(n => n.id === noteId && n.user_id === req.user.uid);
      if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
      
      notesData.notes.splice(noteIndex, 1);
      console.log(`Note ${noteId} deleted by user ${req.user.email}`);
      
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
  console.log(`🔐 Authentication: ${firebaseInitialized ? 'Enabled (Firebase)' : 'Disabled'}`);
  console.log(`🗄️  Storage: ${useDatabase ? 'Supabase (PostgreSQL)' : 'In-memory (ephemeral)'}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, 'static')}`);
});
