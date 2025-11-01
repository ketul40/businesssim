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

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();

/**
 * Get OpenAI instance
 * @return {OpenAI} OpenAI instance
 */
function getOpenAI() {
  return new OpenAI({
    apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY,
  });
}

/**
 * Simulate stakeholder response during role-play
 */
exports.simulateStakeholder = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to use this function",
    );
  }

  const {scenario, transcript, userMessage} = data;

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
      model: "gpt-4",
      messages: messages,
      max_tokens: 200,
      temperature: 0.8,
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
exports.getCoachingHint = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }

  const {scenario, transcript} = data;

  try {
    // eslint-disable-next-line max-len
    const prompt = `You are a business communication coach. Based on this conversation transcript in a "${scenario.title}" scenario, provide ONE specific, actionable coaching hint (2-3 sentences max) to help the user improve their next response.

Transcript:
${transcript.map((msg) => `${msg.type}: ${msg.content}`).join("\n")}

Coaching hint:`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      max_tokens: 100,
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
exports.evaluateSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }

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
      model: "gpt-4",
      messages: [
        {role: "system", content: "You are an expert evaluator of business communication."},
        {role: "user", content: evaluationPrompt},
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const evaluationText = completion.choices[0].message.content;
    const evaluation = parseEvaluation(evaluationText, rubric);

    // Store evaluation in Firestore
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

  return `You are a realistic workplace stakeholder simulator. Stay in character as ${stakeholder.name}, ${stakeholder.role}.

Personality: ${stakeholder.personality}

Key concerns: ${stakeholder.concerns.join(", ")}
Motivations: ${stakeholder.motivations.join(", ")}

Scenario: ${scenario.title}
Situation: ${scenario.situation}

Constraints:
${scenario.constraints.map((c) => `- ${c}`).join("\n")}

Rules:
1. Be concise (1-4 sentences per response)
2. Surface realistic objections based on your concerns
3. Adapt difficulty based on user performance
4. Stay in character - no feedback during simulation
5. Challenge assumptions and ask for specifics

Respond as ${stakeholder.name}:`;
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

