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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SCENARIOS: 'scenarios',
  SESSIONS: 'sessions',
  EVALUATIONS: 'evaluations',
  ASSETS: 'assets',
  ANALYTICS: 'analytics_daily'
};

// User operations
export const createUser = async (userId, userData) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp()
  });
};

export const getUser = async (userId) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};

// Scenario operations
export const createScenario = async (scenarioData) => {
  const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
  const docRef = await addDoc(scenariosRef, {
    ...scenarioData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getScenario = async (scenarioId) => {
  const scenarioRef = doc(db, COLLECTIONS.SCENARIOS, scenarioId);
  const scenarioSnap = await getDoc(scenarioRef);
  return scenarioSnap.exists() ? { id: scenarioSnap.id, ...scenarioSnap.data() } : null;
};

export const getUserScenarios = async (userId) => {
  const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
  const q = query(
    scenariosRef,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Session operations
export const createSession = async (sessionData) => {
  const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
  const docRef = await addDoc(sessionsRef, {
    ...sessionData,
    startedAt: serverTimestamp(),
    transcript: [],
    state: 'IN_SIM'
  });
  return docRef.id;
};

export const updateSession = async (sessionId, updates) => {
  const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  await updateDoc(sessionRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const getSession = async (sessionId) => {
  const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
  const sessionSnap = await getDoc(sessionRef);
  return sessionSnap.exists() ? { id: sessionSnap.id, ...sessionSnap.data() } : null;
};

export const getUserSessions = async (userId, limitCount = 10) => {
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

// Evaluation operations
export const createEvaluation = async (evaluationData) => {
  const evaluationsRef = collection(db, COLLECTIONS.EVALUATIONS);
  const docRef = await addDoc(evaluationsRef, {
    ...evaluationData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getEvaluation = async (evaluationId) => {
  const evaluationRef = doc(db, COLLECTIONS.EVALUATIONS, evaluationId);
  const evaluationSnap = await getDoc(evaluationRef);
  return evaluationSnap.exists() ? { id: evaluationSnap.id, ...evaluationSnap.data() } : null;
};

export const getSessionEvaluation = async (sessionId) => {
  const evaluationsRef = collection(db, COLLECTIONS.EVALUATIONS);
  const q = query(
    evaluationsRef,
    where('sessionId', '==', sessionId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

// Analytics operations
export const getUserAnalytics = async (userId, days = 30) => {
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
export const createAsset = async (assetData) => {
  const assetsRef = collection(db, COLLECTIONS.ASSETS);
  const docRef = await addDoc(assetsRef, {
    ...assetData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getSessionAssets = async (sessionId) => {
  const assetsRef = collection(db, COLLECTIONS.ASSETS);
  const q = query(
    assetsRef,
    where('sessionId', '==', sessionId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

