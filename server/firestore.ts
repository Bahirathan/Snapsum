import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let db: Firestore | null = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  let projectId: string | undefined;
  let databaseId: string | undefined;

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    projectId = config.projectId;
    databaseId = config.firestoreDatabaseId;
  } else {
    projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  }

  if (projectId) {
    let adminApp;
    if (getApps().length === 0) {
      adminApp = initializeApp({ projectId });
    } else {
      adminApp = getApp();
    }
    // Initialize Firestore. Pass databaseId if provided (non-default firestore instances)
    db = getFirestore(adminApp, databaseId || '(default)');
    console.log(`Firebase Admin Firestore initialized successfully with project: ${projectId}, database: ${databaseId || '(default)'}`);
  } else {
    console.warn('No project ID found for Firestore initialization.');
  }
} catch (error) {
  console.error('Failed to initialize Firestore with firebase-admin:', error);
}

export { db };
