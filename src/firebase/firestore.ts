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
  serverTimestamp,
  writeBatch,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SCENARIOS: 'scenarios',
  SESSIONS: 'sessions',
  EVALUATIONS: 'evaluations',
  ASSETS: 'assets',
  ANALYTICS: 'analytics_daily',
} as const;

// Types
export interface UserData {
  email: string;
  displayName: string;
  photoURL?: string;
  roleLevel: 'individual_contributor' | 'manager' | 'director' | 'executive';
  totalSessions: number;
  averageScore: number;
  createdAt?: Timestamp | ReturnType<typeof serverTimestamp>;
}

export interface SessionData {
  userId: string;
  scenario: any; // ScenarioTemplate type
  turnLimit: number;
  settings: {
    difficulty: string;
  };
  transcript?: any[];
  state?: string;
  startedAt?: Timestamp | ReturnType<typeof serverTimestamp>;
  updatedAt?: Timestamp | ReturnType<typeof serverTimestamp>;
}

export interface SessionUpdate {
  id: string;
  data: Partial<SessionData>;
}

export interface EvaluationData {
  sessionId: string;
  rubricId?: string;
  overall_score?: number;
  criterion_scores?: any[];
  createdAt?: Timestamp | ReturnType<typeof serverTimestamp>;
}

// Cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const scenarioCache = new Map<string, CacheEntry<any>>();
const userCache = new Map<string, CacheEntry<any>>();

function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

export function clearScenarioCache(): void {
  scenarioCache.clear();
}

export function clearUserCache(): void {
  userCache.clear();
}

// User operations
export const createUser = async (userId: string, userData: UserData): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
  });
  
  // Invalidate cache
  userCache.delete(userId);
};

export const getUser = async (userId: string): Promise<any | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};

export const getUserWithCache = async (userId: string): Promise<any | null> => {
  const cached = userCache.get(userId);
  if (isCacheValid(cached)) {
    return cached!.data;
  }
  
  const user = await getUser(userId);
  if (user) {
    userCache.set(userId, { data: user, timestamp: Date.now() });
  }
  return user;
};

// Scenario operations
export const createScenario = async (scenarioData: any): Promise<string> => {
  const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
  const docRef = await addDoc(scenariosRef, {
    ...scenarioData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getScenario = async (scenarioId: string): Promise<any | null> => {
  const scenarioRef = doc(db, COLLECTIONS.SCENARIOS, scenarioId);
  const scenarioSnap = await getDoc(scenarioRef);
  return scenarioSnap.exists() ? { id: scenarioSnap.id, ...scenarioSnap.data() } : null;
};

export const getScenarioWithCache = async (scenarioId: string): Promise<any | null> => {
  const cached = scenarioCache.get(scenarioId);
  if (isCacheValid(cached)) {
    return cached!.data;
  }
  
  const scenario = await getScenario(scenarioId);
  if (scenario) {
    scenarioCache.set(scenarioId, { data: scenario, timestamp: Date.now() });
  }
  return scenario;
};

export const getUserScenarios = async (userId: string, limitCount: number = 50): Promise<any[]> => {
  const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
  const q = query(
    scenariosRef,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount) // Added limit to prevent unbounded reads
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Session operations
export const createSession = async (sessionData: SessionData): Promise<string> => {
  const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
  const docRef = await addDoc(sessionsRef, {
    ...sessionData,
    startedAt: serverTimestamp(),
    transcript: [],
    state: 'IN_SIM',
  });
  return docRef.id;
};

export const updateSession = async (sessionId: string, updates: Partial<SessionData>): Promise<void> => {
  const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  await updateDoc(sessionRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  } as any);
};

export const getSession = async (sessionId: string): Promise<any | null> => {
  const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  const sessionSnap = await getDoc(sessionRef);
  return sessionSnap.exists() ? { id: sessionSnap.id, ...sessionSnap.data() } : null;
};

export const getUserSessions = async (userId: string, limitCount: number = 10): Promise<any[]> => {
  const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('startedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Batch operations for sessions
export const batchUpdateSessions = async (updates: SessionUpdate[]): Promise<void> => {
  const batch = writeBatch(db);
  
  updates.forEach(update => {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, update.id);
    batch.update(sessionRef, {
      ...update.data,
      updatedAt: serverTimestamp(),
    } as any);
  });
  
  await batch.commit();
};

// Real-time listener for session
export const subscribeToSession = (
  sessionId: string,
  callback: (session: any) => void
): Unsubscribe => {
  const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  return onSnapshot(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};

// Real-time listener for user sessions
export const subscribeToUserSessions = (
  userId: string,
  callback: (sessions: any[]) => void,
  limitCount: number = 10
): Unsubscribe => {
  const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('startedAt', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(sessions);
  });
};

// Evaluation operations
export const createEvaluation = async (evaluationData: EvaluationData): Promise<string> => {
  const evaluationsRef = collection(db, COLLECTIONS.EVALUATIONS);
  const docRef = await addDoc(evaluationsRef, {
    ...evaluationData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getEvaluation = async (evaluationId: string): Promise<any | null> => {
  const evaluationRef = doc(db, COLLECTIONS.EVALUATIONS, evaluationId);
  const evaluationSnap = await getDoc(evaluationRef);
  return evaluationSnap.exists() ? { id: evaluationSnap.id, ...evaluationSnap.data() } : null;
};

export const getSessionEvaluation = async (sessionId: string): Promise<any | null> => {
  const evaluationsRef = collection(db, COLLECTIONS.EVALUATIONS);
  const q = query(
    evaluationsRef,
    where('sessionId', '==', sessionId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

// Batch operations for evaluations
export const batchCreateEvaluations = async (evaluations: EvaluationData[]): Promise<string[]> => {
  const batch = writeBatch(db);
  const ids: string[] = [];
  
  evaluations.forEach(evaluation => {
    const evaluationRef = doc(collection(db, COLLECTIONS.EVALUATIONS));
    ids.push(evaluationRef.id);
    batch.set(evaluationRef, {
      ...evaluation,
      createdAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
  return ids;
};

// Analytics operations
export const getUserAnalytics = async (userId: string, days: number = 30): Promise<any[]> => {
  const analyticsRef = collection(db, COLLECTIONS.ANALYTICS);
  const q = query(
    analyticsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(days)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Asset operations (for uploaded context files)
export const createAsset = async (assetData: any): Promise<string> => {
  const assetsRef = collection(db, COLLECTIONS.ASSETS);
  const docRef = await addDoc(assetsRef, {
    ...assetData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getSessionAssets = async (sessionId: string, limitCount: number = 100): Promise<any[]> => {
  const assetsRef = collection(db, COLLECTIONS.ASSETS);
  const q = query(
    assetsRef,
    where('sessionId', '==', sessionId),
    limit(limitCount) // Added limit to prevent unbounded reads
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
