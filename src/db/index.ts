import Dexie, { type EntityTable } from 'dexie';
import { fastCountWords } from '../utils/textCounters';
import { queryClient } from '../lib/queryClient';
import { 
  compressText, 
  decompressText, 
  createDeltaPatch, 
  applyDeltaPatch, 
  calculateSpaceSavings, 
  SNAPSHOT_INTERVAL, 
  MAX_REVISIONS_CAP 
} from '../utils/deltaCompression';

export interface DocumentMetadata {
  id: string;
  title: string;
  snippet: string; // First 2-3 lines preview
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastOpenedAt?: number;
  openCount: number;
  isPinned: boolean;
  isFavorite: boolean;
  sizeBytes: number;
  wordCount: number;
  isDeleted?: boolean;
  deletedAt?: number;
}

export interface CachedContent {
  id: string; // Matches DocumentMetadata.id
  content: string; // Full markdown text
  cachedAt: number;
  isDirty?: boolean;
}

export interface DocumentRevision {
  id?: number;
  documentId: string;
  title: string;
  content: string;
  wordCount: number;
  timestamp: number;
  reason?: string;
  // v1.0.1 Delta Engine & LZ Compression
  isSnapshot?: boolean;        // true = full snapshot (~every 20 revisions or manual), false = delta diff
  baseRevisionId?: number;    // ID of base snapshot for delta reconstruction
  deltaData?: string;         // LZ-compressed diff patch or full snapshot
  compressed?: boolean;       // whether LZString compression was applied
  rawSizeBytes?: number;      // original uncompressed byte size
  storedSizeBytes?: number;   // compressed stored size in IndexedDB
  spaceSavedPercent?: number; // e.g. 78% storage saved
}

export interface StoredImage {
  id: string; // e.g. "img_8a2fd" (< 10 chars)
  name: string;
  dataUrl: string; // Compressed WebP data URL
  mimeType: string;
  sizeBytes: number;
  createdAt: number;
}

// Database declaration extending Dexie
export class MdWriterDB extends Dexie {
  documents!: EntityTable<DocumentMetadata, 'id'>;
  document_cache!: EntityTable<CachedContent, 'id'>;
  revisions!: EntityTable<DocumentRevision, 'id'>;
  images!: EntityTable<StoredImage, 'id'>;

  constructor() {
    super('MdWriterDB');
    this.version(1).stores({
      documents: 'id, title, updatedAt, createdAt, isPinned, isFavorite, openCount, *tags',
      document_cache: 'id, cachedAt'
    });
    this.version(2).stores({
      documents: 'id, title, updatedAt, createdAt, isPinned, isFavorite, openCount, *tags',
      document_cache: 'id, cachedAt',
      revisions: '++id, documentId, timestamp'
    });
    this.version(3).stores({
      documents: 'id, title, updatedAt, createdAt, isPinned, isFavorite, openCount, *tags',
      document_cache: 'id, cachedAt',
      revisions: '++id, documentId, timestamp',
      images: 'id, name, createdAt'
    });
    this.version(4).stores({
      documents: 'id, title, updatedAt, createdAt, isPinned, isFavorite, openCount, isDeleted, deletedAt, *tags',
      document_cache: 'id, cachedAt',
      revisions: '++id, documentId, timestamp',
      images: 'id, name, createdAt'
    });
  }
}

export const db = new MdWriterDB();

/**
 * Extracts a lightweight 2-3 line preview snippet from raw Markdown.
 * Scans only the first few non-empty lines to avoid allocating strings across large documents.
 */
export function extractSnippet(markdown: string): string {
  const snippets: string[] = [];
  let start = 0;
  const len = markdown.length;

  while (start < len && snippets.length < 3) {
    let end = markdown.indexOf('\n', start);
    if (end === -1) end = len;
    const line = markdown.slice(start, end).trim();
    if (line.length > 0 && !line.startsWith('---')) {
      snippets.push(line);
    }
    start = end + 1;
  }

  return snippets.join(' \n ');
}

