#!/bin/bash

# Deployment Script for Human-Like AI Responses Feature
# This script commits changes to git and deploys to Firebase

echo "=== BusinessSim Deployment Script ==="
echo ""

# Step 1: Check git status
echo "Step 1: Checking git status..."
git status
echo ""

# Step 2: Add all changes
echo "Step 2: Adding all changes to git..."
git add .
echo ""

# Step 3: Commit changes
echo "Step 3: Committing changes..."
git commit -m "feat: Enhanced AI responses with human-like conversation patterns

- Implemented PersonalityEngine for personality-specific language patterns
- Added EmotionalStateTracker for dynamic emotional state progression
- Created ContextAnalyzer for conversation memory and context awareness
- Built ConversationalPatterns library with natural speech elements
- Enhanced buildSimulationPrompt with all components integrated
- Optimized OpenAI parameters (temp: 1.0, penalties: 0.3)
- Added comprehensive error handling and fallbacks
- Created deployment documentation and validation tools

This enhancement makes AI stakeholder responses more natural, emotionally
authentic, and contextually aware, significantly improving the simulation
experience.

Closes: Task 11 - Deploy and validate
Spec: human-like-ai-responses"
echo ""

# Step 4: Push to main
echo "Step 4: Pushing to main branch..."
git push origin main
echo ""

# Step 5: Deploy Firebase Functions
echo "Step 5: Deploying Firebase Functions..."
firebase deploy --only functions
echo ""

# Step 6: Deploy Firebase Hosting (optional)
read -p "Do you want to deploy hosting as well? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Step 6: Building and deploying hosting..."
    npm run build
    firebase deploy --only hosting
    echo ""
fi

# Step 7: Validate deployment
echo "Step 7: Running validation script..."
cd functions
node validate-deployment.js
cd ..
echo ""

# Step 8: Check logs
echo "Step 8: Checking recent function logs..."
firebase functions:log --limit 20
echo ""

echo "=== Deployment Complete ==="
echo ""
echo "Next steps:"
echo "1. Test the application with a real scenario"
echo "2. Monitor Firebase Functions logs for any errors"
echo "3. Verify response quality improvements"
echo "4. Check the validation checklist: DEPLOYMENT_VALIDATION_CHECKLIST.md"
echo ""
