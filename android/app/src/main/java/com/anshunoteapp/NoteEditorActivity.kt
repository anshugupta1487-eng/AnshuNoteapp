package com.anshunoteapp

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.anshunoteapp.data.Note
import com.anshunoteapp.data.UpdateNoteRequest
import com.anshunoteapp.databinding.ActivityNoteEditorBinding
import com.anshunoteapp.network.ApiClient
import com.anshunoteapp.supabase.NotesService
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

class NoteEditorActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityNoteEditorBinding
    private var note: Note? = null
    private var isEditing = false
    private lateinit var notesService: NotesService
    private lateinit var auth: FirebaseAuth
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNoteEditorBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupToolbar()
        setupNote()
        setupClickListeners()
        setupSupabase()
    }
    
    private fun setupToolbar() {
        // Custom app bar - no need to set as support action bar
        // The back navigation is handled by the layout
    }
    
    private fun setupNote() {
        note = intent.getParcelableExtra("note")
        isEditing = note != null
        
        if (isEditing && note != null) {
            binding.titleText.text = getString(R.string.edit_note)
            binding.noteTitle.setText(note!!.title)
            binding.noteContent.setText(note!!.content)
        } else {
            binding.titleText.text = getString(R.string.create_note)
        }
    }
    
    private fun setupClickListeners() {
        binding.saveBtn.setOnClickListener {
            saveNote()
        }
        
        binding.backBtn.setOnClickListener {
            onBackPressed()
        }
    }
    
    private fun setupSupabase() {
        notesService = NotesService()
        auth = FirebaseAuth.getInstance()
    }
    
    private fun saveNote() {
        val title = binding.noteTitle.text.toString().trim()
        val content = binding.noteContent.text.toString().trim()
        
        if (title.isEmpty()) {
            binding.noteTitle.error = getString(R.string.title_required)
            return
        }
        
        if (content.isEmpty()) {
            binding.noteContent.error = getString(R.string.content_required)
            return
        }
        
        if (title.length > 200) {
            binding.noteTitle.error = getString(R.string.title_too_long)
            return
        }
        
        binding.saveBtn.isEnabled = false
        binding.saveBtn.text = getString(R.string.saving)
        
        lifecycleScope.launch {
            try {
                val user = auth.currentUser
                if (user != null) {
                    val result = if (isEditing && note != null) {
                        notesService.updateNote(
                            note!!.id,
                            UpdateNoteRequest(title, content),
                            user.uid
                        )
                    } else {
                        notesService.createNote(
                            com.anshunoteapp.data.CreateNoteRequest(title, content),
                            user.uid,
                            user.email ?: ""
                        )
                    }
                    
                    if (result != null) {
                        val message = if (isEditing) {
                            getString(R.string.note_updated)
                        } else {
                            getString(R.string.note_created)
                        }
                        showMessage(message, Toast.LENGTH_SHORT)
                        finish()
                    } else {
                        val errorMessage = if (isEditing) {
                            "Failed to update note"
                        } else {
                            "Failed to create note"
                        }
                        showMessage(errorMessage, Toast.LENGTH_LONG)
                    }
                }
            } catch (e: Exception) {
                val errorMessage = if (isEditing) {
                    "Error updating note: ${e.message}"
                } else {
                    "Error creating note: ${e.message}"
                }
                showMessage(errorMessage, Toast.LENGTH_LONG)
            } finally {
                binding.saveBtn.isEnabled = true
                binding.saveBtn.text = getString(R.string.save)
            }
        }
    }
    
    private fun showMessage(message: String, duration: Int = Toast.LENGTH_SHORT) {
        Toast.makeText(this, message, duration).show()
    }
    
    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}
