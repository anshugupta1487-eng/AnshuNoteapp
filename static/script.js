// API base URL
const API_URL = '/api';

// Load notes on page load
document.addEventListener('DOMContentLoaded', () => {
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
    
    try {
        const response = await fetch(`${API_URL}/notes`);
        
        if (!response.ok) {
            throw new Error('Failed to load notes');
        }
        
        const notes = await response.json();
        
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
        container.innerHTML = '<p class="error">Failed to load notes. Please try again.</p>';
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
    
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to create note');
        }
        
        const newNote = await response.json();
        
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
        showMessage('Failed to create note. Please try again.', 'error');
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
    
    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete note');
        }
        
        // Reload notes
        await loadNotes();
        
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
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
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
    }, 3000);
}

