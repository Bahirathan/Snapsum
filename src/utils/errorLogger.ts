import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface ClientErrorLog {
  id?: string;
  errorId?: string;
  message: string;
  stack?: string;
  url: string;
  userId?: string;
  userEmail?: string;
  userAgent: string;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved';
  type: 'exception' | 'promise_rejection' | 'user_report' | 'api_error';
  userNotes?: string;
}

// Low-frequency cache to avoid spamming Firestore with the exact same error multiple times in a short window
const errorCache = new Set<string>();

export async function logClientError(params: {
  message: string;
  stack?: string;
  userId?: string;
  userEmail?: string;
  type?: 'exception' | 'promise_rejection' | 'user_report' | 'api_error';
  userNotes?: string;
}): Promise<string | null> {
  const message = params.message || 'Unknown client-side error';
  const stack = params.stack || '';
  const type = params.type || 'exception';
  const userNotes = params.userNotes || '';

  // Create a fingerprint to prevent duplicate spam
  const fingerprint = `${message}_${stack.substring(0, 50)}_${type}`;
  if (errorCache.has(fingerprint)) {
    return null;
  }
  errorCache.add(fingerprint);
  // Clear from cache after 15 seconds to allow logging it again later if it recurs
  setTimeout(() => {
    errorCache.delete(fingerprint);
  }, 15000);

  try {
    const errorData: Omit<ClientErrorLog, 'id'> = {
      message,
      stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userId: params.userId || 'anonymous',
      userEmail: params.userEmail || '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      timestamp: new Date().toISOString(),
      status: 'new',
      type,
      userNotes,
    };

    const docRef = await addDoc(collection(db, 'client_errors'), errorData);
    // Also update document with its own auto-generated Firestore ID as errorId
    await updateDoc(docRef, { errorId: docRef.id });
    
    console.log(`[ErrorLogger] Logged ${type} with Firestore ID: ${docRef.id}`);
    return docRef.id;
  } catch (err) {
    console.error('[ErrorLogger] Failed to write error to Firestore:', err);
    return null;
  }
}

/**
 * Initializes global window error capturing
 */
export function initGlobalErrorLogging(getUserContext: () => { uid?: string; email?: string }) {
  if (typeof window === 'undefined') return;

  // Capture standard javascript runtime errors
  window.addEventListener('error', (event) => {
    const { uid, email } = getUserContext();
    logClientError({
      message: event.message || (event.error && event.error.message) || 'Global runtime exception',
      stack: event.error ? event.error.stack : '',
      userId: uid,
      userEmail: email,
      type: 'exception',
    });
  });

  // Capture unhandled promise rejections (async/await failures, API call failures)
  window.addEventListener('unhandledrejection', (event) => {
    const { uid, email } = getUserContext();
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : '';
    
    logClientError({
      message: `Unhandled Promise Rejection: ${message}`,
      stack,
      userId: uid,
      userEmail: email,
      type: 'promise_rejection',
    });
  });
}
