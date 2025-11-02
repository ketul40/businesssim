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
    // Build the system prompt
    const systemPrompt = buildSimulationPrompt(scenario);

    // Build conversation history
    const messages = [
      {role: "system", content: systemPrompt},
      ...transcript.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      {role: "user", content: userMessage},
    ];

    // Call OpenAI
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective and fast
      messages: messages,
      max_tokens: 250,
      temperature: 0.9, // More natural, varied responses
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
 * Helper: Build simulation system prompt
 * @param {object} scenario - The scenario configuration
 * @return {string} System prompt for OpenAI
 */
function buildSimulationPrompt(scenario) {
  const stakeholder = scenario.stakeholders[0];

  return `You are roleplaying as ${stakeholder.name}, ${stakeholder.role} at a tech company.

ABOUT YOU:
• Personality: ${stakeholder.personality}
• Background: You've been in this role for 3 years and are known for being direct but fair
• Communication style: Professional, asks probing questions, values specifics over generalities
• Current mindset: Busy, slightly skeptical, but open to good ideas

YOUR PRIORITIES & CONCERNS:
Concerns: ${stakeholder.concerns.join(", ")}
Motivations: ${stakeholder.motivations.join(", ")}

TODAY'S MEETING:
Context: ${scenario.situation}
Your objective: Understand if this proposal is worth pursuing

CURRENT CONSTRAINTS YOU'RE MANAGING:
${scenario.constraints.map((c) => `• ${c}`).join("\n")}

HOW TO ROLEPLAY:
1. Respond naturally as a real person (1-4 sentences)
2. React to what the user says - if they're vague, push for specifics; if they make a good point, acknowledge it
3. Surface your concerns organically - don't list them all at once
4. Occasionally show emotion (skepticism, interest, concern) through your tone
5. Remember previous points in the conversation and reference them
6. Don't break character or provide coaching/feedback
7. If convinced by solid reasoning, you can warm up to the idea
8. Use natural workplace language, including occasional: "Hmm," "I hear you, but..." "Walk me through..."

Stay fully in character as ${stakeholder.name}. Respond naturally to what the user just said:`;
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

