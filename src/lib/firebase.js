/**
 * Firebase Configuration and Service Initialization
 * 
 * This module initializes and exports Firebase services used throughout the application.
 * It centralizes Firebase configuration and provides access to authentication,
 * Firestore database, and storage services.
 * 
 * @module firebase
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration object
 * Values are loaded from environment variables
 * 
 * @private
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate configuration to prevent runtime errors
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    "Firebase configuration is incomplete. Make sure environment variables are set properly. " +
    "Check .env.local file or environment configuration."
  );
}

/**
 * Initialized Firebase app instance
 * @private
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication service instance
 * @public
 */
const auth = getAuth(app);

/**
 * Firebase Firestore database service instance
 * @public
 */
const firestore = getFirestore(app);

/**
 * Firebase Storage service instance
 * @public
 */
const storage = getStorage(app);

/**
 * Google Authentication provider for sign-in
 * @public
 */
const googleProvider = new GoogleAuthProvider();

// Configure Google provider (optional settings)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  auth, 
  firestore, 
  storage, 
  googleProvider,
  app as firebaseApp  // Export the app instance if needed elsewhere
}; 