"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, googleProvider, firestore, storage } from "@/lib/firebase";
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
        const userDocRef = doc(firestore, "users", authUser.email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // Existing user
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName || userDoc.data().name,
            photoURL: authUser.photoURL || userDoc.data().profilePicture,
            ...userDoc.data()
          });
        } else {
          // New user - create profile
          const newUserData = {
            uid: authUser.uid,
            email: authUser.email,
            name: authUser.displayName || "",
            profilePicture: authUser.photoURL || "",
            dob: "",
            avatar_id: null,
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

  // Update user profile
  const updateProfile = async (userData) => {
    if (!user) return { success: false, error: "No user logged in" };
    
    try {
      const userDocRef = doc(firestore, "users", user.email);
      await updateDoc(userDocRef, userData);
      
      setUser({ ...user, ...userData });
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    if (!user) return { success: false, error: "No user logged in" };
    if (!file) return { success: false, error: "No file provided" };
    
    try {
      const fileRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      // Update the profile with the new image URL
      const userDocRef = doc(firestore, "users", user.email);
      await updateDoc(userDocRef, { profilePicture: downloadURL });
      
      setUser({ ...user, profilePicture: downloadURL });
      return { success: true, downloadURL };
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return { success: false, error };
    }
  };

  // Update avatar ID
  const updateAvatarId = async (avatarId) => {
    if (!user) return { success: false, error: "No user logged in" };
    
    try {
      const userDocRef = doc(firestore, "users", user.email);
      await updateDoc(userDocRef, { avatar_id: avatarId });
      
      setUser({ ...user, avatar_id: avatarId });
      return { success: true };
    } catch (error) {
      console.error("Error updating avatar ID:", error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logOut,
    updateProfile,
    uploadProfilePicture,
    updateAvatarId
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