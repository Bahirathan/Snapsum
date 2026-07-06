import { db } from './firestore';

export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  userId: string;
  workspaceId: string;
  text: string;
  embedding: number[];
  pageNumber?: number;
  heading?: string;
  slideNumber?: number;
  timestamp?: string;
  metadata?: any;
}

export interface IndexedDocument {
  documentId: string;
  userId: string;
  workspaceId: string;
  title: string;
  sourceType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'markdown' | 'url' | 'youtube';
  sourceUrl?: string;
  indexedAt: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  suggestions?: string[];
}

// In-memory cache for ultra-fast, zero-read searches (saves Firestore read quota)
const memoryChunks: Record<string, DocumentChunk[]> = {};
const memoryDocuments: Record<string, IndexedDocument[]> = {};

// Active indexing progress tracking
export const indexingProgress: Record<string, { progress: number; status: string; error?: string }> = {};

// Cosine similarity helper
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Ensure chunks are loaded from Firestore into memory for rapid search
async function ensureChunksLoaded(userId: string, workspaceId: string): Promise<void> {
  const cacheKey = `${userId}_${workspaceId}`;
  if (memoryChunks[cacheKey]) {
    return;
  }

  memoryChunks[cacheKey] = [];
  if (!db) return;

  try {
    const snapshot = await db.collection('document_chunks')
      .where('userId', '==', userId)
      .where('workspaceId', '==', workspaceId)
      .get();

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      memoryChunks[cacheKey].push({
        chunkId: docSnap.id,
        documentId: data.documentId,
        userId: data.userId,
        workspaceId: data.workspaceId,
        text: data.text,
        embedding: data.embedding,
        pageNumber: data.pageNumber,
        heading: data.heading,
        slideNumber: data.slideNumber,
        timestamp: data.timestamp,
        metadata: data.metadata,
      });
    });
    console.log(`[VectorDb] Loaded ${memoryChunks[cacheKey].length} chunks from Firestore for user: ${userId}, workspace: ${workspaceId}`);
  } catch (err) {
    console.error('[VectorDb] Error loading chunks from Firestore:', err);
  }
}

// Ensure documents are loaded from Firestore into memory
async function ensureDocumentsLoaded(userId: string, workspaceId: string): Promise<void> {
  const cacheKey = `${userId}_${workspaceId}`;
  if (memoryDocuments[cacheKey]) {
    return;
  }

  memoryDocuments[cacheKey] = [];
  if (!db) return;

  try {
    const snapshot = await db.collection('documents')
      .where('userId', '==', userId)
      .where('workspaceId', '==', workspaceId)
      .get();

    snapshot.forEach(docSnap => {
      memoryDocuments[cacheKey].push(docSnap.data() as IndexedDocument);
    });
    console.log(`[VectorDb] Loaded ${memoryDocuments[cacheKey].length} documents from Firestore for user: ${userId}, workspace: ${workspaceId}`);
  } catch (err) {
    console.error('[VectorDb] Error loading documents from Firestore:', err);
  }
}

// Get all indexed documents for a specific user and workspace
export async function getDocuments(userId: string, workspaceId: string): Promise<IndexedDocument[]> {
  await ensureDocumentsLoaded(userId, workspaceId);
  const cacheKey = `${userId}_${workspaceId}`;
  const localDocs = memoryDocuments[cacheKey] || [];
  
  // Merge active indexing documents
  const activeDocs: IndexedDocument[] = [];
  for (const [docId, state] of Object.entries(indexingProgress)) {
    // We assume docId stores composite key or we query by tracking in progress
    // Let's filter progress items belonging to this user
    if (docId.startsWith(`${userId}_${workspaceId}_`)) {
      const parts = docId.split('_');
      const realDocId = parts.slice(2).join('_');
      
      const exists = localDocs.some(d => d.documentId === realDocId);
      if (!exists) {
        // Find title if saved in the status
        const titleMatch = state.status.match(/"([^"]+)"/);
        activeDocs.push({
          documentId: realDocId,
          userId,
          workspaceId,
          title: titleMatch ? titleMatch[1] : 'Processing File...',
          sourceType: 'pdf', // default placeholder
          indexedAt: new Date().toISOString(),
          status: state.status.includes('failed') ? 'failed' : 'processing' as any,
          progress: state.progress,
        });
      }
    }
  }

  return [...localDocs, ...activeDocs];
}

