import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  db, 
  DocumentMetadata, 
  getDocumentContent, 
  saveDocument, 
  createNewDocument, 
  deleteDocument, 
  restoreDocument,
  emptyTrash,
  duplicateDocument,
  togglePinDocument, 
  getStorageStats 
} from '../db';
import { 
  pullCloudDocuments, 
  deleteDocumentFromSupabase, 
  syncDocumentToSupabase, 
  syncDocumentPinToSupabase, 
  syncDocumentTrashToSupabase, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { searchDocumentsFullText } from '../utils/searchEngine';

export interface PaginatedDocumentsResult {
  documents: DocumentMetadata[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface UsePaginatedDocumentsOptions {
  searchQuery?: string;
  activeTag?: string;
  showTrash?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Filter and sort helper: extracts filtered, sorted document list from IndexedDB.
 * Uses indexed lookup on *tags when activeTag is specified.
 */
async function getFilteredAndSortedDocuments(
  searchQuery: string,
  activeTag: string,
  showTrash: boolean
): Promise<DocumentMetadata[]> {
  let docs: DocumentMetadata[];

  if (showTrash) {
    docs = await db.documents.filter((doc) => Boolean(doc.isDeleted)).toArray();
    docs.sort((a, b) => (b.deletedAt || b.updatedAt) - (a.deletedAt || a.updatedAt));
    if (searchQuery.trim()) {
      docs = await searchDocumentsFullText(docs, searchQuery);
    }
    return docs;
  }

  // Optimized fetch for active documents:
  // If specific tag is selected, leverage multi-entry index on *tags
  if (activeTag && activeTag !== 'All') {
    docs = await db.documents.where('tags').equals(activeTag).toArray();
    docs = docs.filter((doc) => !doc.isDeleted);
  } else {
    // Fast fetch all non-deleted documents
    docs = await db.documents.filter((doc) => !doc.isDeleted).toArray();
  }

  if (searchQuery.trim()) {
    docs = await searchDocumentsFullText(docs, searchQuery);
  }

  // Pinned first, then sorted by updatedAt descending
  return docs.sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return b.updatedAt - a.updatedAt;
    }
    return a.isPinned ? -1 : 1;
  });
}

/**
 * P0: High-performance paginated document query hook.
 * Slices the filtered/sorted results by page and pageSize.
 * Stale time is set to 30s to eliminate redundant IndexedDB round-trips.
 */
export function usePaginatedDocuments({
  searchQuery = '',
  activeTag = 'All',
  showTrash = false,
  page = 1,
  pageSize = 24,
}: UsePaginatedDocumentsOptions = {}) {
  // Background cloud pull throttled to once per session when Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    pullCloudDocuments().catch(console.warn);
  }, []);

  return useQuery({
    queryKey: ['documents', 'paginated', searchQuery, activeTag, showTrash, page, pageSize],
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<PaginatedDocumentsResult> => {
      const sortedDocs = await getFilteredAndSortedDocuments(searchQuery, activeTag, showTrash);
      const totalCount = sortedDocs.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const startIndex = (safePage - 1) * pageSize;
      const paginatedSlice = sortedDocs.slice(startIndex, startIndex + pageSize);

      return {
        documents: paginatedSlice,
        totalCount,
        totalPages,
        page: safePage,
        pageSize,
      };
    },
  });
}

export function useDocuments(searchQuery = '', activeTag = 'All', showTrash = false) {
  return useQuery({
    queryKey: ['documents', searchQuery, activeTag, showTrash],
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<DocumentMetadata[]> => {
      return await getFilteredAndSortedDocuments(searchQuery, activeTag, showTrash);
    }
  });
}

export function useActiveDocumentCount() {
  return useQuery({
    queryKey: ['active-document-count'],
    staleTime: 30_000,
    queryFn: async () => {
      return await db.documents.filter(d => !d.isDeleted).count();
    }
  });
}

export function useTrashCount() {
  return useQuery({
    queryKey: ['trash-count'],
    staleTime: 30_000,
    queryFn: async () => {
      return await db.documents.filter(d => Boolean(d.isDeleted)).count();
    }
  });
}

export function useAllDocumentTags() {
  return useQuery({
    queryKey: ['all-document-tags'],
    staleTime: 30_000,
    queryFn: async () => {
      const docs = await db.documents.filter(d => !d.isDeleted).toArray();
      const tags = Array.from(new Set(docs.flatMap(d => d.tags || []))).filter(Boolean);
      return ['All', ...tags];
    }
  });
}

/**
 * Lazy content fetcher: only called when opening the document in editor or preview modal.
 */
export function useDocumentContent(id: string | null | undefined) {
  return useQuery({
    queryKey: ['document-content', id],
    queryFn: async () => {
      if (!id) return '';
      return await getDocumentContent(id);
    },
    enabled: !!id
  });
}

export function useStorageStats() {
  return useQuery({
    queryKey: ['storage-stats'],
    staleTime: 30_000,
    queryFn: async () => {
      return await getStorageStats();
    }
  });
}

export function useCreateDocument() {
  return useMutation({
    mutationFn: async ({ title, content }: { title?: string; content?: string }) => {
      const id = await createNewDocument(title, content);
      if (isSupabaseConfigured()) {
        const meta = await db.documents.get(id);
        const actualContent = await getDocumentContent(id);
        if (meta) {
          syncDocumentToSupabase(meta, actualContent).catch(console.warn);
        }
      }
      return id;
    }
  });
}

export function useSaveDocument() {
  return useMutation({
    mutationFn: async ({ id, title, content, tags }: { id: string; title: string; content: string; tags?: string[] }) => {
      await saveDocument(id, title, content, tags);
    }
  });
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: async ({ id, permanent = false }: { id: string; permanent?: boolean }) => {
      await deleteDocument(id, permanent);
      if (isSupabaseConfigured()) {
        if (permanent) {
          deleteDocumentFromSupabase(id).catch(console.warn);
        } else {
          syncDocumentTrashToSupabase(id, true).catch(console.warn);
        }
      }
    }
  });
}

export function useRestoreDocument() {
  return useMutation({
    mutationFn: async (id: string) => {
      await restoreDocument(id);
      if (isSupabaseConfigured()) {
        syncDocumentTrashToSupabase(id, false).catch(console.warn);
      }
    }
  });
}

export function useEmptyTrash() {
  return useMutation({
    mutationFn: async () => {
      // Get all trashed doc IDs to sync deletion with Supabase Cloud
      const trashedDocs = await db.documents.filter(d => Boolean(d.isDeleted)).toArray();
      const ids = trashedDocs.map(d => d.id);
      
      const count = await emptyTrash();

      if (isSupabaseConfigured()) {
        for (const id of ids) {
          deleteDocumentFromSupabase(id).catch(console.warn);
        }
      }

      return count;
    }
  });
}

export function useDuplicateDocument() {
  return useMutation({
    mutationFn: async (id: string) => {
      const newId = await duplicateDocument(id);
      if (isSupabaseConfigured()) {
        const meta = await db.documents.get(newId);
        const actualContent = await getDocumentContent(newId);
        if (meta) {
          syncDocumentToSupabase(meta, actualContent).catch(console.warn);
        }
      }
      return newId;
    }
  });
}

export function useTogglePin() {
  return useMutation({
    mutationFn: async (id: string) => {
      const newPinned = await togglePinDocument(id);
      if (isSupabaseConfigured()) {
        syncDocumentPinToSupabase(id, newPinned).catch(console.warn);
      }
      return newPinned;
    }
  });
}
