# Anshu Note App - Android Client

A simple Android client for the Anshu Note App with Firebase authentication and CRUD operations for text notes.

## Features

- **Firebase Authentication**: Sign in with Google
- **CRUD Operations**: Create, Read, Update, Delete text notes
- **Modern UI**: Material Design 3 with clean interface
- **Real-time Sync**: Notes sync with the backend server
- **Offline Support**: Basic offline functionality

## Prerequisites

- Android Studio Narwhal 4 Feature Drop | 2025.1.4 or later
- Android SDK 24+ (Android 7.0)
- Firebase project with Google Sign-In enabled
- Backend server running (see main project README)

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (`notes-web-app-8bf56`)
3. Add Android app:
   - Package name: `com.anshunoteapp`
   - App nickname: `Anshu Note App Android`
   - Download `google-services.json`
4. Replace the existing `google-services.json` in `app/` directory
5. Enable Google Sign-In in Authentication settings

### 2. Update Firebase Configuration

1. Open `app/google-services.json`
2. Update the `mobilesdk_app_id` with your actual Android app ID
3. Update the `oauth_client` entries with your actual OAuth client IDs

### 3. Backend Configuration

The app is configured to connect to: `https://anshunoteeapp-1.onrender.com/`

If your backend is running on a different URL, update `ApiClient.kt`:

```kotlin
private const val BASE_URL = "YOUR_BACKEND_URL"
```

### 4. Build and Run

1. Open Android Studio
2. Open the `android` folder as a project
3. Sync Gradle files
4. Run the app on an emulator or device

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/anshunoteapp/
│   │   │   ├── data/           # Data models
│   │   │   ├── network/        # API client
│   │   │   ├── adapter/        # RecyclerView adapters
│   │   │   ├── MainActivity.kt # Main activity
│   │   │   └── NoteEditorActivity.kt
│   │   ├── res/               # Resources
│   │   └── AndroidManifest.xml
│   ├── build.gradle           # App-level build config
│   └── google-services.json   # Firebase config
├── build.gradle               # Project-level build config
└── settings.gradle
```

## Key Components

### Data Models
- `Note`: Main note data class with Parcelable support
- `CreateNoteRequest`: Request model for creating notes
- `UpdateNoteRequest`: Request model for updating notes
- `User`: User information model

### Network Layer
- `ApiService`: Retrofit interface for API calls
- `ApiClient`: Singleton for API configuration and authentication

### UI Components
- `MainActivity`: Main screen with authentication and notes list
- `NoteEditorActivity`: Create/edit note screen
- `NotesAdapter`: RecyclerView adapter for notes list

## API Integration

The app communicates with the backend using the following endpoints:

- `GET /api/user` - Get current user info
- `GET /api/notes` - Get all notes for user
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update existing note
- `DELETE /api/notes/{id}` - Delete note

All requests include Firebase ID token in Authorization header.

## Authentication Flow

1. User taps "Sign in with Google"
2. Google Sign-In popup appears
3. User selects Google account
4. Firebase authenticates the user
5. App gets Firebase ID token
6. Token is used for all API calls
7. User can create, view, edit, and delete notes

## Dependencies

- **Firebase**: Authentication and Analytics
- **Retrofit**: HTTP client for API calls
- **Material Design**: UI components
- **Coroutines**: Asynchronous programming
- **Gson**: JSON serialization

## Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all dependencies are synced
2. **Authentication Fails**: Check Firebase configuration
3. **API Calls Fail**: Verify backend URL and network connectivity
4. **Google Sign-In Issues**: Check OAuth client configuration

### Debug Steps

1. Check Android Studio logs for error messages
2. Verify Firebase project settings
3. Test backend API endpoints directly
4. Check network permissions in manifest

## Development Notes

- The app uses ViewBinding for type-safe view access
- All network calls are made using Kotlin Coroutines
- Material Design 3 components are used throughout
- The app follows MVVM architecture patterns
- Error handling includes user-friendly messages

## Future Enhancements

- Offline note storage with Room database
- Rich text editing capabilities
- Note categories and tags
- Search functionality
- Note sharing features
- Push notifications
- Dark theme support

## License

This project is part of the Anshu Note App and follows the same license terms.
