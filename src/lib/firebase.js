// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkZk_qOlSFXBuMMv--tosD1XWKP2iT65Y",
  authDomain: "reed-4dd32.firebaseapp.com",
  projectId: "reed-4dd32",
  storageBucket: "reed-4dd32.firebasestorage.app",
  messagingSenderId: "599138733989",
  appId: "1:599138733989:web:2cb46c31dda8d5b1d4224c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, firestore, storage, googleProvider }; 