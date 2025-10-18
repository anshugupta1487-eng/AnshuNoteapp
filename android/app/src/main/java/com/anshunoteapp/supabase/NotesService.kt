package com.anshunoteapp.supabase

import com.anshunoteapp.data.Note
import com.anshunoteapp.data.CreateNoteRequest
import com.anshunoteapp.data.UpdateNoteRequest
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class NotesService {
    
    private val supabase = SupabaseClient.postgrest
    
    suspend fun getNotes(userId: String): List<Note> {
        return try {
            supabase.from("notes")
                .select {
                    filter {
                        eq("user_id", userId)
                    }
                    order("created_at", ascending = false)
                }
                .decodeList<Note>()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun getNote(noteId: Int, userId: String): Note? {
        return try {
            supabase.from("notes")
                .select {
                    filter {
                        eq("id", noteId)
                        eq("user_id", userId)
                    }
                }
                .decodeSingle<Note>()
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun createNote(note: CreateNoteRequest, userId: String, userEmail: String): Note? {
        return try {
            val newNote = mapOf(
                "title" to note.title,
                "content" to note.content,
                "user_id" to userId,
                "user_email" to userEmail
            )
            
            supabase.from("notes")
                .insert(newNote) {
                    select()
                }
                .decodeSingle<Note>()
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun updateNote(noteId: Int, note: UpdateNoteRequest, userId: String): Note? {
        return try {
            val updateData = mutableMapOf<String, Any>()
            note.title?.let { updateData["title"] = it }
            note.content?.let { updateData["content"] = it }
            updateData["updated_at"] = "now()"
            
            supabase.from("notes")
                .update(updateData) {
                    filter {
                        eq("id", noteId)
                        eq("user_id", userId)
                    }
                    select()
                }
                .decodeSingle<Note>()
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun deleteNote(noteId: Int, userId: String): Boolean {
        return try {
            supabase.from("notes")
                .delete {
                    filter {
                        eq("id", noteId)
                        eq("user_id", userId)
                    }
                }
            true
        } catch (e: Exception) {
            false
        }
    }
}
