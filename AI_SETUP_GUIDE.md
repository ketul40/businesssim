# AI Setup Guide for BusinessSim

This guide will help you set up the AI-powered stakeholder responses using OpenAI and Firebase Functions.

## Prerequisites

1. An OpenAI API account ([sign up here](https://platform.openai.com/signup))
2. Firebase project set up (already configured in your app)
3. Node.js installed on your machine

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name (e.g., "BusinessSim")
4. Copy the key (it starts with `sk-...`)
5. **Save it somewhere safe** - you won't be able to see it again!

## Step 2: Configure Firebase Functions

### Option A: Using Environment Variable (Recommended for Development)

1. Navigate to the functions directory:
```bash
cd functions
```

2. Create a `.env` file:
```bash
# On Windows (PowerShell)
New-Item -Path .env -ItemType File

# Or just create it manually in the functions folder
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

4. Make sure `.env` is in your `.gitignore` (it should be already)

### Option B: Using Firebase Config (For Production)

```bash
firebase functions:config:set openai.key="sk-your-actual-api-key-here"
```

## Step 3: Install Dependencies

Make sure you're in the `functions` directory:

```bash
cd functions
npm install
```

This will install:
- `firebase-functions`
- `firebase-admin`
- `openai`

## Step 4: Test Locally (Optional but Recommended)

1. Install Firebase emulator:
```bash
npm install -g firebase-tools
firebase init emulators
```

2. Start the emulator:
```bash
firebase emulators:start
```

3. Your functions will run locally at `http://localhost:5001`

## Step 5: Deploy to Firebase

From your project root directory:

```bash
firebase deploy --only functions
```

This will deploy all three functions:
- `simulateStakeholder` - Generates AI responses during conversations
- `getCoachingHint` - Provides coaching hints when user pauses
- `evaluateSession` - Evaluates performance and provides detailed feedback

## Step 6: Verify It's Working

1. Start your app:
```bash
npm run dev
```

2. Try a scenario as a guest (no login required!)
3. The AI stakeholder should respond naturally to your messages
4. Check the console for any error messages

## Troubleshooting

### "OpenAI API key not configured" error

- Make sure you've set the API key in either `.env` or Firebase config
- Redeploy the functions: `firebase deploy --only functions`

### Functions are timing out

- Check your Firebase plan - free tier has limitations
- Consider upgrading to Blaze (pay-as-you-go) plan

### Still getting mock responses

- Check browser console for errors
- Make sure functions are deployed: `firebase functions:list`
- Verify your Firebase project ID in `.firebaserc`

### Authentication errors (should be fixed now)

- We've updated the functions to allow guest users
- If you still get auth errors, redeploy: `firebase deploy --only functions`

## Cost Estimates

Using OpenAI with these settings:

**Per Simulation (10 turns):**
- Stakeholder responses: ~$0.003 (using gpt-4o-mini)
- Coaching hint: ~$0.0003
- Evaluation: ~$0.02 (using gpt-4o)
- **Total per session: ~$0.025**

**Monthly estimates:**
- 100 sessions/month: ~$2.50
- 500 sessions/month: ~$12.50
- 1000 sessions/month: ~$25

*These are rough estimates. Actual costs may vary based on conversation length.*

## AI Model Configuration

The functions use different models for different purposes:

- **Stakeholder responses**: `gpt-4o-mini` - Fast, cost-effective, natural conversations
- **Coaching hints**: `gpt-4o-mini` - Quick, helpful tips
- **Evaluations**: `gpt-4o` - More detailed, thorough analysis

You can adjust these in `functions/index.js` if needed.

## What the AI Does

### Stakeholder Responses
The AI creates a realistic character with:
- A defined personality based on the scenario
- Background and communication style
- Specific concerns and motivations
- Natural reactions to what you say
- Memory of the conversation

### Evaluation
The AI provides:
- Scores for each criterion in the rubric
- Evidence from your conversation
- Key moments that mattered
- Missed opportunities with specific advice
- Practice drills tailored to your gaps
- Reflection prompts

## Next Steps

1. Monitor your OpenAI usage in the [OpenAI dashboard](https://platform.openai.com/usage)
2. Set up usage limits if needed
3. Consider adding rate limiting for production use
4. Test different scenarios to see the AI in action!

## Support

If you run into issues:
1. Check the Firebase Functions logs: `firebase functions:log`
2. Check browser console for client-side errors
3. Verify your OpenAI API key is valid
4. Make sure you have billing enabled on OpenAI (required for API access)

---

**Ready to test?** Just run `npm run dev` and try a scenario! The AI will respond naturally to your messages.

