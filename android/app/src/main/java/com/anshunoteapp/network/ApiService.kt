package com.anshunoteapp.network

import com.anshunoteapp.data.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    @GET("api/user")
    suspend fun getCurrentUser(): Response<User>
    
    @GET("api/notes")
    suspend fun getNotes(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 100
    ): Response<List<Note>>
    
    @GET("api/notes/{id}")
    suspend fun getNote(@Path("id") id: Int): Response<Note>
    
    @POST("api/notes")
    suspend fun createNote(@Body note: CreateNoteRequest): Response<Note>
    
    @PUT("api/notes/{id}")
    suspend fun updateNote(
        @Path("id") id: Int,
        @Body note: UpdateNoteRequest
    ): Response<Note>
    
    @DELETE("api/notes/{id}")
    suspend fun deleteNote(@Path("id") id: Int): Response<Unit>
}
