import { useState, useEffect } from 'react';
import { observeAuthState, getCurrentUser } from '../firebase/auth';
import { getUser } from '../firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsGuest(false);
          // Fetch additional user data from Firestore
          const firestoreUserData = await getUser(firebaseUser.uid);
          setUserData(firestoreUserData);
        } else {
          // User is in guest mode
          setUser(null);
          setUserData(null);
          setIsGuest(true);
        }
      } catch (err) {
        console.error('Error in auth state observer:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userData,
    loading,
    error,
    isAuthenticated: !!user,
    isGuest
  };
}

