// Firebase Configuration
// You'll need to replace these with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// API base URL
const API_URL = '/api';

// Global state
let currentUser = null;
let idToken = null;

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing authentication...');
  initializeAuth();
  setupEventListeners();
});

// Initialize authentication
function initializeAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('User signed in:', user.email);
      currentUser = user;
      
      // Get fresh ID token
      try {
        idToken = await user.getIdToken();
        console.log('ID token obtained');
        showApp();
        updateUserUI(user);
        loadNotes();
      } catch (error) {
        console.error('Error getting ID token:', error);
        showAuthSection();
      }
    } else {
      console.log('No user signed in');
      currentUser = null;
      idToken = null;
      showAuthSection();
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Google Sign-In button
  document.getElementById('googleSignInBtn').addEventListener('click', signInWithGoogle);
  
  // Sign Out button
  document.getElementById('signOutBtn').addEventListener('click', signOutUser);
  
  // Note form
  document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await createNote();
  });
}

// Sign in with Google
async function signInWithGoogle() {
  const btn = document.getElementById('googleSignInBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Sign-in successful:', result.user.email);
  } catch (error) {
    console.error('Sign-in error:', error);
    alert(`Sign-in failed: ${error.message}`);
    btn.disabled = false;
    btn.textContent = 'Sign in with Google';
  }
}

// Sign out user
async function signOutUser() {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Sign-out error:', error);
    alert(`Sign-out failed: ${error.message}`);
  }
}

// Update user UI
function updateUserUI(user) {
  document.getElementById('userName').textContent = user.displayName || 'User';
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userPhoto').src = user.photoURL || 'https://via.placeholder.com/40';
}

// Show authentication section
function showAuthSection() {
  document.getElementById('authSection').style.display = 'flex';
  document.getElementById('appSection').style.display = 'none';
}

// Show app section
function showApp() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'block';
}

// Make authenticated API request
async function authenticatedFetch(url, options = {}) {
  if (!idToken) {
    throw new Error('No authentication token available');
  }
  
  // Refresh token if needed
  if (currentUser) {
    idToken = await currentUser.getIdToken(true);
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  };
  
  return fetch(url, { ...options, headers });
}

// Load all notes
async function loadNotes() {
  const container = document.getElementById('notesContainer');
  console.log('Loading notes from:', `${API_URL}/notes`);
  
  try {
    container.innerHTML = '<p class="loading">Loading your notes...</p>';
    
    const response = await authenticatedFetch(`${API_URL}/notes`, {
      method: 'GET'
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      showMessage('Session expired. Please sign in again.', 'error');
      await signOutUser();
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const notes = await response.json();
    console.log('Notes received:', notes.length, 'notes');
    
    if (notes.length === 0) {
      container.innerHTML = '<p class="empty">No notes yet. Create your first note above!</p>';
      return;
    }
    
    container.innerHTML = notes.map(note => createNoteCard(note)).join('');
    
    // Attach delete handlers
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const noteId = e.target.dataset.noteId;
        deleteNote(noteId);
      });
    });
    
  } catch (error) {
    console.error('Error loading notes:', error);
    console.error('Error details:', error.message);
    container.innerHTML = `
      <div class="error">
        <h3>Failed to load notes</h3>
        <p>Error: ${error.message}</p>
        <p>Check the browser console (F12) for more details.</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
}

// Create note card HTML
function createNoteCard(note) {
  const createdDate = new Date(note.created_at).toLocaleString();
  
  return `
    <div class="note-card">
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.content)}</p>
      <div class="note-meta">Created: ${createdDate}</div>
      <div class="note-actions">
        <button class="delete-btn" data-note-id="${note.id}">Delete</button>
      </div>
    </div>
  `;
}

// Create a new note
async function createNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  const submitBtn = document.querySelector('#noteForm button[type="submit"]');
  
  if (!title || !content) {
    showMessage('Please fill in both title and content', 'error');
    return;
  }
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  console.log('Creating note:', { title, content: content.substring(0, 50) + '...' });
  
  try {
    const response = await authenticatedFetch(`${API_URL}/notes`, {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
    
    console.log('Create response status:', response.status);
    
    if (response.status === 401) {
      showMessage('Session expired. Please sign in again.', 'error');
      await signOutUser();
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const newNote = await response.json();
    console.log('Note created:', newNote);
    
    // Clear form
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    
    // Show success message
    showMessage('✓ Note created successfully!', 'success');
    
    // Reload notes
    await loadNotes();
    
    // Scroll to notes section
    document.getElementById('notesContainer').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
    
  } catch (error) {
    console.error('Error creating note:', error);
    showMessage(`Failed to create note: ${error.message}`, 'error');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Note';
  }
}

// Delete a note
async function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  console.log('Deleting note:', noteId);
  
  try {
    const response = await authenticatedFetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE'
    });
    
    console.log('Delete response status:', response.status);
    
    if (response.status === 401) {
      showMessage('Session expired. Please sign in again.', 'error');
      await signOutUser();
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('Note deleted successfully');
    showMessage('Note deleted successfully', 'success');
    
    // Reload notes
    await loadNotes();
    
  } catch (error) {
    console.error('Error deleting note:', error);
    showMessage(`Failed to delete note: ${error.message}`, 'error');
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show message to user
function showMessage(message, type = 'info') {
  console.log('Showing message:', message, type);
  
  // Remove any existing message
  const existingMessage = document.querySelector('.message-banner');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message banner
  const banner = document.createElement('div');
  banner.className = `message-banner ${type}`;
  banner.textContent = message;
  
  // Insert at top of app section
  const appSection = document.getElementById('appSection');
  if (appSection.style.display !== 'none') {
    appSection.insertBefore(banner, appSection.firstChild);
  } else {
    const authSection = document.getElementById('authSection');
    authSection.insertBefore(banner, authSection.firstChild);
  }
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 300);
  }, 4000);
}
