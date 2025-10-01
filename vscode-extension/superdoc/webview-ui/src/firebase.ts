import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY
const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
const firebaseProjectid = import.meta.env.VITE_FIREBASE_PROJECT_ID
const firebaseStorageBucket = import.meta.env.VITE_FIREBASE_STRORAGE_BUCKET
const firebaseMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID
const firebaseMeasurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectid,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);