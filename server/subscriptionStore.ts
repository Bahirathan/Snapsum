import { db } from './firestore';

export interface SubscriptionRecord {
  email: string;
  plan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const fallbackSubscriptions: Record<string, SubscriptionRecord> = {};

export async function saveSubscription(email: string, plan: string, status: string = 'active'): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const record: SubscriptionRecord = {
    email: normalizedEmail,
    plan,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db) {
    fallbackSubscriptions[normalizedEmail] = record;
    return true;
  }

  try {
    await db.collection('subscriptions').doc(normalizedEmail).set(record);
    console.log(`Saved subscription details to Firestore for email: ${normalizedEmail}`);
    return true;
  } catch (err) {
    console.error(`Failed to save subscription details for email ${normalizedEmail}:`, err);
    fallbackSubscriptions[normalizedEmail] = record;
    return false;
  }
}

export async function getSubscription(email: string): Promise<SubscriptionRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!db) {
    return fallbackSubscriptions[normalizedEmail] || null;
  }

  try {
    const doc = await db.collection('subscriptions').doc(normalizedEmail).get();
    if (doc.exists) {
      return doc.data() as SubscriptionRecord;
    }
  } catch (err) {
    console.error(`Failed to fetch subscription details of email ${normalizedEmail}:`, err);
  }

  return fallbackSubscriptions[normalizedEmail] || null;
}
