// AI Service - handles simulation and evaluation via Firebase Functions or API
// In production, this would call Firebase Functions that use OpenAI API
// For now, includes mock implementation for development

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

// Firebase Functions endpoints
const simulateStakeholderFn = httpsCallable(functions, 'simulateStakeholder');
const evaluateSessionFn = httpsCallable(functions, 'evaluateSession');
const getCoachingHintFn = httpsCallable(functions, 'getCoachingHint');

// Simulate stakeholder response
export const getStakeholderResponse = async (sessionData, userMessage) => {
  try {
    // Call Firebase Function
    const result = await simulateStakeholderFn({
      scenario: sessionData.scenario,
      transcript: sessionData.transcript,
      userMessage: userMessage,
      turnCount: sessionData.turnCount
    });
    return result.data;
  } catch (error) {
    console.error('Error getting stakeholder response:', error);
    // Fallback to mock for development
    return getMockStakeholderResponse(sessionData, userMessage);
  }
};

// Get coaching hint during timeout
export const getCoachingHint = async (sessionData) => {
  try {
    const result = await getCoachingHintFn({
      scenario: sessionData.scenario,
      transcript: sessionData.transcript,
      turnCount: sessionData.turnCount
    });
    return result.data.hint;
  } catch (error) {
    console.error('Error getting coaching hint:', error);
    return getMockCoachingHint(sessionData);
  }
};

// Evaluate session performance
export const evaluateSession = async (sessionId, sessionData) => {
  try {
    const result = await evaluateSessionFn({
      sessionId: sessionId,
      scenario: sessionData.scenario,
      transcript: sessionData.transcript,
      rubricId: sessionData.scenario.rubricId
    });
    return result.data;
  } catch (error) {
    console.error('Error evaluating session:', error);
    return getMockEvaluation(sessionData);
  }
};

// ==================== MOCK IMPLEMENTATIONS FOR DEVELOPMENT ====================

function getMockStakeholderResponse(sessionData, userMessage) {
  const stakeholder = sessionData.scenario.stakeholders[0];
  const turnCount = sessionData.turnCount || 0;
  
  // Generate contextual responses based on turn count and content
  const responses = [
    `I appreciate you bringing this to me. I'm concerned about the $200k investment given our current budget constraints. Can you walk me through the expected ROI?`,
    `That's interesting, but I need more concrete numbers. What's your baseline metric, and what improvement are you projecting?`,
    `I hear what you're saying about the opportunity, but my team is already stretched thin at 85% capacity. How do you plan to staff this without impacting our Q4 commitments?`,
    `The timeline seems aggressive. We have a board review in 8 weeks. What are the key milestones, and what happens if we hit roadblocks?`,
    `What about the risks? I need to understand what could go wrong and how you'd mitigate that before I can sign off.`,
    `The sales team also has competing priorities for these resources. Why should your initiative take precedence?`,
    `Let me challenge you on that assumption. What if the market doesn't respond as you expect? Do you have a kill criterion or a Plan B?`,
    `I'm starting to see the value here, but I need this summarized: What exactly are you asking for, what's the success metric, and when do we review progress?`
  ];
  
  const responseIndex = Math.min(turnCount, responses.length - 1);
  return {
    message: responses[responseIndex],
    stakeholder: stakeholder.name,
    role: stakeholder.role,
    timestamp: new Date().toISOString()
  };
}

function getMockCoachingHint(sessionData) {
  const hints = [
    "Try leading with a shared goal that aligns with the director's priorities, like hitting Q4 targets.",
    "Use specific numbers: baseline metric → projected delta → payback period. Avoid vague claims.",
    "Acknowledge the concern directly, then offer a concrete mitigation with an owner and checkpoint.",
    "Keep your response concise—aim for 2-3 sentences. Directors value brevity.",
    "Present 2-3 options instead of one solution. Show you've thought through trade-offs.",
    "Identify a kill criterion: 'If we don't see X by week 3, we stop.' This reduces perceived risk."
  ];
  
  const randomHint = hints[Math.floor(Math.random() * hints.length)];
  return randomHint;
}