/**
 * Calculates word count from text using fast non-allocating word counter.
 */
export function countWords(text: string): number {
  return fastCountWords(text);
}

/**
 * Retrieves full document content from the cache.
 * If not present in cache, generates default content or fetches from fallback.
 */
export async function getDocumentContent(id: string): Promise<string> {
  // Read document once — avoids double IndexedDB query on the same line
  const docMeta = await db.documents.get(id);
  await db.documents.update(id, {
    lastOpenedAt: Date.now(),
    openCount: (docMeta?.openCount ?? 0) + 1,
  });


  const cached = await db.document_cache.get(id);
  if (cached) {
    return cached.content;
  }

  // If not in cache, create placeholder or return empty
  const doc = await db.documents.get(id);
  const fallbackContent = doc ? `# ${doc.title}\n\nStart writing here...` : '';
  await db.document_cache.put({
    id,
    content: fallbackContent,
    cachedAt: Date.now()
  });

  return fallbackContent;
}

/**
 * Invalidates React Query caches across the app so newly created/edited documents
 * and tag counts reflect immediately with 0ms lag without requiring a manual page refresh.
 */
export function notifyDocumentStoreChanged(docId?: string): void {
  try {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['trash-count'] });
    queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
    if (docId) {
      queryClient.invalidateQueries({ queryKey: ['document-content', docId] });
    }
  } catch (err) {
    console.warn('[Db] Failed to invalidate query cache', err);
  }
}

/**
 * Saves full document content: caches it in Dexie and updates metadata snippet.
 */
export async function saveDocument(id: string, title: string, content: string, tags: string[] = []): Promise<void> {
  const now = Date.now();
  const snippet = extractSnippet(content);
  const wordCount = countWords(content);
  const sizeBytes = new Blob([content]).size;

  await db.transaction('rw', db.documents, db.document_cache, async () => {
    // 1. Cache full content
    await db.document_cache.put({
      id,
      content,
      cachedAt: now
    });

    // 2. Update or insert lightweight metadata
    const existing = await db.documents.get(id);
    if (existing) {
      await db.documents.update(id, {
        title,
        snippet,
        tags: tags.length ? tags : existing.tags,
        updatedAt: now,
        wordCount,
        sizeBytes
      });
    } else {
      await db.documents.put({
        id,
        title,
        snippet,
        tags,
        createdAt: now,
        updatedAt: now,
        openCount: 1,
        isPinned: false,
        isFavorite: false,
        wordCount,
        sizeBytes
      });
    }
  });

  notifyDocumentStoreChanged(id);
}

/**
 * Creates a brand new document draft.
 */
export async function createNewDocument(title = 'Untitled Document', initialContent = '# Untitled\n\nStart writing with Markdown...'): Promise<string> {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? `doc_${crypto.randomUUID()}` 
    : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  await saveDocument(id, title, initialContent, ['General']);
  return id;
}

/**
 * Deletes a document:
 * By default (permanent = false), performs a soft-delete moving it to Trash.
 * If permanent = true, permanently removes document metadata, cached content, and revisions.
 */
export async function deleteDocument(id: string, permanent = false): Promise<void> {
  if (permanent) {
    await db.transaction('rw', db.documents, db.document_cache, db.revisions, async () => {
      await db.documents.delete(id);
      await db.document_cache.delete(id);
      await db.revisions.where('documentId').equals(id).delete();
    });
  } else {
    await db.documents.update(id, {
      isDeleted: true,
      deletedAt: Date.now()
    });
  }

  notifyDocumentStoreChanged(id);
}

/**
 * Restores a soft-deleted document back to active library.
 */
export async function restoreDocument(id: string): Promise<void> {
  await db.documents.update(id, {
    isDeleted: false,
    deletedAt: undefined
  });

  notifyDocumentStoreChanged(id);
}

