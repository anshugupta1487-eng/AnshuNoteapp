# Notes App

A simple and elegant note-taking web application built with Node.js, Express, and vanilla JavaScript. Create, read, and delete notes with a beautiful, responsive interface.

## Features

- ✨ Create new notes with title and content
- 📖 View all your notes in a beautiful grid layout
- 🗑️ Delete notes you no longer need
- 📱 Responsive design that works on all devices
- 🚀 Fast and lightweight
- 💾 JSON file storage (no database setup required)
- ⚡ Zero native dependencies - pure JavaScript!

## Technology Stack

- **Backend**: Node.js with Express.js
- **Storage**: JSON file-based persistence
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Deployment**: Render (or any Node.js hosting)

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

### Step-by-Step Deployment

1. Push this code to GitHub (if not already done)

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click **"New +"** and select **"Web Service"**

4. Connect your GitHub repository

5. Configure the service:
   - **Name**: `notes-app` (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or your choice)

6. Click **"Create Web Service"**

7. Wait for deployment to complete (usually 2-5 minutes)

8. Your app will be live at: `https://your-app-name.onrender.com`

### Using render.yaml (Blueprint)

This repository includes a `render.yaml` file for one-click deployment:

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will auto-detect the configuration
4. Click **"Apply"** to deploy

## Why No Database?

This app uses JSON file storage instead of a database:
- ✅ **Zero native dependencies** - no compilation issues
- ✅ **Works everywhere** - any Node.js environment
- ✅ **Easy to backup** - just copy the JSON file
- ✅ **Perfect for small apps** - handles thousands of notes easily
- ✅ **No setup required** - automatic initialization

## Data Storage

- Data is stored in `data/notes.json`
- File is created automatically on first run
- Persists across restarts on Render
- Human-readable JSON format

## Project Structure

```
note-app/
├── server.js           # Express server and API routes
├── package.json        # Node.js dependencies and scripts
├── render.yaml         # Render deployment configuration
├── README.md          # This file
├── .gitignore         # Git ignore file
├── data/              # Data storage (auto-created)
│   └── notes.json     # Notes database (auto-created)
└── static/            # Frontend files
    ├── index.html     # Main HTML page
    ├── style.css      # Styles
    └── script.js      # JavaScript functionality
```

## Environment Variables

No environment variables are required! The app works out of the box.

Optional:
- `PORT` - Port number (automatically set by Render, defaults to 3000 locally)

## Performance & Scalability

- **Fast**: In-memory operations with file persistence
- **Lightweight**: Only 2 dependencies (express + cors)
- **Efficient**: Atomic file operations
- **Scalable**: Handles thousands of notes easily

## Troubleshooting

### Build fails on Render
- This version uses **zero native dependencies**, so builds should always succeed
- If issues persist, check that Node.js version is 18.0 or higher

### Data not persisting
- Render's free tier uses ephemeral storage
- For permanent storage, upgrade to a paid plan or use a database add-on

## Development

To add new features:

1. Install nodemon: `npm install --save-dev nodemon`
2. Run with auto-reload: `npm run dev`
3. Make your changes
4. Test locally before deploying

## Future Enhancements

- ✏️ Update/Edit notes functionality
- 🔍 Search and filter notes
- 🏷️ Categories or tags
- 🔐 User authentication
- 📝 Rich text editor
- 💾 Export/Import notes
- 🌙 Dark mode
- 🗄️ Optional database support (PostgreSQL/MongoDB)

## Advantages Over Database Version

1. **No build dependencies** - pure JavaScript
2. **Faster deployment** - no compilation needed
3. **Simpler architecture** - easier to understand
4. **No database setup** - works immediately
5. **Easy data inspection** - just open the JSON file

## License

MIT License - feel free to use this project for learning or building your own apps!
