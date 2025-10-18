package com.anshunoteapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.anshunoteapp.adapter.NotesAdapter
import com.anshunoteapp.data.Note
import com.anshunoteapp.databinding.ActivityMainBinding
import com.anshunoteapp.network.ApiClient
import com.anshunoteapp.supabase.NotesService
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var auth: FirebaseAuth
    private lateinit var googleSignInClient: GoogleSignInClient
    private lateinit var notesAdapter: NotesAdapter
    private lateinit var notesService: NotesService
    
    companion object {
        private const val RC_SIGN_IN = 9001
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupFirebaseAuth()
        setupRecyclerView()
        setupClickListeners()
        setupSupabase()
        
        // Check if user is already signed in
        if (auth.currentUser != null) {
            showAppSection()
            loadUserInfo()
            loadNotes()
        } else {
            showAuthSection()
        }
    }
    
    private fun setupFirebaseAuth() {
        auth = FirebaseAuth.getInstance()
        
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
        
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }
    
    private fun setupRecyclerView() {
        notesAdapter = NotesAdapter(
            notes = emptyList(),
            onEditClick = { note -> editNote(note) },
            onDeleteClick = { note -> deleteNote(note) }
        )
        
        binding.notesRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = notesAdapter
        }
        
        binding.swipeRefreshLayout.setOnRefreshListener {
            loadNotes()
        }
    }
    
    private fun setupClickListeners() {
        binding.googleSignInBtn.setOnClickListener {
            signInWithGoogle()
        }
        
        binding.signOutBtn.setOnClickListener {
            signOut()
        }
        
        binding.createNoteBtn.setOnClickListener {
            createNote()
        }
    }
    
    private fun setupSupabase() {
        notesService = NotesService()
    }
    
    private fun signInWithGoogle() {
        binding.googleSignInBtn.isEnabled = false
        binding.googleSignInBtn.text = getString(R.string.signing_in)
        
        val signInIntent = googleSignInClient.signInIntent
        startActivityForResult(signInIntent, RC_SIGN_IN)
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                firebaseAuthWithGoogle(account.idToken!!)
            } catch (e: ApiException) {
                showMessage("Sign in failed: ${e.message}", Toast.LENGTH_LONG)
                resetSignInButton()
            }
        }
    }
    
    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    val user = auth.currentUser
                    if (user != null) {
                        showAppSection()
                        loadUserInfo()
                        loadNotes()
                    }
                } else {
                    showMessage("Authentication failed: ${task.exception?.message}", Toast.LENGTH_LONG)
                }
                resetSignInButton()
            }
    }
    
    private fun signOut() {
        binding.signOutBtn.isEnabled = false
        binding.signOutBtn.text = getString(R.string.signing_out)
        
        auth.signOut()
        googleSignInClient.signOut().addOnCompleteListener {
            showAuthSection()
            resetSignOutButton()
        }
    }
    
    private fun showAuthSection() {
        binding.authSection.visibility = View.VISIBLE
        binding.appSection.visibility = View.GONE
    }
    
    private fun showAppSection() {
        binding.authSection.visibility = View.GONE
        binding.appSection.visibility = View.VISIBLE
    }
    
    private fun loadUserInfo() {
        val user = auth.currentUser
        if (user != null) {
            binding.userName.text = user.displayName ?: "User"
            binding.userEmail.text = user.email
        }
    }
    
    private fun loadNotes() {
        lifecycleScope.launch {
            try {
                binding.swipeRefreshLayout.isRefreshing = true
                
                val user = auth.currentUser
                if (user != null) {
                    // Use Firebase UID as the user_id for Supabase
                    val userId = user.uid
                    val notes = notesService.getNotes(userId)
                    
                    notesAdapter.updateNotes(notes)
                    
                    if (notes.isEmpty()) {
                        showEmptyState()
                    }
                }
            } catch (e: Exception) {
                showMessage("Error loading notes: ${e.message}", Toast.LENGTH_LONG)
            } finally {
                binding.swipeRefreshLayout.isRefreshing = false
            }
        }
    }
    
    private fun createNote() {
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
        
        binding.createNoteBtn.isEnabled = false
        binding.createNoteBtn.text = getString(R.string.saving)
        
        lifecycleScope.launch {
            try {
                val user = auth.currentUser
                if (user != null) {
                    val newNote = notesService.createNote(
                        com.anshunoteapp.data.CreateNoteRequest(title, content),
                        user.uid,
                        user.email ?: ""
                    )
                    
                    if (newNote != null) {
                        binding.noteTitle.text?.clear()
                        binding.noteContent.text?.clear()
                        showMessage(getString(R.string.note_created), Toast.LENGTH_SHORT)
                        loadNotes()
                    } else {
                        showMessage("Failed to create note", Toast.LENGTH_LONG)
                    }
                }
            } catch (e: Exception) {
                showMessage("Error creating note: ${e.message}", Toast.LENGTH_LONG)
            } finally {
                binding.createNoteBtn.isEnabled = true
                binding.createNoteBtn.text = getString(R.string.save)
            }
        }
    }
    
    private fun editNote(note: Note) {
        val intent = Intent(this, NoteEditorActivity::class.java)
        intent.putExtra("note", note)
        startActivity(intent)
    }
    
    private fun deleteNote(note: Note) {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(getString(R.string.confirm_delete))
            .setMessage("Are you sure you want to delete '${note.title}'?")
            .setPositiveButton(getString(R.string.yes)) { _, _ ->
                performDeleteNote(note)
            }
            .setNegativeButton(getString(R.string.no), null)
            .show()
    }
    
    private fun performDeleteNote(note: Note) {
        lifecycleScope.launch {
            try {
                val user = auth.currentUser
                if (user != null) {
                    val success = notesService.deleteNote(note.id, user.uid)
                    if (success) {
                        showMessage(getString(R.string.note_deleted), Toast.LENGTH_SHORT)
                        loadNotes()
                    } else {
                        showMessage("Failed to delete note", Toast.LENGTH_LONG)
                    }
                }
            } catch (e: Exception) {
                showMessage("Error deleting note: ${e.message}", Toast.LENGTH_LONG)
            }
        }
    }
    
    private fun showEmptyState() {
        // This will be handled by the adapter or we can show a custom view
    }
    
    private fun resetSignInButton() {
        binding.googleSignInBtn.isEnabled = true
        binding.googleSignInBtn.text = getString(R.string.sign_in_with_google)
    }
    
    private fun resetSignOutButton() {
        binding.signOutBtn.isEnabled = true
        binding.signOutBtn.text = getString(R.string.sign_out)
    }
    
    private fun showMessage(message: String, duration: Int = Toast.LENGTH_SHORT) {
        Toast.makeText(this, message, duration).show()
    }
    
    override fun onResume() {
        super.onResume()
        // Refresh notes when returning from note editor
        if (auth.currentUser != null) {
            loadNotes()
        }
    }
}
