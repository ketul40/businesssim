# 🚀 Quick Start Guide

Get BusinessSim running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Firebase

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name it "BusinessSim" (or your choice)
4. Follow the setup wizard

### Enable Firebase Services
1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

2. **Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode (for development)
   - Choose your region

3. **Cloud Storage**
   - Go to Storage
   - Click "Get started"
   - Use default security rules

4. **Cloud Functions** (optional for now, required for full AI)
   - Go to Functions
   - Click "Get started"

### Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (</>)
4. Register app
5. Copy the config object

## Step 3: Configure Environment Variables

Create a file `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

## Step 4: Update Firestore Rules

Go to Firestore → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone authenticated can read scenarios
    match /scenarios/{scenarioId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      resource.data.ownerId == request.auth.uid;
    }
    
    // Users can read/write their own sessions
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
    }
    
    // Users can read their own evaluations
    match /evaluations/{evaluationId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:5173

## Step 6: Sign Up & Test

1. Click "Sign Up"
2. Create an account
3. Choose "Convince Director on Project Direction"
4. Start chatting!

---

## 🤖 Enabling Full AI (Optional)

The app includes mock AI responses for development. To enable real AI:

### 1. Set Up Firebase Functions

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize functions
firebase init functions
```

Select:
- JavaScript
- Install dependencies: Yes

### 2. Install OpenAI

```bash
cd functions
npm install openai
```

### 3. Copy Example Code

Copy contents from `firebase-functions-example.js` to `functions/index.js`

### 4. Set OpenAI API Key

```bash
firebase functions:config:set openai.key="sk-your-openai-key"
```

### 5. Deploy Functions

```bash
firebase deploy --only functions
```

---

## 🎯 What's Next?

- **Customize scenarios**: Edit `src/constants/scenarios.js`
- **Modify rubrics**: Edit `src/constants/rubrics.js`
- **Adjust styling**: Edit `src/App.css`
- **Add features**: Check `README.md` for architecture

---

## 🐛 Troubleshooting

### "Firebase not initialized"
- Check your `.env.local` file
- Restart dev server after creating `.env.local`

### "Permission denied" in Firestore
- Update Firestore rules (see Step 4)
- Make sure you're signed in

### Mock AI responses only
- This is expected for development
- See "Enabling Full AI" section above

### Build errors
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check Node version (should be 16+)

---

## 📝 Development Mode Notes

The app works in development mode with:
- ✅ Authentication (Firebase Auth)
- ✅ Database storage (Firestore)
- ✅ File uploads (Firebase Storage)
- ✅ Mock AI responses (built-in)
- ❌ Real AI evaluation (requires Functions)

Mock AI provides realistic responses based on turn count and scenario context.

---

**Need help?** Check the full [README.md](README.md) or create an issue on GitHub!

