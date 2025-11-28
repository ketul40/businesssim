/**
 * Firebase Functions for BusinessSim
 *
 * This is an example implementation of the Firebase Cloud Functions
 * needed for AI simulation and evaluation.
 *
 * Setup:
 * 1. Initialize Firebase Functions: firebase init functions
 * 2. Install OpenAI: npm install openai
 * 3. Set OpenAI API key: firebase functions:config:set openai.key="YOUR_KEY"
 * 4. Copy this code to functions/index.js
 * 5. Deploy: firebase deploy --only functions
 */

/* eslint-disable max-len */

require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const {PersonalityEngine} = require("./personalityEngine");
const {EmotionalStateTracker} = require("./emotionalStateTracker");
const {ContextAnalyzer} = require("./contextAnalyzer");
const ConversationalPatterns = require("./conversationalPatterns");

admin.initializeApp();

/**
 * Get OpenAI instance
 * @return {OpenAI} OpenAI instance
 */
function getOpenAI() {
  // Try multiple sources for the API key
  const apiKey = process.env.OPENAI_API_KEY ||
                 functions.config()?.openai?.key;

  if (!apiKey) {
    console.error("OpenAI API key not found in environment or config");
    console.error("process.env.OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "EXISTS" : "NOT SET");
    console.error("functions.config().openai?.key:", functions.config()?.openai?.key ? "EXISTS" : "NOT SET");
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  console.log("OpenAI API key found, initializing...");
  return new OpenAI({
    apiKey: apiKey,
  });
}

/**
 * Simulate stakeholder response during role-play
 */
exports.simulateStakeholder = functions.https.onCall(async (request) => {
  // Allow both authenticated and guest users
  // Guest users can use the simulation but won't have data saved

  // Gen 2 functions receive data differently
  const data = request.data || request;

  console.log("Raw request received:", typeof request, Object.keys(request));
  console.log("Data extracted:", typeof data, data ? Object.keys(data) : "null");

  const {scenario, transcript, userMessage} = data;

  // Debug logging
  console.log("Received data:", {
    hasScenario: !!scenario,
    scenarioKeys: scenario ? Object.keys(scenario) : "N/A",
    hasTranscript: !!transcript,
    hasUserMessage: !!userMessage,
  });

  if (!scenario) {
    console.error("Scenario is missing from request data");
    throw new functions.https.HttpsError("invalid-argument", "Scenario data is required");
  }

  if (!scenario.stakeholders || scenario.stakeholders.length === 0) {
    console.error("Scenario is missing stakeholders:", scenario);
    throw new functions.https.HttpsError("invalid-argument", "Scenario must have at least one stakeholder");
  }

  try {
    // Build the enhanced system prompt with transcript context
    const systemPrompt = buildSimulationPrompt(scenario, transcript);

    // Build conversation history
    const messages = [
      {role: "system", content: systemPrompt},
      ...transcript.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      {role: "user", content: userMessage},
    ];

    // Call OpenAI with enhanced parameters
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective and fast
      messages: messages,
      max_tokens: 300, // Increased for natural flow
      temperature: 1.0, // Increased for more variation
      presence_penalty: 0.3, // Discourage repetition
      frequency_penalty: 0.3, // Encourage varied vocabulary
    });

    const response = completion.choices[0].message.content;
    const stakeholder = scenario.stakeholders[0];

    return {
      message: response,
      stakeholder: stakeholder.name,
      role: stakeholder.role,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in simulateStakeholder:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate response");
  }
});

/**
 * Get coaching hint during timeout
 */
exports.getCoachingHint = functions.https.onCall(async (request) => {
  // Allow both authenticated and guest users

  const data = request.data || request;
  const {scenario, transcript} = data;

  try {
    // eslint-disable-next-line max-len
    const prompt = `You are a business communication coach. Based on this conversation transcript in a "${scenario.title}" scenario, provide ONE specific, actionable coaching hint (2-3 sentences max) to help the user improve their next response.

Transcript:
${transcript.map((msg) => `${msg.type}: ${msg.content}`).join("\n")}

Coaching hint:`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{role: "user", content: prompt}],
      max_tokens: 120,
      temperature: 0.7,
    });

    return {
      hint: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("Error in getCoachingHint:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate hint");
  }
});

