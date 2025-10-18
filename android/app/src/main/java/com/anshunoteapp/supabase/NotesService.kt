package com.anshunoteapp.supabase

import com.anshunoteapp.data.Note
import com.anshunoteapp.data.CreateNoteRequest
import com.anshunoteapp.data.UpdateNoteRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.net.HttpURLConnection
import java.net.URL

class NotesService {
    
    private val json = Json { ignoreUnknownKeys = true }
    
    suspend fun getNotes(userId: String): List<Note> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${SupabaseClient.SUPABASE_URL}/rest/v1/notes?user_id=eq.$userId&order=created_at.desc")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.requestMethod = "GET"
            connection.setRequestProperty("apikey", SupabaseClient.SUPABASE_ANON_KEY)
            connection.setRequestProperty("Authorization", "Bearer ${SupabaseClient.SUPABASE_ANON_KEY}")
            connection.setRequestProperty("Content-Type", "application/json")
            
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val jsonArray = json.parseToJsonElement(response).jsonArray
                
                jsonArray.map { jsonElement ->
                    val obj = jsonElement.jsonObject
                    Note(
                        id = obj["id"]?.jsonPrimitive?.content?.toInt() ?: 0,
                        title = obj["title"]?.jsonPrimitive?.content ?: "",
                        content = obj["content"]?.jsonPrimitive?.content ?: "",
                        userId = obj["user_id"]?.jsonPrimitive?.content ?: "",
                        userEmail = obj["user_email"]?.jsonPrimitive?.content ?: "",
                        createdAt = obj["created_at"]?.jsonPrimitive?.content ?: "",
                        updatedAt = obj["updated_at"]?.jsonPrimitive?.content ?: ""
                    )
                }
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun getNote(noteId: Int, userId: String): Note? = withContext(Dispatchers.IO) {
        try {
            val url = URL("${SupabaseClient.SUPABASE_URL}/rest/v1/notes?id=eq.$noteId&user_id=eq.$userId")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.requestMethod = "GET"
            connection.setRequestProperty("apikey", SupabaseClient.SUPABASE_ANON_KEY)
            connection.setRequestProperty("Authorization", "Bearer ${SupabaseClient.SUPABASE_ANON_KEY}")
            connection.setRequestProperty("Content-Type", "application/json")
            
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val jsonArray = json.parseToJsonElement(response).jsonArray
                
                if (jsonArray.isNotEmpty()) {
                    val obj = jsonArray[0].jsonObject
                    Note(
                        id = obj["id"]?.jsonPrimitive?.content?.toInt() ?: 0,
                        title = obj["title"]?.jsonPrimitive?.content ?: "",
                        content = obj["content"]?.jsonPrimitive?.content ?: "",
                        userId = obj["user_id"]?.jsonPrimitive?.content ?: "",
                        userEmail = obj["user_email"]?.jsonPrimitive?.content ?: "",
                        createdAt = obj["created_at"]?.jsonPrimitive?.content ?: "",
                        updatedAt = obj["updated_at"]?.jsonPrimitive?.content ?: ""
                    )
                } else null
            } else null
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun createNote(note: CreateNoteRequest, userId: String, userEmail: String): Note? = withContext(Dispatchers.IO) {
        try {
            val url = URL("${SupabaseClient.SUPABASE_URL}/rest/v1/notes")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.requestMethod = "POST"
            connection.setRequestProperty("apikey", SupabaseClient.SUPABASE_ANON_KEY)
            connection.setRequestProperty("Authorization", "Bearer ${SupabaseClient.SUPABASE_ANON_KEY}")
            connection.setRequestProperty("Content-Type", "application/json")
            connection.doOutput = true
            
            val requestBody = """
                {
                    "title": "${note.title}",
                    "content": "${note.content}",
                    "user_id": "$userId",
                    "user_email": "$userEmail"
                }
            """.trimIndent()
            
            connection.outputStream.bufferedWriter().use { it.write(requestBody) }
            
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_CREATED) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val jsonArray = json.parseToJsonElement(response).jsonArray
                
                if (jsonArray.isNotEmpty()) {
                    val obj = jsonArray[0].jsonObject
                    Note(
                        id = obj["id"]?.jsonPrimitive?.content?.toInt() ?: 0,
                        title = obj["title"]?.jsonPrimitive?.content ?: "",
                        content = obj["content"]?.jsonPrimitive?.content ?: "",
                        userId = obj["user_id"]?.jsonPrimitive?.content ?: "",
                        userEmail = obj["user_email"]?.jsonPrimitive?.content ?: "",
                        createdAt = obj["created_at"]?.jsonPrimitive?.content ?: "",
                        updatedAt = obj["updated_at"]?.jsonPrimitive?.content ?: ""
                    )
                } else null
            } else null
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun updateNote(noteId: Int, note: UpdateNoteRequest, userId: String): Note? = withContext(Dispatchers.IO) {
        try {
            val url = URL("${SupabaseClient.SUPABASE_URL}/rest/v1/notes?id=eq.$noteId&user_id=eq.$userId")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.requestMethod = "PATCH"
            connection.setRequestProperty("apikey", SupabaseClient.SUPABASE_ANON_KEY)
            connection.setRequestProperty("Authorization", "Bearer ${SupabaseClient.SUPABASE_ANON_KEY}")
            connection.setRequestProperty("Content-Type", "application/json")
            connection.doOutput = true
            
            val requestBody = buildString {
                append("{")
                note.title?.let { append("\"title\": \"$it\",") }
                note.content?.let { append("\"content\": \"$it\",") }
                append("\"updated_at\": \"now()\"")
                append("}")
            }
            
            connection.outputStream.bufferedWriter().use { it.write(requestBody) }
            
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val jsonArray = json.parseToJsonElement(response).jsonArray
                
                if (jsonArray.isNotEmpty()) {
                    val obj = jsonArray[0].jsonObject
                    Note(
                        id = obj["id"]?.jsonPrimitive?.content?.toInt() ?: 0,
                        title = obj["title"]?.jsonPrimitive?.content ?: "",
                        content = obj["content"]?.jsonPrimitive?.content ?: "",
                        userId = obj["user_id"]?.jsonPrimitive?.content ?: "",
                        userEmail = obj["user_email"]?.jsonPrimitive?.content ?: "",
                        createdAt = obj["created_at"]?.jsonPrimitive?.content ?: "",
                        updatedAt = obj["updated_at"]?.jsonPrimitive?.content ?: ""
                    )
                } else null
            } else null
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun deleteNote(noteId: Int, userId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val url = URL("${SupabaseClient.SUPABASE_URL}/rest/v1/notes?id=eq.$noteId&user_id=eq.$userId")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.requestMethod = "DELETE"
            connection.setRequestProperty("apikey", SupabaseClient.SUPABASE_ANON_KEY)
            connection.setRequestProperty("Authorization", "Bearer ${SupabaseClient.SUPABASE_ANON_KEY}")
            connection.setRequestProperty("Content-Type", "application/json")
            
            val responseCode = connection.responseCode
            responseCode == HttpURLConnection.HTTP_NO_CONTENT
        } catch (e: Exception) {
            false
        }
    }
}