function getMockEvaluation(sessionData) {
  // Generate semi-realistic scores based on transcript length and quality indicators
  const transcript = sessionData.transcript || [];
  const hasMetrics = transcript.some(msg => 
    msg.content.toLowerCase().includes('roi') || 
    msg.content.toLowerCase().includes('%') ||
    msg.content.toLowerCase().includes('$')
  );
  const hasRisk = transcript.some(msg => 
    msg.content.toLowerCase().includes('risk') || 
    msg.content.toLowerCase().includes('mitigation')
  );
  const hasPlan = transcript.some(msg => 
    msg.content.toLowerCase().includes('week') || 
    msg.content.toLowerCase().includes('milestone')
  );
  
  const criterionScores = [
    {
      criterion: 'Framing & Stakeholder Alignment',
      weight: 0.20,
      score: transcript.length > 2 ? 4 : 3,
      evidence: ['User opened with context about Q4 targets', 'Acknowledged budget constraints']
    },
    {
      criterion: 'Evidence & ROI',
      weight: 0.25,
      score: hasMetrics ? 4 : 2,
      evidence: hasMetrics ? ['Provided baseline metrics', 'Discussed ROI calculations'] : ['Metrics were vague or missing']
    },
    {
      criterion: 'Risk & Mitigation',
      weight: 0.20,
      score: hasRisk ? 4 : 2,
      evidence: hasRisk ? ['Identified key risks', 'Proposed mitigation strategies'] : ['Risk discussion was limited']
    },
    {
      criterion: 'Objection Handling',
      weight: 0.15,
      score: 3,
      evidence: ['Responded to concerns', 'Could be more concise']
    },
    {
      criterion: 'Ask & Next Steps',
      weight: 0.20,
      score: hasPlan ? 4 : 2,
      evidence: hasPlan ? ['Clear timeline proposed', 'Specific milestones mentioned'] : ['Next steps could be more specific']
    }
  ];
  
  // Calculate weighted score
  const overallScore = Math.round(
    criterionScores.reduce((sum, c) => sum + (c.weight * ((c.score / 5) * 100)), 0)
  );
  
  return {
    overall_score: overallScore,
    criterion_scores: criterionScores,
    moments_that_mattered: [
      {
        turn: 2,
        description: 'Strong opening with alignment',
        why: 'You connected your ask to the director\'s Q4 priorities, which showed strategic thinking.'
      },
      {
        turn: 5,
        description: 'Missed opportunity for specificity',
        why: 'When asked about ROI, you could have provided exact baseline → delta numbers.'
      }
    ],
    missed_opportunities: [
      {
        criterion: 'Evidence & ROI',
        what: 'Specific ROI calculation with sensitivity analysis',
        how_to_improve: 'Prepare exact numbers: "Current CAC is $X, we project Y% reduction, ROI in Z months."'
      },
      {
        criterion: 'Risk & Mitigation',
        what: 'Kill criteria for the pilot',
        how_to_improve: 'Define clear exit conditions: "If we don\'t see X metric by week 3, we halt the project."'
      }
    ],
    drills: [
      {
        title: 'ROI Rehearsal',
        instructions: 'Rewrite your core ask with explicit baseline → delta → payback in ≤90 seconds.',
        estimated_minutes: 10
      },
      {
        title: 'Risk Mitigation Reps',
        instructions: 'List top 3 risks for any initiative, each with mitigation + kill criteria in one line.',
        estimated_minutes: 15
      },
      {
        title: 'Concise Ask Practice',
        instructions: 'Practice stating your ask in exactly 3 bullets: What, Success metric, Review date.',
        estimated_minutes: 10
      }
    ],
    reflection_prompt: 'What assumptions did you make about the director\'s priorities that you didn\'t explicitly verify?'
  };
}

