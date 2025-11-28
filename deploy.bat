@echo off
REM Deployment Script for Human-Like AI Responses Feature
REM This script commits changes to git and deploys to Firebase

echo === BusinessSim Deployment Script ===
echo.

REM Step 1: Check git status
echo Step 1: Checking git status...
git status
echo.

REM Step 2: Add all changes
echo Step 2: Adding all changes to git...
git add .
echo.

REM Step 3: Commit changes
echo Step 3: Committing changes...
git commit -m "feat: Enhanced AI responses with human-like conversation patterns - Implemented PersonalityEngine for personality-specific language patterns - Added EmotionalStateTracker for dynamic emotional state progression - Created ContextAnalyzer for conversation memory and context awareness - Built ConversationalPatterns library with natural speech elements - Enhanced buildSimulationPrompt with all components integrated - Optimized OpenAI parameters (temp: 1.0, penalties: 0.3) - Added comprehensive error handling and fallbacks - Created deployment documentation and validation tools"
echo.

REM Step 4: Push to main
echo Step 4: Pushing to main branch...
git push origin main
echo.

REM Step 5: Deploy Firebase Functions
echo Step 5: Deploying Firebase Functions...
firebase deploy --only functions
echo.

REM Step 6: Deploy Firebase Hosting (optional)
set /p DEPLOY_HOSTING="Do you want to deploy hosting as well? (y/n): "
if /i "%DEPLOY_HOSTING%"=="y" (
    echo Step 6: Building and deploying hosting...
    call npm run build
    firebase deploy --only hosting
    echo.
)

REM Step 7: Validate deployment
echo Step 7: Running validation script...
cd functions
node validate-deployment.js
cd ..
echo.

REM Step 8: Check logs
echo Step 8: Checking recent function logs...
firebase functions:log --limit 20
echo.

echo === Deployment Complete ===
echo.
echo Next steps:
echo 1. Test the application with a real scenario
echo 2. Monitor Firebase Functions logs for any errors
echo 3. Verify response quality improvements
echo 4. Check the validation checklist: DEPLOYMENT_VALIDATION_CHECKLIST.md
echo.

pause
