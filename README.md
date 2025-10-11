# Notes App with Firebase Authentication

A secure, user-friendly note-taking web application with **Google Sign-In authentication**, built with Node.js, Express, Firebase, and Supabase. Your notes are private and persist across devices!

## ✨ Features

- 🔐 **Secure Authentication** - Google Sign-In with Firebase
- 👤 **Private Notes** - Each user sees only their own notes
- ✨ Create, read, and delete notes with a beautiful interface
- 📱 Responsive design that works on all devices
- 💾 **Persistent storage** with Supabase (PostgreSQL)
- 🚀 Fast and lightweight
- ⚡ Zero native dependencies - pure JavaScript!

## 🔒 Security

- User authentication required for all note operations
- JWT token verification on backend
- User-specific data isolation
- Secure database queries with user ID filtering
- HTTPS enforcement on production

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: HTML, CSS, JavaScript (Vanilla, ES6 modules)
- **Deployment**: Render

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm (comes with Node.js)
- Google account
- Firebase account (free)
- Supabase account (free)

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

3. **Set up Firebase** 
   - See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions
   - Update `static/script.js` with your Firebase config

4. **Set up Supabase**
   - Create a Supabase project
   - Run the SQL in `supabase-setup.sql`
   - Get your credentials

5. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your credentials
```

6. **Run the application**
```bash
npm start
```

7. **Open your browser**
Visit: `http://localhost:3000`

## 📋 Complete Setup Guide

### 1. Firebase Setup (Required for Authentication)

**See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed step-by-step instructions.**

Quick summary:
1. Create Firebase project
2. Enable Google Authentication
3. Get Firebase config for frontend
4. Generate service account key for backend
5. Configure environment variables

### 2. Supabase Setup (Required for Database)

