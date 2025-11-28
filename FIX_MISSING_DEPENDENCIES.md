# Fix: Missing firebase-functions Package

## Problem
Firebase deployment is failing because `node_modules` are not installed in the functions directories.

## Quick Fix - Run This Script

```cmd
install-and-deploy.bat
```

This will:
1. Install dependencies in `functions/` directory
2. Install dependencies in `ai-functions/` directory  
3. Deploy to Firebase

## Or Manual Fix

If you prefer to run commands manually:

```bash
# 1. Go back to project root (if you're in functions directory)
cd ..

# 2. Install dependencies in functions directory
cd functions
npm install
cd ..

# 3. Install dependencies in ai-functions directory
cd ai-functions
npm install
cd ..

# 4. Now deploy
firebase deploy --only functions
```

## Why This Happened

The `node_modules` folders were not committed to git (which is correct), but they need to be installed locally before deployment. Firebase needs these dependencies to:
- Analyze your code
- Determine which functions to deploy
- Package everything correctly

## What Gets Installed

In `functions/` directory:
- firebase-functions (required)
- firebase-admin (required)
- openai (required)
- dotenv (required)
- eslint, jest, fast-check (dev dependencies)

In `ai-functions/` directory:
- firebase-functions (required)
- firebase-admin (required)
- Any other dependencies listed in its package.json

## After Installation

Once dependencies are installed, deployment should work:

```bash
firebase deploy --only functions
```

You'll see:
```
✔  functions: Finished running predeploy script.
i  functions: uploading functions...
✔  functions: functions folder uploaded successfully
✔  functions[simulateStakeholder]: Successful update operation.
...
✔  Deploy complete!
```

## One-Time Setup

You only need to run `npm install` once. After that, you can deploy anytime with:

```bash
firebase deploy --only functions
```

Unless you add new dependencies to package.json, you won't need to run `npm install` again.
