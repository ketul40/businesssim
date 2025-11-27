import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn((...args) => args),
  where: vi.fn((...args) => ({ type: 'where', args })),
  orderBy: vi.fn((...args) => ({ type: 'orderBy', args })),
  limit: vi.fn((n) => ({ type: 'limit', value: n })),
  serverTimestamp: vi.fn(() => 'TIMESTAMP'),
  writeBatch: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('./config', () => ({
  db: {},
}));

describe('Firebase Firestore Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query Construction with Limits', () => {
    it('should construct getUserSessions query with limit', async () => {
      const { getUserSessions } = await import('./firestore.ts');
      
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
      } as any);
      
      await getUserSessions('user123', 20);
      
      // Verify limit was called with the correct value
      expect(limit).toHaveBeenCalledWith(20);
      expect(getDocs).toHaveBeenCalled();
    });

    it('should use default limit of 10 for getUserSessions', async () => {
      const { getUserSessions } = await import('./firestore.ts');
      
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
      } as any);
      
      await getUserSessions('user123');
      
      expect(limit).toHaveBeenCalledWith(10);
    });

    it('should construct getUserAnalytics query with limit', async () => {
      const { getUserAnalytics } = await import('./firestore.ts');
      
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
      } as any);
      
      await getUserAnalytics('user123', 30);
      
      expect(limit).toHaveBeenCalledWith(30);
    });

    it('should construct getSessionEvaluation query with limit 1', async () => {
      const { getSessionEvaluation } = await import('./firestore.ts');
      
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
      } as any);
      
      await getSessionEvaluation('session123');
      
      expect(limit).toHaveBeenCalledWith(1);
    });
  });

  describe('Batch Write Operations', () => {
    it('should batch multiple session updates', async () => {
      const mockBatch = {
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      };
      
      vi.mocked(writeBatch).mockReturnValue(mockBatch as any);
      vi.mocked(doc).mockReturnValue({} as any);
      
      // Dynamic import to get fresh module
      const firestoreModule = await import('./firestore?t=' + Date.now());
      
      const updates = [
        { id: 'session1', data: { state: 'COMPLETED' } },
        { id: 'session2', data: { state: 'COMPLETED' } },
        { id: 'session3', data: { state: 'COMPLETED' } },
      ];
      
      await firestoreModule.batchUpdateSessions(updates);
      
      expect(writeBatch).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalledTimes(3);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should batch create multiple evaluations', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      };
      
      vi.mocked(writeBatch).mockReturnValue(mockBatch as any);
      vi.mocked(doc).mockReturnValue({} as any);
      vi.mocked(collection).mockReturnValue({} as any);
      
      // Dynamic import to get fresh module
      const firestoreModule = await import('./firestore?t=' + Date.now());
      
      const evaluations = [
        { sessionId: 'session1', score: 85 },
        { sessionId: 'session2', score: 90 },
      ];
      
      await firestoreModule.batchCreateEvaluations(evaluations);
      
      expect(writeBatch).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('Listener Cleanup', () => {
    it('should return unsubscribe function from subscribeToSession', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);
      vi.mocked(doc).mockReturnValue({} as any);
      
      const firestoreModule = await import('./firestore?t=' + Date.now());
      
      const callback = vi.fn();
      const unsubscribe = firestoreModule.subscribeToSession('session123', callback);
      
      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should return unsubscribe function from subscribeToUserSessions', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);
      vi.mocked(collection).mockReturnValue({} as any);
      
      const firestoreModule = await import('./firestore?t=' + Date.now());
      
      const callback = vi.fn();
      const unsubscribe = firestoreModule.subscribeToUserSessions('user123', callback);
      
      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Caching Behavior', () => {
    it('should cache frequently accessed scenario data', async () => {
      vi.mocked(doc).mockReturnValue({} as any);
      
      const firestoreModule = await import('./firestore?t=' + Date.now());
      
      const mockScenario = {
        id: 'scenario123',
        title: 'Test Scenario',
        difficulty: 'Medium',
      };
      
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'scenario123',
        data: () => mockScenario,
      } as any);
      
      // Clear cache first
      firestoreModule.clearScenarioCache();
      
      // First call should fetch from Firestore
      const result1 = await firestoreModule.getScenarioWithCache('scenario123');
      expect(getDoc).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ id: 'scenario123', ...mockScenario });
      
      // Second call should use cache
      const result2 = await firestoreModule.getScenarioWithCache('scenario123');
      expect(getDoc).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(result2).toEqual({ id: 'scenario123', ...mockScenario });
      
      // Clear cache and fetch again
      firestoreModule.clearScenarioCache();
      const result3 = await firestoreModule.getScenarioWithCache('scenario123');
      expect(getDoc).toHaveBeenCalledTimes(2); // Now 2
    });

    it('should cache user data', async () => {
      vi.mocked(doc).mockReturnValue({} as any);
      
      const firestoreModule = await import('./firestore?t=' + Date.now());
      
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
      };
      
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'user123',
        data: () => mockUser,
      } as any);
      
      // Clear cache first
      firestoreModule.clearUserCache();
      
      // First call should fetch from Firestore
      await firestoreModule.getUserWithCache('user123');
      expect(getDoc).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      await firestoreModule.getUserWithCache('user123');
      expect(getDoc).toHaveBeenCalledTimes(1);
      
      // Clear cache
      firestoreModule.clearUserCache();
      await firestoreModule.getUserWithCache('user123');
      expect(getDoc).toHaveBeenCalledTimes(2);
    });

    it('should respect cache TTL', async () => {
      vi.useFakeTimers();
      vi.mocked(doc).mockReturnValue({} as any);
      
      const firestoreModule = await import('./firestore?t=' + Date.now());
      
      const mockScenario = {
        id: 'scenario123',
        title: 'Test Scenario',
      };
      
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'scenario123',
        data: () => mockScenario,
      } as any);
      
      firestoreModule.clearScenarioCache();
      
      // First call
      await firestoreModule.getScenarioWithCache('scenario123');
      expect(getDoc).toHaveBeenCalledTimes(1);
      
      // Advance time by 4 minutes (cache TTL is 5 minutes)
      vi.advanceTimersByTime(4 * 60 * 1000);
      
      // Should still use cache
      await firestoreModule.getScenarioWithCache('scenario123');
      expect(getDoc).toHaveBeenCalledTimes(1);
      
      // Advance time by 2 more minutes (total 6 minutes, past TTL)
      vi.advanceTimersByTime(2 * 60 * 1000);
      
      // Should fetch again
      await firestoreModule.getScenarioWithCache('scenario123');
      expect(getDoc).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });
});
