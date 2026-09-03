import type { FirebaseOptions } from "firebase/app";

const env = import.meta.env;

export const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "AIzaSyBMGA15NjP9m_4LkXG8Pr9HMG0conyCfQ4",
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ?? "launchpad-41d1e.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "launchpad-41d1e",
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ?? "launchpad-41d1e.firebasestorage.app",
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "819649466375",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:819649466375:web:181be4f5851b6895925aa2",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-949M4L5YYS",
};

export const APP_ID = env.VITE_APP_ID ?? "reset-launchpad-app";
