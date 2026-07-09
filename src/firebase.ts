import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Use the standard firebaseapp.com authDomain to guarantee Google Sign-In works out-of-the-box in development.
// For production (zipytiny.app / www.zipytiny.app), we use the custom domain 'www.zipytiny.app' so Google Sign-In popup shows Zipytiny.app instead of Firebase.
const resolvedConfig = { ...firebaseConfig };
resolvedConfig.authDomain = firebaseConfig.authDomain;

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
