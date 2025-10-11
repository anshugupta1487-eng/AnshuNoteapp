// API base URL
const API_URL = '/api';

// Load notes on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    loadNotes();
    setupFormHandler();
});

// Setup form submission handler
function setupFormHandler() {
    const form = document.getElementById('noteForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNote();
    });
}

// Load all notes
async function loadNotes() {
    const container = document.getElementById('notesContainer');
    console.log('Loading notes from:', `${API_URL}/notes`);
    
    try {
        container.innerHTML = '<p class="loading">Loading notes...</p>';
        
        const response = await fetch(`${API_URL}/notes`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
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
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ title, content }),
        });
        
        console.log('Create response status:', response.status);
        
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
        
        // Scroll to notes section to show the new note
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
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE',
        });
        
        console.log('Delete response status:', response.status);
        
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
    
    // Insert at top of container
    const container = document.querySelector('.container');
    container.insertBefore(banner, container.firstChild);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
    }, 4000);
}
