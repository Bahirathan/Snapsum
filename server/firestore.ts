import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedDb: Firestore | null = null;

function getDbInstance(): Firestore | null {
  if (cachedDb) return cachedDb;

  try {
    const possiblePaths = [
      path.join(__dirname, '..', 'firebase-applet-config.json'),
      path.join(process.cwd(), 'firebase-applet-config.json'),
      path.join(process.cwd(), 'applet', 'firebase-applet-config.json'),
    ];

    let configPath = possiblePaths.find(p => fs.existsSync(p));
    let projectId: string | undefined;
    let databaseId: string | undefined;

    if (configPath) {
      console.log(`Found firebase-applet-config.json at: ${configPath}`);
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      projectId = config.projectId;
      databaseId = config.firestoreDatabaseId;
    } else {
      console.warn('firebase-applet-config.json not found in any standard path. Falling back to environment variables.');
      projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
    }

    if (projectId) {
      let adminApp;
      if (getApps().length === 0) {
        adminApp = initializeApp({ projectId });
      } else {
        adminApp = getApp();
      }
      cachedDb = getFirestore(adminApp, databaseId || '(default)');
      console.log(`Firebase Admin Firestore lazily initialized successfully with project: ${projectId}, database: ${databaseId || '(default)'}`);
      return cachedDb;
    } else {
      console.warn('No project ID found for Firestore initialization.');
      return null;
    }
  } catch (error) {
    console.error('Failed to lazily initialize Firestore with firebase-admin:', error);
    return null;
  }
}

// Transparent Proxy to allow import { db } from './server/firestore'
// while performing lazy initialization and handling missing db instances gracefully.
const db = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    const instance = getDbInstance();
    if (!instance) {
      throw new Error("Firestore Admin SDK is not initialized. Database service unavailable.");
    }
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export { db };
