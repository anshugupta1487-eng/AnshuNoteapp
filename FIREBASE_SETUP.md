# Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase Authentication with Google Sign-In for your Notes App.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

---

## Part 1: Create Firebase Project

### Step 1: Create New Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `notes-app` (or your choice)
4. Click **"Continue"**
5. **Google Analytics**: You can disable it for now (toggle off)
6. Click **"Create project"**
7. Wait for setup to complete (~30 seconds)
8. Click **"Continue"**

### Step 2: Register Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. App nickname: `notes-web-app`
3. **Firebase Hosting**: Leave unchecked for now
4. Click **"Register app"**
5. **IMPORTANT**: Copy the `firebaseConfig` object - you'll need this!

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "notes-app-xxxxx.firebaseapp.com",
  projectId: "notes-app-xxxxx",
  storageBucket: "notes-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

6. Click **"Continue to console"**

---

## Part 2: Enable Google Sign-In

### Step 1: Enable Authentication

1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab

### Step 2: Enable Google Provider

1. Find **"Google"** in the list of providers
2. Click on it
3. Toggle **"Enable"** to ON
4. **Project support email**: Select your email from dropdown
5. Click **"Save"**

### Step 3: Configure OAuth Consent (Important for Production)

1. Click **"Settings"** (gear icon) → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Note your **Auth domain** (e.g., `notes-app-xxxxx.firebaseapp.com`)

For production deployment on Render:
- You'll need to authorize your domain in OAuth settings
- We'll do this in Part 4

---

## Part 3: Get Service Account Key (for Backend)

### Step 1: Generate Private Key

1. Click **"Settings"** (gear icon) → **"Project settings"**
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"** button
4. Click **"Generate key"** in the confirmation dialog
5. A JSON file will download - **KEEP THIS SECURE!**

### Step 2: Format for Environment Variable

The downloaded JSON looks like:
```json
{
  "type": "service_account",
  "project_id": "notes-app-xxxxx",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  ...
}
```

You need to convert this to a single-line string for the environment variable.

**Option 1: Manual (use online JSON minifier)**
- Copy the entire JSON content
- Go to https://www.jsonminifier.com/
- Paste and minify
- Copy the result

**Option 2: Command line**
```bash
cat /path/to/downloaded-file.json | jq -c
```

The result should be a single line like:
```
{"type":"service_account","project_id":"notes-app-xxxxx",...}
```

---

## Part 4: Configure Your Application

### Frontend Configuration

1. Open `/static/script.js` in your project
2. Find the `firebaseConfig` object (near the top)
3. Replace the placeholder values with your Firebase config from Part 1, Step 2

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

4. **Commit and push** these changes to GitHub

### Backend Configuration (Render)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **notes-app** web service
3. Click **"Environment"** in the left sidebar
4. Add a new environment variable:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: (paste the minified JSON from Part 3, Step 2)
5. Click **"Save Changes"**

Render will automatically redeploy with Firebase authentication enabled!

---

## Part 5: Authorize Your Domain (Production Only)

### For Render Deployment

1. Go back to Firebase Console
2. Click **"Authentication"** → **"Settings"** tab
3. Scroll to **"Authorized domains"**
4. Click **"Add domain"**
5. Add your Render domain: `anshunoteeapp-1.onrender.com` (or your actual domain)
6. Click **"Add"**

This allows Google Sign-In to work from your deployed app.

---

## Part 6: Testing

### Local Testing

1. Update `static/script.js` with your Firebase config
2. Run: `npm start`
3. Visit: `http://localhost:3000`
4. Click **"Sign in with Google"**
5. You should see the Google sign-in popup
6. After signing in, you should see the notes app

### Production Testing

1. Visit your deployed app: `https://anshunoteeapp-1.onrender.com`
2. Click **"Sign in with Google"**
3. Sign in with your Google account
4. Create some notes!

---

## Environment Variables Summary

You need to set these in Render:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (minified) | Firebase → Settings → Service accounts |
| `SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API |

---

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- **Solution**: Add your domain to authorized domains (Part 5)
- Make sure to add both `localhost` (for development) and your Render domain

### "Authentication failed: Invalid token"
- **Solution**: Check that `FIREBASE_SERVICE_ACCOUNT` is set correctly in Render
- Make sure the JSON is properly minified (single line, no line breaks)

### "Sign-in popup blocked"
- **Solution**: Allow popups in your browser for the site
- Or check browser console for other errors

### Notes not loading after sign-in
- **Solution**: Check browser console (F12) for errors
- Verify Supabase connection is working (`/health` endpoint)
- Make sure you ran the updated SQL to add `user_id` columns

### CORS errors
- **Solution**: Make sure your Render domain is added to Firebase authorized domains
- Check that the auth domain in Firebase config matches your Firebase project

---

## Security Best Practices

1. **Never commit** `FIREBASE_SERVICE_ACCOUNT` to Git
2. **Keep your service account JSON file secure** - it has admin access
3. **Use environment variables** for all sensitive data
4. In production, consider implementing:
   - Rate limiting
   - Email verification
   - Admin controls
   - More restrictive Supabase RLS policies

---

## Next Steps

Once authentication is working:
1. Create and manage your private notes
2. Consider adding more features:
   - Note editing
   - Note categories/tags
   - Search functionality
   - Rich text editor
   - Sharing notes (with permissions)

---

## Support

If you encounter issues:
1. Check the browser console (F12) for errors
2. Check Render logs for backend errors
3. Verify all environment variables are set correctly
4. Make sure Firebase and Supabase are both configured

Happy note-taking! 📝🔐