#### Step A: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: notes-app
   - **Database Password**: (create and save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup

#### Step B: Create the Notes Table

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New Query"**
3. Copy the contents of `supabase-setup.sql` from this repository
4. Paste and click **"Run"**
5. You should see "✅ Notes table with authentication support created successfully!"

#### Step C: Get API Credentials

1. Click **"Settings"** → **"API"**
2. Copy these two values:
   - **Project URL** → Use for `SUPABASE_URL`
   - **anon public** key → Use for `SUPABASE_ANON_KEY`

### 3. Frontend Configuration

1. Open `static/script.js`
2. Find the `firebaseConfig` object (lines 3-10)
3. Replace with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. **Commit and push to GitHub**

### 4. Deploy to Render

#### Step A: Initial Deployment

1. Push your code to GitHub (with updated Firebase config)
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `notes-app`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **"Create Web Service"** (don't deploy yet!)

#### Step B: Add Environment Variables

Click **"Environment"** and add these three variables:

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Settings → API |
| `SUPABASE_ANON_KEY` | `eyJ...` | Supabase Settings → API |
| `FIREBASE_SERVICE_ACCOUNT` | `{"type":"service_account",...}` | Firebase (see FIREBASE_SETUP.md) |

**Important**: `FIREBASE_SERVICE_ACCOUNT` must be a single-line minified JSON string!

7. Click **"Save Changes"**
8. Render will deploy automatically

#### Step C: Authorize Domain in Firebase

1. Go to Firebase Console
2. **Authentication** → **Settings** tab
3. **Authorized domains** → **Add domain**
4. Add: `your-app-name.onrender.com`
5. Click **"Add"**

## 📡 API Endpoints

All endpoints require authentication (except `/health`).

- `GET /` - Serve the web interface
- `GET /health` - Health check (shows auth & storage status)
- `GET /api/user` - Get current user info
- `POST /api/notes` - Create a new note (requires auth)
- `GET /api/notes` - Get all user's notes (requires auth)
- `GET /api/notes/{id}` - Get specific note (requires auth & ownership)
- `PUT /api/notes/{id}` - Update note (requires auth & ownership)
- `DELETE /api/notes/{id}` - Delete note (requires auth & ownership)

## 🔐 Authentication Flow

1. User visits the app → sees "Sign in with Google"
2. User clicks button → Firebase popup for Google Sign-In
3. User signs in → Firebase returns ID token
4. Frontend stores token and includes it in all API requests
5. Backend verifies token with Firebase Admin SDK
6. Backend extracts user ID and filters data accordingly
7. Users can only access their own notes

## 🌐 Environment Variables

### Required for Production

```bash
# Supabase (Database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Firebase (Authentication)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Optional

```bash
# Server
PORT=3000  # Auto-set by Render
```

## 📁 Project Structure

```
note-app/
├── server.js                 # Express server with Firebase Auth
├── package.json              # Dependencies
├── .env.example              # Environment variables template
├── render.yaml               # Render deployment config
├── README.md                 # This file
├── FIREBASE_SETUP.md         # Detailed Firebase setup guide
├── supabase-setup.sql        # Database schema with user_id
└── static/                   # Frontend files
    ├── index.html            # Auth UI + Notes interface
    ├── style.css             # Styles with auth sections
    └── script.js             # Firebase Auth + API calls
```

## 🔍 Testing

### Check Health Endpoint

Visit: `https://your-app.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "storage": "database",
  "authentication": "enabled",
  "notesCount": 0
}
```

### Test Authentication

1. Visit your deployed app
2. Click "Sign in with Google"
3. Sign in with your Google account
4. Create a note
5. Refresh the page - note should still be there
6. Sign out and sign in with a different account - previous notes should not be visible

## 🐛 Troubleshooting

### Authentication Issues

**"Firebase: Error (auth/unauthorized-domain)"**
- Add your domain to Firebase authorized domains
- Go to Firebase Console → Authentication → Settings → Authorized domains

**"Unauthorized - Invalid token"**
- Check `FIREBASE_SERVICE_ACCOUNT` is set correctly in Render
- Make sure the JSON is minified (single line)
- Verify the service account key is not expired

### Database Issues

**"Notes not loading"**
- Check Supabase credentials are correct
- Verify the `notes` table exists with `user_id` column
- Run the updated `supabase-setup.sql`

**"Note not found" errors**
- This is expected if trying to access another user's note
- Security feature - users can only see their own notes

### Deployment Issues

**Build fails**
- Ensure Node.js 18.0+ is specified
- Check all dependencies are in `package.json`
- Review Render build logs

**Frontend not loading**
- Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check Firebase config in `script.js` is correct
- Open browser console (F12) for errors

## 🎨 Features Demo

### User Experience

1. **Landing Page** - Clean sign-in interface
2. **Google Sign-In** - One-click authentication
3. **Dashboard** - See your name, photo, and email
4. **Create Notes** - Simple form with validation
5. **View Notes** - Beautiful grid layout
6. **Delete Notes** - Confirm before deletion
7. **Sign Out** - Secure logout

### Security Features

- JWT token verification
- User-specific data queries
- No cross-user data access
- Secure session management
- HTTPS in production

## 📈 Performance

- **Fast**: In-memory JWT verification
- **Scalable**: PostgreSQL handles thousands of users
- **Efficient**: Indexed database queries
- **Reliable**: Firebase Auth handles millions of users globally

## 💰 Cost (Free Tier)

- **Firebase**: 10K authentications/month free
- **Supabase**: 500 MB database, 50K monthly active users free
- **Render**: 750 hours/month free (one app always on)
- **Total**: $0/month for personal projects!

## 🔜 Future Enhancements

- ✏️ Edit notes functionality
- 🔍 Search and filter notes
- 🏷️ Categories or tags
- 📝 Rich text editor
- 💾 Export/Import notes
- 🌙 Dark mode
- 📱 Progressive Web App (PWA)
- 🔔 Email notifications
- 👥 Share notes with specific users

## 🤝 Contributing

Feel free to fork this project and make improvements!

## 📄 License

MIT License - feel free to use this project for learning or building your own apps!

## 🆘 Support

- **Firebase Setup Issues**: See [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Supabase Issues**: Check `supabase-setup.sql` comments
- **General Questions**: Check browser console (F12) and Render logs

---

Made with ❤️ using Node.js, Express, Firebase, Supabase, and Render

**Happy note-taking!** 📝🔐
