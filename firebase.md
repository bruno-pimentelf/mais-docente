// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);