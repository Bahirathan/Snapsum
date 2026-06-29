import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, updateDoc } from 'firebase/firestore';
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

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    return new QueryRefAdapter(this.dbInstance, this.pathStr, [field, direction]);
  }

  async get() {
    const colRef = collection(this.dbInstance, this.pathStr);
    const snapshot = await getDocs(colRef);
    return new QuerySnapshotAdapter(snapshot);
  }
}

class DocumentRefAdapter {
  constructor(private dbInstance: any, private docPath: string) {}

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
}

class QueryRefAdapter {
  constructor(private dbInstance: any, private pathStr: string, private orderRule: [string, 'asc' | 'desc']) {}

  async get() {
    const colRef = collection(this.dbInstance, this.pathStr);
    const q = query(colRef, orderBy(this.orderRule[0], this.orderRule[1]));
    const snapshot = await getDocs(q);
    return new QuerySnapshotAdapter(snapshot);
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
    console.error('Failed to initialize client-side Firestore on backend:', error);
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
