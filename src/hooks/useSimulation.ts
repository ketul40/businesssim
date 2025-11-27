import { useState, useCallback } from 'react';
import { updateSession } from '../firebase/firestore';
import { getStakeholderResponse, getCoachingHint, evaluateSession } from '../utils/aiService';

/**
 * Message in a simulation conversation
 */
interface Message {
  type: 'user' | 'ai' | 'system' | 'coaching';
  content: string;
  timestamp: string;
  stakeholder?: string;
  role?: string;
}

/**
 * Scenario configuration for a simulation
 */
interface Scenario {
  id: string;
  title: string;
  turnLimit: number;
  difficulty: string;
  [key: string]: any;
}

/**
 * Options for the useSimulation hook
 */
interface UseSimulationOptions {
  scenario: Scenario;
  sessionId: string | null;
  onEvaluationComplete?: (evaluation: any) => void;
}

/**
 * Return value from the useSimulation hook
 */
interface UseSimulationReturn {
  messages: Message[];
  turnCount: number;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  requestTimeout: () => Promise<void>;
  exitSimulation: () => Promise<void>;
  clearMessages: () => void;
}

/**
 * Custom hook for managing simulation state and AI interactions
 * 
 * Handles the complete simulation lifecycle including:
 * - Sending user messages and receiving AI responses
 * - Requesting coaching hints
 * - Exiting simulation and triggering evaluation
 * - Syncing state with Firestore
 * 
 * @param options - Configuration options for the simulation
 * @returns Simulation state and control functions
 * 
 * @example
 * ```typescript
 * const {
 *   messages,
 *   turnCount,
 *   isLoading,
 *   sendMessage,
 *   exitSimulation
 * } = useSimulation({
 *   scenario,
 *   sessionId,
 *   onEvaluationComplete: (evaluation) => {
 *     console.log('Score:', evaluation.overall_score);
 *   }
 * });
 * ```
 */
export function useSimulation({
  scenario,
  sessionId,
  onEvaluationComplete,
}: UseSimulationOptions): UseSimulationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [turnCount, setTurnCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        type: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setTurnCount((prev) => prev + 1);

      // Update session in Firebase
      if (sessionId) {
        try {
          await updateSession(sessionId, {
            transcript: newMessages,
            turnCount: turnCount + 1,
          });
        } catch (error) {
          console.error('Error updating session:', error);
        }
      }

      // Get AI response
      setIsLoading(true);
      try {
        const response = await getStakeholderResponse(
          { scenario, transcript: newMessages, turnCount: turnCount + 1 },
          content
        );

        const aiMessage: Message = {
          type: 'ai',
          content: response.message,
          stakeholder: response.stakeholder,
          role: response.role,
          timestamp: response.timestamp,
        };

        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);

        // Update session again with AI response
        if (sessionId) {
          await updateSession(sessionId, {
            transcript: updatedMessages,
          });
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: Message = {
          type: 'system',
          content: `Error: ${(error as Error).message || 'Unable to get AI response. Check console for details.'}`,
          timestamp: new Date().toISOString(),
        };
        setMessages([...newMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, turnCount, scenario, sessionId]
  );

  const requestTimeout = useCallback(async () => {
    setIsLoading(true);

    try {
      const hint = await getCoachingHint({
        scenario,
        transcript: messages,
        turnCount,
      });

      const coachingMessage: Message = {
        type: 'coaching',
        content: hint,
        timestamp: new Date().toISOString(),
      };

      setMessages([...messages, coachingMessage]);
    } catch (error) {
      console.error('Error getting coaching hint:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, turnCount, scenario]);

  const exitSimulation = useCallback(async () => {
    setIsLoading(true);

    try {
      // Update session status
      if (sessionId) {
        await updateSession(sessionId, {
          completedAt: new Date(),
          state: 'EXITED',
        });
      }

      // Get evaluation
      const evaluationResult = await evaluateSession(sessionId, {
        scenario,
        transcript: messages,
      });

      if (onEvaluationComplete) {
        onEvaluationComplete(evaluationResult);
      }
    } catch (error) {
      console.error('Error evaluating session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, scenario, messages, onEvaluationComplete]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setTurnCount(0);
  }, []);

  return {
    messages,
    turnCount,
    isLoading,
    sendMessage,
    requestTimeout,
    exitSimulation,
    clearMessages,
  };
}
