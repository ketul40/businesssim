// AI Service - handles simulation and evaluation via Firebase Functions with OpenAI API

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

// Firebase Functions endpoints
const simulateStakeholderFn = httpsCallable(functions, 'simulateStakeholder');
const evaluateSessionFn = httpsCallable(functions, 'evaluateSession');
const getCoachingHintFn = httpsCallable(functions, 'getCoachingHint');

// Simulate stakeholder response
export const getStakeholderResponse = async (sessionData, userMessage) => {
  // Ensure data is properly serializable (plain objects only)
  const payload = {
    scenario: JSON.parse(JSON.stringify(sessionData.scenario)),
    transcript: JSON.parse(JSON.stringify(sessionData.transcript)),
    userMessage: String(userMessage),
    turnCount: Number(sessionData.turnCount)
  };
  
  console.log('Sending to Firebase Function:', {
    hasScenario: !!payload.scenario,
    hasStakeholders: !!payload.scenario?.stakeholders,
    transcriptLength: payload.transcript?.length || 0,
    userMessage: payload.userMessage?.substring(0, 50)
  });
  
  // Call Firebase Function
  const result = await simulateStakeholderFn(payload);
  return result.data;
};

// Get coaching hint during timeout
export const getCoachingHint = async (sessionData) => {
  const result = await getCoachingHintFn({
    scenario: sessionData.scenario,
    transcript: sessionData.transcript,
    turnCount: sessionData.turnCount
  });
  return result.data.hint;
};

// Evaluate session performance
export const evaluateSession = async (sessionId, sessionData) => {
  const result = await evaluateSessionFn({
    sessionId: sessionId,
    scenario: sessionData.scenario,
    transcript: sessionData.transcript,
    rubricId: sessionData.scenario.rubricId
  });
  return result.data;
};