// Save document metadata
export async function saveDocument(doc: IndexedDocument): Promise<void> {
  const cacheKey = `${doc.userId}_${doc.workspaceId}`;
  await ensureDocumentsLoaded(doc.userId, doc.workspaceId);

  // Update memory
  const docs = memoryDocuments[cacheKey] || [];
  const idx = docs.findIndex(d => d.documentId === doc.documentId);
  if (idx > -1) {
    docs[idx] = doc;
  } else {
    docs.push(doc);
  }
  memoryDocuments[cacheKey] = docs;

  // Save to Firestore
  if (db) {
    try {
      await db.collection('documents').doc(doc.documentId).set(doc, { merge: true });
    } catch (err) {
      console.error('[VectorDb] Error saving document to Firestore:', err);
    }
  }
}

// Save document chunk
export async function saveDocumentChunk(chunk: DocumentChunk): Promise<void> {
  const cacheKey = `${chunk.userId}_${chunk.workspaceId}`;
  await ensureChunksLoaded(chunk.userId, chunk.workspaceId);

  // Update memory
  if (!memoryChunks[cacheKey]) {
    memoryChunks[cacheKey] = [];
  }
  memoryChunks[cacheKey].push(chunk);

  // Save to Firestore
  if (db) {
    try {
      await db.collection('document_chunks').doc(chunk.chunkId).set(chunk, { merge: true });
    } catch (err) {
      console.error('[VectorDb] Error saving chunk to Firestore:', err);
    }
  }
}

// Delete document and all of its chunks (to allow clean re-indexing/updates)
export async function deleteDocument(userId: string, workspaceId: string, documentId: string): Promise<void> {
  const cacheKey = `${userId}_${workspaceId}`;
  
  // 1. Clear documents memory cache
  await ensureDocumentsLoaded(userId, workspaceId);
  if (memoryDocuments[cacheKey]) {
    memoryDocuments[cacheKey] = memoryDocuments[cacheKey].filter(d => d.documentId !== documentId);
  }

  // 2. Clear chunks memory cache
  await ensureChunksLoaded(userId, workspaceId);
  if (memoryChunks[cacheKey]) {
    memoryChunks[cacheKey] = memoryChunks[cacheKey].filter(c => c.documentId !== documentId);
  }

  // 3. Delete from Firestore
  if (db) {
    try {
      await db.collection('documents').doc(documentId).delete();
      
      const chunkSnapshot = await db.collection('document_chunks')
        .where('documentId', '==', documentId)
        .get();

      const batch = db.batch();
      chunkSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`[VectorDb] Fully purged document ${documentId} and its ${chunkSnapshot.size} chunks.`);
    } catch (err) {
      console.error('[VectorDb] Failed to purge document from Firestore:', err);
    }
  }
}

// Check if document is already indexed and get its chunks if so (avoids duplicate embeddings)
export async function getExistingDocumentChunks(userId: string, workspaceId: string, title: string): Promise<DocumentChunk[] | null> {
  const cacheKey = `${userId}_${workspaceId}`;
  await ensureDocumentsLoaded(userId, workspaceId);
  await ensureChunksLoaded(userId, workspaceId);

  const docs = memoryDocuments[cacheKey] || [];
  const foundDoc = docs.find(d => d.title.trim().toLowerCase() === title.trim().toLowerCase() && d.status === 'completed');
  if (foundDoc) {
    const chunks = memoryChunks[cacheKey] || [];
    const docChunks = chunks.filter(c => c.documentId === foundDoc.documentId);
    if (docChunks.length > 0) {
      console.log(`[VectorDb] Cache HIT: Found existing completed document "${title}" with ${docChunks.length} chunks. Avoiding duplication.`);
      return docChunks;
    }
  }
  return null;
}

// Semantic RAG retrieval: Search top-K chunks for a specific workspace/user
export async function searchVectorStore(
  userId: string,
  workspaceId: string,
  queryEmbedding: number[],
  topK: number = 5,
  targetDocumentId?: string
): Promise<(DocumentChunk & { similarity: number })[]> {
  const cacheKey = `${userId}_${workspaceId}`;
  await ensureChunksLoaded(userId, workspaceId);

  let chunks = memoryChunks[cacheKey] || [];
  if (targetDocumentId) {
    chunks = chunks.filter(c => c.documentId === targetDocumentId);
  }

  const results = chunks.map(chunk => {
    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    return { ...chunk, similarity };
  });

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}
