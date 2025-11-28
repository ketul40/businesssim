@echo off
REM Quick hotfix deployment script

echo === Deploying Hotfix ===
echo.

echo Committing fix...
git add functions/conversationalPatterns.js HOTFIX_CONVERSATIONAL_PATTERNS.md
git commit -m "fix: getRandomPattern now supports returning multiple patterns"
echo.

echo Pushing to main...
git push origin main
echo.

echo Deploying to Firebase...
firebase deploy --only functions
echo.

echo === Hotfix Deployed ===
echo.
echo Test the app now - AI responses should work!
echo.

pause
