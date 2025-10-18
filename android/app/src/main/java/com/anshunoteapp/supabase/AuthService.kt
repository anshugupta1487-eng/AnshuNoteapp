package com.anshunoteapp.supabase

import com.google.firebase.auth.FirebaseUser
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.tasks.await

class AuthService {
    
    private val supabase = SupabaseClient.auth
    
    suspend fun signInWithFirebaseUser(firebaseUser: FirebaseUser): Boolean {
        return try {
            // Get Firebase ID token
            val idToken = firebaseUser.getIdToken(true).await()
            
            // Sign in to Supabase using Firebase token
            supabase.signInWith(Email) {
                email = firebaseUser.email ?: ""
                password = idToken.token ?: "" // Use Firebase token as password for Supabase
            }
            
            true
        } catch (e: Exception) {
            // If the above doesn't work, we'll use a different approach
            // Create a Supabase user with Firebase UID
            try {
                supabase.signUpWith(Email) {
                    email = firebaseUser.email ?: ""
                    password = firebaseUser.uid // Use Firebase UID as password
                }
                true
            } catch (e2: Exception) {
                false
            }
        }
    }
    
    suspend fun signOut() {
        try {
            supabase.signOut()
        } catch (e: Exception) {
            // Handle error if needed
        }
    }
    
    fun getCurrentUserId(): String? {
        return try {
            supabase.currentUserOrNull()?.id
        } catch (e: Exception) {
            null
        }
    }
    
    fun getCurrentUserEmail(): String? {
        return try {
            supabase.currentUserOrNull()?.email
        } catch (e: Exception) {
            null
        }
    }
}
