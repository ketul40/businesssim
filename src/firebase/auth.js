import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './config';
import { createUser, getUser } from './firestore';

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user document in Firestore
  await createUser(user.uid, {
    email: user.email,
    displayName: displayName || email.split('@')[0],
    roleLevel: 'individual_contributor',
    totalSessions: 0,
    averageScore: 0
  });
  
  return user;
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  
  // Check if user document exists, create if not
  const existingUser = await getUser(user.uid);
  if (!existingUser) {
    await createUser(user.uid, {
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL,
      roleLevel: 'individual_contributor',
      totalSessions: 0,
      averageScore: 0
    });
  }
  
  return user;
};

// Sign out
export const signOutUser = async () => {
  await signOut(auth);
};

// Reset password
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// Auth state observer
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

