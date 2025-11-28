@echo off
REM Install dependencies and deploy script

echo === Installing Dependencies ===
echo.

echo Installing dependencies in functions directory...
cd functions
call npm install
cd ..
echo.

echo Installing dependencies in ai-functions directory...
cd ai-functions
call npm install
cd ..
echo.

echo === Dependencies Installed ===
echo.

echo === Deploying to Firebase ===
echo.

firebase deploy --only functions

echo.
echo === Deployment Complete ===
echo.

pause
