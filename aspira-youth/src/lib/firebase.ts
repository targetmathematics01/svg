import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBYP5tCFAkB661cceKeZa9YfAwdpid0nxc",
  authDomain: "aspira-youth.firebaseapp.com",
  projectId: "aspira-youth",
  storageBucket: "aspira-youth.firebasestorage.app",
  messagingSenderId: "427673296576",
  appId: "1:427673296576:web:419b84c644c14ee2b35725",
  measurementId: "G-QYJQKLN74D"
};

// Initialize Firebase only if it hasn't been initialized already (important for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
