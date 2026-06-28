import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const db: Firestore | null = (() => {
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
      const firestoreDb = getFirestore(adminApp, databaseId || '(default)');
      console.log(`Firebase Admin Firestore initialized successfully with project: ${projectId}, database: ${databaseId || '(default)'}`);
      return firestoreDb;
    } else {
      console.warn('No project ID found for Firestore initialization.');
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize Firestore with firebase-admin:', error);
    return null;
  }
})();

export { db };
