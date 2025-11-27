import { ScenarioTemplate, Message, Evaluation } from './models';

// AI Service Request Types
export interface SimulateStakeholderRequest {
  scenario: ScenarioTemplate;
  transcript: Message[];
  userMessage: string;
  turnCount: number;
}

export interface GetCoachingHintRequest {
  scenario: ScenarioTemplate;
  transcript: Message[];
  turnCount: number;
}

export interface GetSuggestionsRequest {
  scenario: ScenarioTemplate;
  transcript: Message[];
}

export interface EvaluateSessionRequest {
  sessionId: string;
  scenario: ScenarioTemplate;
  transcript: Message[];
  rubricId: string;
}

// AI Service Response Types
export interface StakeholderResponse {
  message: string;
  stakeholder: string;
  role: string;
  timestamp: string;
}

export interface CoachingHintResponse {
  hint: string;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface EvaluationResponse extends Evaluation {}

// Firebase Function Response Wrapper
export interface FirebaseFunctionResponse<T> {
  data: T;
}

// Session Creation Data
export interface CreateSessionData {
  userId: string;
  scenario: ScenarioTemplate;
  turnLimit: number;
  settings: {
    difficulty: string;
  };
}

// Session Update Data
export interface UpdateSessionData {
  transcript?: Message[];
  turnCount?: number;
  completedAt?: Date;
  state?: 'IN_SIM' | 'TIMEOUT' | 'EXITED' | 'EVALUATED';
}

// Error Response
export interface ApiError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
}
