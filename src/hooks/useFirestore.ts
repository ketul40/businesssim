import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  getDocs,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface UseFirestoreOptions<T> {
  collectionName: string;
  queryConstraints?: QueryConstraint[];
  realtime?: boolean;
  cacheTime?: number;
}

interface UseFirestoreReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any[]; timestamp: number }>();

export function useFirestore<T = DocumentData>({
  collectionName,
  queryConstraints = [],
  realtime = false,
  cacheTime = 5 * 60 * 1000, // 5 minutes default
}: UseFirestoreOptions<T>): UseFirestoreReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Generate cache key from collection name and query constraints
  const cacheKey = `${collectionName}-${JSON.stringify(queryConstraints)}`;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data as T[]);
        setLoading(false);
        return;
      }

      const collectionRef = collection(db, collectionName);
      const q = queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData(results);

      // Update cache
      cache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Error fetching Firestore data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, queryConstraints, cacheKey, cacheTime]);

  const setupRealtimeListener = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const collectionRef = collection(db, collectionName);
      const q = queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const results = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          setData(results);
          setLoading(false);

          // Update cache
          cache.set(cacheKey, {
            data: results,
            timestamp: Date.now(),
          });
        },
        (err) => {
          console.error('Error in Firestore listener:', err);
          setError(err as Error);
          setLoading(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('Error setting up Firestore listener:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, queryConstraints, cacheKey]);

  useEffect(() => {
    if (realtime) {
      setupRealtimeListener();
    } else {
      fetchData();
    }

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [realtime, setupRealtimeListener, fetchData]);

  const refetch = useCallback(async () => {
    // Clear cache for this query
    cache.delete(cacheKey);
    await fetchData();
  }, [cacheKey, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
