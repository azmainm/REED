"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  // Set up the Firebase auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is signed in - get additional Firestore data
        try {
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
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(authUser);
        }
      } else {
        // User is signed out
        setUser(null);
        setIsNewUser(false);
      }
      
      setLoading(false);
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with Google
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

  // Sign out function
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

  // Update avatar ID
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

  // Update profile picture
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

  // Context value
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

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 