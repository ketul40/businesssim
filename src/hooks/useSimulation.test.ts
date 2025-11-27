import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSimulation } from './useSimulation';
import { updateSession } from '../firebase/firestore';
import { getStakeholderResponse, getCoachingHint, evaluateSession } from '../utils/aiService';

// Mock dependencies
vi.mock('../firebase/firestore', () => ({
  updateSession: vi.fn(),
}));

vi.mock('../utils/aiService', () => ({
  getStakeholderResponse: vi.fn(),
  getCoachingHint: vi.fn(),
  evaluateSession: vi.fn(),
}));

describe('useSimulation', () => {
  const mockScenario = {
    id: 'scenario-1',
    title: 'Test Scenario',
    turnLimit: 10,
    difficulty: 'Medium',
  };

  const mockSessionId = 'session-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty messages and zero turn count', () => {
    const { result } = renderHook(() =>
      useSimulation({
        scenario: mockScenario,
        sessionId: mockSessionId,
      })
    );

    expect(result.current.messages).toEqual([]);
    expect(result.current.turnCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('should send message and get AI response', async () => {
    const mockAIResponse = {
      message: 'AI response',
      stakeholder: 'Manager',
      role: 'supervisor',
      timestamp: new Date().toISOString(),
    };

    vi.mocked(getStakeholderResponse).mockResolvedValue(mockAIResponse);

    const { result } = renderHook(() =>
      useSimulation({
        scenario: mockScenario,
        sessionId: mockSessionId,
      })
    );

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].type).toBe('user');
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[1].type).toBe('ai');
    expect(result.current.messages[1].content).toBe('AI response');
    expect(result.current.turnCount).toBe(1);
  });

  it('should update session when sending message', async () => {
    const mockAIResponse = {
      message: 'AI response',
      stakeholder: 'Manager',
      role: 'supervisor',
      timestamp: new Date().toISOString(),
    };

    vi.mocked(getStakeholderResponse).mockResolvedValue(mockAIResponse);

    const { result } = renderHook(() =>
      useSimulation({
        scenario: mockScenario,
        sessionId: mockSessionId,
      })
    );

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    await waitFor(() => {
      expect(updateSession).toHaveBeenCalled();
    });

    expect(updateSession).toHaveBeenCalledWith(
      mockSessionId,
      expect.objectContaining({
        transcript: expect.any(Array),
        turnCount: 1,
      })
    );
  });

  it('should handle AI response errors', async () => {
    vi.mocked(getStakeholderResponse).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() =>
      useSimulation({
        scenario: mockScenario,
        sessionId: mockSessionId,
      })
    );

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].type).toBe('system');
    expect(result.current.messages[1].content).toContain('Error');
  });

  it('should request timeout and get coaching hint', async () => {
    const mockHint = 'Try asking about their concerns';
    vi.mocked(getCoachingHint).mockResolvedValue(mockHint);

    const { result } = renderHook(() =>
      useSimulation({
        scenario: mockScenario,
        sessionId: mockSessionId,
      })
    );

    await act(async () => {
      await result.current.requestTimeout();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].type).toBe('coaching');
    expect(result.current.messages[0].content).toBe(mockHint);
  });

  it('should exit simulation and evaluate', async () => {
    const mockEvaluation = {
      overall_score: 85,
      criterion_scores: [],
    };

    vi.mocked(evaluateSession).mockResolvedValue(mockEvaluation);

    const onEvaluationComplete = vi.fn();

    const { result } = renderHook(() =>
      useSimulation({
        scenario: mockScenario,
        sessionId: mockSessionId,
        onEvaluationComplete,
      })
    );

    await act(async () => {
      await result.current.exitSimulation();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(updateSession).toHaveBeenCalledWith(
      mockSessionId,
      expect.objectContaining({
        completedAt: expect.any(Date),
        state: 'EXITED',
      })
    );

    expect(evaluateSession).toHaveBeenCalledWith(
      mockSessionId,
      expect.objectContaining({
        scenario: mockScenario,
        transcript: expect.any(Array),
      })
    );

    expect(onEvaluationComplete).toHaveBeenCalledWith(mockEvaluation);
  });

  it('should clear messages', () => {
    const { result } = renderHook(() =>
      useSimulation({
        scenario: mockScenario,
        sessionId: mockSessionId,
      })
    );

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.turnCount).toBe(0);
  });
});
