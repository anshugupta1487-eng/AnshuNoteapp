package com.anshunoteapp.supabase

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest

object SupabaseClient {
    
    // Replace these with your actual Supabase credentials
    // Get these from your Supabase project settings
    const val SUPABASE_URL = "https://your-project-id.supabase.co"
    const val SUPABASE_ANON_KEY = "your-anon-key"
    
    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_ANON_KEY
    ) {
        install(Auth) {
            // Configure auth if needed
        }
        install(Postgrest) {
            // Configure postgrest if needed
        }
    }
    
    val auth = client.auth
    val postgrest = client.postgrest
}
