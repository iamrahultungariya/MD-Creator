import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { pullCloudDocuments } from '../lib/supabase';

export function useDocuments(searchQuery = '', activeTag = 'All', showTrash = false) {
  const queryClient = useQueryClient();

  // Background cloud pull to synchronize latest cloud documents into Dexie
  useEffect(() => {
    let isMounted = true;
    pullCloudDocuments().then((pulled) => {
      if (isMounted && pulled > 0) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        queryClient.invalidateQueries({ queryKey: ['trash-count'] });
        queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
      }
    }).catch(console.warn);
    return () => { isMounted = false; };
  }, [queryClient]);

  return useQuery({
    queryKey: ['documents', searchQuery, activeTag, showTrash],
    queryFn: async (): Promise<DocumentMetadata[]> => {
      let docs = await db.documents.toArray();

      if (showTrash) {
        docs = docs.filter(doc => Boolean(doc.isDeleted));
        return docs.sort((a, b) => (b.deletedAt || b.updatedAt) - (a.deletedAt || a.updatedAt));
      }

      // Hide soft-deleted documents from normal library view
      docs = docs.filter(doc => !doc.isDeleted);

      if (activeTag && activeTag !== 'All') {
        docs = docs.filter(doc => doc.tags.includes(activeTag));
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        docs = docs.filter(
          doc =>
            doc.title.toLowerCase().includes(q) ||
            doc.snippet.toLowerCase().includes(q) ||
            doc.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      // Pinned first, then sorted by updatedAt descending
      return docs.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return b.updatedAt - a.updatedAt;
        }
        return a.isPinned ? -1 : 1;
      });
    }
  });
}

export function useTrashCount() {
  return useQuery({
    queryKey: ['trash-count'],
    queryFn: async () => {
      return await db.documents.filter(d => Boolean(d.isDeleted)).count();
    }
  });
}

export function useAllDocumentTags() {
  return useQuery({
    queryKey: ['all-document-tags'],
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
    queryFn: async () => {
      return await getStorageStats();
    }
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, content }: { title?: string; content?: string }) => {
      return await createNewDocument(title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    }
  });
}

export function useSaveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title, content, tags }: { id: string; title: string; content: string; tags?: string[] }) => {
      await saveDocument(id, title, content, tags);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-content', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    }
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permanent = false }: { id: string; permanent?: boolean }) => {
      await deleteDocument(id, permanent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['trash-count'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    }
  });
}

export function useRestoreDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await restoreDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['trash-count'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    }
  });
}

export function useEmptyTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await emptyTrash();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['trash-count'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    }
  });
}

export function useDuplicateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await duplicateDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    }
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await togglePinDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}