/**
 * Get AI-powered conversation suggestions
 */
exports.getSuggestions = functions.https.onCall(async (request) => {
  // Allow both authenticated and guest users

  const data = request.data || request;
  const {scenario, transcript} = data;

  try {
    const stakeholder = scenario.stakeholders[0];

    // Build context-aware prompt for suggestions
    // eslint-disable-next-line max-len
    const prompt = `You are a business communication coach helping someone navigate a conversation with ${stakeholder.name}, ${stakeholder.role}.

Scenario: ${scenario.title}
Situation: ${scenario.situation}
User's Objective: ${scenario.objective}

Stakeholder's concerns: ${stakeholder.concerns.join(", ")}
Stakeholder's motivations: ${stakeholder.motivations.join(", ")}

Conversation so far:
${transcript.map((msg) => `${msg.type === "user" ? "User" : stakeholder.name}: ${msg.content}`).join("\n")}

Based on this conversation, provide 3 short, effective response options the user could say next. Each suggestion should:
- Be 1-2 sentences max
- Address the stakeholder's concerns or build on the conversation
- Demonstrate good communication practices
- Be natural and conversational
- Help move toward the user's objective

Return ONLY a JSON array with 3 suggestions, no other text:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{role: "user", content: prompt}],
      max_tokens: 250,
      temperature: 0.8,
    });

    const responseText = completion.choices[0].message.content;

    // Try to parse JSON response
    try {
      const suggestions = JSON.parse(responseText);
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return {suggestions: suggestions.slice(0, 3)};
      }
    } catch (parseError) {
      console.warn("Could not parse suggestions as JSON, extracting manually");
    }

    // Fallback: extract suggestions from text
    const lines = responseText.split("\n").filter((line) => line.trim());
    const suggestions = lines
        .map((line) => line.replace(/^[\d.\-*[\]"\s]+/, "").replace(/["]+$/, "").trim())
        .filter((s) => s.length > 10)
        .slice(0, 3);

    if (suggestions.length === 0) {
      throw new Error("No valid suggestions extracted");
    }

    return {suggestions};
  } catch (error) {
    console.error("Error in getSuggestions:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate suggestions");
  }
});

/**
 * Evaluate session and provide detailed feedback
 */
exports.evaluateSession = functions.https.onCall(async (request) => {
  // Allow both authenticated and guest users

  const data = request.data || request;
  // eslint-disable-next-line no-unused-vars
  const context = request; // Used for auth checking in Firestore write

  const {sessionId, scenario, transcript, rubricId} = data;

  try {
    // Get rubric from Firestore
    const rubricDoc = await admin.firestore()
        .collection("rubrics")
        .doc(rubricId)
        .get();

    const rubric = rubricDoc.exists ? rubricDoc.data() : getDefaultRubric(rubricId);

    // Build evaluation prompt
    const evaluationPrompt = buildEvaluationPrompt(scenario, transcript, rubric);

    // Call OpenAI for evaluation
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Use stronger model for evaluation
      messages: [
        {role: "system", content: "You are an expert evaluator of business communication. Provide detailed, actionable feedback."},
        {role: "user", content: evaluationPrompt},
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    const evaluationText = completion.choices[0].message.content;
    const evaluation = parseEvaluation(evaluationText, rubric);

    // Store evaluation in Firestore only for authenticated users
    if (context.auth && sessionId) {
      const evaluationRef = await admin.firestore()
          .collection("evaluations")
          .add({
            sessionId,
            userId: context.auth.uid,
            rubricId,
            ...evaluation,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

      // Update session with evaluation ID
      await admin.firestore()
          .collection("sessions")
          .doc(sessionId)
          .update({
            evaluationId: evaluationRef.id,
            state: "EVALUATED",
          });
    }

    return evaluation;
  } catch (error) {
    console.error("Error in evaluateSession:", error);
    throw new functions.https.HttpsError("internal", "Failed to evaluate session");
  }
});

/**
 * Helper: Build enhanced simulation system prompt with personality, emotional state, and context
 * @param {object} scenario - The scenario configuration
 * @param {Array} transcript - Conversation history (optional)
 * @return {string} Enhanced system prompt for OpenAI
 */
function buildSimulationPrompt(scenario, transcript = []) {
  const stakeholder = scenario.stakeholders[0];

  // Initialize enhancement components with error handling
  let personalityEngine = null;
  let emotionalStateTracker = null;
  let contextAnalyzer = null;
  let personalityInstructions = "";
  let emotionalStateInstructions = "";
  let contextReferences = "";
  let examplePhrases = "";

  // Track enhancement failures for logging
  const enhancementFailures = [];

  try {
    // Initialize PersonalityEngine
    personalityEngine = new PersonalityEngine(stakeholder);
    personalityInstructions = personalityEngine.getLanguageInstructions();
    examplePhrases = personalityEngine.getSamplePhrases();
    console.log("PersonalityEngine initialized successfully");
  } catch (error) {
    console.error("PersonalityEngine initialization failed:", {
      error: error.message,
      stack: error.stack,
      stakeholder: stakeholder?.name,
      personality: stakeholder?.personality,
    });
    enhancementFailures.push("PersonalityEngine");
    // Fallback to balanced personality
    personalityInstructions = "Use a balanced, professional communication style.";
    examplePhrases = "";
  }

  try {
    // Initialize EmotionalStateTracker
    emotionalStateTracker = new EmotionalStateTracker(stakeholder, scenario);
    if (transcript && transcript.length > 0) {
      emotionalStateTracker.analyzeTranscript(transcript);
    }
    emotionalStateInstructions = emotionalStateTracker.getStateInstructions();
    console.log("EmotionalStateTracker initialized successfully");
  } catch (error) {
    console.error("EmotionalStateTracker initialization failed:", {
      error: error.message,
      stack: error.stack,
      stakeholder: stakeholder?.name,
      transcriptLength: transcript?.length || 0,
    });
    enhancementFailures.push("EmotionalStateTracker");
    // Fallback to neutral state
    emotionalStateInstructions = "Maintain a neutral, professional demeanor.";
  }

  try {
    // Initialize ContextAnalyzer
    if (transcript && transcript.length > 0) {
      contextAnalyzer = new ContextAnalyzer(transcript);
      const referencablePoints = contextAnalyzer.getReferencablePoints();
      if (referencablePoints.length > 0) {
        contextReferences = "\n\nKEY POINTS FROM CONVERSATION TO REFERENCE NATURALLY:\n" +
          referencablePoints.map((point) => `• ${point.content}`).join("\n");
      }
      console.log("ContextAnalyzer initialized successfully");
    }
  } catch (error) {
    console.error("ContextAnalyzer initialization failed:", {
      error: error.message,
      stack: error.stack,
      transcriptLength: transcript?.length || 0,
    });
    enhancementFailures.push("ContextAnalyzer");
    // Graceful degradation - continue without context references
    contextReferences = "";
  }

  // Get conversational patterns for examples with error handling
  let openingExamples = [];
  let thinkingExamples = [];
  let acknowledgmentExamples = [];

  try {
    openingExamples = ConversationalPatterns.getRandomPattern("openingPhrases", "neutral", 3);
    thinkingExamples = ConversationalPatterns.getRandomPattern("thinkingMarkers", "neutral", 3);
    acknowledgmentExamples = ConversationalPatterns.getRandomPattern("acknowledgments", "neutral", 3);
    console.log("ConversationalPatterns loaded successfully");
  } catch (error) {
    console.error("ConversationalPatterns loading failed:", {
      error: error.message,
      stack: error.stack,
    });
    enhancementFailures.push("ConversationalPatterns");
    // Fallback to basic examples
    openingExamples = ["Look,", "Here's the thing,", "You know,"];
    thinkingExamples = ["Hmm,", "Let me think about that...", "Okay, so..."];
    acknowledgmentExamples = ["I see what you're saying", "Fair point", "That makes sense"];
  }

  // Log overall enhancement status
  if (enhancementFailures.length > 0) {
    console.warn("Some enhancements failed but conversation will continue:", {
      failures: enhancementFailures,
      scenario: scenario?.title,
      stakeholder: stakeholder?.name,
    });
  } else {
    console.log("All enhancements initialized successfully");
  }

  return `You are roleplaying as ${stakeholder.name}, ${stakeholder.role} at a tech company.

ABOUT YOU:
• Personality: ${stakeholder.personality}
• Background: You've been in this role for 3 years and are experienced in your domain
• Communication style: ${personalityInstructions}
• Current emotional state: ${emotionalStateInstructions}

YOUR PRIORITIES & CONCERNS:
Concerns: ${stakeholder.concerns.join(", ")}
Motivations: ${stakeholder.motivations.join(", ")}

TODAY'S MEETING:
Context: ${scenario.situation}
Your objective: ${scenario.objective || "Understand if this proposal is worth pursuing"}

CURRENT CONSTRAINTS YOU'RE MANAGING:
${scenario.constraints.map((c) => `• ${c}`).join("\n")}
${contextReferences}

HOW TO RESPOND NATURALLY (CRITICAL - READ CAREFULLY):

1. LENGTH & STRUCTURE:
   • Keep responses 1-4 sentences (vary the length unpredictably)
   • Mix short punchy sentences with longer flowing ones
   • Don't always use complete sentences - real people trail off sometimes
   • Occasionally add a quick reaction before your main point

2. USE CONTRACTIONS & INFORMAL LANGUAGE:
   • Always use: "I'm" not "I am", "you're" not "you are", "that's" not "that is"
   • Say "I don't know" not "I am uncertain"
   • Say "What's your take?" not "What is your perspective?"
   • Use workplace phrases like: "on the same page", "move the needle", "circle back"

3. ADD NATURAL SPEECH PATTERNS:
   • Start responses with: ${openingExamples.join(", ")}
   • Show thinking with: ${thinkingExamples.join(", ")}
   • Acknowledge points with: ${acknowledgmentExamples.join(", ")}
   • Use hedges when uncertain: "maybe", "possibly", "I'm not entirely sure"
   • Show emotion through tone: skepticism, curiosity, concern, interest

4. VARY YOUR RESPONSES:
   • Never repeat the same opening phrase twice in a row
   • Don't use formulaic patterns like "I appreciate X, but Y"
   • Change how you express similar ideas across the conversation
   • Sometimes be direct, sometimes more exploratory

5. REFERENCE CONTEXT NATURALLY:
   • If the user made a commitment earlier, reference it: "Going back to what you said about..."
   • If you notice a contradiction, call it out: "Wait, earlier you mentioned..."
   • Build on previous points rather than treating each turn as isolated
   • Track whether your concerns are being addressed

6. SHOW REALISTIC WORKPLACE BEHAVIOR:
   • Mention time constraints: "I've got another meeting in 10 minutes"
   • Reference realistic processes: "I'd need to run this by the team"
   • Bring up practical concerns: "What's the timeline?" "Do we have budget?"
   • Include plausible background details when relevant

7. EMOTIONAL AUTHENTICITY:
   • If the user is vague, show frustration or skepticism
   • If they make a strong point, acknowledge it genuinely
   • Warm up gradually if they address your concerns well
   • Don't hide your reactions - let them show through your words
${examplePhrases}

WHAT NOT TO DO:
• Don't list all your concerns at once - surface them organically
• Don't be overly formal or robotic
• Don't use phrases like "I would like to inquire" - too stiff
• Don't always start with the same pattern
• Don't provide coaching or break character
• Don't ignore what was said before
• Don't be artificially positive - be realistic

EXAMPLES OF NATURAL RESPONSES:

User: "I think we should expand to the European market."
Bad: "I appreciate your suggestion. However, I have concerns about the European market expansion."
Good: "Hmm, Europe's interesting but... what's driving that? We've got our hands full with the US market right now."

User: "We could start with just Germany and France."
Bad: "That is a more focused approach. What is your timeline for this expansion?"
Good: "Okay, that's more manageable. Walk me through the timeline - when would we actually launch?"

User: "I'm thinking Q3 next year."
Bad: "I see. That timeline seems reasonable given our current constraints."
Good: "Q3... that gives us some breathing room. But I'm still not clear on the budget side of this."

Stay fully in character as ${stakeholder.name}. Respond naturally to what the user just said, using contractions, varied structure, and authentic workplace language:`;
}

/**
 * Helper: Build evaluation prompt
 * @param {object} scenario - The scenario configuration
 * @param {Array} transcript - Conversation transcript
 * @param {object} rubric - Evaluation rubric
 * @return {string} Evaluation prompt for OpenAI
 */
function buildEvaluationPrompt(scenario, transcript, rubric) {
  return `Evaluate this business simulation conversation using the provided rubric.

Scenario: ${scenario.title}

Transcript:
${transcript.map((msg, i) => `Turn ${i + 1} (${msg.type}): ${msg.content}`).join("\n\n")}

Rubric Criteria:
${rubric.criteria.map((c) => `
${c.name} (${Math.round(c.weight * 100)}%):
${c.description}
- Score 1: ${c.anchors[1]}
- Score 3: ${c.anchors[3]}
- Score 5: ${c.anchors[5]}
`).join("\n")}

Provide evaluation in JSON format:
{
  "overall_score": 0-100,
  "criterion_scores": [
    {
      "criterion": "name",
      "weight": 0.XX,
      "score": 1-5,
      "evidence": ["specific quote or observation"]
    }
  ],
  "moments_that_mattered": [
    {
      "turn": N,
      "description": "what happened",
      "why": "why it mattered"
    }
  ],
  "missed_opportunities": [
    {
      "criterion": "name",
      "what": "what was missing",
      "how_to_improve": "specific advice"
    }
  ],
  "drills": [
    {
      "title": "Exercise name",
      "instructions": "specific practice task",
      "estimated_minutes": 10
    }
  ],
  "reflection_prompt": "one powerful question"
}`;
}

/**
 * Helper: Parse evaluation response
 * @param {string} text - OpenAI response text
 * @param {object} rubric - Evaluation rubric
 * @return {object} Parsed evaluation object
 */
function parseEvaluation(text, rubric) {
  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[0]);
      return evaluation;
    }
  } catch (error) {
    console.error("Error parsing evaluation:", error);
  }

  // Fallback to default structure
  return {
    overall_score: 70,
    criterion_scores: rubric.criteria.map((c) => ({
      criterion: c.name,
      weight: c.weight,
      score: 3,
      evidence: ["Evaluation could not be fully parsed"],
    })),
    moments_that_mattered: [],
    missed_opportunities: [],
    drills: [],
    reflection_prompt: "What could you have done differently?",
  };
}

/**
 * Helper: Get default rubric structure
 * @param {string} rubricId - The rubric ID
 * @return {object} Default rubric structure
 */
function getDefaultRubric(rubricId) {
  // Return default rubric structure
  // In production, this would be stored in Firestore
  return {
    id: rubricId,
    criteria: [
      {
        name: "Overall Performance",
        weight: 1.0,
        description: "General assessment",
        anchors: {1: "Poor", 3: "Average", 5: "Excellent"},
      },
    ],
  };
}

/**
 * Trigger: Update user analytics when session completes
 * TODO: Migrate to v2 API syntax
 */
/* exports.onSessionComplete = functions.firestore
    .document("sessions/{sessionId}")
    .onUpdate(async (change, context) => {
      const after = change.after.data();
      const before = change.before.data();

      // Check if session just completed
      if (after.state === "EVALUATED" && before.state !== "EVALUATED") {
        const userId = after.userId;

        // Get user's sessions
        const sessionsSnapshot = await admin.firestore()
            .collection("sessions")
            .where("userId", "==", userId)
            .where("state", "==", "EVALUATED")
            .get();

        // Calculate stats
        let totalScore = 0;
        let count = 0;

        for (const doc of sessionsSnapshot.docs) {
          const session = doc.data();
          if (session.evaluation && session.evaluation.overall_score) {
            totalScore += session.evaluation.overall_score;
            count++;
          }
        }

        const averageScore = count > 0 ? Math.round(totalScore / count) : 0;

        // Update user document
        await admin.firestore()
            .collection("users")
            .doc(userId)
            .update({
              totalSessions: count,
              averageScore: averageScore,
              lastSessionAt: admin.firestore.FieldValue.serverTimestamp(),
            });
      }
    }); */

