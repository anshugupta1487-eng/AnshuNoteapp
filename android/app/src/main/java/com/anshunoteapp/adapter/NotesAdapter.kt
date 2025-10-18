package com.anshunoteapp.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.anshunoteapp.R
import com.anshunoteapp.data.Note
import java.text.SimpleDateFormat
import java.util.*

class NotesAdapter(
    private var notes: List<Note>,
    private val onEditClick: (Note) -> Unit,
    private val onDeleteClick: (Note) -> Unit
) : RecyclerView.Adapter<NotesAdapter.NoteViewHolder>() {

    class NoteViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val titleText: TextView = itemView.findViewById(R.id.noteTitle)
        val contentText: TextView = itemView.findViewById(R.id.noteContent)
        val dateText: TextView = itemView.findViewById(R.id.noteDate)
        val editBtn: com.google.android.material.button.MaterialButton = itemView.findViewById(R.id.editBtn)
        val deleteBtn: com.google.android.material.button.MaterialButton = itemView.findViewById(R.id.deleteBtn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NoteViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_note, parent, false)
        return NoteViewHolder(view)
    }

    override fun onBindViewHolder(holder: NoteViewHolder, position: Int) {
        val note = notes[position]
        
        holder.titleText.text = note.title
        holder.contentText.text = note.content
        
        // Format date
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val outputFormat = SimpleDateFormat("MMM dd, yyyy 'at' HH:mm", Locale.getDefault())
        try {
            val date = inputFormat.parse(note.createdAt)
            holder.dateText.text = "Created: ${outputFormat.format(date)}"
        } catch (e: Exception) {
            holder.dateText.text = "Created: ${note.createdAt}"
        }
        
        holder.editBtn.setOnClickListener { onEditClick(note) }
        holder.deleteBtn.setOnClickListener { onDeleteClick(note) }
    }

    override fun getItemCount(): Int = notes.size

    fun updateNotes(newNotes: List<Note>) {
        notes = newNotes
        notifyDataSetChanged()
    }
}
