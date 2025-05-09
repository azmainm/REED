/**
 * Authentication Context for Socrati
 * 
 * Provides authentication state and methods throughout the application
 * using React Context API.
 * 
 * @module AuthContext
 */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// Create the auth context
const AuthContext = createContext();

/**
 * Auth Provider Component
 * 
 * Manages authentication state and provides auth-related methods to the application.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Auth Provider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  /**
   * Set up the Firebase auth state listener
   * Synchronizes the user state with Firebase Authentication
   * and fetches additional user data from Firestore
   */
  useEffect(() => {
    const auth = getAuth();
    setLoading(true); // Set loading to true before starting auth check
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          // User is signed in - get additional Firestore data
          const userDocRef = doc(firestore, "users", authUser.email);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Combine auth user with Firestore data
            const userData = userDoc.data();
            setUser({
              ...authUser,
              ...userData
            });
            
            // Check if user has no avatar and is a new login
            if (!userData.avatar_id && !userData.hasSelectedAvatar) {
              setIsNewUser(true);
            }
          } else {
            // New user, create document
            const newUserData = {
              uid: authUser.uid,
              email: authUser.email,
              name: authUser.displayName || "",
              profilePicture: authUser.photoURL || "",
              avatar_id: null,
              hasSelectedAvatar: false,
              xp: 0,
              createdAt: new Date()
            };
            
            await setDoc(userDocRef, newUserData);
            setUser({
              ...authUser,
              ...newUserData
            });
            
            // Flag as new user
            setIsNewUser(true);
          }
        } else {
          // User is signed out
          setUser(null);
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with Google Authentication
   * 
   * @async
   * @returns {Promise<Object>} Result object with success status and user or error
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      router.push('/dashboard');
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user and redirect to home page
   * 
   * @async
   * @returns {Promise<Object>} Result object with success status and any error
   */
  const logOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      
      setUser(null);
      setIsNewUser(false);
      router.push('/');
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error };
    }
  };

  /**
   * Update user's avatar ID in Firestore and local state
   * 
   * @async
   * @param {string} avatarId - The ID of the selected avatar
   * @returns {Promise<Object>} Result object with success status and any error
   */
  const updateAvatarId = async (avatarId) => {
    if (!user || !user.email) return { success: false, error: "No user logged in" };
    
    try {
      const userDocRef = doc(firestore, "users", user.email);
      await updateDoc(userDocRef, { 
        avatar_id: avatarId,
        hasSelectedAvatar: true 
      });
      
      setUser({
        ...user,
        avatar_id: avatarId,
        hasSelectedAvatar: true
      });
      
      setIsNewUser(false);
      
      return { success: true };
    } catch (error) {
      console.error("Error updating avatar ID:", error);
      return { success: false, error };
    }
  };

  /**
   * Update user's profile picture in Firestore and local state
   * 
   * @async
   * @param {string} imageData - The base64 or URL of the profile picture
   * @returns {Promise<Object>} Result object with success status and any error
   */
  const updateProfilePicture = async (imageData) => {
    if (!user || !user.email) return { success: false, error: "No user logged in" };
    
    try {
      const userDocRef = doc(firestore, "users", user.email);
      await updateDoc(userDocRef, { 
        profilePicture: imageData
      });
      
      // Update local state to reflect changes immediately
      setUser({
        ...user,
        profilePicture: imageData
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return { success: false, error };
    }
  };

  // Context value with all auth-related state and methods
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isNewUser,
    logOut,
    signInWithGoogle,
    updateAvatarId,
    updateProfilePicture,
    setIsNewUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 * 
 * @returns {Object} The auth context value
 * @throws {Error} If used outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 