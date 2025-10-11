# Notes App

A simple and elegant note-taking web application built with Node.js, Express, and vanilla JavaScript. Now with persistent database storage using Supabase!

## Features

- ✨ Create new notes with title and content
- 📖 View all your notes in a beautiful grid layout
- 🗑️ Delete notes you no longer need
- 📱 Responsive design that works on all devices
- 🚀 Fast and lightweight
- 💾 **Persistent storage with Supabase (PostgreSQL)**
- 🔄 Automatic fallback to in-memory storage if database not configured
- ⚡ Zero native dependencies - pure JavaScript!

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Persistent database with in-memory fallback
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Deployment**: Render (or any Node.js hosting)

## Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm (comes with Node.js)
- Supabase account (free tier available)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/anshugupta1487-eng/AnshuNoteapp.git
cd AnshuNoteapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase** (see detailed instructions below)

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your Supabase credentials
```

5. **Run the application**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. **Open your browser**
Visit: `http://localhost:3000`

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: notes-app (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

### Step 2: Create the Notes Table

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
-- In production, you should restrict this based on user authentication
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. You should see "Success. No rows returned"

### Step 3: Get Your API Credentials

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 4: Configure Environment Variables

**For Local Development:**

Create a `.env` file in the project root:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**For Render Deployment:**

1. Go to your Render dashboard
2. Select your notes-app service
3. Click **"Environment"** in the left sidebar
4. Add these environment variables:
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_ANON_KEY` = your anon public key
5. Click **"Save Changes"**
6. Render will automatically redeploy

## API Endpoints

- `GET /` - Serve the web interface
- `GET /health` - Health check endpoint (shows storage type and note count)
- `POST /api/notes` - Create a new note
- `GET /api/notes` - Get all notes (with pagination)
- `GET /api/notes/{note_id}` - Get a specific note
- `PUT /api/notes/{note_id}` - Update a note
- `DELETE /api/notes/{note_id}` - Delete a note

## Deploying to Render

### Initial Deployment

1. Push your code to GitHub

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click **"New +"** and select **"Web Service"**

4. Connect your GitHub repository

5. Configure the service:
   - **Name**: `notes-app`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. Add environment variables (from Supabase setup):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

7. Click **"Create Web Service"**

8. Wait for deployment (usually 2-5 minutes)

9. Your app will be live at: `https://your-app-name.onrender.com`

### Using render.yaml (Blueprint)

Alternatively, use the included `render.yaml`:

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will auto-detect the configuration
4. Add environment variables manually
5. Click **"Apply"** to deploy

## Storage Modes

The app supports two storage modes:

### 1. Database Mode (Recommended)
- ✅ Persistent storage
- ✅ Data survives server restarts
- ✅ Production-ready
- ✅ Automatic when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

### 2. In-Memory Mode (Fallback)
- ⚡ Fast for development
- ⚠️ Data resets on server restart
- ✅ No configuration needed
- ✅ Automatic when Supabase not configured

The app automatically detects which mode to use based on environment variables.

## Project Structure

```
note-app/
├── server.js           # Express server with Supabase integration
├── package.json        # Node.js dependencies
├── .env.example        # Example environment variables
├── render.yaml         # Render deployment config
├── README.md          # This file
├── .gitignore         # Git ignore file
└── static/            # Frontend files
    ├── index.html     # Main HTML page
    ├── style.css      # Styles
    └── script.js      # JavaScript functionality
```

## Environment Variables

Required for database mode:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon public key

Optional:
- `PORT` - Port number (defaults to 3000)

## Troubleshooting

### Notes not persisting
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
- Visit `/health` endpoint to see which storage mode is active
- Check Render logs for connection errors

### Database connection errors
- Verify your Supabase credentials are correct
- Ensure the notes table exists (run the SQL from setup)
- Check that RLS policies are configured correctly

### Build fails on Render
- Ensure Node.js version is 18.0 or higher
- Check that all dependencies are in `package.json`
- Review Render build logs for specific errors

### Check Storage Mode
Visit your app's health endpoint:
```
https://your-app.onrender.com/health
```

Response shows:
```json
{
  "status": "healthy",
  "storage": "database",  // or "in-memory"
  "notesCount": 5
}
```

## Security Considerations

### For Production Use

1. **Enable Authentication**: Update RLS policies to require user authentication
2. **Restrict API Access**: Add authentication middleware to your routes
3. **Use Service Role Key**: For admin operations, use service role key (keep it secret!)
4. **Add Rate Limiting**: Prevent abuse with rate limiting middleware
5. **Enable HTTPS Only**: Ensure all connections use HTTPS

### Example: Secure RLS Policy

Replace the permissive policy with user-specific policies:

```sql
-- Delete the permissive policy
DROP POLICY "Allow all operations on notes" ON notes;

-- Create user-specific policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add user_id column
ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

## Development

### Adding New Features

1. Install nodemon: `npm install --save-dev nodemon`
2. Run with auto-reload: `npm run dev`
3. Make your changes
4. Test locally before deploying

### Database Migrations

When changing the database schema:

1. Write migration SQL in Supabase SQL Editor
2. Test in development first
3. Apply to production
4. Update code to match new schema

## Future Enhancements

- ✏️ Edit notes functionality (API already supports it!)
- 🔍 Search and filter notes
- 🏷️ Categories or tags
- 🔐 User authentication (Supabase Auth)
- 📝 Rich text editor
- 💾 Export/Import notes
- 🌙 Dark mode
- 📱 Mobile app (React Native)
- 🔔 Reminders and notifications

## Performance

- **Fast**: Supabase provides excellent query performance
- **Scalable**: PostgreSQL handles thousands of concurrent users
- **Efficient**: Connection pooling and prepared statements
- **Reliable**: Automatic backups and point-in-time recovery

## Cost

- **Supabase Free Tier**: 500 MB database, 50,000 monthly active users
- **Render Free Tier**: 750 hours/month (enough for one app)
- **Total**: $0/month for personal projects!

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Render Docs**: https://render.com/docs
- **Issues**: Create an issue in the GitHub repository

## License

MIT License - feel free to use this project for learning or building your own apps!

---

Made with ❤️ using Node.js, Express, Supabase, and Render
