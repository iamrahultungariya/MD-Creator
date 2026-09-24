import Dexie, { type EntityTable } from 'dexie';
import { fastCountWords } from '../utils/textCounters';

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
  // Update lastOpenedAt and openCount in metadata
  await db.documents.update(id, {
    lastOpenedAt: Date.now(),
    openCount: (await db.documents.get(id))?.openCount ? ((await db.documents.get(id))!.openCount + 1) : 1
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
}

/**
 * Restores a soft-deleted document back to active library.
 */
export async function restoreDocument(id: string): Promise<void> {
  await db.documents.update(id, {
    isDeleted: false,
    deletedAt: undefined
  });
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
  const newId = `doc_${Date.now()}_copy`;

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
  return newPinned;
}

/**
 * Creates an offline revision snapshot in Dexie IndexedDB.
 * Automatically caps total revisions per document at 30 to conserve storage.
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

  return await db.transaction('rw', db.revisions, async () => {
    // Avoid creating duplicate identical snapshot if content is identical to the latest revision
    const latest = await db.revisions
      .where('documentId')
      .equals(documentId)
      .reverse()
      .sortBy('timestamp');

    if (latest.length > 0 && latest[0].content === content) {
      return latest[0].id;
    }

    // Insert new snapshot
    const newId = await db.revisions.add({
      documentId,
      title,
      content,
      wordCount,
      timestamp: now,
      reason
    });

    // Prune older revisions if count exceeds 30
    const allRevisions = await db.revisions
      .where('documentId')
      .equals(documentId)
      .sortBy('timestamp');

    if (allRevisions.length > 30) {
      const toDelete = allRevisions.slice(0, allRevisions.length - 30);
      const idsToDelete = toDelete.map(r => r.id!).filter(Boolean);
      await db.revisions.bulkDelete(idsToDelete);
    }

    return newId;
  });
}

/**
 * Retrieves all saved local revisions for a document, ordered newest first.
 */
export async function getDocumentRevisions(documentId: string): Promise<DocumentRevision[]> {
  const revs = await db.revisions
    .where('documentId')
    .equals(documentId)
    .reverse()
    .sortBy('timestamp');
  return revs;
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
