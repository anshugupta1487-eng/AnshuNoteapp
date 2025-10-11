# Notes App

A simple and elegant note-taking web application built with FastAPI and vanilla JavaScript. Create, read, and delete notes with a beautiful, responsive interface.

## Features

- ✨ Create new notes with title and content
- 📖 View all your notes in a beautiful grid layout
- 🗑️ Delete notes you no longer need
- 📱 Responsive design that works on all devices
- 🚀 Fast and lightweight
- 💾 SQLite for local development, PostgreSQL for production

## Technology Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLAlchemy with SQLite/PostgreSQL
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Deployment**: Render

## Local Development

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Clone or download this repository

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the application:
```bash
python main.py
```

6. Open your browser and visit: `http://localhost:8000`

## API Endpoints

- `GET /` - Serve the web interface
- `GET /health` - Health check endpoint
- `POST /api/notes` - Create a new note
- `GET /api/notes` - Get all notes
- `GET /api/notes/{note_id}` - Get a specific note
- `DELETE /api/notes/{note_id}` - Delete a note

## Deploying to Render

### Step 1: Prepare Your Repository

1. Push this code to a GitHub repository

### Step 2: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: notes-app (or your preferred name)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add PostgreSQL Database (Optional but Recommended)

1. In Render Dashboard, click "New +" and select "PostgreSQL"
2. Create the database with a name like "notes-db"
3. Once created, copy the "Internal Database URL"
4. Go back to your web service settings
5. Add an environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: [paste the Internal Database URL]

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Once deployed, you'll get a URL like: `https://notes-app-xxxx.onrender.com`

## Environment Variables

- `DATABASE_URL` - Database connection string (automatically set by Render if using PostgreSQL)
- `PORT` - Port number (automatically set by Render)

## Project Structure

```
note-app/
├── main.py              # FastAPI application and routes
├── database.py          # Database models and configuration
├── schemas.py           # Pydantic schemas for validation
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── .gitignore          # Git ignore file
└── static/             # Frontend files
    ├── index.html      # Main HTML page
    ├── style.css       # Styles
    └── script.js       # JavaScript functionality
```

## Future Enhancements

- Update/Edit notes functionality
- Search and filter notes
- Categories or tags
- User authentication
- Rich text editor
- Export notes

## License

MIT License - feel free to use this project for learning or building your own apps!

