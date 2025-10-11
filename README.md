# Notes App

A simple and elegant note-taking web application built with Node.js, Express, and vanilla JavaScript. Create, read, and delete notes with a beautiful, responsive interface.

## Features

- ✨ Create new notes with title and content
- 📖 View all your notes in a beautiful grid layout
- 🗑️ Delete notes you no longer need
- 📱 Responsive design that works on all devices
- 🚀 Fast and lightweight
- 💾 SQLite database for data persistence

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (better-sqlite3)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Deployment**: Render

## Local Development

### Prerequisites

- Node.js 18.0 or higher
- npm (comes with Node.js)

### Setup

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and visit: `http://localhost:3000`

## API Endpoints

- `GET /` - Serve the web interface
- `GET /health` - Health check endpoint
- `POST /api/notes` - Create a new note
- `GET /api/notes` - Get all notes
- `GET /api/notes/{note_id}` - Get a specific note
- `PUT /api/notes/{note_id}` - Update a note
- `DELETE /api/notes/{note_id}` - Delete a note

## Deploying to Render

### Option 1: Using the Render Dashboard

1. Push this code to a GitHub repository (if not already done)

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click "New +" and select "Web Service"

4. Connect your GitHub repository

5. Configure the service:
   - **Name**: `notes-app` (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. Click "Create Web Service"

7. Your app will be deployed at a URL like: `https://notes-app-xxxx.onrender.com`

### Option 2: Using render.yaml (Blueprint)

This repository includes a `render.yaml` file for easy deployment:

1. In Render Dashboard, click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` and configure everything
4. Click "Apply" to deploy

## Environment Variables

No environment variables are required for basic functionality. The app uses:
- `PORT` - Port number (automatically set by Render, defaults to 3000 locally)
- `NODE_ENV` - Environment (automatically set to 'production' on Render)

## Project Structure

```
note-app/
├── server.js           # Express server and API routes
├── package.json        # Node.js dependencies and scripts
├── render.yaml         # Render deployment configuration
├── README.md          # This file
├── .gitignore         # Git ignore file
└── static/            # Frontend files
    ├── index.html     # Main HTML page
    ├── style.css      # Styles
    └── script.js      # JavaScript functionality
```

## Database

The app uses SQLite for data storage:
- Local development: Creates `notes.db` in the project root
- Production: SQLite file is created in the deployed environment
- Data persists across restarts on Render

## Development

To add new features:

1. Install nodemon for development: `npm install --save-dev nodemon`
2. Run with auto-reload: `npm run dev`
3. Make your changes
4. Test locally before deploying

## Future Enhancements

- ✏️ Update/Edit notes functionality
- 🔍 Search and filter notes
- 🏷️ Categories or tags
- 🔐 User authentication
- 📝 Rich text editor
- 💾 Export notes
- 🌙 Dark mode

## Performance

- Fast in-memory SQLite database
- Prepared statements for security and performance
- Minimal dependencies
- Efficient static file serving

## License

MIT License - feel free to use this project for learning or building your own apps!
