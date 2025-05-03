"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is signed in
        const userDocRef = doc(firestore, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // Existing user
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            ...userDoc.data()
          });
        } else {
          // New user - create profile
          const newUserData = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            createdAt: new Date(),
            xp: 0,
          };
          
          await setDoc(userDocRef, newUserData);
          setUser(newUserData);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}; 