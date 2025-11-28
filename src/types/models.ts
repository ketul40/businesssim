import { Timestamp } from 'firebase/firestore';

// User Models
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roleLevel: 'individual_contributor' | 'manager' | 'director' | 'executive';
  totalSessions: number;
  averageScore: number;
  createdAt: Timestamp;
}

// Scenario Models
export interface Stakeholder {
  role: string;
  name: string;
  relationshipType: 'direct_report' | 'peer' | 'stakeholder';
  personality: string;
  concerns: string[];
  motivations: string[];
  communicationStyle?: {
    directness: 'direct' | 'indirect' | 'balanced';
    formality: 'formal' | 'casual' | 'professional';
    emotionalExpressiveness: 'high' | 'medium' | 'low';
    questioningStyle: 'probing' | 'supportive' | 'challenging';
  };
  speechPatterns?: {
    averageSentenceLength: 'short' | 'medium' | 'long';
    usesIdioms: boolean;
    usesHumor: boolean;
    thinkingPauses: 'frequent' | 'occasional' | 'rare';
  };
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rubricId: string;
  description: string;
  situation: string;
  objective: string;
  turnLimit: number;
  stakeholders: Stakeholder[];
  constraints: string[];
}

// Message Models
export interface Message {
  type: 'user' | 'ai' | 'system' | 'coaching';
  content: string;
  timestamp: string;
  stakeholder?: string;
  role?: string;
}

// Session Models
export interface SimulationSession {
  id: string;
  userId: string;
  scenario: ScenarioTemplate;
  transcript: Message[];
  turnCount: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  state: 'IN_SIM' | 'TIMEOUT' | 'EXITED' | 'EVALUATED';
}

// Evaluation Models
export interface CriterionScore {
  criterion: string;
  weight: number;
  score: number;
  evidence: string[];
}

export interface MissedOpportunity {
  criterion: string;
  what: string;
  how_to_improve: string;
}

export interface MomentThatMattered {
  turn: number;
  description: string;
  why: string;
}

export interface PracticeDrill {
  title: string;
  instructions: string;
  estimated_minutes: number;
}

export interface Evaluation {
  id: string;
  sessionId: string;
  rubricId: string;
  overall_score: number;
  criterion_scores: CriterionScore[];
  missed_opportunities: MissedOpportunity[];
  moments_that_mattered: MomentThatMattered[];
  reflection_prompt: string;
  drills: PracticeDrill[];
  createdAt: Timestamp;
}
