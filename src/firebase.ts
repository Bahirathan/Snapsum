import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Dynamic authDomain resolution: Use www.snapsum.app in production (on the custom domain)
// to display the custom brand domain rather than firebaseapp.com on the Google Sign-In dialog.
const resolvedConfig = { ...firebaseConfig };
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'snapsum.app' || window.location.hostname === 'www.snapsum.app')
) {
  resolvedConfig.authDomain = window.location.hostname;
}

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
