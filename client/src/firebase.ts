// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ⚠️ Replace with your own Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyCra6aSGl_Bb1AcQRbkozQmnyY-sqOdkzQ",
  authDomain: "destination-quiz.firebaseapp.com",
  projectId: "destination-quiz",
  storageBucket: "destination-quiz.firebasestorage.app",
  messagingSenderId: "556773175822",
  appId: "1:556773175822:web:f95dc0fe313476cb4a825f",
  measurementId: "G-MQ7FBS1SBC",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
