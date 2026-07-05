import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Use the standard firebaseapp.com authDomain to guarantee Google Sign-In works out-of-the-box.
// Overriding this dynamically to zipytiny.app causes "redirect_uri_mismatch" errors on Google's side
// unless custom Firebase Hosting DNS and Google Cloud Console OAuth Authorized Redirect URIs are manually configured.
const resolvedConfig = { ...firebaseConfig };
resolvedConfig.authDomain = firebaseConfig.authDomain;

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