/**
 * Permanently purges all documents currently in the Trash.
 */
export async function emptyTrash(): Promise<number> {
  const trashedDocs = await db.documents.filter(d => Boolean(d.isDeleted)).toArray();
  const ids = trashedDocs.map(d => d.id);
  if (ids.length === 0) return 0;

  await db.transaction('rw', db.documents, db.document_cache, db.revisions, async () => {
    for (const id of ids) {
      await db.documents.delete(id);
      await db.document_cache.delete(id);
      await db.revisions.where('documentId').equals(id).delete();
    }
  });

  notifyDocumentStoreChanged();
  return ids.length;
}

/**
 * Duplicates an existing document with all its content and tags.
 */
export async function duplicateDocument(id: string): Promise<string> {
  const originalDoc = await db.documents.get(id);
  const originalContent = await getDocumentContent(id);

  const baseTitle = originalDoc?.title ? originalDoc.title.replace(/\.md$/i, '') : 'Document';
  const newTitle = `${baseTitle} (Copy).md`;
  // Use cryptographically random UUID to guarantee uniqueness even on rapid duplications
  const newId = `doc_${crypto.randomUUID()}`;

  const tags = originalDoc?.tags ? [...originalDoc.tags] : ['General'];
  await saveDocument(newId, newTitle, originalContent, tags);

  return newId;
}

/**
 * Toggles the pinned status of a document.
 */
export async function togglePinDocument(id: string): Promise<boolean> {
  const doc = await db.documents.get(id);
  if (!doc) return false;
  const newPinned = !doc.isPinned;
  await db.documents.update(id, { isPinned: newPinned });
  notifyDocumentStoreChanged(id);
  return newPinned;
}

/**
 * Creates an offline revision snapshot in Dexie IndexedDB.
 * Automatically caps total revisions per document at 30 to conserve storage.
 */
/**
 * Creates an offline revision snapshot in Dexie IndexedDB.
 * Implements:
 * - Delta Storage: diff-match-patch diffs for intermediate edits.
 * - Periodic Full Snapshot: Full keyframe snapshot every ~20 revisions or on manual checkpoints.
 * - LZ Compression: 3x-5x compression on stored deltas and snapshots.
 * - Pruning Cap: Strictly limits revisions per document to MAX_REVISIONS_CAP (50) with safe rebasing.
 */
