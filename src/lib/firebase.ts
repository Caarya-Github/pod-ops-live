// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1JK9RSc9VNJXAepJDzEP-OIf7nGIhnEw",
  authDomain: "caarya-live-891d3.firebaseapp.com",
  projectId: "caarya-live-891d3",
  storageBucket: "caarya-live-891d3.firebasestorage.app",
  messagingSenderId: "1073593877061",
  appId: "1:1073593877061:web:bf0d6d845d088b5952192c",
  measurementId: "G-QWTDEYT3KP"
};
// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);