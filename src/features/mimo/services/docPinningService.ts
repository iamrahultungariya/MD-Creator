import { db, DocumentMetadata, getDocumentContent } from '../../../db';
import { PinnedDocReference } from '../types/mimoTypes';

/**
 * Searches and lists candidate documents from local IndexedDB (Dexie)
 * that can be pinned as reference context for Mimo.
 * 
 * Rules:
 * - Excludes currently open document (`currentDocId`)
 * - Excludes soft-deleted documents (`isDeleted`)
 * - Excludes AI-shielded documents (`isAiExcluded`)
 */
export async function searchAvailableReferenceDocs(
  currentDocId: string,
  searchQuery = ''
): Promise<DocumentMetadata[]> {
  try {
    const allDocs = await db.documents.toArray();
    const q = searchQuery.trim().toLowerCase();

    const filtered = allDocs.filter((doc) => {
      if (doc.id === currentDocId) return false;
      if (doc.isDeleted) return false;
      if (doc.isAiExcluded) return false;

      if (!q) return true;

      const titleMatch = doc.title.toLowerCase().includes(q);
      const tagMatch = doc.tags?.some((t) => t.toLowerCase().includes(q));
      const snippetMatch = doc.snippet?.toLowerCase().includes(q);

      return titleMatch || tagMatch || snippetMatch;
    });

    // Sort by most recently updated
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    return filtered.slice(0, 15);
  } catch (err) {
    console.error('[docPinningService] Failed to search reference documents:', err);
    return [];
  }
}

/**
 * Extracts H1-H3 headings from markdown content without heavy AST dependencies.
 */
function extractHeadingsOutline(content: string, maxHeadings = 8): string[] {
  const lines = content.split('\n');
  const outline: string[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      outline.push(`${match[1]} ${match[2].trim()}`);
      if (outline.length >= maxHeadings) break;
    }
  }
  return outline;
}

/**
 * Fetches pinned documents by IDs and extracts compact reference representations.
 */
export async function fetchPinnedDocReferences(
  pinnedDocIds: string[]
): Promise<PinnedDocReference[]> {
  if (!pinnedDocIds || pinnedDocIds.length === 0) return [];

  const results: PinnedDocReference[] = [];

  for (const id of pinnedDocIds) {
    try {
      const meta = await db.documents.get(id);
      if (!meta || meta.isDeleted || meta.isAiExcluded) continue;

      let content = '';
      try {
        content = await getDocumentContent(id);
      } catch {
        const cached = await db.document_cache.get(id);
        content = cached?.content || '';
      }

      const outline = extractHeadingsOutline(content);
      // Clean snippet excerpt: first ~400 non-empty characters
      const cleanExcerpt = content
        .replace(/^#+.*$/gm, '') // Remove heading lines
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 450);

      results.push({
        id: meta.id,
        title: meta.title || 'Untitled Document',
        snippet: cleanExcerpt || meta.snippet || '',
        tags: meta.tags || [],
        outline,
        wordCount: meta.wordCount || 0,
        updatedAt: meta.updatedAt,
      });
    } catch (err) {
      console.warn(`[docPinningService] Could not resolve pinned doc "${id}":`, err);
    }
  }

  return results;
}

/**
 * Formats pinned documents into a high-density, token-efficient prompt layer.
 */
export function formatPinnedDocsPromptLayer(pinnedDocs: PinnedDocReference[]): string {
  if (!pinnedDocs || pinnedDocs.length === 0) return '';

  const blocks = pinnedDocs.map((doc, idx) => {
    const tagList = doc.tags.length > 0 ? ` (Tags: ${doc.tags.map((t) => `#${t}`).join(', ')})` : '';
    const outlineBlock =
      doc.outline.length > 0
        ? `Outline:\n${doc.outline.map((h) => `  ${h}`).join('\n')}`
        : 'Outline: (No structural headings)';

    const excerptBlock = doc.snippet
      ? `Key Excerpt:\n"${doc.snippet}${doc.snippet.length >= 440 ? '...' : ''}"`
      : '';

    return `### Reference [${idx + 1}]: "${doc.title}"${tagList}\n${outlineBlock}\n${excerptBlock}`.trim();
  });

  return `[Pinned Workspace References (${pinnedDocs.length} Note${pinnedDocs.length > 1 ? 's' : ''})]
The following reference document(s) from the user's workspace are pinned to this session.
Integrate facts, definitions, requirements, constraints, and context from these documents whenever relevant.

${blocks.join('\n\n')}`;
}
