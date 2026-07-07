import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, updateDoc,
  where, limit, deleteDoc, writeBatch
} from 'firebase/firestore';
import admin from 'firebase-admin';
import { getApps, initializeApp as initAdminApp, getApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getDirname = () => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) {
      return __dirname;
    }
    const meta = typeof import.meta !== 'undefined' ? import.meta : null;
    if (meta && meta.url) {
      return path.dirname(fileURLToPath(meta.url));
    }
  } catch (e) {
    // safe fallback
  }
  return process.cwd();
};

const __dirname = getDirname();

class ClientFirestoreAdapter {
  public _projectId: string;
  constructor(private dbInstance: any, projectId: string) {
    this._projectId = projectId;
  }

  collection(collectionName: string) {
    return new CollectionRefAdapter(this.dbInstance, collectionName);
  }

  batch() {
    return new WriteBatchAdapter(this.dbInstance);
  }
}

class CollectionRefAdapter {
  constructor(private dbInstance: any, private pathStr: string) {}

  doc(docId: string) {
    return new DocumentRefAdapter(this.dbInstance, `${this.pathStr}/${docId}`);
  }

  async add(data: any) {
    const colRef = collection(this.dbInstance, this.pathStr);
    const docRef = await addDoc(colRef, data);
    return new DocumentRefAdapter(this.dbInstance, `${this.pathStr}/${docRef.id}`);
  }

  where(field: string, op: string, value: any) {
    const q = new QueryRefAdapter(this.dbInstance, this.pathStr);
    return q.where(field, op, value);
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    const q = new QueryRefAdapter(this.dbInstance, this.pathStr);
    return q.orderBy(field, direction);
  }

  limit(n: number) {
    const q = new QueryRefAdapter(this.dbInstance, this.pathStr);
    return q.limit(n);
  }

  async get() {
    const colRef = collection(this.dbInstance, this.pathStr);
    const snapshot = await getDocs(colRef);
    return new QuerySnapshotAdapter(snapshot);
  }
}

class DocumentRefAdapter {
  constructor(private dbInstance: any, private docPath: string) {}

  getDocPath() {
    return this.docPath;
  }

  async get() {
    const pathParts = this.docPath.split('/');
    const docRef = doc(this.dbInstance, pathParts[0], ...pathParts.slice(1));
    const snap = await getDoc(docRef);
    return new DocumentSnapshotAdapter(snap);
  }

  async set(data: any, options?: { merge?: boolean }) {
    const pathParts = this.docPath.split('/');
    const docRef = doc(this.dbInstance, pathParts[0], ...pathParts.slice(1));
    await setDoc(docRef, data, { merge: options?.merge ?? false });
    return this;
  }

  async update(data: any) {
    const pathParts = this.docPath.split('/');
    const docRef = doc(this.dbInstance, pathParts[0], ...pathParts.slice(1));
    await updateDoc(docRef, data);
    return this;
  }

  async delete() {
    const pathParts = this.docPath.split('/');
    const docRef = doc(this.dbInstance, pathParts[0], ...pathParts.slice(1));
    await deleteDoc(docRef);
    return this;
  }
}

class QueryRefAdapter {
  private constraints: any[] = [];

  constructor(private dbInstance: any, private pathStr: string) {}

  where(field: string, op: string, value: any) {
    this.constraints.push(where(field, op as any, value));
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.constraints.push(orderBy(field, direction));
    return this;
  }

  limit(n: number) {
    this.constraints.push(limit(n));
    return this;
  }

  async get() {
    const colRef = collection(this.dbInstance, this.pathStr);
    const q = query(colRef, ...this.constraints);
    const snapshot = await getDocs(q);
    return new QuerySnapshotAdapter(snapshot);
  }
}

class WriteBatchAdapter {
  private batchInstance: any;

  constructor(private dbInstance: any) {
    this.batchInstance = writeBatch(dbInstance);
  }

  delete(docRefAdapter: DocumentRefAdapter) {
    const pathParts = docRefAdapter.getDocPath().split('/');
    const docRef = doc(this.dbInstance, pathParts[0], ...pathParts.slice(1));
    this.batchInstance.delete(docRef);
    return this;
  }

  set(docRefAdapter: DocumentRefAdapter, data: any, options?: { merge?: boolean }) {
    const pathParts = docRefAdapter.getDocPath().split('/');
    const docRef = doc(this.dbInstance, pathParts[0], ...pathParts.slice(1));
    this.batchInstance.set(docRef, data, options);
    return this;
  }

  update(docRefAdapter: DocumentRefAdapter, data: any) {
    const pathParts = docRefAdapter.getDocPath().split('/');
    const docRef = doc(this.dbInstance, pathParts[0], ...pathParts.slice(1));
    this.batchInstance.update(docRef, data);
    return this;
  }

  async commit() {
    await this.batchInstance.commit();
  }
}

class QuerySnapshotAdapter {
  constructor(private snapshot: any) {}

  get size() {
    return this.snapshot.size;
  }

  get empty() {
    return this.snapshot.empty;
  }

  get docs() {
    return (this.snapshot.docs || []).map((docSnap: any) => new DocumentSnapshotAdapter(docSnap));
  }

  forEach(callback: (doc: DocumentSnapshotAdapter) => void) {
    this.snapshot.forEach((docSnap: any) => {
      callback(new DocumentSnapshotAdapter(docSnap));
    });
  }
}

class DocumentSnapshotAdapter {
  constructor(private docSnap: any) {}

  get id() {
    return this.docSnap.id;
  }

  get exists() {
    return this.docSnap.exists();
  }

  get ref() {
    return new DocumentRefAdapter(this.docSnap.ref.firestore, this.docSnap.ref.path);
  }

  data() {
    return this.docSnap.data();
  }
}

let cachedDb: any = null;
let initError: any = null;

function getDbInstance() {
  if (cachedDb) return cachedDb;
  if (initError) throw initError;

  try {
    const possiblePaths = [
      path.join(__dirname, '..', 'firebase-applet-config.json'),
      path.join(process.cwd(), 'firebase-applet-config.json'),
      path.join(process.cwd(), 'applet', 'firebase-applet-config.json'),
    ];

    const configPath = possiblePaths.find(p => fs.existsSync(p));
    if (!configPath) {
      throw new Error('firebase-applet-config.json not found in any standard path.');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Try initializing via Firebase Admin SDK (bypasses security rules server-side)
    try {
      if (getApps().length === 0) {
        initAdminApp({
          projectId: config.projectId,
        });
      }
      const adminDb = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
        ? getAdminFirestore(getApp(), config.firestoreDatabaseId)
        : getAdminFirestore();
      
      cachedDb = adminDb;
      console.log(`Firebase Admin SDK initialized successfully on backend with project: ${config.projectId}, database: ${config.firestoreDatabaseId || '(default)'}`);
      return cachedDb;
    } catch (adminErr) {
      console.warn('Firebase Admin SDK initialization failed, falling back to Client SDK:', adminErr);
    }

    const app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });

    const clientDb = getFirestore(app, config.firestoreDatabaseId || '(default)');
    cachedDb = new ClientFirestoreAdapter(clientDb, config.projectId);
    console.log(`Firebase Client SDK initialized on backend with project: ${config.projectId}`);
    return cachedDb;
  } catch (error: any) {
    console.error('Failed to initialize Firestore on backend:', error);
    initError = error;
    throw error;
  }
}

// Transparent Proxy to allow import { db } from './server/firestore'
// while performing lazy initialization and handling missing db instances gracefully.
const db = new Proxy({} as any, {
  get(target, prop, receiver) {
    const instance = getDbInstance();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export { db };
