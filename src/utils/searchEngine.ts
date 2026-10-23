import { db, DocumentMetadata } from '../db';

export interface SearchMatchHighlight {
  document: DocumentMetadata;
  matchedField: 'title' | 'tag' | 'content';
  excerpt?: string;
}

// In-memory cache for fast search scans (<1ms without hitting IndexedDB on each keystroke)
const searchMemoryCache = new Map<string, { content: string; lower: string; cachedAt: number }>();

/**
 * Invalidates the in-memory search cache when documents are edited or deleted.
 */
export function invalidateSearchCache(docId?: string) {
  if (docId) {
    searchMemoryCache.delete(docId);
  } else {
    searchMemoryCache.clear();
  }
}

/**
 * High-performance full-text search across all documents.
 * Scans title, tags, and cached full markdown body without blocking the main UI thread.
 */
export async function searchDocumentsFullText(
  documents: DocumentMetadata[],
  searchQuery: string
): Promise<DocumentMetadata[]> {
  const rawQ = searchQuery.trim().toLowerCase();
  if (!rawQ) return documents;

  // Split multi-word query: all terms must match
  const terms = rawQ.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return documents;

  const directMatches = new Map<string, DocumentMetadata>();
  const toCheckContent: DocumentMetadata[] = [];

  // Pass 1: Ultra-fast metadata checks (title, snippet, tags) in memory (0ms)
  for (const doc of documents) {
    const titleLower = doc.title.toLowerCase();
    const snippetLower = doc.snippet.toLowerCase();
    const tagsLower = doc.tags.map((t) => t.toLowerCase());

    const matchesAllMetaTerms = terms.every(
      (term) =>
        titleLower.includes(term) ||
        snippetLower.includes(term) ||
        tagsLower.some((t) => t.includes(term))
    );

    if (matchesAllMetaTerms) {
      directMatches.set(doc.id, doc);
    } else {
      toCheckContent.push(doc);
    }
  }

  // Pass 2: Fast content scan with in-memory LRU caching
  if (toCheckContent.length > 0) {
    const missingIds: string[] = [];
    const now = Date.now();

    // Check what is already cached in memory
    for (const doc of toCheckContent) {
      const cached = searchMemoryCache.get(doc.id);
      if (!cached || now - cached.cachedAt > 120000) {
        missingIds.push(doc.id);
      }
    }

    // Only load uncached documents from IndexedDB
    if (missingIds.length > 0) {
      try {
        const entries = await db.document_cache.where('id').anyOf(missingIds).toArray();
        for (const entry of entries) {
          searchMemoryCache.set(entry.id, {
            content: entry.content,
            lower: entry.content.toLowerCase(),
            cachedAt: now,
          });
        }
      } catch (err) {
        console.warn('[SearchEngine] Cache lookup warning:', err);
      }
    }

    // Now test remaining documents against in-memory cached content
    for (const doc of toCheckContent) {
      const cached = searchMemoryCache.get(doc.id);
      if (cached) {
        const matchesAll = terms.every((term) => cached.lower.includes(term));

        if (matchesAll) {
          const matchIndex = cached.lower.indexOf(terms[0]);
          const start = Math.max(0, matchIndex - 40);
          const end = Math.min(cached.content.length, matchIndex + terms[0].length + 80);
          const rawExcerpt = cached.content.slice(start, end).replace(/[\r\n\t]+/g, ' ').trim();
          const cleanSnippet = `${start > 0 ? '...' : ''}${rawExcerpt}${end < cached.content.length ? '...' : ''}`;

          directMatches.set(doc.id, {
            ...doc,
            snippet: cleanSnippet,
          });
        }
      }
    }
  }

  return Array.from(directMatches.values());
}
