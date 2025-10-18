package com.anshunoteapp.data

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Note(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("title")
    val title: String,
    
    @SerializedName("content")
    val content: String,
    
    @SerializedName("user_id")
    val userId: String,
    
    @SerializedName("user_email")
    val userEmail: String,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String
) : Parcelable

data class CreateNoteRequest(
    val title: String,
    val content: String
)

data class UpdateNoteRequest(
    val title: String?,
    val content: String?
)

data class User(
    val uid: String,
    val email: String,
    val name: String?,
    val picture: String?
)
