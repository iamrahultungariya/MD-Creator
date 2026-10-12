import { db, DocumentMetadata } from '../db';

export interface SearchMatchHighlight {
  document: DocumentMetadata;
  matchedField: 'title' | 'tag' | 'content';
  excerpt?: string;
}

/**
 * High-performance full-text search across all documents.
 * Scans title, tags, and cached full markdown body without blocking the main UI thread.
 */
export async function searchDocumentsFullText(
  documents: DocumentMetadata[],
  searchQuery: string
): Promise<DocumentMetadata[]> {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return documents;

  const directMatches = new Map<string, DocumentMetadata>();
  const toCheckContent: DocumentMetadata[] = [];

  // Pass 1: Fast metadata checks (title, snippet, tags)
  for (const doc of documents) {
    const titleMatch = doc.title.toLowerCase().includes(q);
    const snippetMatch = doc.snippet.toLowerCase().includes(q);
    const tagMatch = doc.tags.some((t) => t.toLowerCase().includes(q));

    if (titleMatch || snippetMatch || tagMatch) {
      directMatches.set(doc.id, doc);
    } else {
      toCheckContent.push(doc);
    }
  }

  // Pass 2: Deep content scan in Dexie document_cache for remaining documents
  if (toCheckContent.length > 0) {
    const ids = toCheckContent.map((d) => d.id);
    const cachedEntries = await db.document_cache.where('id').anyOf(ids).toArray();
    const cacheMap = new Map(cachedEntries.map((c) => [c.id, c.content]));

    for (const doc of toCheckContent) {
      const content = cacheMap.get(doc.id);
      if (content) {
        const lowerContent = content.toLowerCase();
        const matchIndex = lowerContent.indexOf(q);

        if (matchIndex !== -1) {
          // Extract a 120-character contextual snippet surrounding the match
          const start = Math.max(0, matchIndex - 40);
          const end = Math.min(content.length, matchIndex + q.length + 80);
          const rawExcerpt = content.slice(start, end).replace(/[\r\n\t]+/g, ' ').trim();
          const cleanSnippet = `${start > 0 ? '...' : ''}${rawExcerpt}${end < content.length ? '...' : ''}`;

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