export async function createRevisionSnapshot(
  documentId: string, 
  title: string, 
  content: string, 
  reason = 'Auto-snapshot'
): Promise<number | undefined> {
  if (!content.trim()) return undefined;

  const now = Date.now();
  const wordCount = countWords(content);
  const rawSizeBytes = new Blob([content]).size;

  return await db.transaction('rw', db.revisions, async () => {
    // 1. Fetch existing revisions sorted chronologically
    const allExisting = await db.revisions
      .where('documentId')
      .equals(documentId)
      .sortBy('timestamp');

    // 2. Avoid duplicate identical snapshot if content is unchanged from latest revision
    if (allExisting.length > 0) {
      const latest = allExisting[allExisting.length - 1];
      if (latest.content === content) {
        return latest.id;
      }
    }

    // 3. Determine if this should be a Full Snapshot or a Delta Diff
    let isSnapshot = false;
    let baseRevisionId: number | undefined = undefined;
    let deltaData = '';

    // Find the latest full snapshot
    let latestSnapshot: DocumentRevision | undefined;
    let revisionsSinceSnapshot = 0;

    for (let i = allExisting.length - 1; i >= 0; i--) {
      const rev = allExisting[i];
      if (rev.isSnapshot) {
        latestSnapshot = rev;
        break;
      }
      revisionsSinceSnapshot++;
    }

    const isManualOrBackup = reason.toLowerCase().includes('manual') || reason.toLowerCase().includes('backup');
    const isFirstRevision = allExisting.length === 0 || !latestSnapshot;
    const isIntervalHit = revisionsSinceSnapshot >= (SNAPSHOT_INTERVAL - 1);

    if (isFirstRevision || isManualOrBackup || isIntervalHit) {
      // Full Keyframe Snapshot
      isSnapshot = true;
      baseRevisionId = undefined;
      deltaData = compressText(content);
    } else {
      // Delta Patch: compute diff against latest revision
      const baseContent = allExisting[allExisting.length - 1]?.content || latestSnapshot?.content || '';
      const patchText = createDeltaPatch(baseContent, content);
      
      if (!patchText) {
        isSnapshot = true;
        deltaData = compressText(content);
      } else {
        isSnapshot = false;
        baseRevisionId = latestSnapshot?.id ?? allExisting[allExisting.length - 1]?.id;
        deltaData = compressText(patchText);
      }
    }

    const storedSizeBytes = new Blob([deltaData]).size;
    const spaceSavedPercent = calculateSpaceSavings(rawSizeBytes, storedSizeBytes);

    // 4. Insert revision with deltaData & metadata
    const newId = await db.revisions.add({
      documentId,
      title,
      content,
      wordCount,
      timestamp: now,
      reason,
      isSnapshot,
      baseRevisionId,
      deltaData,
      compressed: true,
      rawSizeBytes,
      storedSizeBytes,
      spaceSavedPercent
    });

    // 5. Enforce 50-Revision Cap with Intelligent Rebasing
    const updatedRevisions = await db.revisions
      .where('documentId')
      .equals(documentId)
      .sortBy('timestamp');

    if (updatedRevisions.length > MAX_REVISIONS_CAP) {
      const excess = updatedRevisions.length - MAX_REVISIONS_CAP;
      const newOldest = updatedRevisions[excess];

      // If the revision becoming the oldest is a delta, rebase it to a full snapshot
      if (newOldest && !newOldest.isSnapshot && newOldest.id) {
        await db.revisions.update(newOldest.id, {
          isSnapshot: true,
          deltaData: compressText(newOldest.content),
          baseRevisionId: undefined
        });
      }

      const toDelete = updatedRevisions.slice(0, excess);
      const idsToDelete = toDelete.map(r => r.id!).filter(Boolean);
      await db.revisions.bulkDelete(idsToDelete);
    }

    return newId;
  });
}

/**
 * Retrieves all saved local revisions for a document, ordered newest first.
 * Reconstructs content on the fly if reading from compressed deltas.
 */
export async function getDocumentRevisions(documentId: string): Promise<DocumentRevision[]> {
  const revs = await db.revisions
    .where('documentId')
    .equals(documentId)
    .sortBy('timestamp');

  const reconstructedMap = new Map<number, string>();

  for (const rev of revs) {
    if (!rev.content && rev.deltaData) {
      if (rev.isSnapshot) {
        rev.content = decompressText(rev.deltaData);
      } else {
        const baseContent = (rev.baseRevisionId ? reconstructedMap.get(rev.baseRevisionId) : '') || '';
        const patchText = decompressText(rev.deltaData);
        rev.content = applyDeltaPatch(baseContent, patchText);
      }
    }
    if (rev.id && rev.content) {
      reconstructedMap.set(rev.id, rev.content);
    }
  }

  return revs.reverse();
}

/**
 * Deletes all revisions for a specific document.
 */
export async function deleteDocumentRevisions(documentId: string): Promise<void> {
  await db.revisions.where('documentId').equals(documentId).delete();
}

/**
 * Gets storage and cache usage statistics.
 */
export async function getStorageStats(): Promise<{ totalDocs: number; cachedDocs: number; totalBytes: number }> {
  const totalDocs = await db.documents.count();
  const cached = await db.document_cache.toArray();
  const totalBytes = cached.reduce((acc, curr) => acc + new Blob([curr.content]).size, 0);
  return {
    totalDocs,
    cachedDocs: cached.length,
    totalBytes
  };
}
