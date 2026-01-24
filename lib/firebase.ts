import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ9Cg4-hrvuyJdNTGl9Wpi6j5w9e3O52c",
  authDomain: "mais-docente-c7221.firebaseapp.com",
  projectId: "mais-docente-c7221",
  storageBucket: "mais-docente-c7221.firebasestorage.app",
  messagingSenderId: "155631338286",
  appId: "1:155631338286:web:accabb260453fa22f5f0bf",
  measurementId: "G-9PC8NKD91C"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (only in browser)
export const analytics: Analytics | null = 
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
